'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, History, Loader2, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { apiSend, useApi } from '@/lib/civic/api'
import { OFFICE_META, STATUS_META, formatDateTime, relativeTime } from '@/lib/civic/format'
import type { DemoUser, PoliticalRecord, VerificationLog } from '@/lib/civic/types'
import { DataBanner, FreshnessBadge, GenericChip, VerificationBadge } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading } from '@/components/civic/ui-bits'
import { GuardedButton } from './admin-shared'

const STATUS_FILTERS = ['ALL', 'CURRENT', 'FORMER', 'VACANT', 'PENDING_VERIFICATION'] as const
const FRESHNESS_FILTERS = ['ALL', 'FRESH', 'STALE', 'NEVER_VERIFIED'] as const

type DialogState =
  | { kind: 'VERIFY'; record: PoliticalRecord }
  | { kind: 'STATUS'; record: PoliticalRecord }
  | { kind: 'SOURCE'; record: PoliticalRecord }

type RecordActionBody = {
  action: 'VERIFY' | 'STATUS' | 'SOURCE'
  actor: string
  actorRole: DemoUser['role']
  note?: string
  status?: PoliticalRecord['status']
  sourceUrl?: string
  sourceName?: string
}

const LOG_ACTION_TONE: Record<string, string> = {
  VERIFY: 'green',
  STATUS: 'amber',
  SOURCE: 'teal',
  CREATE: 'slate',
  IMPORT: 'slate',
}

function officeLabel(record: PoliticalRecord): string {
  return record.officeLabel ?? OFFICE_META[record.office]?.label ?? record.office
}

