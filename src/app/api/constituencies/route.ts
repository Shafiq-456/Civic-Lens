import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok, bad } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * Electoral constituency directory.
 *
 * GET /api/constituencies
 *   ?type=ASSEMBLY|PARLIAMENTARY   (default: both)
 *   ?district=<district name>      (ASSEMBLY rows only)
 *   ?pc=<pcNo>                     (ACs of one Lok Sabha seat)
 *   ?no=<acNo|pcNo>                (single constituency)
 *   ?party=<TVK|DMK|...>           (holder party short code)
 *   ?status=VACANT|CURRENT
 *   ?q=<search>                    (matches constituency, holder, district, party)
 *
 * Returns the directory grouped by district (for the district-wise view) plus
 * aggregate counts. Every row carries its verification metadata.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')?.toUpperCase()
    const district = sp.get('district')?.trim()
    const pc = sp.get('pc')
    const no = sp.get('no')
    const party = sp.get('party')?.trim().toUpperCase()
    const status = sp.get('status')?.trim().toUpperCase()
    const q = sp.get('q')?.trim()

    if (type && type !== 'ASSEMBLY' && type !== 'PARLIAMENTARY') return bad('type must be ASSEMBLY or PARLIAMENTARY')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (no) where.no = Number(no)
    if (pc) where.parentNo = Number(pc)
    if (party) where.holderPartyShort = party
    if (status) where.holderStatus = status
    if (district) where.district = { is: { name: { contains: district, mode: 'insensitive' } } }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { holderName: { contains: q, mode: 'insensitive' } },
        { holderParty: { contains: q, mode: 'insensitive' } },
        { holderPartyShort: { contains: q, mode: 'insensitive' } },
        { district: { is: { name: { contains: q, mode: 'insensitive' } } } },
      ]
    }

    const rows = await db.constituency.findMany({
      where,
      orderBy: [{ type: 'asc' }, { no: 'asc' }],
      include: {
        district: { select: { id: true, name: true, headquarters: true } },
      },
    })

    // Enrich ACs with parent PC + MP snapshot (single query over PCs).
    const pcs = await db.constituency.findMany({
      where: { type: 'PARLIAMENTARY' },
      select: { no: true, name: true, holderName: true, holderPartyShort: true, reservation: true },
    })
    const pcByNo = new Map(pcs.map((p) => [p.no, p]))

    const enriched = rows.map((r) => {
      if (r.type === 'ASSEMBLY' && r.parentNo) {
        const parent = pcByNo.get(r.parentNo)
        return { ...r, parentPC: parent ? { no: parent.no, name: parent.name, mp: parent.holderName, mpParty: parent.holderPartyShort, reservation: parent.reservation } : null }
      }
      return { ...r, parentPC: null }
    })

    // Group by district for the district-wise directory (ACs only).
    const districtGroups: Array<{ district: string; headquarters: string | null; acCount: number; vacant: number; acs: typeof enriched }> = []
    const byDistrict = new Map<string, typeof enriched>()
    for (const r of enriched) {
      if (r.type !== 'ASSEMBLY') continue
      const key = r.district?.name ?? 'Unassigned'
      const list = byDistrict.get(key) ?? []
      list.push(r)
      byDistrict.set(key, list)
    }
    for (const [key, list] of [...byDistrict.entries()].sort((a, b) => a[1][0].no - b[1][0].no)) {
      districtGroups.push({
        district: key,
        headquarters: list[0].district?.headquarters ?? null,
        acCount: list.length,
        vacant: list.filter((r) => r.holderStatus === 'VACANT').length,
        acs: list,
      })
    }

    // Party tally across the 234 ACs (current holders + vacancies).
    const acRows = enriched.filter((r) => r.type === 'ASSEMBLY')
    const tally: Record<string, number> = {}
    for (const r of acRows) {
      const k = r.holderStatus === 'VACANT' ? 'VACANT' : r.holderPartyShort ?? 'N/A'
      tally[k] = (tally[k] ?? 0) + 1
    }

    return ok({
      meta: {
        assembly: '17th Tamil Nadu Legislative Assembly',
        pollDate: '2026-04-23',
        resultDate: '2026-05-04',
        verifiedAt: '2026-11-06',
        source: 'Election Commission of India results (results.eci.gov.in); TN Legislative Assembly member register',
        note: 'Assembly and parliamentary boundaries are kept separate from administrative districts. Several ACs span modern district lines and are listed under the district containing the seat\u2019s predominant area.',
      },
      stats: {
        acs: acRows.length,
        pcs: enriched.filter((r) => r.type === 'PARLIAMENTARY').length,
        vacancies: tally['VACANT'] ?? 0,
        districts: districtGroups.length,
        tally,
      },
      districtGroups,
      constituencies: enriched,
      total: enriched.length,
    })
  } catch (e) {
    return handleError(e, 'GET /api/constituencies')
  }
}
