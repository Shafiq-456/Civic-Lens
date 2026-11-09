'use client'

// Shared tiny helpers for the Government Information Portal panels.

/** Matches GeoMap's internal name normalisation (case/space/punctuation-insensitive). */
export function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, '')
}

/** Two-letter initials for avatar circles. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.charAt(0) ?? ''
  const b = parts[1]?.charAt(0) ?? ''
  return (a + b).toUpperCase() || '?'
}

/** Standard card surface used across panels (design system: rounded-xl + slate border + shadow-sm). */
export const CARD = 'rounded-xl border border-slate-200 bg-white shadow-sm p-4'

/** Hero panel surface (p-6) for flagship sections. */
export const CARD_HERO = 'rounded-xl border border-slate-200 bg-white shadow-sm p-6'

/** Custom thin scrollbar styling for long scrollable lists. */
export const SCROLLBAR =
  '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent'

/** Definition-list row used in audit/detail surfaces. */
export function DefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-slate-700">{children}</dd>
    </div>
  )
}
