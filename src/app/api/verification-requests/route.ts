import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { audit, handleError, ok, bad } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const requests = await db.citizenVerificationRequest.findMany({ orderBy: { submittedAt: 'desc' } })
    return ok({ requests })
  } catch (e) {
    return handleError(e, 'GET /api/verification-requests')
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.citizenName || !body?.requestType) return bad('citizenName and requestType are required')
    const count = await db.citizenVerificationRequest.count()
    const requestNo = `CV-${new Date().getFullYear()}-${String(count + 421).padStart(6, '0')}`
    const request = await db.citizenVerificationRequest.create({
      data: {
        requestNo, citizenName: String(body.citizenName), requestType: String(body.requestType),
        documentMasked: body.documentMasked ?? null, status: 'PENDING',
        remarks: 'Submitted through public portal (demonstration).',
      },
    })
    await audit({
      actor: body.citizenName, actorRole: 'CITIZEN', action: 'SUBMIT_VERIFICATION', entity: 'CITIZEN_VERIFICATION',
      entityId: requestNo, summary: `Verification request submitted (${body.requestType}).`,
    })
    return ok({ request }, 201)
  } catch (e) {
    return handleError(e, 'POST /api/verification-requests')
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestNo, decision, remarks, actor } = body ?? {}
    if (!requestNo || !['APPROVED', 'REJECTED'].includes(decision)) {
      return ok({ error: 'requestNo and decision (APPROVED|REJECTED) required' }, 400)
    }
    const existing = await db.citizenVerificationRequest.findUnique({ where: { requestNo } })
    if (!existing) return ok({ error: 'Request not found' }, 404)
    const request = await db.citizenVerificationRequest.update({
      where: { requestNo },
      data: { status: decision, remarks: remarks ?? existing.remarks, processedAt: new Date() },
    })
    await audit({
      actor: actor ?? 'admin', actorRole: 'ADMIN', action: decision === 'APPROVED' ? 'APPROVE_VERIFICATION' : 'REJECT_VERIFICATION',
      entity: 'CITIZEN_VERIFICATION', entityId: requestNo,
      summary: `Verification request ${requestNo} ${decision.toLowerCase()}.`, details: remarks ?? null,
    })
    return ok({ request })
  } catch (e) {
    return handleError(e, 'PATCH /api/verification-requests')
  }
}
