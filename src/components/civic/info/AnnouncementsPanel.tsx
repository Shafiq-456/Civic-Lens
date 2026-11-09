'use client'

import { useState } from 'react'
import { Bell, CalendarDays, ChevronDown, ChevronUp, ExternalLink, Megaphone, ShieldCheck } from 'lucide-react'
import { useApi } from '@/lib/civic/api'
import type { Announcement } from '@/lib/civic/types'
import { ANNOUNCEMENT_CATEGORY_META, formatDate } from '@/lib/civic/format'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, SectionTitle } from '@/components/civic/ui-bits'
import { CARD } from './shared'

/* ------------------------------------------------------------------ */

interface AnnouncementsResponse {
  announcements: Announcement[]
}

const CATEGORIES = ['ALL', 'POLICY', 'TENDER', 'SCHEME', 'PUBLIC_NOTICE', 'PRESS'] as const

const CATEGORY_TONE: Record<string, string> = {
  POLICY: 'teal',
  TENDER: 'amber',
  SCHEME: 'green',
  PUBLIC_NOTICE: 'slate',
  PRESS: 'teal',
}

function categoryLabel(category: string): string {
  return ANNOUNCEMENT_CATEGORY_META[category]?.label ?? category
}

/* ------------------------------------------------------------------ */

export default function AnnouncementsPanel() {
  const [category, setCategory] = useState<string>('ALL')
  const { data, loading, error } = useApi<AnnouncementsResponse>('/api/announcements')

  const announcements = data?.announcements ?? []
  const filtered = category === 'ALL' ? announcements : announcements.filter((a) => a.category === category)

  return (
    <section aria-label="Official announcements" className="space-y-4">
      <SectionTitle
        icon={Megaphone}
        title="Announcements"
        subtitle="Policy circulars, tenders, scheme notices and press releases published by the government."
      />

      {/* Category filter chips */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter announcements by category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              category === c
                ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'
            }`}
          >
            {c === 'ALL' ? 'All' : categoryLabel(c)}
          </button>
        ))}
        <p className="ml-auto text-xs text-slate-400" aria-live="polite">
          {filtered.length} of {announcements.length}
        </p>
      </div>

      {loading ? (
        <Loading label="Loading announcements…" />
      ) : error ? (
        <ErrorState message={`Could not load announcements: ${error}`} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={announcements.length === 0 ? 'No announcements published yet' : 'Nothing in this category'}
          hint={
            announcements.length === 0
              ? 'Announcements will appear here as departments publish them.'
              : 'Try another category chip to see other notices.'
          }
        />
      ) : (
        <ul className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </ul>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function AnnouncementCard({ announcement: a }: { announcement: Announcement }) {
  const [expanded, setExpanded] = useState(false)
  const longBody = a.body.length > 180

  return (
    <li className={`${CARD} flex flex-col`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <GenericChip tone={CATEGORY_TONE[a.category] ?? 'slate'}>{categoryLabel(a.category)}</GenericChip>
        {a.isImportant && (
          <GenericChip tone="amber">
            <Bell className="h-3 w-3" aria-hidden />
            Important
          </GenericChip>
        )}
        {a.department?.shortName && (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {a.department.shortName}
          </span>
        )}
      </div>

      <h3 className="mt-2.5 text-sm font-semibold leading-snug text-slate-900">{a.title}</h3>

      <p className={`mt-1.5 flex-1 text-xs leading-relaxed text-slate-600 ${expanded ? '' : 'line-clamp-3'}`}>{a.body}</p>

      {longBody && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-teal-700 hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-3 w-3" aria-hidden />
            </>
          ) : (
            <>
              Show more <ChevronDown className="h-3 w-3" aria-hidden />
            </>
          )}
        </button>
      )}

      <p className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
        <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
        Published {formatDate(a.publishedAt)}
        {a.department?.name && !a.department.shortName ? ` · ${a.department.name}` : ''}
      </p>

      {a.officialSource && (
        <a
          href={a.officialSource}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-flex max-w-full items-center gap-1 truncate text-[11px] font-medium text-teal-700 hover:underline"
          aria-label={`Open official source: ${a.sourceName ?? 'official source'}`}
        >
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{a.sourceName ?? 'Official source'}</span>
        </a>
      )}
      {a.lastVerifiedAt && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
          Verified {formatDate(a.lastVerifiedAt)}
        </p>
      )}
    </li>
  )
}
