import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const departmentId = sp.get('departmentId') ?? undefined
    const q = sp.get('q')?.trim()

    const schemes = await db.scheme.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      include: { department: { select: { name: true, shortName: true } } },
      orderBy: { launchDate: 'desc' },
    })
    return ok({ schemes })
  } catch (e) {
    return handleError(e, 'GET /api/schemes')
  }
}
