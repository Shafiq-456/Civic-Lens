import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Resolves the Postgres connection string for Netlify Database.
 *
 * Netlify injects `NETLIFY_DB_URL` into deployed functions and into `netlify dev`,
 * so no manual configuration is needed. `DATABASE_URL` is accepted as an explicit
 * Postgres override (e.g. for scripts run outside Netlify).
 */
function getDatabaseUrl(): string | undefined {
  const url = process.env.NETLIFY_DB_URL || process.env.DATABASE_URL
  if (url && !/^postgres(ql)?:\/\//.test(url)) {
    throw new Error('[CIVIC LENZ] Database URL must be a PostgreSQL connection string.')
  }
  return url
}

function createClient() {
  const url = getDatabaseUrl()
  return new PrismaClient({
    ...(url ? { datasources: { db: { url } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createClient()

globalForPrisma.prisma = db
