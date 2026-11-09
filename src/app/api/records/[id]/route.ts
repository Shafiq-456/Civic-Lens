import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { audit, handleError, ok, bad } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * Verification workflow for a single political record.
 * actions: VERIFY | STATUS | SOURCE — every action writes a VerificationLog + AuditLog.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const action: string = body?.action
    const actor: string = body?.actor ?? 'admin'
    const actorRole: string = body?.actorRole ?? 'ADMIN'

    const existing = await db.politicalRecord.findUnique({ where: { id } })
    if (!existing) return bad('Record not found', 404)

    if (action === 'VERIFY') {
      const updated = await db.politicalRecord.update({
        where: { id },
        data: {
          lastVerifiedAt: new Date(),
          verifiedBy: actor,
          officialSource: body.sourceUrl ?? existing.officialSource,
          sourceName: body.sourceName ?? existing.sourceName,
        },
      })
      await db.verificationLog.create({
        data: {
          recordId: id, action: 'VERIFIED', previousStatus: existing.status, newStatus: existing.status,
          sourceUrl: updated.officialSource, verifiedBy: actor, note: body.note ?? 'Verified against cited official source.',
        },
      })
      await audit({ actor, actorRole, action: 'VERIFY_RECORD', entity: 'POLITICAL_RECORD', entityId: id, summary: `Verified record “${existing.name}” against official source.` })
      return ok({ record: updated })
    }

    if (action === 'STATUS') {
      const newStatus: string = body.status
      if (!['CURRENT', 'FORMER', 'VACANT', 'PENDING_VERIFICATION'].includes(newStatus)) {
        return bad('Invalid status value')
      }
      const updated = await db.politicalRecord.update({
        where: { id },
        data: {
          status: newStatus,
          verificationNote: body.note ?? existing.verificationNote,
          endPeriodDate: newStatus === 'FORMER' && !existing.endPeriodDate ? new Date() : existing.endPeriodDate,
          lastVerifiedAt: new Date(),
          verifiedBy: actor,
        },
      })
      await db.verificationLog.create({
        data: {
          recordId: id, action: 'STATUS_CHANGED', previousStatus: existing.status, newStatus,
          sourceUrl: body.sourceUrl ?? existing.officialSource, verifiedBy: actor,
          note: body.note ?? `Status changed ${existing.status} → ${newStatus}.`,
        },
      })
      await audit({ actor, actorRole, action: 'CHANGE_RECORD_STATUS', entity: 'POLITICAL_RECORD', entityId: id, summary: `Record “${existing.name}”: ${existing.status} → ${newStatus}.`, details: body.note ?? null })
      return ok({ record: updated })
    }

    if (action === 'SOURCE') {
      const updated = await db.politicalRecord.update({
        where: { id },
        data: {
          officialSource: body.sourceUrl ?? existing.officialSource,
          sourceName: body.sourceName ?? existing.sourceName,
          verificationNote: body.note ?? existing.verificationNote,
        },
      })
      await db.verificationLog.create({
        data: {
          recordId: id, action: 'SOURCE_UPDATED', previousStatus: existing.status, newStatus: existing.status,
          sourceUrl: updated.officialSource, verifiedBy: actor, note: body.note ?? 'Official source reference updated.',
        },
      })
      await audit({ actor, actorRole, action: 'SOURCE_UPDATED', entity: 'POLITICAL_RECORD', entityId: id, summary: `Source updated for “${existing.name}”.` })
      return ok({ record: updated })
    }

    return bad('Unknown action — expected VERIFY, STATUS or SOURCE')
  } catch (e) {
    return handleError(e, 'PATCH /api/records/[id]')
  }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const record = await db.politicalRecord.findUnique({
      where: { id },
      include: {
        district: { select: { name: true } },
        state: { select: { name: true, code: true } },
        verificationLogs: { orderBy: { createdAt: 'desc' }, take: 25 },
      },
    })
    if (!record) return bad('Record not found', 404)
    return ok({ record })
  } catch (e) {
    return handleError(e, 'GET /api/records/[id]')
  }
}
