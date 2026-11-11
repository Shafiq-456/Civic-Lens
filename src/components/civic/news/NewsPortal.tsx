'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Newspaper,
  Globe,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Building2,
  Tag,
  ArrowRight,
  Flame,
  CheckCircle2,
  X,
  Share2,
  Languages,
  Clock,
  FileCheck,
  Sparkles,
  Info
} from 'lucide-react'
import { useApi } from '@/lib/civic/api'
import { RealtimeNewsItem } from '@/lib/civic/realtime-news-data'
import { formatDate, relativeTime } from '@/lib/civic/format'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { Loading, ErrorState, EmptyState } from '@/components/civic/ui-bits'

interface NewsApiResponse {
  news: RealtimeNewsItem[]
  total: number
  sourcesMonitored: string[]
  lastCollectedAt: string
}

const CATEGORY_META: Record<string, { label: string; badge: string }> = {
  ALL: { label: 'All Categories', badge: 'bg-slate-100 text-slate-700' },
  POLICY: { label: 'Policy & Cabinet', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  INFRASTRUCTURE: { label: 'Infrastructure', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  WELFARE: { label: 'Welfare & Benefits', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  AGRICULTURE: { label: 'Agriculture & Delta', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  HEALTH: { label: 'Public Health', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  GOVERNANCE: { label: 'Administration & Monsoon', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  RECRUITMENT: { label: 'TNPSC & Recruitment', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  EDUCATION: { label: 'Higher & School Edu', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
}

const TN_DISTRICTS = [
  'ALL',
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
]

export default function NewsPortal() {
  const [lang, setLang] = useState<'EN' | 'TA'>('EN')
  const [jurisdictionFilter, setJurisdictionFilter] = useState<'ALL' | 'TN' | 'INDIA'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [districtFilter, setDistrictFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<RealtimeNewsItem | null>(null)

  // Live API query with automatic polling refresh
  const apiPath = useMemo(() => {
    const p = new URLSearchParams()
    if (jurisdictionFilter !== 'ALL') p.set('jurisdiction', jurisdictionFilter)
    if (categoryFilter !== 'ALL') p.set('category', categoryFilter)
    if (districtFilter !== 'ALL') p.set('district', districtFilter)
    if (searchQuery.trim()) p.set('q', searchQuery.trim())
    return `/api/news?${p.toString()}`
  }, [jurisdictionFilter, categoryFilter, districtFilter, searchQuery])

  const { data, loading, error, refresh } = useApi<NewsApiResponse>(apiPath)

  // Auto-refresh news feed every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => refresh(), 60000)
    return () => clearInterval(timer)
  }, [refresh])

  const newsItems = data?.news || []
  const breakingNews = useMemo(() => newsItems.filter((n) => n.isBreaking), [newsItems])
  const featuredArticles = useMemo(() => newsItems.filter((n) => n.isFeatured), [newsItems])

  return (
    <div className="space-y-6">
      {/* Real-time Hero Banner */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Official Live Intelligence Stream
              </span>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-200">
                Tamil Nadu DIPR & PIB Monitored
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {lang === 'EN' ? 'Tamil Nadu Government News & Briefings' : 'தமிழ்நாடு அரசு செய்திகள் & அதிகாரப்பூர்வ அறிவிப்புகள்'}
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              {lang === 'EN'
                ? 'Directly collected from official gazettes, department releases, and district collectorates. Preserving official source evidence.'
                : 'அரசிதழ், அரசுத் துறைகள் மற்றும் மாவட்ட ஆட்சியர் அறிவிப்புகளிலிருந்து நேரடியாக பெறப்பட்ட சரிபார்க்கப்பட்ட தகவல்கள்.'}
            </p>
          </div>

          {/* Language Switcher Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setLang('EN')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                lang === 'EN' ? 'bg-white text-slate-900 shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('TA')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                lang === 'TA' ? 'bg-amber-400 text-slate-950 shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Breaking News Ticker */}
        {breakingNews.length > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3.5 py-2 text-xs">
            <span className="flex items-center gap-1 font-bold text-rose-400 uppercase tracking-wide">
              <Flame className="h-3.5 w-3.5 fill-rose-400" />
              Breaking
            </span>
            <div className="h-4 w-px bg-rose-500/30" />
            <p className="truncate text-slate-200">
              {lang === 'EN' ? breakingNews[0].title : breakingNews[0].titleTa}
            </p>
            {breakingNews[0].goReference && (
              <span className="hidden md:inline rounded bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-200">
                {breakingNews[0].goReference}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'EN' ? 'Search verified headlines, G.O. numbers, schemes or keywords...' : 'செய்திகள், அரசாணை எண்கள், திட்டங்கள் தேடுக...'}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Jurisdiction selector */}
            <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setJurisdictionFilter('ALL')}
                className={`rounded px-2.5 py-1 transition ${
                  jurisdictionFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setJurisdictionFilter('TN')}
                className={`rounded px-2.5 py-1 transition ${
                  jurisdictionFilter === 'TN' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tamil Nadu
              </button>
              <button
                type="button"
                onClick={() => setJurisdictionFilter('INDIA')}
                className={`rounded px-2.5 py-1 transition ${
                  jurisdictionFilter === 'INDIA' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Union / Central
              </button>
            </div>

            {/* 38 District Filter Dropdown */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              aria-label="Filter by district"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All 38 Districts</option>
              {TN_DISTRICTS.filter((d) => d !== 'ALL').map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoryFilter(key)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                categoryFilter === key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Articles Listing & Detail Modal */}
      {loading ? (
        <Loading label="Fetching real-time government news stream..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : newsItems.length === 0 ? (
        <EmptyState
          title="No government news matched"
          hint="Try adjusting your search criteria, category filters, or select 'All 38 Districts'."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((article) => {
            const cat = CATEGORY_META[article.category] || CATEGORY_META.ALL
            const title = lang === 'TA' ? article.titleTa : article.title
            const summary = lang === 'TA' ? article.summaryTa : article.summary

            return (
              <div
                key={article.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${cat.badge}`}>
                      {cat.label}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {relativeTime(article.publishedAt)}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">
                    {title}
                  </h3>

                  <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {summary}
                  </p>

                  {/* Key Fact Highlight */}
                  {article.keyFacts && (article.keyFacts.outlay || article.keyFacts.beneficiaries) && (
                    <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-700 border border-slate-100 space-y-1">
                      {article.keyFacts.outlay && (
                        <p>
                          <strong className="text-slate-900">Sanctioned Outlay:</strong> {article.keyFacts.outlay}
                        </p>
                      )}
                      {article.keyFacts.beneficiaries && (
                        <p>
                          <strong className="text-slate-900">Beneficiary Group:</strong> {article.keyFacts.beneficiaries}
                        </p>
                      )}
                    </div>
                  )}

                  {/* District / G.O. Badge */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {article.district ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
                        <MapPin className="h-2.5 w-2.5" />
                        {article.district}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Statewide / All TN
                      </span>
                    )}

                    {article.goReference && (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
                        <FileCheck className="h-2.5 w-2.5" />
                        {article.goReference}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-teal-700 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-[11px]">Official Source</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedArticle(article)}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Full Article Intelligence View */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 pr-6">
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                  {CATEGORY_META[selectedArticle.category]?.label || selectedArticle.category}
                </span>
                <span className="text-xs text-slate-400">
                  Published: {formatDate(selectedArticle.publishedAt)}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {lang === 'TA' ? selectedArticle.titleTa : selectedArticle.title}
              </h2>
            </div>

            {/* Department & District Attribution */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <div>
                <span className="font-semibold text-slate-900 block">Department:</span>
                {selectedArticle.department}
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">Jurisdiction / District:</span>
                {selectedArticle.district ? `${selectedArticle.district} District` : 'Statewide (All 38 Districts)'}
              </div>
            </div>

            {/* Summary & Full Content */}
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <div className="rounded-lg border-l-4 border-indigo-600 bg-indigo-50/50 p-3 text-xs text-indigo-950">
                <strong className="block font-semibold mb-1">Official Summary:</strong>
                {lang === 'TA' ? selectedArticle.summaryTa : selectedArticle.summary}
              </div>

              <p className="whitespace-pre-line text-xs sm:text-sm">
                {lang === 'TA' ? selectedArticle.contentTa : selectedArticle.content}
              </p>
            </div>

            {/* Key Facts Checklist */}
            {selectedArticle.keyFacts && (
              <div className="space-y-1.5 rounded-lg border border-slate-200 p-3 text-xs">
                <p className="font-semibold text-slate-900">Extracted Intelligence & Criteria:</p>
                {selectedArticle.keyFacts.outlay && (
                  <p><span className="text-slate-500">Financial Outlay:</span> <strong>{selectedArticle.keyFacts.outlay}</strong></p>
                )}
                {selectedArticle.keyFacts.beneficiaries && (
                  <p><span className="text-slate-500">Beneficiary Group:</span> {selectedArticle.keyFacts.beneficiaries}</p>
                )}
                {selectedArticle.keyFacts.eligibility && (
                  <p><span className="text-slate-500">Eligibility Terms:</span> {selectedArticle.keyFacts.eligibility}</p>
                )}
              </div>
            )}

            {/* Official Source Link & G.O. References */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-500">
                  Source: <strong>{selectedArticle.sourceName}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {selectedArticle.officialDocUrl && (
                    <a
                      href={selectedArticle.officialDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-teal-50 px-2.5 py-1 font-semibold text-teal-800 border border-teal-200 hover:bg-teal-100"
                    >
                      <FileCheck className="h-3 w-3" />
                      View Official G.O. (PDF)
                    </a>
                  )}

                  <a
                    href={selectedArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-indigo-600 px-3 py-1 font-semibold text-white hover:bg-indigo-700"
                  >
                    Original Portal
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
