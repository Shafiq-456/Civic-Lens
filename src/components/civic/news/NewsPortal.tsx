'use client'

import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { GOVERNMENT_NEWS, type NewsItem } from '@/lib/civic/news-data'

const CATEGORY_META: Record<NewsItem['category'], { label: string; badge: string }> = {
  POLICY: { label: 'Policy & Cabinet', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  INFRASTRUCTURE: { label: 'Infrastructure', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  WELFARE: { label: 'Welfare & Social Justice', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  AGRICULTURE: { label: 'Agriculture & Irrigation', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  HEALTH: { label: 'Public Health', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  GOVERNANCE: { label: 'Public Administration', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export default function NewsPortal() {
  const [jurisdictionFilter, setJurisdictionFilter] = useState<'ALL' | 'TN' | 'INDIA'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)

  const filteredNews = useMemo(() => {
    return GOVERNMENT_NEWS.filter((item) => {
      const matchJur = jurisdictionFilter === 'ALL' || item.jurisdiction === jurisdictionFilter
      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      return matchJur && matchCat && matchSearch
    })
  }, [jurisdictionFilter, categoryFilter, searchQuery])

  const featuredItems = useMemo(() => GOVERNMENT_NEWS.filter((n) => n.isFeatured), [])

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-xs">
              <Newspaper className="h-3.5 w-3.5" />
              Official Gazette & Public Information Feed
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Government News & Public Information
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Verified press releases, cabinet decisions, policy notifications, and civic developments from the
              Government of India and the Government of Tamil Nadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200">
              <Globe className="h-4 w-4 text-indigo-400" />
              National & State Coverage
            </span>
          </div>
        </div>

        {/* Featured Headlines Section */}
        {featuredItems.length > 0 && (
          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
              <Flame className="h-4 w-4" />
              Featured Key Developments
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {featuredItems.map((feat) => (
                <div
                  key={feat.id}
                  onClick={() => setSelectedArticle(feat)}
                  className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-800/60 p-4 transition-all hover:border-indigo-400 hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        feat.jurisdiction === 'TN' ? 'bg-teal-900/80 text-teal-300' : 'bg-indigo-900/80 text-indigo-300'
                      }`}
                    >
                      {feat.jurisdiction === 'TN' ? 'Tamil Nadu' : 'Govt of India'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(feat.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white group-hover:text-indigo-300 line-clamp-2">
                    {feat.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{feat.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control and Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Jurisdiction Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {(['ALL', 'TN', 'INDIA'] as const).map((jur) => (
            <button
              key={jur}
              onClick={() => setJurisdictionFilter(jur)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                jurisdictionFilter === jur
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {jur === 'ALL'
                ? 'All News'
                : jur === 'TN'
                ? '🏛️ Tamil Nadu Government'
                : '🇮🇳 Government of India'}
            </button>
          ))}
        </div>

        {/* Category Pill and Search */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="POLICY">Policy & Cabinet</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="WELFARE">Welfare & Social Justice</option>
            <option value="AGRICULTURE">Agriculture & Irrigation</option>
            <option value="HEALTH">Public Health</option>
            <option value="GOVERNANCE">Public Administration</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search news, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* News Articles Feed */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNews.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
            No news articles match your filter criteria. Try resetting the filters.
          </div>
        ) : (
          filteredNews.map((article) => {
            const cat = CATEGORY_META[article.category]
            return (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group flex flex-col justify-between cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  {/* Card Header Chips */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        article.jurisdiction === 'TN'
                          ? 'border border-teal-200 bg-teal-50 text-teal-800'
                          : 'border border-indigo-200 bg-indigo-50 text-indigo-800'
                      }`}
                    >
                      {article.jurisdiction === 'TN' ? 'Tamil Nadu' : 'Govt of India'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="mt-3">
                    <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium ${cat.badge}`}>
                      {cat.label}
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-indigo-800 sm:text-base line-clamp-2">
                    {article.title}
                  </h2>

                  {/* Summary */}
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                {/* Footer Section */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="line-clamp-1 text-[11px] font-medium text-slate-600">
                      {article.sourceName}
                    </span>
                    <span className="shrink-0 flex items-center gap-1 text-indigo-700 font-semibold text-[11px] group-hover:underline">
                      Read full <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Dialog for Full Article */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Jurisdiction & Category Header */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  selectedArticle.jurisdiction === 'TN'
                    ? 'border border-teal-200 bg-teal-50 text-teal-800'
                    : 'border border-indigo-200 bg-indigo-50 text-indigo-800'
                }`}
              >
                {selectedArticle.jurisdiction === 'TN' ? 'Government of Tamil Nadu' : 'Government of India'}
              </span>
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                {selectedArticle.verificationStatus}
              </span>
            </div>

            {/* Full Title */}
            <h2 className="mt-3 text-lg font-bold text-slate-900 sm:text-xl">
              {selectedArticle.title}
            </h2>

            {/* Date and Department */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(selectedArticle.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {selectedArticle.department && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {selectedArticle.department}
                </span>
              )}
            </div>

            {/* Article Content */}
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
              <p className="font-semibold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedArticle.summary}
              </p>
              <p className="text-slate-700">
                {selectedArticle.content}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
              <Tag className="h-3.5 w-3.5 text-slate-400 mr-1" />
              {selectedArticle.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-slate-200 bg-slate-100/80 px-2 py-0.5 text-[11px] text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Source & Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                <span>Official Source: </span>
                <strong className="text-slate-800">{selectedArticle.sourceName}</strong>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-800"
                >
                  <span>Official Press Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

