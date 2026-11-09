'use client'

import { Landmark, Scale, Building2, ShieldCheck, MapPin, Sparkles, Newspaper } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type PortalId = 'info' | 'accountability' | 'updates' | 'admin' | 'trust' | 'news'

export const PORTALS: Array<{ id: PortalId; label: string; short: string; icon: LucideIcon; blurb: string }> = [
  { id: 'info', label: 'Government Information Portal', short: 'Information', icon: Landmark, blurb: 'Maps, political leadership, announcements, calendar, schemes & departments' },
  { id: 'accountability', label: 'Public Accountability Portal', short: 'Accountability', icon: Scale, blurb: 'Complaints, projects, citizen verification, project history & financial transparency' },
  { id: 'updates', label: 'Government Scheme Updates', short: 'Updates', icon: Sparkles, blurb: 'Recent revisions, newly launched welfare schemes, eligibility changes & official orders' },
  { id: 'admin', label: 'Government Administration Portal', short: 'Administration', icon: Building2, blurb: 'Department workflows, representative monitoring, authorised data management & audit trails' },
  { id: 'trust', label: 'Trust, Data Governance & Deployment', short: 'Trust & Docs', icon: ShieldCheck, blurb: 'Data governance, security assessment plan, and phased deployment roadmap' },
  { id: 'news', label: 'Government News & Briefings', short: 'NEWS', icon: Newspaper, blurb: 'Verified news, gazettes, and official press releases from Government of India & Tamil Nadu' },
]

export default function Header({ portal, onPortalChange }: { portal: PortalId; onPortalChange: (p: PortalId) => void }) {
  const active = PORTALS.find((p) => p.id === portal)
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-teal-700 focus:px-3 focus:py-1.5 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onPortalChange('info')}
            className="flex items-center gap-2.5 text-left"
            aria-label="Civic Lenz home"
          >
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-teal-600/30 shadow-sm ring-1 ring-amber-400/40">
              <img
                src="/civic-lenz-logo.jpg"
                alt="Civic Lenz emblem"
                className="h-full w-full object-cover"
              />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight tracking-tight text-slate-900">Civic Lenz</span>
              <span className="block text-[11px] font-medium leading-tight text-slate-500">Open government, verified</span>
            </span>
          </button>

          <div className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 md:flex">
            <MapPin className="h-3 w-3" aria-hidden />
            Verified prototype · Tamil Nadu focus
          </div>
        </div>

        <nav aria-label="Portal navigation" className="-mx-1 overflow-x-auto pb-1">
          <ul className="flex min-w-max items-center gap-1">
            {PORTALS.map((p) => {
              const isActive = p.id === portal
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onPortalChange(p.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={p.blurb}
                  >
                    <p.icon className="h-4 w-4" aria-hidden />
                    {p.short}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      {active && (
        <div className="border-t border-slate-100 bg-slate-50/80">
          <p className="mx-auto max-w-7xl px-4 py-1.5 text-xs text-slate-500 sm:px-6">{active.label} — {active.blurb}</p>
        </div>
      )}
    </header>
  )
}
