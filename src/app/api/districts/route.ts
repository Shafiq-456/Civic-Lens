import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok, bad } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const stateCode = sp.get('stateCode') ?? 'TN'
    const state = await db.state.findUnique({ where: { code: stateCode } })
    if (!state) return bad('State not found', 404)

    const districts = await db.district.findMany({
      where: { stateId: state.id },
      orderBy: { name: 'asc' },
      include: { _count: { select: { records: true, projects: true, complaints: true } } },
    })

    const statewideRecords = await db.politicalRecord.findMany({
      where: { stateId: state.id, status: 'CURRENT', office: { in: ['GOVERNOR', 'CHIEF_MINISTER', 'DEPUTY_CM', 'SPEAKER'] } },
      orderBy: { office: 'asc' },
    })

    return ok({
      state,
      districts,
      statewideRecords,
      focus: state.isFocusState,
      note: state.isFocusState
        ? 'District polygons are real boundaries from open census/delimitation-based datasets. Mayiladuthurai (created Dec 2020) remains merged inside the Nagapattinam polygon in the open dataset — a documented limitation that must be replaced with Survey of India data for production.'
        : 'Detailed district directory for this state is not part of the demonstration dataset.',
    })
  } catch (e) {
    return handleError(e, 'GET /api/districts')
  }
}
