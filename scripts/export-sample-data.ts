/**
 * Exports the seeded demo SQLite database (db/custom.db) into a JSON snapshot
 * (src/data/sample-db.json) used by the read-only sample-data fallback in
 * src/lib/sample-db.ts when no Postgres DATABASE_URL is configured.
 *
 * Usage: tsx scripts/export-sample-data.ts   (requires the sqlite3 CLI)
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { Prisma } from '@prisma/client'

const out: Record<string, Record<string, unknown>[]> = {}

for (const model of Prisma.dmmf.datamodel.models) {
  const raw = execFileSync('sqlite3', ['-json', 'db/custom.db', `SELECT * FROM "${model.name}"`], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  const rows: Record<string, unknown>[] = raw.trim() ? JSON.parse(raw) : []
  const scalars = model.fields.filter((f) => f.kind === 'scalar' || f.kind === 'enum')
  out[model.name] = rows.map((row) => {
    const rec: Record<string, unknown> = {}
    for (const f of scalars) {
      let v = row[f.name] ?? null
      if (v !== null && f.type === 'DateTime') v = new Date(typeof v === 'number' ? v : String(v)).toISOString()
      if (v !== null && f.type === 'Boolean') v = v === 1 || v === true || v === 'true'
      rec[f.name] = v
    }
    return rec
  })
}

writeFileSync('src/data/sample-db.json', JSON.stringify(out))
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.length}`).join('\n'))
