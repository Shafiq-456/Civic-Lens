import { NextRequest } from 'next/server'
import { handleError, ok } from '@/lib/api-helpers'
import { TAMIL_NADU_GOVERNMENT_ORDERS, GovernmentOrder } from '@/lib/civic/gov-orders-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const department = sp.get('department')
    const goType = sp.get('goType')
    const district = sp.get('district')
    const q = sp.get('q')?.toLowerCase()

    let items = [...TAMIL_NADU_GOVERNMENT_ORDERS]

    if (department && department !== 'ALL') {
      items = items.filter(
        (g) =>
          g.department.toLowerCase().includes(department.toLowerCase()) ||
          g.departmentCode.toLowerCase() === department.toLowerCase()
      )
    }

    if (goType && goType !== 'ALL') {
      items = items.filter((g) => g.goType === goType)
    }

    if (district && district !== 'ALL') {
      items = items.filter(
        (g) =>
          g.districtsCovered.includes('All Tamil Nadu') ||
          g.districtsCovered.some((d) => d.toLowerCase() === district.toLowerCase())
      )
    }

    if (q) {
      items = items.filter(
        (g) =>
          g.goNumber.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          (g.titleTa && g.titleTa.toLowerCase().includes(q)) ||
          g.abstract.toLowerCase().includes(q) ||
          g.department.toLowerCase().includes(q) ||
          (g.relatedSchemeName && g.relatedSchemeName.toLowerCase().includes(q)) ||
          g.keyProvisions.some((p) => p.toLowerCase().includes(q))
      )
    }

    return ok({
      governmentOrders: items,
      total: items.length,
      officialPortal: 'https://www.tn.gov.in/go_view/dept',
      lastVerified: new Date().toISOString()
    })
  } catch (e) {
    return handleError(e, 'GET /api/gov-orders')
  }
}

