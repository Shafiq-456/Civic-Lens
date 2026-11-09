/**
 * Read-only SAMPLE DATA fallback for the Prisma client.
 *
 * Used automatically by src/lib/db.ts when DATABASE_URL is not a Postgres
 * connection string (e.g. the Supabase connection strings have not been set
 * yet). It serves the seeded demo dataset from src/data/sample-db.json
 * (regenerate with `npx tsx scripts/export-sample-data.ts`) and implements the
 * subset of the Prisma query API this app uses: findMany / findFirst /
 * findUnique / count / groupBy with where, include, select, _count, orderBy,
 * take and skip.
 *
 * Every write (create / update / delete / upsert …) throws
 * SampleDataReadOnlyError — nothing is ever stored in memory. Set DATABASE_URL
 * (Supabase transaction pooler) and DIRECT_URL (session pooler) to switch to the
 * real database.
 */
import { Prisma } from '@prisma/client'
import snapshot from '@/data/sample-db.json'

export class SampleDataReadOnlyError extends Error {
  constructor(op: string) {
    super(
      `Sample data mode is read-only (${op} is unavailable). ` +
        'Set DATABASE_URL and DIRECT_URL to your Supabase Postgres connection strings to enable saving.',
    )
    this.name = 'SampleDataReadOnlyError'
  }
}

type Row = Record<string, any>
type DmmfModel = (typeof Prisma.dmmf.datamodel.models)[number]
type DmmfField = DmmfModel['fields'][number]

const MODELS = new Map<string, DmmfModel>(Prisma.dmmf.datamodel.models.map((m) => [m.name, m]))

// Revive DateTime columns into Date objects so code behaves exactly as with Prisma.
const TABLES = new Map<string, Row[]>()
for (const [name, model] of MODELS) {
  const dateFields = model.fields.filter((f) => f.type === 'DateTime').map((f) => f.name)
  const rows = ((snapshot as Record<string, Row[]>)[name] ?? []).map((r) => {
    const row: Row = { ...r }
    for (const f of dateFields) if (row[f] != null) row[f] = new Date(row[f])
    return row
  })
  TABLES.set(name, rows)
}

const field = (model: string, name: string): DmmfField | undefined =>
  MODELS.get(model)?.fields.find((f) => f.name === name)

/** Returns the [targetField, sourceField] key pairs joining `model.rel` to its target model. */
function joinKeys(model: string, rel: DmmfField): Array<[string, string]> {
  const from = rel.relationFromFields ?? []
  if (from.length) return from.map((f, i) => [rel.relationToFields![i], f])
  const opposite = MODELS.get(rel.type)!.fields.find(
    (f) => f.kind === 'object' && f.relationName === rel.relationName && f.type === model && f !== rel,
  )!
  return (opposite.relationFromFields ?? []).map((f, i) => [f, opposite.relationToFields![i]])
}

function related(model: string, rel: DmmfField, row: Row): Row[] {
  const keys = joinKeys(model, rel)
  if (keys.some(([, src]) => row[src] == null)) return []
  return TABLES.get(rel.type)!.filter((t) => keys.every(([tgt, src]) => t[tgt] === row[src]))
}

// ─────────────────────────────── where ───────────────────────────────

const toComparable = (v: any) => (v instanceof Date ? v.getTime() : v)

function matchScalar(value: any, cond: any): boolean {
  if (cond === null || typeof cond !== 'object' || cond instanceof Date) {
    return toComparable(value) === toComparable(cond)
  }
  const ci = cond.mode === 'insensitive'
  const norm = (v: any) => (ci && typeof v === 'string' ? v.toLowerCase() : toComparable(v))
  const v = norm(value)
  for (const [op, raw] of Object.entries(cond)) {
    if (op === 'mode') continue
    const arg = Array.isArray(raw) ? raw.map(norm) : norm(raw)
    switch (op) {
      case 'equals': if (v !== arg) return false; break
      case 'not':
        if (raw !== null && typeof raw === 'object' && !(raw instanceof Date)) { if (matchScalar(value, raw)) return false }
        else if (v === arg) return false
        break
      case 'in': if (!(arg as any[]).includes(v)) return false; break
      case 'notIn': if ((arg as any[]).includes(v)) return false; break
      case 'contains': if (typeof v !== 'string' || !v.includes(arg)) return false; break
      case 'startsWith': if (typeof v !== 'string' || !v.startsWith(arg)) return false; break
      case 'endsWith': if (typeof v !== 'string' || !v.endsWith(arg)) return false; break
      case 'gt': if (!(v != null && v > arg)) return false; break
      case 'gte': if (!(v != null && v >= arg)) return false; break
      case 'lt': if (!(v != null && v < arg)) return false; break
      case 'lte': if (!(v != null && v <= arg)) return false; break
      default: throw new Error(`Sample data: unsupported filter "${op}"`)
    }
  }
  return true
}

