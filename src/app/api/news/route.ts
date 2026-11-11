import { NextRequest } from 'next/server'
import { handleError, ok } from '@/lib/api-helpers'
import { TN_REALTIME_NEWS_FEED, RealtimeNewsItem } from '@/lib/civic/realtime-news-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const jurisdiction = sp.get('jurisdiction')
    const category = sp.get('category')
    const department = sp.get('department')
    const district = sp.get('district')
    const lang = sp.get('lang') // 'EN' | 'TA'
    const q = sp.get('q')?.toLowerCase()

    let items = [...TN_REALTIME_NEWS_FEED]

    if (jurisdiction && jurisdiction !== 'ALL') {
      items = items.filter((n) => n.jurisdiction === jurisdiction)
    }

    if (category && category !== 'ALL') {
      items = items.filter((n) => n.category === category)
    }

    if (department && department !== 'ALL') {
      items = items.filter(
        (n) =>
          n.department.toLowerCase().includes(department.toLowerCase()) ||
          n.departmentCode.toLowerCase() === department.toLowerCase()
      )
    }

    if (district && district !== 'ALL') {
      items = items.filter(
        (n) => !n.district || n.district.toLowerCase() === district.toLowerCase()
      )
    }

    if (lang && ['EN', 'TA'].includes(lang.toUpperCase())) {
      items = items.filter((n) => n.originalLanguage === lang.toUpperCase())
    }

    if (q) {
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.titleTa.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.summaryTa.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.goReference && n.goReference.toLowerCase().includes(q)) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return ok({
      news: items,
      total: items.length,
      sourcesMonitored: [
        'https://dipr.tn.gov.in',
        'https://www.tn.gov.in',
        'https://pib.gov.in',
        'https://www.tn.gov.in/go_view/dept'
      ],
      lastCollectedAt: new Date().toISOString()
    })
  } catch (e) {
    return handleError(e, 'GET /api/news')
  }
}
