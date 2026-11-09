'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, RefreshCw, Search, Send, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { apiSend, useApi } from '@/lib/civic/api'
import { COMPLAINT_CATEGORY_META, COMPLAINT_STATUS_META, formatDateTime, relativeTime } from '@/lib/civic/format'
import type { ComplaintDetail, ComplaintSummary, DemoUser } from '@/lib/civic/types'
import type { Department } from '@/lib/civic/types'
import { EmptyState, ErrorState, Loading } from '@/components/civic/ui-bits'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { GuardedButton } from './admin-shared'

const STATUS_FILTERS = ['ALL', 'SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'REJECTED'] as const

const ACTION_OPTIONS = [
  { value: 'ACKNOWLEDGE', label: 'Acknowledge' },
  { value: 'PROGRESS', label: 'Mark in progress' },
  { value: 'ESCALATE', label: 'Escalate' },
  { value: 'RESOLVE', label: 'Resolve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'COMMENT', label: 'Add comment' },
] as const

const PRIORITY_TONE: Record<string, string> = { HIGH: 'red', MEDIUM: 'amber', LOW: 'slate' }

function statusChip(status: string) {
  const meta = COMPLAINT_STATUS_META[status]
  return (
    <GenericChip tone={meta?.tone ?? 'slate'}>{meta?.label ?? status}</GenericChip>
  )
}

export function ComplaintsTab({ user, canEdit }: { user: DemoUser; canEdit: boolean }) {
  // ---- filters -------------------------------------------------------------
  const [status, setStatus] = useState<string>('ALL')
  const [category, setCategory] = useState<string>('ALL')
  const [q, setQ] = useState('')
  const [qDebounced, setQDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const listPath = useMemo(() => {
    const p = new URLSearchParams()
    if (status !== 'ALL') p.set('status', status)
    if (category !== 'ALL') p.set('category', category)
    if (qDebounced.trim()) p.set('q', qDebounced.trim())
    p.set('take', '100')
    p.set('admin', 'true')
    return `/api/complaints?${p.toString()}`
  }, [status, category, qDebounced])

  const list = useApi<{ complaints: ComplaintSummary[] }>(listPath)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const detail = useApi<{ complaint: ComplaintDetail }>(selectedTicket ? `/api/complaints/${selectedTicket}` : null)
  const departments = useApi<{ departments: Department[] }>('/api/departments')

  // ---- action form ---------------------------------------------------------
  const [action, setAction] = useState<string>('ACKNOWLEDGE')
  const [note, setNote] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [deptId, setDeptId] = useState<string>('NONE')
  const [applying, setApplying] = useState(false)

  const noteRequired = action === 'RESOLVE' || action === 'REJECT'

  async function applyAction() {
    if (!selectedTicket || applying) return
    if (noteRequired && !note.trim()) {
      toast.error(noteRequiredMessage(action))
      return
    }
    setApplying(true)
    try {
      const body: Record<string, string> = { action, actor: user.username, actorRole: user.role }
      if (note.trim()) body.note = note.trim()
      if (assignedTo.trim()) body.assignedTo = assignedTo.trim()
      if (deptId !== 'NONE') body.departmentId = deptId
      await apiSend<{ complaint: ComplaintDetail }>(`/api/complaints/${selectedTicket}`, 'PATCH', body)
      const label = ACTION_OPTIONS.find((a) => a.value === action)?.label ?? action
      toast.success('Complaint updated', { description: `Ticket ${selectedTicket} — ${label}` })
      setNote('')
      setAssignedTo('')
      setDeptId('NONE')
      detail.refresh()
      list.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update complaint.')
    } finally {
      setApplying(false)
    }
  }

  const complaints = list.data?.complaints ?? []
  const complaint = detail.data?.complaint ?? null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <Ticket className="h-5 w-5 text-teal-700" aria-hidden />
          Complaint Workflow
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Triage citizen grievances — acknowledge, assign, escalate or resolve. Every action writes an audit entry
          server-side.
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-5">
        {/* ---- Left: filters + list -------------------------------------- */}
        <section aria-label="Complaint queue" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="complaint-status-filter" className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="complaint-status-filter" className="w-full" size="sm" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === 'ALL' ? 'All statuses' : (COMPLAINT_STATUS_META[s]?.label ?? s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="complaint-category-filter" className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="complaint-category-filter" className="w-full" size="sm" aria-label="Filter by category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All categories</SelectItem>
                  {Object.entries(COMPLAINT_CATEGORY_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ticket, title, citizen, district…"
              className="h-8 pl-8 text-sm"
              aria-label="Search complaints"
            />
          </div>

          {list.loading ? (
            <Loading label="Loading complaints…" />
          ) : list.error ? (
            <div className="space-y-2">
              <ErrorState message={list.error} />
              <Button variant="outline" size="sm" onClick={list.refresh}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
              </Button>
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState title="No complaints match" hint="Adjust the filters or search term." />
          ) : (
            <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c) => {
                    const selected = selectedTicket === c.ticketNo
                    return (
                      <TableRow
                        key={c.id}
                        tabIndex={0}
                        aria-selected={selected}
                        onClick={() => setSelectedTicket(c.ticketNo)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedTicket(c.ticketNo)
                          }
                        }}
                        className={`cursor-pointer ${selected ? 'bg-teal-50' : ''}`}
                      >
                        <TableCell className="font-mono text-xs text-slate-700">{c.ticketNo}</TableCell>
                        <TableCell className="max-w-[11rem] truncate" title={c.title}>{c.title}</TableCell>
                        <TableCell>{statusChip(c.status)}</TableCell>
                        <TableCell>
                          <GenericChip tone={PRIORITY_TONE[c.priority] ?? 'slate'}>{c.priority}</GenericChip>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{c.district?.name ?? '—'}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap text-slate-500">{relativeTime(c.createdAt)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        {/* ---- Right: detail + action bar -------------------------------- */}
        <section aria-label="Complaint detail" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
          {!selectedTicket ? (
            <EmptyState
              title="Select a complaint"
              hint="Pick a ticket from the queue to see its full history and take workflow actions."
            />
          ) : detail.loading ? (
            <Loading label="Loading complaint…" />
          ) : detail.error ? (
            <div className="space-y-2">
              <ErrorState message={detail.error} />
              <Button variant="outline" size="sm" onClick={detail.refresh}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
              </Button>
            </div>
          ) : complaint ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-teal-700">{complaint.ticketNo}</p>
                  <h3 className="truncate text-base font-semibold text-slate-900" title={complaint.title}>{complaint.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{complaint.description}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {statusChip(complaint.status)}
                  <GenericChip tone={PRIORITY_TONE[complaint.priority] ?? 'slate'}>{complaint.priority}</GenericChip>
                </div>
              </div>

              {/* Facts grid */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-slate-400">Citizen</dt>
                  <dd className="font-medium text-slate-800">{complaint.citizenName}</dd>
                  {complaint.citizenContact && <dd className="text-slate-500">{complaint.citizenContact}</dd>}
                </div>
                <div>
                  <dt className="text-slate-400">Category</dt>
                  <dd className="font-medium text-slate-800">{COMPLAINT_CATEGORY_META[complaint.category]?.label ?? complaint.category}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">District / ward</dt>
                  <dd className="font-medium text-slate-800">
                    {complaint.district?.name ?? '—'}{complaint.wardOrArea ? ` · ${complaint.wardOrArea}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Submitted</dt>
                  <dd className="font-medium text-slate-800">{formatDateTime(complaint.createdAt)}</dd>
                  <dd className="text-slate-500">{relativeTime(complaint.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">SLA due</dt>
                  {complaint.slaDueAt ? (
                    <>
                      <dd className={`font-medium ${isSlaOverdue(complaint) ? 'text-rose-700' : 'text-slate-800'}`}>
                        {formatDateTime(complaint.slaDueAt)}
                      </dd>
                      {isSlaOverdue(complaint) && <dd className="text-rose-600">overdue</dd>}
                    </>
                  ) : (
                    <dd className="font-medium text-slate-800">—</dd>
                  )}
                </div>
                <div>
                  <dt className="text-slate-400">Assigned department</dt>
                  <dd className="font-medium text-slate-800">{complaint.assignedDepartment?.name ?? 'Unassigned'}</dd>
                </div>
              </dl>

              {complaint.resolutionNote && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  <strong>Resolution note:</strong> {complaint.resolutionNote}
                </p>
              )}

              <Separator />

              {/* Updates timeline */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Updates timeline</h4>
                {complaint.updates.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">No updates recorded yet — the workflow starts with an acknowledgement.</p>
                ) : (
                  <ol className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1" aria-label="Complaint updates">
                    {complaint.updates.map((u) => (
                      <li key={u.id} className="relative border-l-2 border-slate-200 pl-4">
                        <span className="absolute top-1.5 -left-[7px] h-3 w-3 rounded-full border-2 border-white bg-teal-600" aria-hidden />
                        <p className="text-xs font-medium text-slate-700">
                          {u.byName} <span className="font-normal text-slate-400">· {u.byRole}</span>
                        </p>
                        <p className="mt-0.5 text-sm text-slate-800">{u.note}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          {statusChip(u.statusAfter)}
                          <span>{formatDateTime(u.createdAt)}</span>
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <Separator />

              {/* Action bar */}
              <form
                className="space-y-3"
                aria-label="Complaint workflow actions"
                onSubmit={(e) => {
                  e.preventDefault()
                  void applyAction()
                }}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="complaint-action" className="text-xs">Workflow action</Label>
                    <Select value={action} onValueChange={setAction}>
                      <SelectTrigger id="complaint-action" className="w-full" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_OPTIONS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="complaint-department" className="text-xs">Assign department (optional)</Label>
                    <Select value={deptId} onValueChange={setDeptId}>
                      <SelectTrigger id="complaint-department" className="w-full" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">No department</SelectItem>
                        {(departments.data?.departments ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.shortName ?? d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="complaint-note" className="text-xs">Note</Label>
                  <Textarea
                    id="complaint-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="What was done, checked or decided…"
                    aria-required={noteRequired}
                    className="text-sm"
                  />
                  <p className={`text-xs ${noteRequired ? 'text-amber-700' : 'text-slate-400'}`}>
                    {noteRequired
                      ? `A note is required when you ${action === 'RESOLVE' ? 'resolve' : 'reject'} a complaint.`
                      : 'Optional context — appears in the public-facing update timeline.'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="complaint-assignee" className="text-xs">Assigned to officer (optional)</Label>
                  <Input
                    id="complaint-assignee"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="e.g. j.mehta"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    Acting as <span className="font-medium text-slate-600">{user.name}</span> ({user.role})
                  </p>
                  <GuardedButton type="submit" canEdit={canEdit} disabled={applying} className="bg-teal-700 text-white hover:bg-teal-800">
                    {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Send className="h-3.5 w-3.5" aria-hidden />}
                    Apply action
                  </GuardedButton>
                </div>
              </form>
            </>
          ) : (
            <EmptyState title="Complaint not found" hint="The selected ticket may have been removed." />
          )}
        </section>
      </div>
    </div>
  )
}

function noteRequiredMessage(action: string): string {
  return action === 'RESOLVE'
    ? 'A note is required when resolving a complaint.'
    : 'A note is required when rejecting a complaint.'
}

function isSlaOverdue(complaint: ComplaintDetail): boolean {
  if (!complaint.slaDueAt) return false
  if (complaint.status === 'RESOLVED' || complaint.status === 'REJECTED') return false
  return new Date(complaint.slaDueAt).getTime() < Date.now()
}

