import { NextRequest } from 'next/server'
import { handleError, ok } from '@/lib/api-helpers'
import { GOVERNMENT_NEWS } from '@/lib/civic/news-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const jurisdiction = sp.get('jurisdiction')
    const category = sp.get('category')
    const q = sp.get('q')?.toLowerCase()

    let items = [...GOVERNMENT_NEWS]

    if (jurisdiction && jurisdiction !== 'ALL') {
      items = items.filter((n) => n.jurisdiction === jurisdiction)
    }

    if (category && category !== 'ALL') {
      items = items.filter((n) => n.category === category)
    }

    if (q) {
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    return ok({ news: items, total: items.length })
  } catch (e) {
    return handleError(e, 'GET /api/news')
  }
}

