import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const take = Math.min(Number(sp.get('take') ?? 100), 300)
    const role = sp.get('actorRole') ?? undefined
    const entity = sp.get('entity') ?? undefined

    const logs = await db.auditLog.findMany({
      where: { ...(role ? { actorRole: role } : {}), ...(entity ? { entity } : {}) },
      orderBy: { createdAt: 'desc' },
      take,
    })
    return ok({ logs })
  } catch (e) {
    return handleError(e, 'GET /api/audit-logs')
  }
}
