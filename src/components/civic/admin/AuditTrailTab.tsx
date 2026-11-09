'use client'

import { useMemo, useState } from 'react'
import { RefreshCw, ScrollText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/lib/civic/api'
import { formatDateTime } from '@/lib/civic/format'
import type { AuditLogEntry } from '@/lib/civic/types'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading } from '@/components/civic/ui-bits'

const ROLE_FILTERS = ['ALL', 'ADMIN', 'DEPT_OFFICER', 'AUDITOR', 'CITIZEN', 'VERIFIER', 'SYSTEM'] as const

const AUDIT_ROLE_TONE: Record<string, string> = {
  ADMIN: 'teal',
  DEPT_OFFICER: 'amber',
  AUDITOR: 'slate',
  CITIZEN: 'green',
  VERIFIER: 'green',
  SYSTEM: 'slate',
}

export function AuditTrailTab() {
  const [role, setRole] = useState<string>('ALL')
  const [entityQ, setEntityQ] = useState('')

  const path = role === 'ALL' ? '/api/audit-logs?take=200' : `/api/audit-logs?take=200&actorRole=${role}`
  const { data, error, loading, refresh } = useApi<{ logs: AuditLogEntry[] }>(path)

  const filtered = useMemo(() => {
    const logs = data?.logs ?? []
    const q = entityQ.trim().toLowerCase()
    if (!q) return logs
    return logs.filter(
      (l) =>
        l.entity.toLowerCase().includes(q) ||
        (l.entityId ?? '').toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q),
    )
  }, [data, entityQ])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <ScrollText className="h-5 w-5 text-teal-700" aria-hidden />
          Audit Trail
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Chronological record of every mutation performed through the administration portal.
        </p>
      </div>

      {/* Filters */}
      <section aria-label="Audit filters" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="audit-role-filter" className="text-xs">Actor role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="audit-role-filter" className="w-full" size="sm" aria-label="Filter by actor role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_FILTERS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === 'ALL' ? 'All roles' : r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative self-end">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              value={entityQ}
              onChange={(e) => setEntityQ(e.target.value)}
              placeholder="Filter by entity, id or action…"
              className="h-8 pl-8 text-sm"
              aria-label="Filter audit entries by entity"
            />
          </div>
        </div>
      </section>

      {/* Log table */}
      <section aria-label="Audit log" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <Loading label="Loading audit trail…" />
        ) : error ? (
          <div className="space-y-2">
            <ErrorState message={error} />
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
            </Button>
          </div>
        ) : data && data.logs.length === 0 ? (
          <EmptyState title="No audit entries yet" hint="Entries appear as soon as portal mutations occur." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No entries match" hint="Adjust the role or entity filter." />
        ) : (
          <>
            <p className="mb-3 text-xs text-slate-500" aria-live="polite">
              Showing {filtered.length} of {data?.logs.length ?? 0} entries (latest {Math.min(filtered.length, 200)}).
            </p>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap text-slate-500">{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-slate-800">{log.actor}</p>
                        <GenericChip tone={AUDIT_ROLE_TONE[log.actorRole] ?? 'slate'}>{log.actorRole}</GenericChip>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-teal-700">{log.action}</TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {log.entity}
                        {log.entityId && <span className="block font-mono text-[11px] text-slate-400">{log.entityId}</span>}
                      </TableCell>
                      <TableCell className="max-w-[16rem]">
                        <span className="block truncate text-xs text-slate-700" title={log.summary}>{log.summary}</span>
                      </TableCell>
                      <TableCell className="max-w-[12rem]">
                        <span
                          className="block truncate text-xs text-slate-400"
                          title={log.details ?? undefined}
                        >
                          {log.details ?? '—'}
                          {log.ipAddress && <span className="ml-1 text-slate-300">({log.ipAddress})</span>}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>

      {/* Policy note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800" role="note">
        <strong>Audit policy.</strong> Every mutation in the administration portal writes an audit entry server-side.
        Production must add tamper-evident logging (hash chaining) and a log retention policy — see Trust &amp; Docs.
      </div>
    </div>
  )
}
