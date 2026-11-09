import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok, bad, getServerVerifiedIdentity, audit } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * Live data update system.
 *
 * GET  /api/sync              → registry of official sources + last sync state
 * POST /api/sync              → run a verification pass across all enabled sources
 * POST /api/sync {sourceKey}  → run a verification pass for a single source
 *
 * Design guarantees (per the platform's data-governance rules):
 *  - A sync pass NEVER mutates political records, schemes or announcements.
 *    It verifies source reachability, records the outcome, and flags stale
 *    cadences; content reconciliation is an admin-assisted step afterwards.
 *  - If a source is unreachable, the failure is logged and previously
 *    verified data is preserved untouched.
 *  - Every run is written to SyncLog and AuditLog with a run id.
 */

const FETCH_TIMEOUT_MS = 6000

type ReachResult = { reachable: boolean; httpStatus?: number; message: string }

async function probe(url: string): Promise<ReachResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'CivicLenz-Verifier/1.0 (+source health check)' },
    })
    return {
      reachable: res.ok,
      httpStatus: res.status,
      message: res.ok
        ? `Endpoint reachable (HTTP ${res.status}). Content reconciliation pending admin review.`
        : `Endpoint responded HTTP ${res.status} — treated as unavailable; previously verified data preserved.`,
    }
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'unknown error'
    return {
      reachable: false,
      message: `Endpoint unreachable (${reason}). Previously verified data preserved.`,
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function GET() {
  try {
    const sources = await db.dataSource.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: {
        logs: { orderBy: { startedAt: 'desc' }, take: 3 },
      },
    })
    const lastSuccessfulSyncAt = sources
      .map((s) => (s.lastSyncStatus === 'SUCCESS' ? s.lastSyncedAt : null))
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null

    const now = Date.now()
    const sourcesWithCadence = sources.map((s) => {
      const dueInMs = s.lastSyncedAt
        ? s.cadenceHours * 3600 * 1000 - (now - s.lastSyncedAt.getTime())
        : null
      return {
        ...s,
        logs: s.logs,
        cadence: {
          dueForCheck: dueInMs === null || dueInMs <= 0,
          dueInMs: dueInMs === null ? null : Math.max(0, dueInMs),
        },
      }
    })

    return ok({
      sources: sourcesWithCadence,
      total: sourcesWithCadence.length,
      lastSuccessfulSyncAt,
      note:
        'Sources marked MANUAL_ADMIN require administrator-assisted reconciliation (no public API). ' +
        'Failed checks never overwrite verified data.',
    })
  } catch (e) {
    return handleError(e, 'GET /api/sync')
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verified server-side authentication check
    const identity = await getServerVerifiedIdentity(req)
    if (!identity.isAuthenticated || (!identity.isAdmin && !identity.isOfficer)) {
      return bad('Unauthorized: Administrator or officer credentials required to trigger source synchronization', 403)
    }

    const body = await req.json().catch(() => ({}))
    const sourceKey = typeof body?.sourceKey === 'string' && body.sourceKey ? body.sourceKey : null
    const triggeredBy = body?.triggeredBy === 'MANUAL_ADMIN' ? 'MANUAL_ADMIN' : 'SCHEDULED'

    const sources = await db.dataSource.findMany({
      where: { enabled: true, ...(sourceKey ? { key: sourceKey } : {}) },
    })
    if (sourceKey && sources.length === 0) return bad(`Unknown or disabled data source: ${sourceKey}`)

    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const results: Array<{
      key: string
      name: string
      status: 'SUCCESS' | 'FAILED' | 'SKIPPED'
      message: string
      httpStatus?: number
    }> = []

    for (const src of sources) {
      const log = await db.syncLog.create({
        data: {
          runId, sourceKey: src.key, status: 'PARTIAL', triggeredBy,
        },
      })

      // Sources that need configured credentials are skipped, not failed —
      // their absence is an environment limitation, not a data error.
      if (src.requiresConfig && !process.env[src.requiresConfig]) {
        const msg = `Skipped: requires ${src.requiresConfig} to be configured (environment variable not set).`
        await db.syncLog.update({
          where: { id: log.id },
          data: {
            finishedAt: new Date(), status: 'SKIPPED', errorMessage: null,
            details: msg, triggeredBy,
          },
        })
        await db.dataSource.update({
          where: { key: src.key },
          data: { lastSyncRunId: runId, lastSyncStatus: 'PARTIAL', lastSyncMessage: msg },
        })
        results.push({ key: src.key, name: src.name, status: 'SKIPPED', message: msg })
        continue
      }

      const reach = await probe(src.url)
      const status: 'SUCCESS' | 'FAILED' = reach.reachable ? 'SUCCESS' : 'FAILED'
      const now = new Date()
      await db.syncLog.update({
        where: { id: log.id },
        data: {
          finishedAt: now, status, triggeredBy,
          errorMessage: reach.reachable ? null : reach.message,
          details: `${src.name}: ${reach.message}`,
        },
      })
      await db.dataSource.update({
        where: { key: src.key },
        data: {
          lastSyncedAt: now, // last *attempt* timestamp; status distinguishes success
          lastSyncStatus: status,
          lastSyncMessage: reach.message,
          lastSyncRunId: runId,
        },
      })
      results.push({
        key: src.key, name: src.name, status, message: reach.message,
        httpStatus: reach.httpStatus,
      })
    }

    const succeeded = results.filter((r) => r.status === 'SUCCESS').length
    const failed = results.filter((r) => r.status === 'FAILED').length
    const skipped = results.filter((r) => r.status === 'SKIPPED').length

    await db.auditLog.create({
      data: {
        actor: identity.username || 'sync-engine',
        actorRole: identity.role || 'SYSTEM',
        action: 'SYNC_RUN',
        entity: 'DATA_SOURCE',
        entityId: runId,
        summary: `Source verification pass triggered by ${identity.username}: ${succeeded} reachable, ${failed} failed, ${skipped} skipped. No content changes applied (preservation-first design).`,
        ipAddress: null,
      },
    })

    return ok({
      runId,
      summary: { total: results.length, succeeded, failed, skipped },
      results,
      note: failed + skipped > 0
        ? 'Some sources were unreachable or skipped. All previously verified records were preserved; reconciliation is queued for admin review.'
        : 'All enabled sources reachable. Content reconciliation pending admin review.',
    })
  } catch (e) {
    return handleError(e, 'POST /api/sync')
  }
}