function matches(model: string, row: Row, where: any): boolean {
  if (!where) return true
  for (const [key, cond] of Object.entries(where)) {
    if (cond === undefined) continue
    if (key === 'AND') { if (!(Array.isArray(cond) ? cond : [cond]).every((w) => matches(model, row, w))) return false; continue }
    if (key === 'OR') { if (!(cond as any[]).some((w) => matches(model, row, w))) return false; continue }
    if (key === 'NOT') { if ((Array.isArray(cond) ? cond : [cond]).some((w) => matches(model, row, w))) return false; continue }
    const f = field(model, key)
    if (!f) throw new Error(`Sample data: unknown field ${model}.${key}`)
    if (f.kind !== 'object') { if (!matchScalar(row[key], cond)) return false; continue }
    const rows = related(model, f, row)
    const c = cond as any
    if (f.isList) {
      if (c.some && !rows.some((r) => matches(f.type, r, c.some))) return false
      if (c.every && !rows.every((r) => matches(f.type, r, c.every))) return false
      if (c.none && rows.some((r) => matches(f.type, r, c.none))) return false
    } else {
      const target = rows[0]
      if (c === null) { if (target) return false; continue }
      if ('is' in c || 'isNot' in c) {
        if ('is' in c && (c.is === null ? !!target : !target || !matches(f.type, target, c.is))) return false
        if ('isNot' in c && (c.isNot === null ? !target : !!target && matches(f.type, target, c.isNot))) return false
      } else if (!target || !matches(f.type, target, c)) return false
    }
  }
  return true
}

// ───────────────────────────── orderBy ─────────────────────────────

function sortValue(model: string, row: Row, spec: Row): [any, string] {
  const [key, dir] = Object.entries(spec)[0]
  const f = field(model, key)
  if (f?.kind === 'object' && dir && typeof dir === 'object') {
    const target = related(model, f, row)[0]
    return target ? sortValue(f.type, target, dir) : [null, 'asc']
  }
  return [toComparable(row[key]), typeof dir === 'object' ? (dir as any).sort : dir]
}

function sortRows(model: string, rows: Row[], orderBy: any): Row[] {
  if (!orderBy) return rows
  const specs: Row[] = (Array.isArray(orderBy) ? orderBy : [orderBy]).flatMap((o: Row) =>
    Object.entries(o).map(([k, v]) => ({ [k]: v })),
  )
  return [...rows].sort((a, b) => {
    for (const s of specs) {
      const [av, dir] = sortValue(model, a, s)
      const [bv] = sortValue(model, b, s)
      if (av === bv) continue
      // Postgres default: NULLS LAST for ASC, NULLS FIRST for DESC
      if (av == null) return dir === 'desc' ? -1 : 1
      if (bv == null) return dir === 'desc' ? 1 : -1
      const cmp = typeof av === 'string' ? (av < bv ? -1 : 1) : av - bv
      return dir === 'desc' ? -cmp : cmp
    }
    return 0
  })
}

// ───────────────────────── include / select ─────────────────────────

function paginate<T>(rows: T[], args: any): T[] {
  const skip = args?.skip ?? 0
  return args?.take != null ? rows.slice(skip, skip + args.take) : rows.slice(skip)
}

function countRelations(model: string, row: Row, spec: any): Row {
  const sel = spec === true ? null : spec.select
  const rels = MODELS.get(model)!.fields.filter((f) => f.kind === 'object' && f.isList && (!sel || sel[f.name]))
  const out: Row = {}
  for (const f of rels) {
    const where = sel && typeof sel[f.name] === 'object' ? sel[f.name].where : undefined
    out[f.name] = related(model, f, row).filter((r) => matches(f.type, r, where)).length
  }
  return out
}

function loadRelation(model: string, f: DmmfField, row: Row, args: any) {
  const opts = args === true ? {} : args
  if (!f.isList) {
    const target = related(model, f, row)[0]
    return target ? shape(f.type, target, opts) : null
  }
  const rows = related(model, f, row).filter((r) => matches(f.type, r, opts.where))
  return paginate(sortRows(f.type, rows, opts.orderBy), opts).map((r) => shape(f.type, r, opts))
}

