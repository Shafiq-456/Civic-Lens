'use client'

import { ArrowRight, CheckCircle2, ClipboardList, FolderKanban, MapPin, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataBanner } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, SectionTitle, StatCard } from '@/components/civic/ui-bits'
import { useApi } from '@/lib/civic/api'
import { COMPLAINT_CATEGORY_META, COMPLAINT_STATUS_META, PROJECT_STATUS_META, formatCr, formatDate, formatNum, relativeTime } from '@/lib/civic/format'
import type { CivicStats } from '@/lib/civic/types'
import { ComplaintStatusChip, StatusBarList, type ComplaintsResponse } from './shared'

/** Tab 1 — headline stats, status distributions and the latest public complaints. */
export default function OverviewTab({ onTrackTicket }: { onTrackTicket: (ticket: string) => void }) {
  const stats = useApi<CivicStats>('/api/stats')
  const complaints = useApi<ComplaintsResponse>('/api/complaints')

  const acc = stats.data?.accountability ?? null
  const recent = complaints.data?.complaints.slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      <DataBanner>
        <strong>Demonstration dataset.</strong> Every complaint, project and financial figure in this portal is illustrative
        demonstration data for the accountability workflow. Citizen contact details are masked at rest — no personal data is
        stored unmasked. Production use requires audited finance feeds and authorised records.
      </DataBanner>

      {/* Headline stats */}
      {stats.loading ? (
        <Loading label="Loading accountability stats…" />
      ) : stats.error ? (
        <ErrorState message={stats.error} />
      ) : acc ? (
        <section aria-label="Headline accountability statistics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Open complaints"
              value={formatNum(acc.complaintsOpen)}
              sub={`of ${formatNum(acc.complaintsTotal)} total filed`}
              icon={ClipboardList}
              tone="rose"
            />
            <StatCard
              label="Resolution rate"
              value={`${acc.resolutionRate}%`}
              sub={`avg resolution ${formatNum(acc.avgResolutionHours)} h`}
              icon={CheckCircle2}
              tone="emerald"
            />
            <StatCard
              label="Active projects"
              value={formatNum(acc.projectsTotal)}
              sub={`${formatNum(acc.onHold)} on hold`}
              icon={FolderKanban}
              tone="teal"
            />
            <StatCard
              label="Budget utilisation"
              value={`${acc.utilisationPct}%`}
              sub={`${formatCr(acc.totalSpent)} of ${formatCr(acc.totalSanctioned)}`}
              icon={Wallet}
              tone="amber"
            />
          </div>
        </section>
      ) : null}

      {/* Status distributions */}
      {acc && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Complaints by status">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Complaints by status</h3>
            <StatusBarList byStatus={acc.complaintsByStatus} meta={COMPLAINT_STATUS_META} />
            <p className="mt-4 text-xs text-slate-500">
              {formatNum(acc.complaintsTotal)} complaints filed · {formatNum(acc.complaintsOpen)} currently open
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Projects by status">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Projects by status</h3>
            <StatusBarList byStatus={acc.projectsByStatus} meta={PROJECT_STATUS_META} />
            <p className="mt-4 text-xs text-slate-500">
              {formatNum(acc.projectsTotal)} projects tracked · average progress {acc.avgProgress}%
            </p>
          </section>
        </div>
      )}

      {/* Recent public complaints */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle
          icon={ClipboardList}
          title="Recent public complaints"
          subtitle="The latest filings across districts. Open any ticket in the live status timeline."
        />
        {complaints.loading ? (
          <Loading label="Loading recent complaints…" />
        ) : complaints.error ? (
          <ErrorState message={complaints.error} />
        ) : recent.length === 0 ? (
          <EmptyState
            title="No complaints filed yet"
            hint="Be the first to report a civic issue from the “File a Complaint” tab."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-teal-700">{c.ticketNo}</span>
                    <ComplaintStatusChip status={c.status} />
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-slate-800" title={c.title}>
                    {c.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                    <span>{c.district?.name ?? 'State-wide'}</span>
                    <span aria-hidden>·</span>
                    <span>{COMPLAINT_CATEGORY_META[c.category]?.label ?? c.category}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {relativeTime(c.createdAt)} ({formatDate(c.createdAt)})
                    </span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 self-start sm:self-center"
                  onClick={() => onTrackTicket(c.ticketNo)}
                  aria-label={`Track complaint ${c.ticketNo}`}
                >
                  Track this
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
