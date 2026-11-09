import { db } from '@/lib/db'
import { handleError, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const departments = await db.department.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { schemes: true, projects: true, complaints: true, announcements: true } } },
    })
    return ok({ departments })
  } catch (e) {
    return handleError(e, 'GET /api/departments')
  }
}
