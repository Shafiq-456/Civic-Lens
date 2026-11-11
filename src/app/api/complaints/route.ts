import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { audit, handleError, ok, bad, getServerVerifiedIdentity } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const CATEGORIES = ['ROAD', 'WATER', 'ELECTRICITY', 'SANITATION', 'HEALTH', 'EDUCATION', 'CORRUPTION', 'OTHER']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const status = sp.get('status') ?? undefined
    const category = sp.get('category') ?? undefined
    const districtId = sp.get('districtId') ?? undefined
    const q = sp.get('q')?.trim()
    const take = Math.min(Number(sp.get('take') ?? 100), 200)

    // Security check: Verify admin access via trusted server-side identity
    const identity = await getServerVerifiedIdentity(req)
    const isAdminView = identity.isAdmin || identity.isVigilance

    const complaints = await db.complaint.findMany({
      where: {
        ...(isAdminView ? {} : { isPublic: true, category: { notIn: ['CORRUPTION', 'BRIBERY'] } }),
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(districtId ? { districtId } : {}),
        ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { ticketNo: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      include: {
        district: { select: { name: true } },
        assignedDepartment: { select: { name: true, shortName: true } },
        _count: { select: { updates: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    })

    // Mask PII on public feeds to prevent citizen identity harvesting
    const sanitizedComplaints = complaints.map((c) => {
      if (isAdminView) return c
      return {
        ...c,
        citizenContact: null,
        citizenName: c.citizenName && c.citizenName.toLowerCase() === 'anonymous' ? 'Anonymous' : 'Verified Citizen',
      }
    })

    return ok({ complaints: sanitizedComplaints })
  } catch (e) {
    return handleError(e, 'GET /api/complaints')
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, category, districtId, citizenName, contact, wardOrArea } = body ?? {}
    if (!title || !description || !category || !citizenName) {
      return bad('title, description, category and citizenName are required')
    }
    if (!CATEGORIES.includes(category)) return bad('Invalid category')
    const priority = PRIORITIES.includes(body.priority) ? body.priority : 'MEDIUM'

    const year = new Date().getFullYear()
    const count = await db.complaint.count()
    const ticketNo = `CL-${year}-${String(count + 121).padStart(6, '0')}`

    // Whistleblower protection: CORRUPTION and BRIBERY complaints are never made public
    const isSensitive = category === 'CORRUPTION' || category === 'BRIBERY'
    const slaHours = priority === 'CRITICAL' ? 48 : priority === 'HIGH' ? 72 : priority === 'MEDIUM' ? 120 : 240

    const complaint = await db.complaint.create({
      data: {
        ticketNo,
        title, description, category, priority,
        status: 'SUBMITTED',
        isPublic: !isSensitive,
        districtId: districtId || null,
        citizenName, citizenContact: contact ?? null, wardOrArea: wardOrArea ?? null,
        slaDueAt: new Date(Date.now() + slaHours * 3600 * 1000),
      },
      include: { district: { select: { name: true } } },
    })
    await db.complaintUpdate.create({
      data: {
        complaintId: complaint.id,
        note: 'Complaint registered. Expected first response within 48 hours.',
        statusAfter: 'SUBMITTED', byName: 'System', byRole: 'CITIZEN',
      },
    })
    await audit({
      actor: citizenName, actorRole: 'CITIZEN', action: 'FILE_COMPLAINT', entity: 'COMPLAINT',
      entityId: ticketNo, summary: `New ${category.toLowerCase()} complaint filed: “${title}”.`,
    })
    return ok({ complaint }, 201)
  } catch (e) {
    return handleError(e, 'POST /api/complaints')
  }
}