export function RecordsVerificationTab({ user, canEdit }: { user: DemoUser; canEdit: boolean }) {
  // ---- filters -------------------------------------------------------------
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [freshness, setFreshness] = useState<string>('ALL')
  const [office, setOffice] = useState<string>('ALL')
  const [q, setQ] = useState('')
  const [qDebounced, setQDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const listPath = useMemo(() => {
    const p = new URLSearchParams()
    if (statusFilter !== 'ALL') p.set('status', statusFilter)
    if (office !== 'ALL') p.set('office', office)
    if (qDebounced.trim()) p.set('q', qDebounced.trim())
    return `/api/records?${p.toString()}`
  }, [statusFilter, office, qDebounced])

  const list = useApi<{ records: PoliticalRecord[] }>(listPath)
  const records = list.data?.records ?? []

  // Client-side freshness filter (the API returns the freshness field but has no query param for it).
  const visibleRecords = useMemo(() => {
    if (freshness === 'ALL') return records
    return records.filter((r) => r.freshness === freshness)
  }, [records, freshness])

  // ---- dialogs -------------------------------------------------------------
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [historyFor, setHistoryFor] = useState<PoliticalRecord | null>(null)

  const staleCount = records.filter((r) => r.freshness === 'STALE').length
  const neverCount = records.filter((r) => r.freshness === 'NEVER_VERIFIED').length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <ShieldCheck className="h-5 w-5 text-teal-700" aria-hidden />
          Political Data Verification
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Continuous verification of the political directory — every record must be re-checked against its official
          source and every change is audit-logged.
        </p>
      </div>

      <DataBanner>
        <strong>Continuous verification.</strong> Records must be re-verified against official sources at least every
        30 days. Records older than 30 days are flagged <strong>STALE</strong>; never-verified records are flagged
        red. Verifying stamps <span className="font-mono">lastVerifiedAt</span>, records the source used, and writes an
        audit entry server-side.
      </DataBanner>

      {staleCount + neverCount > 0 && (
        <p className="text-xs text-slate-500" aria-live="polite">
          <span className="font-semibold text-amber-700">{staleCount} stale</span> and{' '}
          <span className="font-semibold text-rose-700">{neverCount} never-verified</span> record
          {staleCount + neverCount === 1 ? '' : 's'} currently in the queue.
        </p>
      )}

      {/* ---- Filters ------------------------------------------------------- */}
      <section aria-label="Filters" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Freshness quick filter">
          {FRESHNESS_FILTERS.map((f) => {
            const active = freshness === f
            return (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                aria-pressed={active}
                onClick={() => setFreshness(f)}
                className={active ? 'bg-teal-700 text-white hover:bg-teal-800' : ''}
              >
                {f === 'ALL' ? 'All' : f}
              </Button>
            )
          })}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="record-status-filter" className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="record-status-filter" className="w-full" size="sm" aria-label="Filter by record status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === 'ALL' ? 'All statuses' : (STATUS_META[s]?.label ?? s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="record-office-filter" className="text-xs">Office</Label>
            <Select value={office} onValueChange={setOffice}>
              <SelectTrigger id="record-office-filter" className="w-full" size="sm" aria-label="Filter by office">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All offices</SelectItem>
                {Object.entries(OFFICE_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative self-end">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, constituency, department…"
              className="h-8 pl-8 text-sm"
              aria-label="Search records"
            />
          </div>
        </div>
      </section>

      {/* ---- Records table -------------------------------------------------- */}
      <section aria-label="Political records" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {list.loading ? (
          <Loading label="Loading records…" />
        ) : list.error ? (
          <div className="space-y-2">
            <ErrorState message={list.error} />
            <Button variant="outline" size="sm" onClick={list.refresh}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
            </Button>
          </div>
        ) : visibleRecords.length === 0 ? (
          <EmptyState
            title="No records match"
            hint="Adjust the status, office or freshness filters to see more records."
          />
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Representative</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Constituency / Dept</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last verified</TableHead>
                  <TableHead>Freshness</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium text-slate-800">
                        {r.name}
                        {r.partyShort && <span className="ml-1.5 text-xs font-normal text-slate-400">{r.partyShort}</span>}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{officeLabel(r)}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {r.constituencyName ?? r.department ?? r.district?.name ?? '—'}
                    </TableCell>
                    <TableCell><VerificationBadge status={r.status} /></TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-slate-500">{relativeTime(r.lastVerifiedAt)}</TableCell>
                    <TableCell><FreshnessBadge freshness={r.freshness} /></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <GuardedButton
                          canEdit={canEdit}
                          size="sm"
                          variant="outline"
                          onClick={() => setDialog({ kind: 'VERIFY', record: r })}
                          className="border-teal-200 text-teal-700 hover:bg-teal-50"
                          aria-label={`Verify ${r.name}`}
                        >
                          Verify
                        </GuardedButton>
                        <GuardedButton
                          canEdit={canEdit}
                          size="sm"
                          variant="outline"
                          onClick={() => setDialog({ kind: 'STATUS', record: r })}
                          aria-label={`Set status for ${r.name}`}
                        >
                          Set status
                        </GuardedButton>
                        <GuardedButton
                          canEdit={canEdit}
                          size="sm"
                          variant="ghost"
                          onClick={() => setDialog({ kind: 'SOURCE', record: r })}
                          aria-label={`Update source for ${r.name}`}
                        >
                          Source
                        </GuardedButton>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setHistoryFor(r)}
                          aria-label={`Verification history for ${r.name}`}
                        >
                          <History className="h-3.5 w-3.5" aria-hidden />
                          History
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* ---- Action dialog -------------------------------------------------- */}
      {dialog && (
        <RecordActionDialog
          state={dialog}
          user={user}
          onClose={() => setDialog(null)}
          onDone={() => list.refresh()}
        />
      )}

      {/* ---- History dialog ------------------------------------------------- */}
      {historyFor && <VerificationHistoryDialog record={historyFor} onClose={() => setHistoryFor(null)} />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Verify / Set status / Source dialog                                 */
/* ------------------------------------------------------------------ */

function RecordActionDialog({
  state,
  user,
  onClose,
  onDone,
}: {
  state: DialogState
  user: DemoUser
  onClose: () => void
  onDone: () => void
}) {
  const { record, kind } = state
  const [note, setNote] = useState('')
  const [sourceUrl, setSourceUrl] = useState(record.officialSource ?? '')
  const [sourceName, setSourceName] = useState(record.sourceName ?? '')
  const [newStatus, setNewStatus] = useState<PoliticalRecord['status']>(record.status)
  const [submitting, setSubmitting] = useState(false)

  const title = kind === 'VERIFY' ? 'Verify against official source' : kind === 'STATUS' ? 'Change record status' : 'Update official source'
  const submitLabel = kind === 'VERIFY' ? 'Mark verified' : kind === 'STATUS' ? 'Save status' : 'Save source'

  async function submit() {
    if (submitting) return
    if (kind === 'SOURCE' && !sourceUrl.trim()) {
      toast.error('A source URL is required when updating the official source.')
      return
    }
    setSubmitting(true)
    try {
      const body: RecordActionBody = { action: kind, actor: user.username, actorRole: user.role }
      if (note.trim()) body.note = note.trim()
      if (kind === 'VERIFY') {
        if (sourceUrl.trim()) body.sourceUrl = sourceUrl.trim()
        if (sourceName.trim()) body.sourceName = sourceName.trim()
      }
      if (kind === 'STATUS') body.status = newStatus
      if (kind === 'SOURCE') {
        body.sourceUrl = sourceUrl.trim()
        if (sourceName.trim()) body.sourceName = sourceName.trim()
      }
      await apiSend<{ record: PoliticalRecord }>(`/api/records/${record.id}`, 'PATCH', body)
      toast.success(
        kind === 'VERIFY' ? 'Record marked verified' : kind === 'STATUS' ? 'Record status updated' : 'Official source updated',
        { description: `${record.name} — change written to the audit trail.` },
      )
      onDone()
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed. Please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {record.name} — {officeLabel(record)}
          </DialogDescription>
        </DialogHeader>

        {/* Current record state */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <VerificationBadge status={record.status} />
          <FreshnessBadge freshness={record.freshness} />
          <span>Last verified {relativeTime(record.lastVerifiedAt)}</span>
          {record.officialSource && (
            <a
              href={record.officialSource}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-teal-700 underline underline-offset-2"
            >
              Current source <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
        </div>

        <div className="space-y-3">
          {kind === 'STATUS' && (
            <div className="space-y-1">
              <Label htmlFor="record-new-status">New status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as PoliticalRecord['status'])}>
                <SelectTrigger id="record-new-status" className="w-full" aria-label="New record status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Transition: <span className="font-medium">{STATUS_META[record.status]?.label ?? record.status}</span>
                {' → '}
                <span className="font-medium text-teal-700">{STATUS_META[newStatus]?.label ?? newStatus}</span>
              </p>
            </div>
          )}

          {kind !== 'STATUS' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="record-source-url">Source URL</Label>
                <Input
                  id="record-source-url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://…"
                  inputMode="url"
                />
                <p className="text-xs text-slate-400">
                  {kind === 'VERIFY'
                    ? 'Prefilled from the record’s registered official source — edit if you verified against a different page.'
                    : 'The official page this record is sourced from (required).'}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="record-source-name">Source name</Label>
                <Input
                  id="record-source-name"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. State Legislative Secretariat notification"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="record-action-note">Note (optional)</Label>
            <Textarea
              id="record-action-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={
                kind === 'VERIFY'
                  ? 'e.g. Cross-checked with official gazette notification dated 12 May.'
                  : kind === 'STATUS'
                    ? 'e.g. Incumbent resigned; seat declared vacant by the Election Commission.'
                    : 'Why the source is changing…'
              }
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Acting as <span className="font-medium text-slate-600">{user.name}</span> ({user.role}). This action is
          audit-logged server-side and appended to the record’s verification history.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={submitting} className="bg-teal-700 text-white hover:bg-teal-800">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {submitting ? 'Saving…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Verification history dialog — the audit-grade trail                 */
/* ------------------------------------------------------------------ */

function VerificationHistoryDialog({ record, onClose }: { record: PoliticalRecord; onClose: () => void }) {
  const { data, error, loading } = useApi<{ record: PoliticalRecord & { verificationLogs: VerificationLog[] } }>(
    `/api/records/${record.id}`,
  )

  const logs = useMemo(() => {
    const list = data?.record.verificationLogs ?? []
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [data])

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verification history — {record.name}</DialogTitle>
          <DialogDescription>
            Append-only, audit-grade trail. Entries cannot be edited or deleted; every workflow action lands here and
            in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <VerificationBadge status={record.status} />
          <FreshnessBadge freshness={record.freshness} />
          <span>Last verified {relativeTime(record.lastVerifiedAt)}</span>
          {record.officialSource && (
            <a
              href={record.officialSource}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-teal-700 underline underline-offset-2"
            >
              Official source <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
        </div>

        {loading ? (
          <Loading label="Loading verification history…" />
        ) : error ? (
          <ErrorState message={error} />
        ) : logs.length === 0 ? (
          <EmptyState
            title="No verification history yet"
            hint="Verify this record to create the first audit-grade entry."
          />
        ) : (
          <ol className="max-h-80 space-y-3 overflow-y-auto pr-1" aria-label="Verification log entries">
            {logs.map((log) => (
              <li key={log.id} className="relative border-l-2 border-slate-200 pl-4">
                <span className="absolute top-1.5 -left-[7px] h-3 w-3 rounded-full border-2 border-white bg-teal-600" aria-hidden />
                <div className="flex flex-wrap items-center gap-2">
                  <GenericChip tone={LOG_ACTION_TONE[log.action] ?? 'slate'}>{log.action}</GenericChip>
                  {(log.previousStatus || log.newStatus) && (
                    <span className="text-xs text-slate-500">
                      {log.previousStatus ?? '—'} → <span className="font-medium text-slate-700">{log.newStatus ?? '—'}</span>
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">{formatDateTime(log.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  by <span className="font-medium text-slate-800">{log.verifiedBy}</span>
                  {log.sourceUrl && (
                    <>
                      {' · '}
                      <a
                        href={log.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 underline underline-offset-2"
                      >
                        {log.sourceUrl}
                      </a>
                    </>
                  )}
                </p>
                {log.note && <p className="mt-1 text-sm text-slate-700">{log.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  )
}
