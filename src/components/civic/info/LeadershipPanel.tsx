'use client'

import { useMemo, useState } from 'react'
import {
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  History,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useApi } from '@/lib/civic/api'
import type { PoliticalRecord, VerificationLog } from '@/lib/civic/types'
import { OFFICE_META, STATUS_META, formatDate, formatDateTime, relativeTime } from '@/lib/civic/format'
import { DataBanner, FreshnessBadge, GenericChip, VerificationBadge } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, SectionTitle } from '@/components/civic/ui-bits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { CARD, SCROLLBAR, DefRow, initials } from './shared'

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

interface RecordsResponse {
  records: PoliticalRecord[]
  total: number
}

interface RecordDetailResponse {
  record: PoliticalRecord & { verificationLogs: VerificationLog[] }
}

const OFFICES = [
  'PRESIDENT',
  'VICE_PRESIDENT',
  'PRIME_MINISTER',
  'LOK_SABHA_SPEAKER',
  'GOVERNOR',
  'CHIEF_MINISTER',
  'LEADER_OF_OPPOSITION',
  'SPEAKER',
  'DEPUTY_SPEAKER',
  'MINISTER',
  'MLA',
  'MP_LOK_SABHA',
  'MP_RAJYA_SABHA',
] as const

const STATUSES = ['CURRENT', 'FORMER', 'VACANT', 'PENDING_VERIFICATION'] as const

