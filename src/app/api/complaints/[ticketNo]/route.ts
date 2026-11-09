import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { audit, handleError, ok, bad, getServerVerifiedIdentity } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const FLOW: Record<string, string> = {
  ACKNOWLEDGE: 'ACKNOWLEDGED',
  PROGRESS: 'IN_PROGRESS',
  ESCALATE: 'ESCALATED',
  RESOLVE: 'RESOLVED',
  REJECT: 'REJECTED',
  COMMENT: 'COMMENT',
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ ticketNo: string }> }) {
  try {
    const { ticketNo } = await ctx.params
    const identity = await getServerVerifiedIdentity(req)
    const isAdminView = identity.isAdmin || identity.isVigilance || (identity.isOfficer && !!identity.departmentId)

    const complaint = await db.complaint.findUnique({
      where: { ticketNo },
      include: {
        district: { select: { name: true } },
        assignedDepartment: { select: { name: true, shortName: true } },
        updates: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!complaint) return bad('Complaint not found', 404)

    // Protection: Sensitive corruption/bribery complaints are excluded from unauthorized public access
    const isSensitive = complaint.category === 'CORRUPTION' || complaint.category === 'BRIBERY'
    if (isSensitive && !isAdminView) {
      return bad('Complaint not found', 404)
    }

    // Sanitize citizen PII for public access
    const sanitized = isAdminView
      ? complaint
      : {
          ...complaint,
          citizenContact: null,
          citizenName: complaint.citizenName && complaint.citizenName.toLowerCase() === 'anonymous' ? 'Anonymous' : 'Verified Citizen',
        }

    return ok({ complaint: sanitized })
  } catch (e) {
    return handleError(e, 'GET /api/complaints/[ticketNo]')
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ ticketNo: string }> }) {
  try {
    const { ticketNo } = await ctx.params
    const body = await req.json()
    const action: string = body?.action
    const nextStatus = FLOW[action]
    if (!nextStatus) return bad('Unknown workflow action')

    // Trusted server-side identity verification
    const identity = await getServerVerifiedIdentity(req)
    
    // Determine effective actor and role from database-backed identity
    const actor = identity.isAuthenticated ? identity.username : (body?.actor ?? 'anonymous_citizen')
    const actorRole = identity.isAuthenticated ? identity.role : 'CITIZEN'

    // Role-based protection: Unauthenticated users / citizens can only post comments
    if (actorRole === 'CITIZEN' || actorRole === 'PUBLIC') {
      if (action !== 'COMMENT') {
        return bad('Unauthorized: Citizens can only submit comments, not modify official complaint status', 403)
      }
    }

    const complaint = await db.complaint.findUnique({ where: { ticketNo } })
    if (!complaint) return bad('Complaint not found', 404)

    // Department isolation: If officer is acting, prevent modifying complaints outside their assigned department
    if (identity.isOfficer && !identity.isAdmin && identity.departmentId && complaint.assignedDepartmentId) {
      if (identity.departmentId !== complaint.assignedDepartmentId) {
        return bad('Department isolation: Officers cannot modify complaints outside their assigned department', 403)
      }
    }

    const note: string = body?.note || defaultNote(action)

    const updated = await db.complaint.update({
      where: { ticketNo },
      data: {
        status: nextStatus === 'COMMENT' ? complaint.status : nextStatus,
        assignedDepartmentId: (identity.isAdmin || identity.isOfficer) ? (body?.departmentId ?? complaint.assignedDepartmentId) : complaint.assignedDepartmentId,
        assignedTo: (identity.isAdmin || identity.isOfficer) ? (body?.assignedTo ?? complaint.assignedTo) : complaint.assignedTo,
        resolutionNote: action === 'RESOLVE' ? (note || complaint.resolutionNote) : complaint.resolutionNote,
      },
      include: { district: { select: { name: true } }, assignedDepartment: { select: { name: true, shortName: true } } },
    })
    await db.complaintUpdate.create({
      data: {
        complaintId: complaint.id, note, statusAfter: updated.status, byName: actor, byRole: actorRole,
      },
    })
    await audit({
      actor, actorRole, action: `COMPLAINT_${action}`, entity: 'COMPLAINT', entityId: ticketNo,
      summary: `Complaint ${ticketNo}: ${complaint.status} → ${updated.status}${action === 'COMMENT' ? ' (comment)' : ''}.`,
      details: note,
    })
    return ok({ complaint: updated })
  } catch (e) {
    return handleError(e, 'PATCH /api/complaints/[ticketNo]')
  }
}

function defaultNote(action: string) {
  switch (action) {
    case 'ACKNOWLEDGE': return 'Complaint acknowledged and assigned to the section concerned.'
    case 'PROGRESS': return 'Field action initiated; work is in progress.'
    case 'ESCALATE': return 'Escalated to higher authority for intervention.'
    case 'RESOLVE': return 'Issue resolved and verified on ground.'
    case 'REJECT': return 'Complaint closed after verification — outside scope of the department concerned.'
    default: return 'Status comment added.'
  }
}
