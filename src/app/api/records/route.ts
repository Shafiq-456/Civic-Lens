import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleError, ok, bad, getServerVerifiedIdentity, audit } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const office = sp.get('office') ?? undefined
    const status = sp.get('status') ?? undefined
    const constituencyType = sp.get('constituencyType') ?? undefined
    const districtId = sp.get('districtId') ?? undefined
    const q = sp.get('q')?.trim()

    const where: Record<string, unknown> = {}
    if (office) where.office = office
    if (status) where.status = status
    if (constituencyType) where.constituencyType = constituencyType
    if (districtId) where.districtId = districtId
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { constituencyName: { contains: q, mode: 'insensitive' } },
        { portfolio: { contains: q, mode: 'insensitive' } },
        { party: { contains: q, mode: 'insensitive' } },
      ]
    }

    const records = await db.politicalRecord.findMany({
      where,
      include: { district: { select: { name: true } }, state: { select: { name: true, code: true } } },
      orderBy: [{ office: 'asc' }, { name: 'asc' }],
    })

    // freshness classification (verification cadence: 30 days)
    const now = Date.now()
    const THIRTY_DAYS = 30 * 24 * 3600 * 1000
    const withFreshness = records.map((r) => ({
      ...r,
      freshness: !r.lastVerifiedAt
        ? 'NEVER_VERIFIED'
        : now - r.lastVerifiedAt.getTime() > THIRTY_DAYS
          ? 'STALE'
          : 'FRESH',
    }))

    return ok({ records: withFreshness, total: withFreshness.length })
  } catch (e) {
    return handleError(e, 'GET /api/records')
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verified server-side authentication check
    const identity = await getServerVerifiedIdentity(req)
    if (!identity.isAuthenticated || (!identity.isAdmin && !identity.isOfficer)) {
      return bad('Unauthorized: Administrator or officer credentials required to create records', 403)
    }

    const body = await req.json()
    if (!body?.name || !body?.office) return bad('name and office are required')
    const rec = await db.politicalRecord.create({
      data: {
        name: String(body.name),
        office: String(body.office),
        officeLabel: body.officeLabel ?? null,
        party: body.party ?? null,
        partyShort: body.partyShort ?? null,
        stateId: body.stateId ?? null,
        districtId: body.districtId ?? null,
        constituencyType: body.constituencyType ?? null,
        constituencyName: body.constituencyName ?? null,
        department: body.department ?? null,
        portfolio: body.portfolio ?? body.officeLabel ?? null,
        tenure: body.tenure ?? null,
        officialSource: body.officialSource ?? null,
        sourceName: body.sourceName ?? null,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
        endPeriodDate: body.endPeriodDate ? new Date(body.endPeriodDate) : null,
        status: body.status ?? 'PENDING_VERIFICATION',
        verificationNote: body.verificationNote ?? null,
      },
    })
    await db.verificationLog.create({
      data: {
        recordId: rec.id, action: 'CREATED', newStatus: rec.status,
        sourceUrl: rec.officialSource, verifiedBy: identity.username,
        note: 'Record created via administration portal.',
      },
    })
    await audit({
      actor: identity.username,
      actorRole: identity.role,
      action: 'CREATE_RECORD',
      entity: 'POLITICAL_RECORD',
      entityId: rec.id,
      summary: `Created political record "${rec.name}" (${rec.office}).`,
    })
    return ok({ record: rec }, 201)
  } catch (e) {
    return handleError(e, 'POST /api/records')
  }
}
