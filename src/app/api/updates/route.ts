import { NextRequest } from 'next/server'
import { handleError, ok } from '@/lib/api-helpers'
import { SCHEME_UPDATES } from '@/lib/civic/updates-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const level = sp.get('level')
    const type = sp.get('type')
    const q = sp.get('q')?.toLowerCase()

    let items = [...SCHEME_UPDATES]

    if (level && level !== 'ALL') {
      items = items.filter((u) => u.schemeLevel === level)
    }

    if (type && type !== 'ALL') {
      items = items.filter((u) => u.updateType === type)
    }

    if (q) {
      items = items.filter(
        (u) =>
          u.schemeName.toLowerCase().includes(q) ||
          u.headline.toLowerCase().includes(q) ||
          u.details.toLowerCase().includes(q) ||
          u.beneficiaryCategory.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q),
      )
    }

    return ok({ updates: items, total: items.length })
  } catch (e) {
    return handleError(e, 'GET /api/updates')
  }
}

