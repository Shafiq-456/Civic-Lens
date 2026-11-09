// Formatting helpers and metadata maps for Civic Lenz.

export function formatCr(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} lakh Cr`
  if (n >= 1000) return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`
}

export function formatNum(n: number): string {
  return n.toLocaleString('en-IN')
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  return `${Math.floor(months / 12)} yr ago`
}

export const OFFICE_META: Record<string, { label: string; group: string }> = {
  PRESIDENT: { label: 'President of India', group: 'Constitutional — Union' },
  VICE_PRESIDENT: { label: 'Vice President of India', group: 'Constitutional — Union' },
  PRIME_MINISTER: { label: 'Prime Minister of India', group: 'Constitutional — Union' },
  LOK_SABHA_SPEAKER: { label: 'Speaker, Lok Sabha', group: 'Constitutional — Union' },
  GOVERNOR: { label: 'Governor', group: 'Constitutional — State' },
  CHIEF_MINISTER: { label: 'Chief Minister', group: 'Executive' },
  DEPUTY_CM: { label: 'Deputy CM', group: 'Executive' },
  SPEAKER: { label: 'Speaker', group: 'Legislature' },
  DEPUTY_SPEAKER: { label: 'Deputy Speaker', group: 'Legislature' },
  LEADER_OF_OPPOSITION: { label: 'Leader of the Opposition', group: 'Legislature' },
  MINISTER: { label: 'Minister', group: 'Executive' },
  MLA: { label: 'MLA', group: 'Legislature' },
  MP_LOK_SABHA: { label: 'MP — Lok Sabha', group: 'Parliament' },
  MP_RAJYA_SABHA: { label: 'MP — Rajya Sabha', group: 'Parliament' },
}

export const STATUS_META: Record<string, { label: string; tone: 'green' | 'slate' | 'red' | 'amber' }> = {
  CURRENT: { label: 'Current', tone: 'green' },
  FORMER: { label: 'Former', tone: 'slate' },
  VACANT: { label: 'Vacant', tone: 'red' },
  PENDING_VERIFICATION: { label: 'Pending verification', tone: 'amber' },
}

export const FRESHNESS_META: Record<string, { label: string; tone: 'green' | 'amber' | 'red' }> = {
  FRESH: { label: 'Verified ≤ 30 days', tone: 'green' },
  STALE: { label: 'Verification stale (> 30 days)', tone: 'amber' },
  NEVER_VERIFIED: { label: 'Never verified', tone: 'red' },
}

export const COMPLAINT_STATUS_META: Record<string, { label: string; tone: 'slate' | 'amber' | 'green' | 'red' | 'teal' }> = {
  SUBMITTED: { label: 'Submitted', tone: 'slate' },
  ACKNOWLEDGED: { label: 'Acknowledged', tone: 'amber' },
  IN_PROGRESS: { label: 'In progress', tone: 'teal' },
  ESCALATED: { label: 'Escalated', tone: 'red' },
  RESOLVED: { label: 'Resolved', tone: 'green' },
  REJECTED: { label: 'Rejected', tone: 'slate' },
}

export const COMPLAINT_CATEGORY_META: Record<string, { label: string }> = {
  ROAD: { label: 'Roads & transport' },
  WATER: { label: 'Water supply' },
  ELECTRICITY: { label: 'Electricity & lighting' },
  SANITATION: { label: 'Sanitation & drainage' },
  HEALTH: { label: 'Health services' },
  EDUCATION: { label: 'Education' },
  CORRUPTION: { label: 'Grievance / integrity' },
  OTHER: { label: 'Other civic issue' },
}

export const PROJECT_STATUS_META: Record<string, { label: string; tone: 'slate' | 'amber' | 'teal' | 'green' | 'red' }> = {
  PROPOSED: { label: 'Proposed', tone: 'slate' },
  TENDERING: { label: 'Tendering', tone: 'amber' },
  IN_PROGRESS: { label: 'In progress', tone: 'teal' },
  COMPLETED: { label: 'Completed', tone: 'green' },
  ON_HOLD: { label: 'On hold', tone: 'red' },
}

export const EVENT_TYPE_META: Record<string, { label: string }> = {
  ASSEMBLY_SESSION: { label: 'Assembly session' },
  REVIEW_MEETING: { label: 'Review meeting' },
  PUBLIC_HEARING: { label: 'Public hearing' },
  SCHEME_LAUNCH: { label: 'Scheme launch' },
  DEADLINE: { label: 'Statutory deadline' },
}

export const ANNOUNCEMENT_CATEGORY_META: Record<string, { label: string }> = {
  POLICY: { label: 'Policy' },
  TENDER: { label: 'Tender' },
  SCHEME: { label: 'Scheme' },
  PUBLIC_NOTICE: { label: 'Public notice' },
  PRESS: { label: 'Press' },
}

export const TONE_CLASS: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
}