function prettyAction(action: string): string {
  const s = action.toLowerCase().replaceAll('_', ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function statusLabel(status: string | null): string {
  if (!status) return '—'
  return STATUS_META[status]?.label ?? status
}

/* ------------------------------------------------------------------ */
/* LeadershipPanel                                                     */
/* ------------------------------------------------------------------ */

export default function LeadershipPanel() {
  const [office, setOffice] = useState<string>('ALL')
  const [status, setStatus] = useState<string>('ALL')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const path = useMemo(() => {
    const params = new URLSearchParams()
    if (office !== 'ALL') params.set('office', office)
    if (status !== 'ALL') params.set('status', status)
    if (q.trim()) params.set('q', q.trim())
    const qs = params.toString()
    return `/api/records${qs ? `?${qs}` : ''}`
  }, [office, status, q])

  const { data, loading, error, refresh } = useApi<RecordsResponse>(path)
  const records = data?.records ?? []

  const runSearch = () => setQ(qInput)

  return (
    <section aria-label="Political leadership directory" className="space-y-4">
      <SectionTitle
        icon={ShieldCheck}
        title="Political Leadership"
        subtitle="A verification-first directory: every entry carries an official source, effective date and a continuously maintained verification trail."
      />

      <DataBanner />

      {/* Filter bar */}
      <div className={`${CARD} flex flex-col gap-3`}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[220px_220px_1fr_auto]">
          <div>
            <label htmlFor="office-filter" className="sr-only">Filter by office</label>
            <Select value={office} onValueChange={setOffice}>
              <SelectTrigger id="office-filter" className="w-full" aria-label="Filter by office">
                <SelectValue placeholder="All offices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All offices</SelectItem>
                {OFFICES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {OFFICE_META[o]?.label ?? o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by verification status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-filter" className="w-full" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s]?.label ?? s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <label htmlFor="record-search" className="sr-only">Search records</label>
            <Input
              id="record-search"
              type="search"
              placeholder="Search name, constituency, party, portfolio…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runSearch()
              }}
              className="h-9 flex-1"
            />
            <Button size="sm" className="h-9 bg-teal-700 text-white hover:bg-teal-800" onClick={runSearch}>
              <Search className="h-4 w-4" aria-hidden />
              Search
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 lg:justify-end">
            <p className="text-sm text-slate-500" aria-live="polite">
              <span className="font-semibold text-slate-800">{records.length}</span> record{records.length === 1 ? '' : 's'}
            </p>
            <Button variant="ghost" size="sm" onClick={refresh} aria-label="Refresh records">
              <History className="h-4 w-4" aria-hidden />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Loading label="Loading political records…" />
      ) : error ? (
        <ErrorState message={`Could not load records: ${error}`} />
      ) : records.length === 0 ? (
        <EmptyState
          title="No records match these filters"
          hint="Try clearing the office/status filters or searching a different name, constituency or party."
        />
      ) : (
        <ul className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {records.map((r) => (
            <RecordCard key={r.id} record={r} onOpen={() => setActiveId(r.id)} />
          ))}
        </ul>
      )}

      <RecordDetailDialog recordId={activeId} onClose={() => setActiveId(null)} />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Record card                                                         */
/* ------------------------------------------------------------------ */

function RecordCard({ record: r, onOpen }: { record: PoliticalRecord; onOpen: () => void }) {
  const place = r.constituencyName
    ? [r.constituencyType, r.constituencyName].filter(Boolean).join(' · ')
    : r.department
      ? r.department
      : null

  return (
    <li
      className={`${CARD} cursor-pointer transition duration-150 hover:border-teal-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700`}
      role="button"
      tabIndex={0}
      aria-label={`View verification audit trail for ${r.name}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${r.accentColor ? '' : 'bg-teal-700'}`}
          style={r.accentColor ? { backgroundColor: r.accentColor } : undefined}
        >
          {initials(r.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{r.name}</p>
          <p className="truncate text-xs text-slate-500">{OFFICE_META[r.office]?.label ?? r.officeLabel ?? r.office}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {r.partyShort && <GenericChip tone="teal">{r.partyShort}</GenericChip>}
            <VerificationBadge status={r.status} />
            <FreshnessBadge freshness={r.freshness} />
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
        {place && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="truncate">{place}</span>
          </p>
        )}
        {r.portfolio && (
          <p className="flex items-start gap-1.5">
            <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="line-clamp-2">{r.portfolio}</span>
          </p>
        )}
        {r.tenure && (
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="truncate">{r.tenure}</span>
          </p>
        )}
        <p className="flex items-center gap-1.5 text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          Effective {formatDate(r.effectiveDate)} · verified {relativeTime(r.lastVerifiedAt)}
        </p>
      </div>

      {r.verificationNote && (
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
          {r.verificationNote}
        </p>
      )}

      {r.officialSource && (
        <a
          href={r.officialSource}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs font-medium text-teal-700 hover:underline"
          aria-label={`Open official source: ${r.sourceName ?? 'official source'}`}
        >
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{r.sourceName ?? 'Official source'}</span>
        </a>
      )}
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Audit-grade detail dialog                                           */
/* ------------------------------------------------------------------ */

function RecordDetailDialog({ recordId, onClose }: { recordId: string | null; onClose: () => void }) {
  const { data, loading, error } = useApi<RecordDetailResponse>(recordId ? `/api/records/${recordId}` : null)
  const r = data?.record

  return (
    <Dialog open={recordId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-6 text-left">
            {r ? (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
                  {initials(r.name)}
                </span>
                <span>{r.name}</span>
              </>
            ) : (
              'Record verification detail'
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-left">
              {r && (
                <span>
                  {OFFICE_META[r.office]?.label ?? r.office}
                  {r.party ? ` · ${r.party}` : ''}
                </span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className={`-mx-1 flex-1 overflow-y-auto px-1 ${SCROLLBAR}`}>
          {loading && <Loading label="Loading verification detail…" />}
          {error && <ErrorState message={error} />}
          {!loading && !error && r && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <VerificationBadge status={r.status} />
                <FreshnessBadge freshness={r.freshness} />
              </div>

              {/* Verification metadata table */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableCell className="w-2/5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Field
                      </TableCell>
                      <TableCell className="text-xs font-semibold uppercase tracking-wide text-slate-500">Value</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Status</TableCell>
                      <TableCell><VerificationBadge status={r.status} /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Official source</TableCell>
                      <TableCell>
                        {r.officialSource ? (
                          <a
                            href={r.officialSource}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex max-w-[240px] items-center gap-1 truncate text-teal-700 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                            <span className="truncate">{r.sourceName ?? r.officialSource}</span>
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Source name</TableCell>
                      <TableCell>{r.sourceName ?? '—'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Effective date</TableCell>
                      <TableCell>{formatDate(r.effectiveDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">End period</TableCell>
                      <TableCell>{r.endPeriodDate ? formatDate(r.endPeriodDate) : '— (ongoing or not applicable)'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Last verified</TableCell>
                      <TableCell>
                        {r.lastVerifiedAt ? `${formatDateTime(r.lastVerifiedAt)} (${relativeTime(r.lastVerifiedAt)})` : 'Never'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Verified by</TableCell>
                      <TableCell>{r.verifiedBy ?? '—'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Constituency</TableCell>
                      <TableCell>
                        {r.constituencyName ? [r.constituencyType, r.constituencyName].filter(Boolean).join(' · ') : '—'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Department</TableCell>
                      <TableCell>{r.department ?? '—'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">District / State</TableCell>
                      <TableCell>
                        {[r.district?.name, r.state ? `${r.state.name} (${r.state.code})` : null].filter(Boolean).join(' · ') || '—'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-600">Tenure</TableCell>
                      <TableCell>{r.tenure ?? '—'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {r.verificationNote && (
                <p className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {r.verificationNote}
                </p>
              )}

              <Separator />

              {/* Verification history timeline */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <History className="h-4 w-4 text-teal-700" aria-hidden />
                  Verification history
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {r.verificationLogs.length} entr{r.verificationLogs.length === 1 ? 'y' : 'ies'}
                  </span>
                </h4>

                {r.verificationLogs.length === 0 ? (
                  <EmptyState title="No verification activity yet" hint="This record has no verification log entries." />
                ) : (
                  <ol className={`ml-1 max-h-64 space-y-0 border-l-2 border-slate-100 pl-4 ${SCROLLBAR}`}>
                    {r.verificationLogs.map((log) => (
                      <li key={log.id} className="relative pb-4 last:pb-0">
                        <span
                          className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-teal-600 ring-4 ring-teal-50"
                          aria-hidden
                        />
                        <p className="text-sm font-medium text-slate-800">
                          {prettyAction(log.action)}
                          {log.previousStatus && log.newStatus && log.previousStatus !== log.newStatus && (
                            <span className="ml-1.5 text-xs font-normal text-slate-500">
                              {statusLabel(log.previousStatus)} → {statusLabel(log.newStatus)}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDateTime(log.createdAt)} · by {log.verifiedBy}
                        </p>
                        {log.note && <p className="mt-1 text-xs leading-relaxed text-slate-600">{log.note}</p>}
                        {log.sourceUrl && (
                          <a
                            href={log.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex max-w-full items-center gap-1 text-[11px] text-teal-700 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                            <span className="truncate">{log.sourceUrl}</span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Record identifiers for audit cross-reference */}
              <dl className="rounded-lg bg-slate-50 px-3 py-2">
                <DefRow label="Record ID"><span className="font-mono text-xs">{r.id}</span></DefRow>
                <DefRow label="Office key"><span className="font-mono text-xs">{r.office}</span></DefRow>
              </dl>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
