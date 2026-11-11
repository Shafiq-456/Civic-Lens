import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const status = sp.get('status') ?? undefined
    const category = sp.get('category') ?? undefined
    const districtId = sp.get('districtId') ?? undefined
    const departmentId = sp.get('departmentId') ?? undefined
    const q = sp.get('q')?.trim()

    const projects = await db.project.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(districtId ? { districtId } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      include: {
        department: { select: { name: true, shortName: true } },
        district: { select: { name: true } },
        _count: { select: { milestones: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return ok({ projects })
  } catch (e) {
    return handleError(e, 'GET /api/projects')
  }
}
