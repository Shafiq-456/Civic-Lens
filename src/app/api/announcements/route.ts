import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const category = sp.get('category') ?? undefined
    const departmentId = sp.get('departmentId') ?? undefined
    const take = Number(sp.get('take') ?? 50)

    const announcements = await db.announcement.findMany({
      where: { ...(category ? { category } : {}), ...(departmentId ? { departmentId } : {}) },
      include: { department: { select: { name: true, shortName: true } } },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(take, 100),
    })
    return ok({ announcements })
  } catch (e) {
    return handleError(e, 'GET /api/announcements')
  }
}
