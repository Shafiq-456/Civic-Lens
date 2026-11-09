import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Returns the resolved database URL based on runtime environment.
 * 
 * Rules:
 * - In local development (NODE_ENV !== 'production'), uses local SQLite at db/custom.db.
 * - During static build phase / CI compilation, supports resolving local database or pooler.
 * - At Netlify / cloud serverless runtime (NETLIFY=true, AWS_LAMBDA_FUNCTION_NAME, etc.),
 *   requires an explicit PostgreSQL URL targeting Supabase.
 * - Never silently falls back to SQLite in serverless cloud environments outside local development.
 */
function getDatabaseUrl(): string {
  // 1. Direct PostgreSQL URL / Supabase connection pooler
  const postgresUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL
  if (postgresUrl) {
    return postgresUrl
  }

  const envUrl = process.env.DATABASE_URL
  if (envUrl) {
    // If DATABASE_URL is set and is PostgreSQL, use directly
    if (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://')) {
      return envUrl
    }

    // If file: URL is specified
    if (envUrl.startsWith('file:')) {
      // Netlify and Lambda runtime check
      const isCloudServerlessRuntime =
        Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL) &&
        process.env.NEXT_PHASE !== 'phase-production-build'

      if (isCloudServerlessRuntime && !process.env.ALLOW_SQLITE_IN_PRODUCTION) {
        throw new Error(
          '[CIVIC LENZ Security Policy] Insecure SQLite fallback blocked in production runtime. ' +
          'Configure POSTGRES_PRISMA_URL or DATABASE_URL with Supabase PostgreSQL connection string.'
        )
      }
      return envUrl
    }
    return envUrl
  }

  // 2. Strict cloud serverless runtime check
  const isCloudServerlessRuntime =
    Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL) &&
    process.env.NEXT_PHASE !== 'phase-production-build'

  if (isCloudServerlessRuntime && !process.env.ALLOW_SQLITE_IN_PRODUCTION) {
    throw new Error(
      '[CIVIC LENZ Security Policy] Missing production database configuration in serverless runtime. ' +
      'DATABASE_URL or POSTGRES_PRISMA_URL targeting Supabase PostgreSQL must be configured.'
    )
  }

  // 3. Local development and static build phase fallback to project SQLite db
  const resolvedPath = path.resolve(process.cwd(), 'db', 'custom.db')
  return `file:${resolvedPath}`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
