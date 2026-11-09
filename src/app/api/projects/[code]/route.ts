import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok, bad } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params
    const project = await db.project.findUnique({
      where: { code },
      include: {
        department: { select: { name: true, shortName: true, contactEmail: true } },
        district: { select: { name: true } },
        milestones: { orderBy: { sortOrder: 'asc' } },
      },
    })
    if (!project) return bad('Project not found', 404)
    return ok({ project })
  } catch (e) {
    return handleError(e, 'GET /api/projects/[code]')
  }
}
