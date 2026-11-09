import { db } from '@/lib/db'
import { handleError, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [states, districts, records, complaints, projects, requests, auditCount] = await Promise.all([
      db.state.count(),
      db.district.count(),
      db.politicalRecord.findMany({ select: { status: true, lastVerifiedAt: true } }),
      db.complaint.findMany({ select: { status: true, createdAt: true } }),
      db.project.findMany({ select: { status: true, budgetInrCr: true, sanctionedInrCr: true, spentInrCr: true, progress: true } }),
      db.citizenVerificationRequest.findMany({ select: { status: true } }),
      db.auditLog.count(),
    ])

    const THIRTY_DAYS = 30 * 24 * 3600 * 1000
    const now = Date.now()
    const statusCount = (arr: Array<{ status: string }>) => {
      const m: Record<string, number> = {}
      for (const x of arr) m[x.status] = (m[x.status] ?? 0) + 1
      return m
    }

    const recordStatus = statusCount(records)
    const verified = records.filter((r) => r.lastVerifiedAt).length
    const stale = records.filter((r) => r.lastVerifiedAt && now - r.lastVerifiedAt.getTime() > THIRTY_DAYS).length
    const queueCount = records.filter(
      (r) => r.status === 'PENDING_VERIFICATION' || (r.lastVerifiedAt && now - r.lastVerifiedAt.getTime() > THIRTY_DAYS),
    ).length

    const complaintStatus = statusCount(complaints)
    const resolved = complaints.filter((c) => c.status === 'RESOLVED').length
    const resolvedWithTime = complaints.filter((c) => c.status === 'RESOLVED')
    const avgResolutionHours = resolvedWithTime.length
      ? resolvedWithTime.reduce((acc, c) => acc + (Date.now() - c.createdAt.getTime()) / 36e5, 0) / resolvedWithTime.length
      : 0

    const projectStatus = statusCount(projects)
    const totalBudget = projects.reduce((a, p) => a + p.budgetInrCr, 0)
    const totalSanctioned = projects.reduce((a, p) => a + p.sanctionedInrCr, 0)
    const totalSpent = projects.reduce((a, p) => a + p.spentInrCr, 0)
    const avgProgress = projects.length ? projects.reduce((a, p) => a + p.progress, 0) / projects.length : 0

    const deptBudgets = await db.department.findMany({
      select: { name: true, shortName: true, budgetInrCr: true, _count: { select: { projects: true, schemes: true } } },
      orderBy: { budgetInrCr: 'desc' },
    })

    return ok({
      info: {
        states,
        districts,
        recordsTotal: records.length,
        recordsCurrent: recordStatus.CURRENT ?? 0,
        recordsFormer: recordStatus.FORMER ?? 0,
        recordsVacant: recordStatus.VACANT ?? 0,
        recordsPending: recordStatus.PENDING_VERIFICATION ?? 0,
        verified,
        verifiedPct: records.length ? Math.round((verified / records.length) * 100) : 0,
        stale,
      },
      accountability: {
        complaintsByStatus: complaintStatus,
        complaintsTotal: complaints.length,
        complaintsOpen: complaints.filter((c) => !['RESOLVED', 'REJECTED'].includes(c.status)).length,
        complaintsResolved: resolved,
        resolutionRate: complaints.length ? Math.round((resolved / complaints.length) * 100) : 0,
        avgResolutionHours: Math.round(avgResolutionHours),
        projectsByStatus: projectStatus,
        projectsTotal: projects.length,
        totalBudget,
        totalSanctioned,
        totalSpent,
        utilisationPct: totalSanctioned ? Math.round((totalSpent / totalSanctioned) * 100) : 0,
        avgProgress: Math.round(avgProgress),
        onHold: projectStatus.ON_HOLD ?? 0,
      },
      admin: {
        auditCount,
        verificationQueue: queueCount,
        pendingCitizenRequests: requests.filter((r) => r.status === 'PENDING').length,
        citizenRequestsTotal: requests.length,
        deptBudgets,
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (e) {
    return handleError(e, 'GET /api/stats')
  }
}
