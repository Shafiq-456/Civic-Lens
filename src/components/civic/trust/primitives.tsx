'use client'

// Small shared UI primitives for the Trust portal.
// Card style contract: rounded-xl border border-slate-200 bg-white shadow-sm p-4 (p-6 for heroes).

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check, TriangleAlert } from 'lucide-react'
import type { Tone } from './content'

export const CHIP_TONES: Record<Tone, string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
  slate: 'border-slate-200 bg-slate-100 text-slate-600',
  teal: 'border-teal-200 bg-teal-50 text-teal-700',
}

export const ICON_TONES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-600',
  teal: 'bg-teal-50 text-teal-700',
}

/** Standard white panel used across the portal. */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm p-4 ${className}`}>{children}</section>
}

/** Amber notice panel for scope statements, framing alerts and prominent warnings. */
export function AmberPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <aside role="note" className={`rounded-xl border border-amber-300 bg-amber-50 p-4 ${className}`}>
      {children}
    </aside>
  )
}

/** Panel header: icon tile + title + optional description and right-side element. */
export function PanelHead({
  icon: Icon,
  title,
  desc,
  right,
}: {
  icon?: LucideIcon
  title: string
  desc?: string
  right?: ReactNode
}) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div className="flex items-start gap-2.5">
        {Icon && (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ICON_TONES.teal}`}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
          {desc && <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-slate-500">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

/** Small tone chip, consistent with the rest of Civic Lenz. */
export function Chip({ tone = 'slate', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${CHIP_TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}

/** Inline monospace token for file names, property keys, credentials, tech names. */
export function Mono({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <code className={`rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 ${className}`}>{children}</code>
}

/** Check-marked list item with optional muted sub-line. */
export function CheckItem({ text, sub }: { text: string; sub?: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700" aria-hidden>
        <Check className="h-3 w-3" />
      </span>
      <span className="text-sm leading-relaxed text-slate-700">
        {text}
        {sub && <span className="mt-0.5 block text-xs text-slate-500">{sub}</span>}
      </span>
    </li>
  )
}

/** Vertically connected numbered step (used for the verification workflow). */
export function NumberedStep({ n, title, detail, last = false }: { n: number; title: string; detail: string; last?: boolean }) {
  return (
    <li className="relative flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
        {n}
      </span>
      {!last && <span className="absolute left-4 top-9 h-[calc(100%-1.75rem)] w-px bg-slate-200" aria-hidden />}
      <div className="pb-5 pt-1 last:pb-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{detail}</p>
      </div>
    </li>
  )
}

/** Scrollable box with styled scrollbar for long tables/lists (max-h-96 overflow-y-auto). */
export function ScrollBox({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-h-96 overflow-y-auto rounded-lg border border-slate-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 ${className}`}
    >
      {children}
    </div>
  )
}

/** Warning item marker (a), (b), (c)… for limitation lists. */
export function MarkerBadge({ marker }: { marker: string }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-amber-300 bg-white text-xs font-bold text-amber-700">
      {marker}
    </span>
  )
}

/** Small inline warning glyph row used inside amber panels. */
export function AmberHead({ title }: { title: string }) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
      {title}
    </p>
  )
}
