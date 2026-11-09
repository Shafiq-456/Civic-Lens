// Server-only grounding context for Markus (Civic Lenz AI assistant).
// Builds a compact, verifiable snapshot of the platform database so the LLM
// answers from Civic Lenz's verified directory instead of its own memory.
// Cached in memory for a few minutes to keep chat latency low.

import { db } from '@/lib/db'

export interface MarkusContext {
  text: string
  generatedAt: string
  stats: {
    records: number
    schemes: number
    departments: number
    announcements: number
    projects: number
    acs: number
    pcs: number
  }
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let cache: { context: MarkusContext; expiresAt: number } | null = null

const fmtDate = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'not recorded'

export async function getMarkusContext(): Promise<MarkusContext> {
  if (cache && Date.now() < cache.expiresAt) return cache.context

  const [
    national,
    tnLeaders,
    departments,
    schemes,
    announcements,
    projects,
    complaints,
    acs,
    pcs,
    stateCount,
    districtCount,
  ] = await Promise.all([
    db.politicalRecord.findMany({
      where: { jurisdiction: 'NATIONAL', status: 'CURRENT', office: { in: ['PRESIDENT', 'VICE_PRESIDENT', 'PRIME_MINISTER', 'LOK_SABHA_SPEAKER'] } },
      select: { office: true, officeLabel: true, name: true, party: true, partyShort: true, tenure: true, verificationStatus: true, lastVerifiedAt: true },
      orderBy: { office: 'asc' },
    }),
    db.politicalRecord.findMany({
      where: { jurisdiction: 'STATE', status: 'CURRENT', office: { in: ['GOVERNOR', 'CHIEF_MINISTER', 'DEPUTY_CM', 'SPEAKER', 'DEPUTY_SPEAKER', 'LEADER_OF_OPPOSITION', 'MINISTER'] } },
      select: { office: true, officeLabel: true, name: true, party: true, partyShort: true, constituencyName: true, portfolio: true, department: true, verificationStatus: true, lastVerifiedAt: true },
      orderBy: [{ office: 'asc' }, { name: 'asc' }],
    }),
    db.department.findMany({
      select: { name: true, shortName: true, ministerName: true, secretaryName: true, services: true, website: true, verificationStatus: true },
      orderBy: { name: 'asc' },
    }),
    db.scheme.findMany({
      select: { name: true, level: true, status: true, eligibility: true, benefits: true, beneficiaries: true, applicationUrl: true, department: { select: { name: true, shortName: true } }, verificationStatus: true },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    }),
    db.announcement.findMany({
      select: { title: true, category: true, publisher: true, publishedAt: true, officialSource: true, department: { select: { name: true, shortName: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    }),
    db.project.findMany({
      select: { code: true, name: true, status: true, progress: true, budgetInrCr: true, district: { select: { name: true } }, department: { select: { shortName: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
    db.complaint.groupBy({ by: ['status'], _count: true }),
    db.constituency.findMany({
      where: { type: 'ASSEMBLY' },
      select: { no: true, name: true, reservation: true, district: { select: { name: true } }, holderName: true, holderParty: true, holderStatus: true, officeTitle: true, verificationStatus: true },
      orderBy: { no: 'asc' },
    }),
    db.constituency.findMany({
      where: { type: 'PARLIAMENTARY' },
      select: { no: true, name: true, holderName: true, holderParty: true, holderStatus: true, verificationStatus: true },
      orderBy: { no: 'asc' },
    }),
    db.state.count(),
    db.district.count(),
  ])

  const lines: string[] = []
  lines.push(`PLATFORM SNAPSHOT GENERATED AT: ${new Date().toISOString()}`)
  lines.push('Civic Lenz tracks: India-wide geography (' + stateCount + ' states/UTs listed, ' + districtCount + ' Tamil Nadu districts), a verification-first political directory, government schemes, departments, announcements, a civic calendar, development projects and citizen complaints.')

  lines.push('')
  lines.push('== NATIONAL LEADERSHIP (CURRENT, as recorded in platform directory) ==')
  for (const r of national) {
    const label = r.officeLabel || r.office.replace(/_/g, ' ')
    lines.push(`- ${label}: ${r.name}${r.partyShort ? ` (${r.partyShort})` : ''} · verified: ${fmtDate(r.lastVerifiedAt)} [${r.verificationStatus}]`)
  }

  lines.push('')
  lines.push('== TAMIL NADU STATE LEADERSHIP (CURRENT) ==')
  for (const r of tnLeaders) {
    const label = r.officeLabel || r.office.replace(/_/g, ' ')
    const bits = [`- ${label}: ${r.name}${r.partyShort ? ` (${r.partyShort})` : ''}`]
    if (r.portfolio || r.department) bits.push(`portfolio: ${r.portfolio || r.department}`)
    if (r.constituencyName) bits.push(`constituency: ${r.constituencyName}`)
    bits.push(`verified: ${fmtDate(r.lastVerifiedAt)} [${r.verificationStatus}]`)
    lines.push(bits.join(' · '))
  }

  lines.push('')
  lines.push('== TAMIL NADU ASSEMBLY CONSTITUENCIES & CURRENT MLAs (234 seats, ECI delimitation numbering) ==')
  lines.push('Format: AC no. Name (reservation) [District] — MLA Name (Party) [status] [verification]')
  for (const c of acs) {
    const res = c.reservation ? ` (${c.reservation})` : ''
    const holder = c.holderStatus === 'VACANT' ? 'VACANT' : `${c.holderName ?? 'not recorded'}${c.holderParty ? ` (${c.holderParty})` : ''}`
    lines.push(`AC ${c.no} ${c.name}${res} [${c.district?.name ?? 'district n/a'}] — ${holder}${c.officeTitle ? ` — ${c.officeTitle}` : ''} [${c.verificationStatus}]`)
  }

  lines.push('')
  lines.push('== TAMIL NADU PARLIAMENTARY CONSTITUENCIES & CURRENT MPs (39 seats) ==')
  for (const c of pcs) {
    const holder = c.holderStatus === 'VACANT' ? 'VACANT' : `${c.holderName ?? 'not recorded'}${c.holderParty ? ` (${c.holderParty})` : ''}`
    lines.push(`PC ${c.no} ${c.name} — MP: ${holder} [${c.verificationStatus}]`)
  }

  lines.push('')
  lines.push('== GOVERNMENT SCHEMES (status as recorded) ==')
  for (const s of schemes) {
    const bits = [`- ${s.name} [${s.level}] — status: ${s.status} [${s.verificationStatus}]`]
    if (s.department) bits.push(`dept: ${s.department.shortName || s.department.name}`)
    if (s.eligibility) bits.push(`eligibility: ${s.eligibility}`)
    if (s.benefits) bits.push(`benefits: ${s.benefits}`)
    if (s.beneficiaries) bits.push(`beneficiaries: ${s.beneficiaries}`)
    if (s.applicationUrl) bits.push(`apply: ${s.applicationUrl}`)
    lines.push(bits.join(' · '))
  }

  lines.push('')
  lines.push('== DEPARTMENTS TRACKED ==')
  for (const d of departments) {
    const bits = [`- ${d.name}${d.shortName ? ` (${d.shortName})` : ''} [${d.verificationStatus}]`]
    if (d.ministerName) bits.push(`minister: ${d.ministerName}`)
    if (d.secretaryName) bits.push(`secretary: ${d.secretaryName}`)
    if (d.services) bits.push(`services: ${d.services}`)
    if (d.website) bits.push(`website: ${d.website}`)
    lines.push(bits.join(' · '))
  }

  lines.push('')
  lines.push('== LATEST ANNOUNCEMENTS (newest first) ==')
  for (const a of announcements) {
    const src = a.department ? ` — ${a.department.shortName || a.department.name}` : a.publisher ? ` — ${a.publisher}` : ''
    lines.push(`- [${a.category}] ${a.title}${src} · published ${fmtDate(a.publishedAt)}${a.officialSource ? ` · source: ${a.officialSource}` : ''}`)
  }

  lines.push('')
  lines.push('== DEVELOPMENT PROJECTS (accountability portal) ==')
  for (const p of projects) {
    lines.push(`- ${p.name} (${p.code})${p.district ? ` · ${p.district.name}` : ''}${p.department ? ` · ${p.department.shortName || p.department.name}` : ''} · status: ${p.status} · progress: ${p.progress}% · budget ₹${p.budgetInrCr} cr`)
  }

  lines.push('')
  lines.push('== CITIZEN COMPLAINT STATS ==')
  const total = complaints.reduce((a, c) => a + c._count, 0)
  const resolved = complaints.find((c) => c.status === 'RESOLVED')?._count ?? 0
  lines.push(`- Total: ${total}; by status: ${complaints.map((c) => `${c.status}=${c._count}`).join(', ')}`)
  lines.push(`- Resolution rate: ${total ? Math.round((resolved / total) * 100) : 0}%`)
  lines.push('- Complaint tickets look like CL-YYYY-NNNNNN and can be tracked under Public Accountability → Track Complaints.')

  lines.push('')
  lines.push('== HOW TO NAVIGATE USERS IN CIVIC LENZ ==')
  lines.push('- Government Information Portal: Interactive Maps, Leadership directory, Announcements, Calendar, Schemes, Departments, Constituency/MLA-MP directory.')
  lines.push('- Public Accountability Portal: Overview, File Complaint, Track Complaints, Projects (with milestones & spend), Financial transparency, Citizen verification.')
  lines.push('- Government Administration Portal: department workflows & data management (login-gated, demo credentials exist).')
  lines.push('- Trust, Data Governance & Deployment: data sources, sync status, map accuracy, security plan, deployment roadmap.')

  const text = lines.join('\n')

  const context: MarkusContext = {
    text,
    generatedAt: new Date().toISOString(),
    stats: {
      records: national.length + tnLeaders.length,
      schemes: schemes.length,
      departments: departments.length,
      announcements: announcements.length,
      projects: projects.length,
      acs: acs.length,
      pcs: pcs.length,
    },
  }

  cache = { context, expiresAt: Date.now() + CACHE_TTL_MS }
  return context
}
