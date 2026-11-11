'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Search,
  Filter,
  Download,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  MapPin,
  IndianRupee,
  FileCheck,
  Sparkles,
  BookOpen,
  CheckCircle2,
  X
} from 'lucide-react'
import { useApi } from '@/lib/civic/api'
import { GovernmentOrder } from '@/lib/civic/gov-orders-data'
import { formatDate } from '@/lib/civic/format'
import { Loading, ErrorState, EmptyState } from '@/components/civic/ui-bits'

interface GovOrdersApiResponse {
  governmentOrders: GovernmentOrder[]
  total: number
  officialPortal: string
  lastVerified: string
}

const DEPARTMENTS = [
  'ALL',
  'Industries, Investment Promotion and Commerce',
  'Special Programme Implementation Department',
  'Department of School Education',
  'Department of Health and Family Welfare',
  'Agriculture and Farmers’ Welfare Department',
  'Municipal Administration and Water Supply Department',
  'Transport Department',
  'Revenue and Disaster Management Department'
]

const GO_TYPES = [
  { value: 'ALL', label: 'All Types' },
  { value: 'MS', label: 'Manuscript (G.O. Ms)' },
  { value: 'POLICY', label: 'Policy Framework' },
  { value: 'SANCTION', label: 'Financial Sanction' }
]

export default function GovernmentOrdersTracker() {
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGo, setSelectedGo] = useState<GovernmentOrder | null>(null)

  const apiPath = useMemo(() => {
    const p = new URLSearchParams()
    if (departmentFilter !== 'ALL') p.set('department', departmentFilter)
    if (typeFilter !== 'ALL') p.set('goType', typeFilter)
    if (searchQuery.trim()) p.set('q', searchQuery.trim())
    return `/api/gov-orders?${p.toString()}`
  }, [departmentFilter, typeFilter, searchQuery])

  const { data, loading, error } = useApi<GovOrdersApiResponse>(apiPath)
  const orders = data?.governmentOrders || []

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-teal-500/20 px-2 py-0.5 text-xs font-semibold text-teal-300">
                Official Gazette & G.O. Archive
              </span>
              <span className="text-xs text-slate-400">tn.gov.in/go_view/dept</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Tamil Nadu Government Orders (G.O.) Tracker
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300">
              Search authentic Government Orders (Ms/Rt) issued across Tamil Nadu secretariats. Inspect financial sanctions, policy directives, and original PDF references.
            </p>
          </div>

          <a
            href="https://www.tn.gov.in/go_view/dept"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 self-start rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow transition hover:bg-teal-700 sm:self-center"
          >
            <span>Official G.O. Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search G.O. number (e.g. '142', 'MS No. 88'), title, scheme name or keyword..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.filter((d) => d !== 'ALL').map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {GO_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <Loading label="Querying Government Order archive..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Government Orders found"
          hint="Try searching for a different G.O. number or reset the department filter."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((go) => (
            <div
              key={go.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-800 border border-teal-200">
                      {go.goNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      Dated: <strong>{formatDate(go.issuedDate)}</strong>
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {go.department}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {go.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-600">
                    {go.abstract}
                  </p>

                  {/* Financial Outlay & District Coverage */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                    {go.financialSanctionCr && (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <IndianRupee className="h-3 w-3" />
                        Sanction: ₹{go.financialSanctionCr} Cr
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <MapPin className="h-3 w-3" />
                      Coverage: {go.districtsCovered.join(', ')}
                    </span>

                    {go.relatedSchemeName && (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 border border-indigo-100 font-medium">
                        <Sparkles className="h-2.5 w-2.5" />
                        Scheme: {go.relatedSchemeName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedGo(go)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    View Provisions
                  </button>

                  <a
                    href={go.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Official G.O. (PDF)
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: G.O. Provisions & Explanation */}
      {selectedGo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setSelectedGo(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1.5 pr-6">
              <span className="rounded bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                {selectedGo.goNumber}
              </span>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {selectedGo.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
              <div>
                <span className="font-semibold text-slate-900 block">Department:</span>
                {selectedGo.department}
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">Issued / Effective Date:</span>
                {formatDate(selectedGo.issuedDate)} (Effective {formatDate(selectedGo.effectiveDate)})
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Official Abstract:</p>
              <p className="rounded-lg bg-slate-50 p-3 border border-slate-200 leading-relaxed text-xs">
                {selectedGo.abstract}
              </p>
              {selectedGo.abstractTa && (
                <p className="rounded-lg bg-amber-50/50 p-3 border border-amber-200 text-amber-950 leading-relaxed text-xs">
                  <strong>தமிழ் விளக்கம்:</strong> {selectedGo.abstractTa}
                </p>
              )}
            </div>

            {/* Key Clauses & Provisions */}
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-slate-900">Mandated Provisions & Directives:</p>
              <ul className="space-y-1.5">
                {selectedGo.keyProvisions.map((prov, i) => (
                  <li key={i} className="flex items-start gap-2 rounded bg-slate-50 px-2.5 py-1.5 border border-slate-100">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{prov}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Verification: <strong>Official Tamil Nadu Gazette</strong>
              </span>

              <a
                href={selectedGo.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded bg-teal-600 px-3.5 py-1.5 font-semibold text-white hover:bg-teal-700"
              >
                <Download className="h-3.5 w-3.5" />
                Download Original G.O. PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