function shape(model: string, row: Row, args: any): Row {
  const scalars = MODELS.get(model)!.fields.filter((f) => f.kind !== 'object')
  const out: Row = {}
  if (args?.select) {
    for (const [key, val] of Object.entries(args.select)) {
      if (!val) continue
      if (key === '_count') { out._count = countRelations(model, row, val); continue }
      const f = field(model, key)!
      out[key] = f.kind === 'object' ? loadRelation(model, f, row, val) : row[key]
    }
    return out
  }
  for (const f of scalars) out[f.name] = row[f.name]
  for (const [key, val] of Object.entries(args?.include ?? {})) {
    if (!val) continue
    if (key === '_count') { out._count = countRelations(model, row, val); continue }
    out[key] = loadRelation(model, field(model, key)!, row, val)
  }
  return out
}

// ─────────────────────────────── client ───────────────────────────────

function findMany(model: string, args: any = {}) {
  const rows = TABLES.get(model)!.filter((r) => matches(model, r, args.where))
  let sorted = sortRows(model, rows, args.orderBy)
  if (args.distinct) {
    const seen = new Set<string>()
    const keys: string[] = Array.isArray(args.distinct) ? args.distinct : [args.distinct]
    sorted = sorted.filter((r) => {
      const k = JSON.stringify(keys.map((key) => r[key]))
      return seen.has(k) ? false : (seen.add(k), true)
    })
  }
  return paginate(sorted, args).map((r) => shape(model, r, args))
}

function groupBy(model: string, args: any) {
  const by: string[] = Array.isArray(args.by) ? args.by : [args.by]
  const groups = new Map<string, Row[]>()
  for (const r of TABLES.get(model)!.filter((row) => matches(model, row, args.where))) {
    const k = JSON.stringify(by.map((b) => r[b]))
    groups.set(k, [...(groups.get(k) ?? []), r])
  }
  const out = [...groups.values()].map((rows) => {
    const g: Row = {}
    for (const b of by) g[b] = rows[0][b]
    if (args._count === true) g._count = rows.length
    else if (args._count) {
      g._count = {}
      for (const k of Object.keys(args._count)) g._count[k] = k === '_all' ? rows.length : rows.filter((r) => r[k] != null).length
    }
    for (const agg of ['_sum', '_avg', '_min', '_max'] as const) {
      if (!args[agg]) continue
      g[agg] = {}
      for (const k of Object.keys(args[agg])) {
        const vals = rows.map((r) => r[k]).filter((v) => v != null)
        g[agg][k] = !vals.length ? null
          : agg === '_sum' ? vals.reduce((a, b) => a + b, 0)
          : agg === '_avg' ? vals.reduce((a, b) => a + b, 0) / vals.length
          : vals.reduce((a, b) => ((agg === '_min' ? a < b : a > b) ? a : b))
      }
    }
    return g
  })
  return paginate(args.orderBy ? sortRows(model, out, args.orderBy) : out, args)
}

const WRITE_OPS = ['create', 'createMany', 'createManyAndReturn', 'update', 'updateMany', 'upsert', 'delete', 'deleteMany']

function modelDelegate(model: string) {
  const first = (args: any) => findMany(model, { ...args, take: 1 })[0] ?? null
  const orThrow = (args: any) => {
    const r = first(args)
    if (!r) throw new Prisma.PrismaClientKnownRequestError(`No ${model} found`, { code: 'P2025', clientVersion: Prisma.prismaVersion.client })
    return r
  }
  const delegate: Row = {
    findMany: async (args?: any) => findMany(model, args),
    findFirst: async (args?: any) => first(args),
    findUnique: async (args: any) => first(args),
    findFirstOrThrow: async (args?: any) => orThrow(args),
    findUniqueOrThrow: async (args: any) => orThrow(args),
    count: async (args?: any) => TABLES.get(model)!.filter((r) => matches(model, r, args?.where)).length,
    groupBy: async (args: any) => groupBy(model, args),
  }
  for (const op of WRITE_OPS) {
    delegate[op] = async () => { throw new SampleDataReadOnlyError(`${model}.${op}`) }
  }
  return delegate
}

export function createSampleDb() {
  const client: Row = {
    $connect: async () => {},
    $disconnect: async () => {},
    $transaction: async (arg: any) => (typeof arg === 'function' ? arg(client) : Promise.all(arg)),
    $queryRaw: async () => { throw new SampleDataReadOnlyError('$queryRaw') },
    $executeRaw: async () => { throw new SampleDataReadOnlyError('$executeRaw') },
  }
  for (const name of MODELS.keys()) client[name[0].toLowerCase() + name.slice(1)] = modelDelegate(name)
  return client
}
