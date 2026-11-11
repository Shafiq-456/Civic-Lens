#!/usr/bin/env node
// Generates a Netlify Database (Postgres) data migration from the local SQLite
// seed database (db/custom.db). Column types are read from the schema migration
// so SQLite values (ms-epoch integers, 0/1 booleans) are converted correctly.
//
// Usage: node scripts/sqlite-to-netlify-db-migration.mjs <schema.sql> <out.sql>
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const [schemaPath, outPath] = process.argv.slice(2)
if (!schemaPath || !outPath) {
  console.error('usage: sqlite-to-netlify-db-migration.mjs <schema.sql> <out.sql>')
  process.exit(1)
}
const schemaSql = readFileSync(schemaPath, 'utf8')

// table -> { column -> pgType }
const tables = new Map()
for (const m of schemaSql.matchAll(/CREATE TABLE "(\w+)" \(([\s\S]*?)\n\);/g)) {
  const cols = {}
  for (const line of m[2].split('\n')) {
    const c = line.trim().match(/^"(\w+)" (\w+)/)
    if (c) cols[c[1]] = c[2]
  }
  tables.set(m[1], cols)
}

// Topological order based on foreign keys.
const deps = new Map([...tables.keys()].map((t) => [t, new Set()]))
for (const m of schemaSql.matchAll(/ALTER TABLE "(\w+)" ADD CONSTRAINT .*? REFERENCES "(\w+)"/g)) {
  if (m[1] !== m[2]) deps.get(m[1]).add(m[2])
}
const order = []
const seen = new Set()
const visit = (t) => {
  if (seen.has(t)) return
  seen.add(t)
  for (const d of deps.get(t)) visit(d)
  order.push(t)
}
for (const t of tables.keys()) visit(t)

const lit = (v, type) => {
  if (v === null || v === undefined) return 'NULL'
  if (type === 'BOOLEAN') return v ? 'true' : 'false'
  if (type === 'TIMESTAMP') {
    const d = typeof v === 'number' ? new Date(v) : new Date(v)
    return `'${d.toISOString()}'`
  }
  if (type === 'INTEGER' || type === 'DOUBLE' || type === 'BIGINT') return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
}

let out = '-- Seed Civic Lenz reference data (generated from db/custom.db)\n'
for (const t of order) {
  const cols = tables.get(t)
  const json = execFileSync('sqlite3', ['-json', 'db/custom.db', `SELECT * FROM "${t}"`], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }).trim()
  const rows = json ? JSON.parse(json) : []
  if (!rows.length) continue
  const names = Object.keys(cols)
  out += `\n-- ${t} (${rows.length} rows)\n`
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100)
    out += `INSERT INTO "${t}" (${names.map((n) => `"${n}"`).join(', ')}) VALUES\n`
    out += chunk.map((r) => '  (' + names.map((n) => lit(r[n], cols[n])).join(', ') + ')').join(',\n')
    out += '\nON CONFLICT DO NOTHING;\n'
  }
}
writeFileSync(outPath, out)
console.log(`wrote ${outPath}`)
