'use client'

// Live data status — surfaces the official-source registry and the outcome of
// verification passes. Read-only for everyone; the run button mirrors the
// admin manual-refresh capability and never mutates content records.

import { RefreshCcw, ShieldCheck, ShieldAlert, Clock, Database } from 'lucide-react'
import { toast } from 'sonner'
import { apiSend, useApi } from '@/lib/civic/api'
import { formatDateTime, relativeTime } from '@/lib/civic/format'
import { Button } from '@/components/ui/button'
import { SectionTitle } from '@/components/civic/ui-bits'
import { Chip, Panel, PanelHead } from './primitives'

interface SyncSource {
  key: string
  name: string
  category: string
  url: string
  method: string
  cadenceHours: number
  enabled: boolean
  requiresConfig: string | null
  description: string | null
  lastSyncedAt: string | null
  lastSyncStatus: string | null
  lastSyncMessage: string | null
  cadence: { dueForCheck: boolean; dueInMs: number | null }
}

interface SyncResponse {
  sources: SyncSource[]
  total: number
  lastSuccessfulSyncAt: string | null
  note: string
}

interface SyncRunResponse {
  runId: string
  summary: { total: number; succeeded: number; failed: number; skipped: number }
  note: string
}

function statusChip(s: SyncSource) {
  if (s.lastSyncStatus === 'SUCCESS') return <Chip tone="teal">Reachable</Chip>
  if (s.lastSyncStatus === 'FAILED') return <Chip tone="red">Unreachable</Chip>
  if (s.lastSyncStatus === 'PARTIAL') return <Chip tone="amber">Needs config</Chip>
  return <Chip tone="slate">Not yet checked</Chip>
}

export default function SyncStatusPanel() {
  const { data, loading, error, refresh } = useApi<SyncResponse>('/api/sync')
  const sources = data?.sources ?? []

  const runPass = async () => {
    try {
      const res = await apiSend<SyncRunResponse>('/api/sync', 'POST', { triggeredBy: 'MANUAL_ADMIN' })
      const { succeeded, failed, skipped } = res.summary
      toast.success(
        `Verification pass complete — ${succeeded} reachable, ${failed} unreachable, ${skipped} skipped. Verified data preserved.`,
      )
      refresh()
    } catch (e) {
      toast.error(`Verification pass failed: ${e instanceof Error ? e.message : 'unknown error'}`)
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Database}
        title="Live data status"
        subtitle="Registry of official sources behind this platform, with the outcome of the latest verification pass. Failed checks never overwrite verified data."
      />

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PanelHead
            icon={RefreshCcw}
            title="Official source registry"
            desc="Every source is checked on its cadence; content reconciliation is an admin-assisted step that never silently reshapes records."
          />
          <Button
            size="sm"
            className="h-9 shrink-0 bg-teal-700 text-white hover:bg-teal-800"
            onClick={runPass}
            disabled={loading || !!error}
          >
            <RefreshCcw className="h-4 w-4" aria-hidden />
            Run verification pass
          </Button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading source registry…</p>
        ) : error ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-red-700">
            <ShieldAlert className="h-4 w-4" aria-hidden />
            Could not load the source registry: {error}
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-teal-100 bg-teal-50/60 p-3 text-xs text-teal-900">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                Last successful source check:{' '}
                <strong>{data?.lastSuccessfulSyncAt ? formatDateTime(data.lastSuccessfulSyncAt) : 'not yet (no endpoint was reachable in the last pass)'}</strong>
                {' '}· {sources.length} sources registered
              </span>
            </div>

            <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {sources.map((s) => (
                <li key={s.key} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">{s.name}</span>
                    {statusChip(s)}
                    <Chip tone="slate">{s.method}</Chip>
                    <Chip tone="slate">every {s.cadenceHours >= 24 ? `${s.cadenceHours / 24}d` : `${s.cadenceHours}h`}</Chip>
                    {s.requiresConfig && <Chip tone="amber">needs {s.requiresConfig}</Chip>}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.description}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                    <a href={s.url} target="_blank" rel="noreferrer" className="max-w-[280px] truncate text-teal-700 hover:underline">
                      {s.url}
                    </a>
                    {s.lastSyncedAt && <span>last check {relativeTime(s.lastSyncedAt)}</span>}
                  </p>
                  {s.lastSyncMessage && (
                    <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                      {s.lastSyncStatus === 'SUCCESS' ? (
                        <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-teal-600" aria-hidden />
                      ) : (
                        <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" aria-hidden />
                      )}
                      {s.lastSyncMessage}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">{data?.note}</p>
          </>
        )}
      </Panel>
    </div>
  )
}
