import { NextRequest } from 'next/server'
import { handleError, ok, bad } from '@/lib/api-helpers'
import { TN_REALTIME_NEWS_FEED } from '@/lib/civic/realtime-news-data'
import { TAMIL_NADU_GOVERNMENT_ORDERS } from '@/lib/civic/gov-orders-data'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const districtName = sp.get('name')
    if (!districtName) {
      return bad('District name is required')
    }

    const normName = districtName.toLowerCase().trim()

    // 1. Fetch district base data from database
    const district = await db.district.findFirst({
      where: {
        OR: [
          { name: { equals: districtName } },
          { geoName: { equals: districtName } }
        ]
      },
      include: {
        _count: { select: { records: true, projects: true, complaints: true } }
      }
    })

    // 2. Fetch projects located in this district
    const projects = await db.project.findMany({
      where: district ? { districtId: district.id } : { name: { contains: districtName } },
      select: {
        id: true,
        code: true,
        name: true,
        category: true,
        budgetInrCr: true,
        spentInrCr: true,
        progress: true,
        status: true
      },
      take: 10
    })

    // 3. Filter real-time news relevant to this district
    const districtNews = TN_REALTIME_NEWS_FEED.filter(
      (n) => n.district && n.district.toLowerCase() === normName
    )

    // 4. Filter Government Orders relevant to this district
    const districtGOs = TAMIL_NADU_GOVERNMENT_ORDERS.filter(
      (g) =>
        g.districtsCovered.includes('All Tamil Nadu') ||
        g.districtsCovered.some((d) => d.toLowerCase() === normName)
    )

    // 5. Relevant schemes operating in the district
    const schemes = await db.scheme.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        description: true,
        level: true,
        eligibility: true,
        applicationUrl: true
      },
      take: 8
    })

    return ok({
      district: district || { name: districtName },
      news: districtNews,
      governmentOrders: districtGOs,
      projects,
      schemes,
      verifiedSourceCount: districtNews.length + districtGOs.length + projects.length,
      generatedAt: new Date().toISOString()
    })
  } catch (e) {
    return handleError(e, 'GET /api/districts/intelligence')
  }
}

