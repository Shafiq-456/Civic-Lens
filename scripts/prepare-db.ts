/**
 * Runs before `next build` on every deploy.
 *
 * 1. Pushes the Prisma schema to the Supabase Postgres database so the tables
 *    the API routes query always exist (non-destructive: it aborts instead of
 *    dropping data if a change would lose data).
 * 2. Seeds the verified dataset ONLY when the database is empty. The seed
 *    script wipes tables before inserting, so it must never run against a
 *    database that already holds data.
 *
 * Usage: tsx scripts/prepare-db.ts
 */
import { execSync } from 'node:child_process'
import { PrismaClient } from '@prisma/client'

function isPostgresUrl(url: string | undefined) {
  return !!url && /^postgres(ql)?:\/\//.test(url.trim().replace(/^["']|["']$/g, ''))
}

async function main() {
  if (!isPostgresUrl(process.env.DATABASE_URL)) {
    console.warn(
      '[prepare-db] DATABASE_URL is not a Postgres connection string — skipping schema push and seed. ' +
        'The app will serve read-only SAMPLE DATA until DATABASE_URL and DIRECT_URL are set to your Supabase connection strings.',
    )
    return
  }
  if (!process.env.DIRECT_URL) {
    // Fall back to the main URL so schema pushes still work with a single direct connection string.
    process.env.DIRECT_URL = process.env.DATABASE_URL
  }

  console.log('[prepare-db] Syncing Prisma schema to Postgres…')
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env })

  const db = new PrismaClient()
  try {
    const states = await db.state.count()
    if (states > 0) {
      console.log(`[prepare-db] Database already has data (${states} states) — skipping seed.`)
      return
    }
  } finally {
    await db.$disconnect()
  }

  console.log('[prepare-db] Empty database — loading seed data…')
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env: process.env })
}

main().catch((e) => {
  console.error('[prepare-db] failed:', e instanceof Error ? e.message : e)
  process.exit(1)
})
