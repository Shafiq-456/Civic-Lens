'use client'

import { useMemo } from 'react'
import { CalendarDays, ExternalLink, Gift, IndianRupee, ShieldCheck, ShieldQuestion, Sparkles, UserCheck, Users } from 'lucide-react'
import { useApi } from '@/lib/civic/api'
import type { Scheme } from '@/lib/civic/types'
import { formatCr, formatDate, relativeTime } from '@/lib/civic/format'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, SectionTitle } from '@/components/civic/ui-bits'
import { CARD } from './shared'

/* ------------------------------------------------------------------ */

interface SchemesResponse {
  schemes: Scheme[]
}

function statusTone(status: string): string {
  const s = status.toUpperCase()
  if (s === 'ACTIVE' || s === 'ONGOING') return 'green'
  if (s === 'PROPOSED' || s === 'PILOT' || s === 'PHASE_1') return 'amber'
  return 'slate'
}

function statusLabel(status: string): string {
  const s = status.replaceAll('_', ' ').toLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function VerificationChip({ status }: { status: string }) {
  if (status === 'VERIFIED') {
    return (
      <GenericChip tone="teal">
        <ShieldCheck className="h-3 w-3" aria-hidden />
        Source verified
      </GenericChip>
    )
  }
  return (
    <GenericChip tone="amber">
      <ShieldQuestion className="h-3 w-3" aria-hidden />
      Pending verification
    </GenericChip>
  )
}

/* ------------------------------------------------------------------ */

export default function SchemesPanel() {
  const { data, loading, error } = useApi<SchemesResponse>('/api/schemes')
  const schemes = data?.schemes ?? []

  const deptCount = useMemo(
    () => new Set(schemes.map((s) => s.department?.name ?? s.department?.shortName ?? '').filter(Boolean)).size,
    [schemes],
  )

  return (
    <section aria-label="Government schemes" className="space-y-4">
      <SectionTitle
        icon={Sparkles}
        title="Schemes"
        subtitle="Flagship welfare and development schemes with eligibility, benefits and outlay."
        right={
          !loading && !error && schemes.length > 0 ? (
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              {schemes.length} scheme{schemes.length === 1 ? '' : 's'} across {deptCount} department{deptCount === 1 ? '' : 's'}
            </span>
          ) : undefined
        }
      />

      {loading ? (
        <Loading label="Loading schemes…" />
      ) : error ? (
        <ErrorState message={`Could not load schemes: ${error}`} />
      ) : schemes.length === 0 ? (
        <EmptyState title="No schemes listed" hint="Scheme profiles will appear here once the directory is populated." />
      ) : (
        <ul className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {schemes.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </ul>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function SchemeCard({ scheme: s }: { scheme: Scheme }) {
  return (
    <li className={`${CARD} flex flex-col`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {s.department && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {s.department.shortName ?? s.department.name}
            </span>
          )}
          <GenericChip tone={statusTone(s.status)}>{statusLabel(s.status)}</GenericChip>
          <VerificationChip status={s.verificationStatus} />
        </div>
        {s.budgetInrCr !== null && (
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800">
            <IndianRupee className="h-3.5 w-3.5" aria-hidden />
            {formatCr(s.budgetInrCr)}
          </p>
        )}
      </div>

      <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900">{s.name}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-600">{s.description}</p>

      {s.verificationNote && (
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
          {s.verificationNote}
        </p>
      )}

      <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
        {s.eligibility && (
          <div className="flex items-start gap-1.5">
            <dt className="sr-only">Eligibility</dt>
            <UserCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
            <dd>
              <span className="font-medium text-slate-500">Eligibility: </span>
              {s.eligibility}
            </dd>
          </div>
        )}
        {s.benefits && (
          <div className="flex items-start gap-1.5">
            <dt className="sr-only">Benefits</dt>
            <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
            <dd>
              <span className="font-medium text-slate-500">Benefits: </span>
              {s.benefits}
            </dd>
          </div>
        )}
        {s.beneficiaries && (
          <div className="flex items-start gap-1.5">
            <dt className="sr-only">Beneficiaries</dt>
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
            <dd>
              <span className="font-medium text-slate-500">Beneficiaries: </span>
              {s.beneficiaries}
            </dd>
          </div>
        )}
        {s.launchDate && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Launch date</dt>
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <dd>
              <span className="font-medium text-slate-500">Launched: </span>
              {formatDate(s.launchDate)}
            </dd>
          </div>
        )}
      </dl>

      {s.officialSource && (
        <a
          href={s.officialSource}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 inline-flex max-w-full items-center gap-1 truncate text-[11px] font-medium text-teal-700 hover:underline"
          aria-label={`Open official source: ${s.sourceName ?? 'official source'}`}
        >
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{s.sourceName ?? 'Official source'}</span>
        </a>
      )}
      {s.lastVerifiedAt && (
        <p className="mt-1 text-[10px] text-slate-400">Last verified {relativeTime(s.lastVerifiedAt)}</p>
      )}
    </li>
  )
}
