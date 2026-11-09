'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, History, Loader2, MapPin, Search, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, SectionTitle } from '@/components/civic/ui-bits'
import { apiGet, useApi } from '@/lib/civic/api'
import { COMPLAINT_CATEGORY_META, COMPLAINT_STATUS_META, formatDate, formatDateTime } from '@/lib/civic/format'
import type { ComplaintDetail, ComplaintSummary } from '@/lib/civic/types'
import { ComplaintStatusChip, PriorityChip, TONE_DOT, type ComplaintsResponse, type TrackPrefill } from './shared'

function Meta({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-0.5 font-medium text-slate-800 ${className ?? ''}`}>{value}</dd>
    </div>
  )
}

function SatisfactionStars({ value }: { value: number }) {
  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
      <span className="text-xs uppercase tracking-wide text-slate-500">Citizen satisfaction</span>
      <span className="flex items-center gap-0.5" role="img" aria-label={`${value} of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
            aria-hidden
          />
        ))}
      </span>
      <span className="text-xs font-medium text-slate-700">{value}/5</span>
    </div>
  )
}

/** Tab 3 — look up a ticket, read its update timeline, and browse recent public complaints. */
export default function TrackComplaintsTab({ prefill }: { prefill: TrackPrefill }) {
  // Detail lookup
  const [input, setInput] = useState('')
  const [detail, setDetail] = useState<ComplaintDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // Browser filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [q, setQ] = useState('')

  const loadTicket = useCallback(async (ticket: string) => {
    const t = ticket.trim()
    if (!t) {
      toast('Enter a ticket number first', { description: 'Ticket numbers look like CL-2025-000118.' })
      return
    }
    setDetailLoading(true)
    setDetailError(null)
    setDetail(null)
    try {
      const res = await apiGet<{ complaint: ComplaintDetail }>(`/api/complaints/${encodeURIComponent(t)}`)
      setDetail(res.complaint)
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load the complaint.')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // Prefill coming from the Overview / File-a-complaint flows ("Track this").
  useEffect(() => {
    if (!prefill) return
    queueMicrotask(() => {
      setInput(prefill.ticket)
      void loadTicket(prefill.ticket)
    })
  }, [prefill, loadTicket])

  const openTicket = useCallback(
    (ticket: string) => {
      setInput(ticket)
      void loadTicket(ticket)
    },
    [loadTicket],
  )

  // Public complaint browser
  const listQs = useMemo(() => {
    const p = new URLSearchParams()
    if (statusFilter !== 'ALL') p.set('status', statusFilter)
    if (categoryFilter !== 'ALL') p.set('category', categoryFilter)
    const s = p.toString()
    return s ? `?${s}` : ''
  }, [statusFilter, categoryFilter])
  const list = useApi<ComplaintsResponse>(`/api/complaints${listQs}`)

  const visible = useMemo(() => {
    const all = list.data?.complaints ?? []
    const needle = q.trim().toLowerCase()
    if (!needle) return all
    return all.filter((c) => c.ticketNo.toLowerCase().includes(needle) || c.title.toLowerCase().includes(needle))
  }, [list.data, q])

  const overdue =
    detail?.slaDueAt != null &&
    detail.status !== 'RESOLVED' &&
    detail.status !== 'REJECTED' &&
    new Date(detail.slaDueAt).getTime() < Date.now()

  const notFound = detailError != null && (detailError.includes('404') || detailError.toLowerCase().includes('not found'))

  return (
    <div className="space-y-6">
      {/* Search card */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Track a complaint by ticket number">
        <SectionTitle
          icon={Search}
          title="Track a complaint"
          subtitle="Enter the ticket number you received when filing — e.g. CL-2025-000118."
        />
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            void loadTicket(input)
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="CL-2025-000118"
            className="font-mono sm:max-w-xs"
            aria-label="Ticket number"
          />
          <Button
            type="submit"
            disabled={detailLoading}
            className="gap-1.5 bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {detailLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
            Track
          </Button>
        </form>
      </section>

      {/* Result */}
      {detailLoading && <Loading label="Fetching complaint…" />}
      {!detailLoading && detailError && (
        <ErrorState
          message={notFound ? 'No complaint found with this ticket number' : detailError}
        />
      )}

      {!detailLoading && detail && (
        <>
          {/* Detail header */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-label={`Complaint ${detail.ticketNo} details`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-lg font-bold tracking-wide text-teal-800">{detail.ticketNo}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">{detail.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ComplaintStatusChip status={detail.status} />
                <PriorityChip priority={detail.priority} />
                {overdue && <GenericChip tone="red">SLA overdue</GenericChip>}
              </div>
            </div>

            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              <Meta label="Category" value={COMPLAINT_CATEGORY_META[detail.category]?.label ?? detail.category} />
              <Meta label="District" value={detail.district?.name ?? 'State-wide'} />
              <Meta label="Ward / area" value={detail.wardOrArea ?? '—'} />
              <Meta label="Filed on" value={formatDateTime(detail.createdAt)} />
              <Meta
                label="SLA due by"
                value={formatDateTime(detail.slaDueAt)}
                className={overdue ? 'font-semibold text-rose-600' : undefined}
              />
              <Meta label="Assigned department" value={detail.assignedDepartment?.name ?? 'Unassigned'} />
            </dl>

            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{detail.description}</p>

            {detail.resolutionNote && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  <strong>Resolution note:</strong> {detail.resolutionNote}
                </span>
              </div>
            )}

            {detail.satisfaction != null && <SatisfactionStars value={detail.satisfaction} />}
          </section>

          {/* Update timeline */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Complaint update timeline">
            <SectionTitle
              icon={History}
              title="Update timeline"
              subtitle={`${detail.updates.length} recorded update${detail.updates.length === 1 ? '' : 's'} — newest last.`}
            />
            {detail.updates.length === 0 ? (
              <EmptyState title="No updates yet" hint="Updates appear here as the department acts on this complaint." />
            ) : (
              <ol className="relative max-h-96 space-y-6 overflow-y-auto border-l-2 border-slate-200 pl-6">
                {[...detail.updates]
                  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                  .map((u) => {
                    const tone = COMPLAINT_STATUS_META[u.statusAfter]?.tone ?? 'slate'
                    return (
                      <li key={u.id} className="relative">
                        <span
                          className={`absolute -left-8 top-1.5 h-3 w-3 rounded-full border-2 border-white ring-2 ring-slate-200 ${TONE_DOT[tone]}`}
                          aria-hidden
                        />
                        <p className="text-sm leading-relaxed text-slate-800">{u.note}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <ComplaintStatusChip status={u.statusAfter} />
                          <span className="text-xs text-slate-500">
                            {u.byName} · {u.byRole}
                          </span>
                          <span className="text-xs text-slate-400">{formatDateTime(u.createdAt)}</span>
                        </div>
                      </li>
                    )
                  })}
              </ol>
            )}
          </section>
        </>
      )}

      {/* Recent public complaints browser */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Browse recent public complaints">
        <SectionTitle
          icon={MapPin}
          title="Recent public complaints"
          subtitle="Filter the public complaint register and select a row to load its timeline above."
        />

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="tc-status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="tc-status" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="ALL">All statuses</SelectItem>
                {Object.entries(COMPLAINT_STATUS_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tc-category">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="tc-category" className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="ALL">All categories</SelectItem>
                {Object.entries(COMPLAINT_CATEGORY_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tc-q">Search</Label>
            <Input
              id="tc-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ticket no. or title…"
              className="w-full"
            />
          </div>
        </div>

        {list.loading ? (
          <Loading label="Loading complaints…" />
        ) : list.error ? (
          <ErrorState message={list.error} />
        ) : visible.length === 0 ? (
          <EmptyState title="No complaints match these filters" hint="Try clearing the search text or picking a different status." />
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow>
                  <TableHead>Ticket no.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Filed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((c: ComplaintSummary) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    aria-label={`Track complaint ${c.ticketNo}`}
                    onClick={() => openTicket(c.ticketNo)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openTicket(c.ticketNo)
                      }
                    }}
                  >
                    <TableCell className="whitespace-nowrap font-mono text-xs font-semibold text-teal-700">{c.ticketNo}</TableCell>
                    <TableCell className="max-w-[14rem] truncate" title={c.title}>
                      {c.title}
                    </TableCell>
                    <TableCell className="hidden text-xs text-slate-600 md:table-cell">
                      {COMPLAINT_CATEGORY_META[c.category]?.label ?? c.category}
                    </TableCell>
                    <TableCell className="hidden text-xs text-slate-600 sm:table-cell">{c.district?.name ?? '—'}</TableCell>
                    <TableCell>
                      <ComplaintStatusChip status={c.status} />
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-xs text-slate-500 sm:table-cell">
                      {formatDate(c.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
