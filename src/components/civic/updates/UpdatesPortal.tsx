'use client'

import { useState, useMemo } from 'react'
import {
  Sparkles,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Building,
  AlertCircle,
  Users,
} from 'lucide-react'
import { SCHEME_UPDATES, type SchemeUpdate } from '@/lib/civic/updates-data'

const UPDATE_TYPE_META: Record<SchemeUpdate['updateType'], { label: string; badgeClass: string }> = {
  BENEFIT_ENHANCEMENT: {
    label: 'Benefit Enhanced',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  ELIGIBILITY_EXPANSION: {
    label: 'Eligibility Expanded',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  NEW_LAUNCH: {
    label: 'New Scheme Launch',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  PORTAL_OPEN: {
    label: 'Portal Open for Application',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  DEADLINE_ALERT: {
    label: 'Application Deadline Approaching',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

export default function UpdatesPortal() {
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'TN' | 'CENTRAL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUpdates = useMemo(() => {
    return SCHEME_UPDATES.filter((u) => {
      const matchLevel = levelFilter === 'ALL' || u.schemeLevel === levelFilter
      const matchType = typeFilter === 'ALL' || u.updateType === typeFilter
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        u.schemeName.toLowerCase().includes(q) ||
        u.headline.toLowerCase().includes(q) ||
        u.details.toLowerCase().includes(q) ||
        u.beneficiaryCategory.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      return matchLevel && matchType && matchSearch
    })
  }, [levelFilter, typeFilter, searchQuery])

  // Aggregate stats
  const totalTracked = SCHEME_UPDATES.length
  const tnCount = SCHEME_UPDATES.filter((u) => u.schemeLevel === 'TN').length
  const centralCount = SCHEME_UPDATES.filter((u) => u.schemeLevel === 'CENTRAL').length
  const enhancedCount = SCHEME_UPDATES.filter((u) => u.updateType === 'BENEFIT_ENHANCEMENT').length

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-slate-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-100/80 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
              <Sparkles className="h-3.5 w-3.5" />
              Real-time Scheme Intelligence
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Government Scheme Updates & Revisions
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Official notifications, newly expanded beneficiary eligibility, cash transfer augmentations, and
              application windows for welfare programs across Tamil Nadu & Union Ministries.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Official Gazette Backed</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>100% Verified Citations</span>
            </div>
          </div>
        </div>

        {/* Quick Stat Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Updates</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{totalTracked}</div>
            <span className="text-[11px] text-teal-700 font-medium">Monitored this month</span>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tamil Nadu State</span>
            <div className="mt-1 text-2xl font-bold text-teal-700">{tnCount}</div>
            <span className="text-[11px] text-slate-500">State welfare schemes</span>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Government of India</span>
            <div className="mt-1 text-2xl font-bold text-indigo-700">{centralCount}</div>
            <span className="text-[11px] text-slate-500">Central DBT programs</span>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Benefit Enhancements</span>
            <div className="mt-1 text-2xl font-bold text-emerald-700">{enhancedCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Outlay/stipend increases</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Jurisdiction Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'TN', 'CENTRAL'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                levelFilter === lvl
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {lvl === 'ALL' ? 'All Jurisdictions' : lvl === 'TN' ? 'Tamil Nadu (State)' : 'Government of India (Central)'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search schemes, G.O., keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Scheme Updates Feed */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
            No scheme updates match the selected filters. Try clearing your search query.
          </div>
        ) : (
          filteredUpdates.map((item) => {
            const meta = UPDATE_TYPE_META[item.updateType]
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-teal-300 hover:shadow-md"
              >
                {/* Header Line */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                        item.schemeLevel === 'TN'
                          ? 'border-teal-200 bg-teal-50 text-teal-800'
                          : 'border-indigo-200 bg-indigo-50 text-indigo-800'
                      }`}
                    >
                      {item.schemeLevel === 'TN' ? 'Tamil Nadu State' : 'Union Government'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${meta.badgeClass}`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {meta.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <ShieldCheck className="h-3 w-3" />
                      {item.verificationStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Effective: {new Date(item.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-teal-800 sm:text-lg">
                        {item.schemeName}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {item.headline}
                      </p>
                    </div>

                    {item.applicationUrl && (
                      <a
                        href={item.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-lg border border-teal-600 bg-teal-50/50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-600 hover:text-white"
                      >
                        <span>Official Portal</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {item.details}
                  </p>
                </div>

                {/* What Changed / Comparison Box */}
                {(item.previousTerms || item.revisedTerms) && (
                  <div className="mt-4 grid gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs sm:grid-cols-2">
                    {item.previousTerms && (
                      <div>
                        <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">
                          Previous Terms / Baseline
                        </span>
                        <p className="mt-0.5 text-slate-700">{item.previousTerms}</p>
                      </div>
                    )}
                    {item.revisedTerms && (
                      <div>
                        <span className="font-semibold text-teal-700 uppercase text-[10px] tracking-wider">
                          Revised Terms & Benefits
                        </span>
                        <p className="mt-0.5 font-medium text-teal-900">{item.revisedTerms}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      {item.officialOrderNo}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {item.beneficiaryCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                      <Building className="h-3 w-3 text-slate-400" />
                      {item.department}
                    </span>
                    {item.applicationUrl && (
                      <a
                        href={item.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex sm:hidden items-center gap-1 text-teal-700 font-semibold"
                      >
                        Apply <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
