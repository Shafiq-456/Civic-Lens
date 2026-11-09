'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, RefreshCw, ShieldQuestion, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { apiSend, useApi } from '@/lib/civic/api'
import { formatDate } from '@/lib/civic/format'
import type { CitizenVerificationRequest, DemoUser } from '@/lib/civic/types'
import { DataBanner, GenericChip } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading } from '@/components/civic/ui-bits'
import { GuardedButton } from './admin-shared'

const REQ_STATUS_META: Record<string, { label: string; tone: string }> = {
  PENDING: { label: 'Pending', tone: 'amber' },
  APPROVED: { label: 'Approved', tone: 'green' },
  REJECTED: { label: 'Rejected', tone: 'slate' },
}

type Decision = { request: CitizenVerificationRequest; decision: 'APPROVED' | 'REJECTED' }

export function CitizenRequestsTab({ user, canEdit }: { user: DemoUser; canEdit: boolean }) {
  const { data, error, loading, refresh } = useApi<{ requests: CitizenVerificationRequest[] }>(
    '/api/verification-requests',
  )
  const [decision, setDecision] = useState<Decision | null>(null)

  const requests = data?.requests ?? []
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <ShieldQuestion className="h-5 w-5 text-teal-700" aria-hidden />
          Citizen Verification
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Review citizen-submitted verification requests. Decisions are audit-logged server-side with the acting
          officer’s identity.
        </p>
      </div>

      <DataBanner>
        <strong>Privacy note.</strong> Citizen documents are shown masked. Approvals are recorded with your username
        and role — production requires document retention and PII handling policies (see Trust &amp; Docs).
      </DataBanner>

      <section aria-label="Citizen verification requests" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <Loading label="Loading verification requests…" />
        ) : error ? (
          <div className="space-y-2">
            <ErrorState message={error} />
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
            </Button>
          </div>
        ) : requests.length === 0 ? (
          <EmptyState title="No citizen requests" hint="Citizen verification requests will appear here." />
        ) : (
          <>
            <p className="mb-3 text-xs text-slate-500" aria-live="polite">
              {pendingCount} of {requests.length} request{requests.length === 1 ? '' : 's'} awaiting a decision.
            </p>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => {
                    const meta = REQ_STATUS_META[r.status] ?? { label: r.status, tone: 'slate' }
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs text-slate-700">{r.requestNo}</TableCell>
                        <TableCell className="font-medium text-slate-800">{r.citizenName}</TableCell>
                        <TableCell className="text-xs text-slate-600">{r.requestType}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{r.documentMasked ?? '—'}</TableCell>
                        <TableCell><GenericChip tone={meta.tone}>{meta.label}</GenericChip></TableCell>
                        <TableCell className="text-xs whitespace-nowrap text-slate-500">{formatDate(r.submittedAt)}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap text-slate-500">{formatDate(r.processedAt)}</TableCell>
                        <TableCell className="max-w-[10rem] truncate text-xs text-slate-500" title={r.remarks ?? undefined}>
                          {r.remarks ?? '—'}
                        </TableCell>
                        <TableCell>
                          {r.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1">
                              <GuardedButton
                                canEdit={canEdit}
                                size="sm"
                                onClick={() => setDecision({ request: r, decision: 'APPROVED' })}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                aria-label={`Approve request ${r.requestNo}`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                Approve
                              </GuardedButton>
                              <GuardedButton
                                canEdit={canEdit}
                                size="sm"
                                variant="outline"
                                onClick={() => setDecision({ request: r, decision: 'REJECTED' })}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                aria-label={`Reject request ${r.requestNo}`}
                              >
                                <XCircle className="h-3.5 w-3.5" aria-hidden />
                                Reject
                              </GuardedButton>
                            </div>
                          ) : (
                            <p className="text-right text-xs text-slate-300" aria-label="Decision already recorded">—</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>

      {decision && (
        <DecisionDialog
          decision={decision}
          user={user}
          onClose={() => setDecision(null)}
          onDone={refresh}
        />
      )}
    </div>
  )
}

function DecisionDialog({
  decision,
  user,
  onClose,
  onDone,
}: {
  decision: Decision
  user: DemoUser
  onClose: () => void
  onDone: () => void
}) {
  const approving = decision.decision === 'APPROVED'
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (submitting) return
    setSubmitting(true)
    try {
      const body: { requestNo: string; decision: 'APPROVED' | 'REJECTED'; remarks?: string; actor: string } = {
        requestNo: decision.request.requestNo,
        decision: decision.decision,
        actor: user.username,
      }
      if (remarks.trim()) body.remarks = remarks.trim()
      await apiSend<{ request: CitizenVerificationRequest }>('/api/verification-requests', 'PATCH', body)
      toast.success(approving ? 'Request approved' : 'Request rejected', {
        description: `${decision.request.requestNo} — ${decision.request.citizenName}. Decision recorded in the audit trail.`,
      })
      onDone()
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Decision failed. Please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {approving ? 'Approve' : 'Reject'} request {decision.request.requestNo}
          </DialogTitle>
          <DialogDescription>
            {decision.request.citizenName} — {decision.request.requestType}. Document on file:{' '}
            <span className="font-mono">{decision.request.documentMasked ?? '—'}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Label htmlFor="request-remarks">Remarks (optional)</Label>
          <Textarea
            id="request-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder={
              approving
                ? 'e.g. Document verified against the state registry.'
                : 'e.g. Document number could not be located — please re-submit.'
            }
          />
          <p className="text-xs text-slate-400">
            Acting as <span className="font-medium text-slate-600">{user.name}</span> ({user.role}) — this decision is
            audit-logged server-side.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button
            onClick={() => void submit()}
            disabled={submitting}
            className={approving ? 'bg-teal-700 text-white hover:bg-teal-800' : 'bg-rose-700 text-white hover:bg-rose-800'}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {submitting ? 'Recording…' : approving ? 'Approve request' : 'Reject request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
