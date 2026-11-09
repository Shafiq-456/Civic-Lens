'use client'

import { ShieldCheck, ShieldAlert, ShieldQuestion, History, BadgeCheck } from 'lucide-react'
import { STATUS_META, FRESHNESS_META, TONE_CLASS } from '@/lib/civic/format'

export function VerificationBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, tone: 'slate' as const }
  const icon =
    status === 'CURRENT' ? <BadgeCheck className="h-3.5 w-3.5" /> :
    status === 'VACANT' ? <ShieldAlert className="h-3.5 w-3.5" /> :
    status === 'PENDING_VERIFICATION' ? <ShieldQuestion className="h-3.5 w-3.5" /> :
    <History className="h-3.5 w-3.5" />
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE_CLASS[meta.tone]}`}>
      {icon}
      {meta.label}
    </span>
  )
}

export function FreshnessBadge({ freshness }: { freshness?: string }) {
  if (!freshness) return null
  const meta = FRESHNESS_META[freshness] ?? { label: freshness, tone: 'slate' as const }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE_CLASS[meta.tone]}`}>
      <ShieldCheck className="h-3 w-3" />
      {meta.label}
    </span>
  )
}

export function GenericChip({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE_CLASS[tone] ?? TONE_CLASS.slate}`}>
      {children}
    </span>
  )
}

/** Persistent data-currency notice shown across data surfaces. */
export function DataBanner({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900 ${className}`}>
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {children ?? (
          <>
            <strong>Verified 5 Nov 2026.</strong> Records reflect the 2026 Tamil Nadu Assembly election and the government formed on 10 May 2026, each carrying an official source, effective date and last-verified stamp. Records awaiting official confirmation are explicitly labelled &ldquo;Pending verification&rdquo; — production use still requires authorised feeds (see Trust portal → Architecture).
          </>
        )}
      </span>
    </div>
  )
}
