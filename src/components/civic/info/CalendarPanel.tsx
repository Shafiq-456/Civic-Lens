'use client'

import { useMemo } from 'react'
import { CalendarDays, Clock, MapPin, UserRound } from 'lucide-react'
import { useApi } from '@/lib/civic/api'
import type { CalendarEvent } from '@/lib/civic/types'
import { EVENT_TYPE_META, formatDateTime } from '@/lib/civic/format'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, SectionTitle } from '@/components/civic/ui-bits'
import { CARD, SCROLLBAR } from './shared'

/* ------------------------------------------------------------------ */

interface EventsResponse {
  events: CalendarEvent[]
}

const TYPE_TONE: Record<string, string> = {
  ASSEMBLY_SESSION: 'teal',
  REVIEW_MEETING: 'slate',
  PUBLIC_HEARING: 'amber',
  SCHEME_LAUNCH: 'green',
  DEADLINE: 'red',
}

function typeLabel(type: string): string {
  return EVENT_TYPE_META[type]?.label ?? type
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ */

export default function CalendarPanel() {
  const { data, loading, error } = useApi<EventsResponse>('/api/events')

  /** Group events by local calendar date, sorted ascending (earliest first). */
  const groups = useMemo(() => {
    const events = [...(data?.events ?? [])].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    const out: Array<{ key: string; date: Date; events: CalendarEvent[] }> = []
    for (const e of events) {
      const d = new Date(e.startsAt)
      const key = dateKey(d)
      const last = out[out.length - 1]
      if (last && last.key === key) {
        last.events.push(e)
      } else {
        out.push({ key, date: d, events: [e] })
      }
    }
    return out
  }, [data])

  const startOfToday = useMemo(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), n.getDate())
  }, [])

  return (
    <section aria-label="Official government calendar" className="space-y-4">
      <SectionTitle
        icon={CalendarDays}
        title="Official Calendar"
        subtitle="Assembly sessions, review meetings, public hearings, scheme launches and statutory deadlines — rendered in chronological order."
      />

      {loading ? (
        <Loading label="Loading calendar…" />
      ) : error ? (
        <ErrorState message={`Could not load the calendar: ${error}`} />
      ) : groups.length === 0 ? (
        <EmptyState title="No events scheduled" hint="Official events will appear here as they are added to the calendar." />
      ) : (
        <div className={`max-h-[38rem] space-y-5 overflow-y-auto pr-1 ${SCROLLBAR}`}>
          {groups.map((g, i) => {
            const isPast = g.date.getTime() < startOfToday.getTime()
            const prevWasPast = i > 0 && groups[i - 1].date.getTime() < startOfToday.getTime()
            return (
              <div key={g.key}>
                {/* Small "past" divider at the past → upcoming boundary */}
                {i === 0 && isPast && <Divider label="Past" tone="past" />}
                {!isPast && (i === 0 || prevWasPast) && <Divider label="Today & upcoming" tone="upcoming" />}

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {g.date.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <ul className="space-y-2.5">
                  {g.events.map((e) => (
                    <EventRow key={e.id} event={e} />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Divider({ label, tone }: { label: string; tone: 'past' | 'upcoming' }) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <span
        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
          tone === 'past' ? 'border-slate-200 bg-slate-100 text-slate-500' : 'border-teal-200 bg-teal-50 text-teal-700'
        }`}
      >
        {label}
      </span>
      <span className={`h-px flex-1 ${tone === 'past' ? 'bg-slate-200' : 'bg-teal-100'}`} />
    </div>
  )
}

function EventRow({ event: e }: { event: CalendarEvent }) {
  const start = new Date(e.startsAt)
  return (
    <li className={`${CARD} flex items-start gap-4`}>
      {/* Date block: day + month */}
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-teal-800">
        <span className="text-lg font-bold leading-none">{start.getDate()}</span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
          {start.toLocaleString('en-IN', { month: 'short' })}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900" title={formatDateTime(e.startsAt)}>
            {e.title}
          </h3>
          <GenericChip tone={TYPE_TONE[e.type] ?? 'slate'}>{typeLabel(e.type)}</GenericChip>
        </div>

        {e.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{e.description}</p>}

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1" title={formatDateTime(e.startsAt)}>
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            {timeOf(e.startsAt)}
            {e.endsAt ? ` – ${timeOf(e.endsAt)}` : ''}
            <span className="sr-only"> ({formatDateTime(e.startsAt)}{e.endsAt ? ` to ${formatDateTime(e.endsAt)}` : ''})</span>
          </span>
          {e.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              {e.location}
            </span>
          )}
          {e.organizer && (
            <span className="inline-flex items-center gap-1">
              <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              {e.organizer}
            </span>
          )}
        </div>

        {e.verificationStatus === 'PENDING_VERIFICATION' && e.sourceNote && (
          <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
            {e.sourceNote}
          </p>
        )}
      </div>
    </li>
  )
}
