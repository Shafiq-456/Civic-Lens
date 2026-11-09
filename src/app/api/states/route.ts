import { db } from '@/lib/db'
import { handleError, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const states = await db.state.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { records: true, districts: true } } },
    })
    return ok({ states })
  } catch (e) {
    return handleError(e, 'GET /api/states')
  }
}
