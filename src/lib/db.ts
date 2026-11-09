import { PrismaClient } from '@prisma/client'
import { createSampleDb } from '@/lib/sample-db'

/**
 * True when DATABASE_URL points at a Postgres database (Supabase). When it
 * doesn't (unset, or the legacy SQLite `file:` URL), the app falls back to the
 * read-only sample dataset so pages and API routes still work.
 */
export const isDatabaseConfigured = /^postgres(ql)?:\/\//.test(
  (process.env.DATABASE_URL ?? '').trim().replace(/^["']|["']$/g, ''),
)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  if (!isDatabaseConfigured) {
    console.warn(
      '[db] DATABASE_URL is not a Postgres connection string — serving read-only SAMPLE DATA. ' +
        'Set DATABASE_URL and DIRECT_URL to your Supabase connection strings to use the real database.',
    )
    return createSampleDb() as unknown as PrismaClient
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createClient()

// Reuse one client per runtime instance (dev hot-reload and warm serverless invocations).
globalForPrisma.prisma = db
