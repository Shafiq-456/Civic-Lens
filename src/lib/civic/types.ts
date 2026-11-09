// Shared TypeScript contracts for the Civic Lenz frontend.

export interface StateSummary {
  id: string
  code: string
  name: string
  region: string | null
  isUnionTerritory: boolean
  assemblySeats: number
  lokSabhaSeats: number
  rajyaSabhaSeats: number
  isFocusState: boolean
  _count: { records: number; districts: number }
}

export interface DistrictSummary {
  id: string
  name: string
  headquarters: string | null
  formedOn: string | null
  geoName: string | null
  _count: { records: number; projects: number; complaints: number }
}

export interface PoliticalRecord {
  id: string
  name: string
  office: string
  officeLabel: string | null
  party: string | null
  partyShort: string | null
  constituencyType: string | null
  constituencyName: string | null
  department: string | null
  portfolio: string | null
  accentColor: string | null
  tenure: string | null
  officialSource: string | null
  sourceName: string | null
  effectiveDate: string | null
  endPeriodDate: string | null
  lastVerifiedAt: string | null
  verifiedBy: string | null
  status: 'CURRENT' | 'FORMER' | 'VACANT' | 'PENDING_VERIFICATION'
  verificationNote: string | null
  district?: { name: string } | null
  state?: { name: string; code: string } | null
  freshness?: 'FRESH' | 'STALE' | 'NEVER_VERIFIED'
}

export interface VerificationLog {
  id: string
  action: string
  previousStatus: string | null
  newStatus: string | null
  sourceUrl: string | null
  verifiedBy: string
  note: string | null
  createdAt: string
}

export interface Department {
  id: string
  name: string
  shortName: string | null
  description: string
  ministerName: string | null
  secretaryName: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  website: string | null
  budgetInrCr: number
  officialSource: string | null
  sourceName: string | null
  lastVerifiedAt: string | null
  verificationStatus: string
  verificationNote: string | null
  _count: { schemes: number; projects: number; complaints: number; announcements: number }
}

export interface Scheme {
  id: string
  name: string
  description: string
  eligibility: string | null
  benefits: string | null
  beneficiaries: string | null
  launchDate: string | null
  status: string
  budgetInrCr: number | null
  applicationUrl: string | null
  officialSource: string | null
  sourceName: string | null
  lastVerifiedAt: string | null
  verificationStatus: string
  verificationNote: string | null
  department?: { name: string; shortName: string | null } | null
}

export interface Announcement {
  id: string
  title: string
  body: string
  category: string
  publishedAt: string
  isImportant: boolean
  officialSource: string | null
  sourceName: string | null
  lastVerifiedAt: string | null
  verificationStatus: string
  department?: { name: string; shortName: string | null } | null
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string | null
  location: string | null
  type: string
  organizer: string | null
  verificationStatus: string
  sourceNote: string | null
}

export interface ProjectSummary {
  id: string
  code: string
  name: string
  description: string
  category: string
  budgetInrCr: number
  sanctionedInrCr: number
  spentInrCr: number
  progress: number
  status: string
  startDate: string | null
  targetEndDate: string | null
  completedOn: string | null
  contractor: string | null
  fundedBy: string | null
  department?: { name: string; shortName: string | null } | null
  district?: { name: string } | null
  _count?: { milestones: number }
}

export interface Milestone {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  completedOn: string | null
  status: string
  amountReleasedCr: number | null
  sortOrder: number
}

export interface ProjectDetail extends Omit<ProjectSummary, '_count'> {
  department?: { name: string; shortName: string | null; contactEmail: string | null } | null
  district?: { name: string } | null
  milestones: Milestone[]
}

export interface ComplaintSummary {
  id: string
  ticketNo: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  citizenName: string
  citizenContact: string | null
  wardOrArea: string | null
  slaDueAt: string | null
  resolutionNote: string | null
  satisfaction: number | null
  createdAt: string
  updatedAt: string
  district?: { name: string } | null
  assignedDepartment?: { name: string; shortName: string | null } | null
  _count?: { updates: number }
}

export interface ComplaintUpdate {
  id: string
  note: string
  statusAfter: string
  byName: string
  byRole: string
  createdAt: string
}

export interface ComplaintDetail extends Omit<ComplaintSummary, '_count'> {
  updates: ComplaintUpdate[]
}

export interface CitizenVerificationRequest {
  id: string
  requestNo: string
  citizenName: string
  requestType: string
  documentMasked: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  remarks: string | null
  submittedAt: string
  processedAt: string | null
}

export interface AuditLogEntry {
  id: string
  actor: string
  actorRole: string
  action: string
  entity: string
  entityId: string | null
  summary: string
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export interface DemoUser {
  username: string
  name: string
  role: 'ADMIN' | 'DEPT_OFFICER' | 'AUDITOR'
  department: string | null
}

export interface CivicStats {
  info: {
    states: number
    districts: number
    recordsTotal: number
    recordsCurrent: number
    recordsFormer: number
    recordsVacant: number
    recordsPending: number
    verified: number
    verifiedPct: number
    stale: number
  }
  accountability: {
    complaintsByStatus: Record<string, number>
    complaintsTotal: number
    complaintsOpen: number
    complaintsResolved: number
    resolutionRate: number
    avgResolutionHours: number
    projectsByStatus: Record<string, number>
    projectsTotal: number
    totalBudget: number
    totalSanctioned: number
    totalSpent: number
    utilisationPct: number
    avgProgress: number
    onHold: number
  }
  admin: {
    auditCount: number
    verificationQueue: number
    pendingCitizenRequests: number
    citizenRequestsTotal: number
    deptBudgets: Array<{ name: string; shortName: string | null; budgetInrCr: number; _count: { projects: number; schemes: number } }>
  }
  generatedAt: string
}
