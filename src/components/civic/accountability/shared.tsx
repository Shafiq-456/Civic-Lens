'use client'

import { useCallback, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { useApi } from '@/lib/civic/api'
import { COMPLAINT_STATUS_META, PROJECT_STATUS_META, TONE_CLASS } from '@/lib/civic/format'
import type { ComplaintSummary, DistrictSummary, ProjectSummary } from '@/lib/civic/types'

// ---------- shared API response shapes ----------

export type DistrictsResponse = { districts: DistrictSummary[] }
export type ComplaintsResponse = { complaints: ComplaintSummary[] }
export type ProjectsResponse = { projects: ProjectSummary[] }

/** Prefill payload for the tracking tab (ticket + nonce so repeat clicks re-trigger the lookup). */
export type TrackPrefill = { ticket: string; nonce: number } | null

// ---------- tone helpers (solid fills for bars / timeline dots) ----------

export const TONE_BAR: Record<string, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
  slate: 'bg-slate-400',
  teal: 'bg-teal-600',
}

export const TONE_DOT: Record<string, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
  slate: 'bg-slate-400',
  teal: 'bg-teal-600',
}

// ---------- chips ----------

const PRIORITY_META: Record<string, { label: string; cls: string }> = {
  LOW: { label: 'Low', cls: TONE_CLASS.slate },
  MEDIUM: { label: 'Medium', cls: TONE_CLASS.amber },
  HIGH: { label: 'High', cls: TONE_CLASS.red },
  CRITICAL: { label: 'Critical', cls: 'border-rose-600 bg-rose-600 text-white' },
}

export function PriorityChip({ priority }: { priority: string }) {
  const meta = PRIORITY_META[priority] ?? { label: priority, cls: TONE_CLASS.slate }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  )
}

export function ComplaintStatusChip({ status }: { status: string }) {
  const meta = COMPLAINT_STATUS_META[status] ?? { label: status, tone: 'slate' as const }
  return <GenericChip tone={meta.tone}>{meta.label}</GenericChip>
}

export function ProjectStatusChip({ status }: { status: string }) {
  const meta = PROJECT_STATUS_META[status] ?? { label: status, tone: 'slate' as const }
  return <GenericChip tone={meta.tone}>{meta.label}</GenericChip>
}

// ---------- horizontal CSS status bars ----------

/** Horizontal proportional bars for a Record<statusKey, count>, styled via a meta map (label + tone). */
export function StatusBarList({
  byStatus,
  meta,
}: {
  byStatus: Record<string, number>
  meta: Record<string, { label: string; tone: string }>
}) {
  const entries = Object.entries(meta)
  const max = Math.max(1, ...entries.map(([key]) => byStatus[key] ?? 0))
  return (
    <div className="space-y-3">
      {entries.map(([key, m]) => {
        const count = byStatus[key] ?? 0
        const pct = Math.round((count / max) * 100)
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE_CLASS[m.tone] ?? TONE_CLASS.slate}`}
              >
                {m.label}
              </span>
              <span className="text-xs font-semibold tabular-nums text-slate-700">{count.toLocaleString('en-IN')}</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-100"
              role="img"
              aria-label={`${m.label}: ${count.toLocaleString('en-IN')}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${TONE_BAR[m.tone] ?? TONE_BAR.slate}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------- shared data hooks ----------

/** District list (Tamil Nadu demo dataset) used by complaint + project pickers. */
export function useDistricts() {
  return useApi<DistrictsResponse>('/api/districts?stateCode=TN')
}

// ---------- clipboard ----------

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Copied to clipboard')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy — please copy it manually')
    }
  }, [value])
  return (
    <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={onCopy} aria-label={`${label}: ${value}`}>
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? 'Copied' : label}
    </Button>
  )
}
