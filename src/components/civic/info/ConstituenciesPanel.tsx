'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Landmark,
  MapPin,
  Search,
  Users,
  Vote,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApi } from '@/lib/civic/api'
import { partyColor, partyName, TALLY_ORDER } from '@/lib/civic/parties'
import { EmptyState, ErrorState, Loading, SectionTitle } from '@/components/civic/ui-bits'
import { VerificationBadge } from '@/components/civic/VerificationBadge'
import { CARD, CARD_HERO, SCROLLBAR } from './shared'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Constituency {
  id: string
  type: 'ASSEMBLY' | 'PARLIAMENTARY'
  no: number
  name: string
  reservation: string | null
  parentNo: number | null
  holderName: string | null
  holderParty: string | null
  holderPartyShort: string | null
  holderSince: string | null
  holderStatus: 'CURRENT' | 'VACANT'
  officeTitle: string | null
  electionWinner: string | null
  electionParty: string | null
  electionMargin: string | null
  electionMarginPct: string | null
  runnerUpName: string | null
  runnerUpParty: string | null
  holderNotes: string | null
  officialSource: string | null
  sourceName: string | null
  lastVerifiedAt: string | null
  verificationStatus: string
  verificationNote: string | null
  naturalKey: string
  district?: { id: string; name: string; headquarters: string | null } | null
  parentPC?: { no: number; name: string; mp: string | null; mpParty: string | null; reservation: string | null } | null
}

interface DistrictGroup {
  district: string
  headquarters: string | null
  acCount: number
  vacant: number
  acs: Constituency[]
}

interface DirectoryResponse {
  meta: {
    assembly: string
    pollDate: string
    resultDate: string
    verifiedAt: string
    source: string
    note: string
  }
  stats: {
    acs: number
    pcs: number
    vacancies: number
    districts: number
    tally: Record<string, number>
  }
  districtGroups: DistrictGroup[]
  constituencies: Constituency[]
  total: number
}

type ViewKey = 'districts' | 'all' | 'pcs'

const VIEWS: Array<{ key: ViewKey; label: string }> = [
  { key: 'districts', label: 'Districts → ACs' },
  { key: 'all', label: 'All 234 seats' },
  { key: 'pcs', label: 'Lok Sabha (39)' },
]

function resTag(r: string | null): string | null {
  if (r === 'SC' || r === 'ST') return r
  return null
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

export default function ConstituenciesPanel() {
  const { data, loading, error } = useApi<DirectoryResponse>('/api/constituencies')

  const [view, setView] = useState<ViewKey>('districts')
  const [q, setQ] = useState('')
  const [district, setDistrict] = useState<string>('all')
  const [party, setParty] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [openDistricts, setOpenDistricts] = useState<Set<string>>(new Set())
  const [openAC, setOpenAC] = useState<string | null>(null)

  const acs = (data?.constituencies ?? []).filter((c) => c.type === 'ASSEMBLY')
  const pcs = (data?.constituencies ?? []).filter((c) => c.type === 'PARLIAMENTARY')

  const filterAC = (c: Constituency) => {
    if (district !== 'all' && c.district?.name !== district) return false
    if (party !== 'all' && (c.holderStatus === 'VACANT' ? 'VACANT' : c.holderPartyShort ?? 'N/A') !== party) return false
    if (status !== 'all' && c.holderStatus !== status) return false
    if (q.trim()) {
      const hay = [c.name, c.holderName, c.district?.name, c.holderPartyShort, `AC ${c.no}`, String(c.no)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q.trim().toLowerCase())) return false
    }
    return true
  }

  const filteredAcs = acs.filter(filterAC)

  const groups = (data?.districtGroups ?? [])
    .map((g) => ({ ...g, acs: g.acs.filter(filterAC) }))
    .filter((g) => g.acs.length > 0)

  const toggleDistrict = (name: string) => {
    setOpenDistricts((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const expandAll = () => setOpenDistricts(new Set((data?.districtGroups ?? []).map((g) => g.district)))
  const collapseAll = () => setOpenDistricts(new Set())

  if (loading) return <Loading label="Loading the 234-constituency directory…" />
  if (error || !data) return <ErrorState message={`Could not load the constituency directory: ${error}`} />

  const tallyEntries = TALLY_ORDER.filter((k) => data.stats.tally[k]).map((k) => [k, data.stats.tally[k]] as const)

  return (
    <section aria-label="Districts and constituencies directory" className="space-y-6">
      <SectionTitle
        icon={Landmark}
        title="Districts & Constituencies — MLAs of the 17th Assembly"
        subtitle="Every Tamil Nadu district with its assembly constituencies and current MLAs, plus the 39 Lok Sabha seats and their MPs. Administrative districts and electoral constituencies are kept strictly separate — each AC belongs to a parent parliamentary seat, not to a district boundary."
      />

      {/* Verification banner */}
      <div className="flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2.5 text-xs text-teal-900">
        <Vote className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          <strong>Verified 6 Nov 2026.</strong> {data.meta.assembly} — polled 23 Apr 2026, results declared 4 May 2026
          (turnout ≈85.1%). Seat-level results cross-validated against the ECI compilation, the Assembly member register
          and the party-position table (all three agree). By-polls of 6 Oct 2026 (Madurantakam AC 35, Dharapuram AC 101)
          confirmed directly on <span className="font-mono">results.eci.gov.in</span>. Five seats are shown as{' '}
          <strong>vacant</strong> pending by-polls rather than guessed. Source: {data.meta.source}.
        </span>
      </div>

      {/* Stats + tally */}
      <div className={`${CARD_HERO} space-y-4`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Districts', value: data.stats.districts, hint: 'administrative (38)' },
            { label: 'Assembly seats', value: data.stats.acs, hint: 'ACs 1–234' },
            { label: 'Lok Sabha seats', value: data.stats.pcs, hint: 'PCs 1–39' },
            { label: 'Vacant', value: data.stats.vacancies, hint: 'by-polls pending' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
              <p className="text-[10px] text-slate-400">{s.hint}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Party position — current MLAs (post 6 Oct 2026 by-polls)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tallyEntries.map(([k, n]) => (
              <button
                key={k}
                type="button"
                onClick={() => setParty(party === (k === 'VACANT' ? 'VACANT' : k) ? 'all' : k === 'VACANT' ? 'VACANT' : k)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  party === (k === 'VACANT' ? 'VACANT' : k)
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
                aria-pressed={party === (k === 'VACANT' ? 'VACANT' : k)}
                title={k === 'VACANT' ? 'Vacant — by-poll pending' : partyName(k)}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: partyColor(k === 'VACANT' ? 'IND' : k) }} aria-hidden />
                {k === 'VACANT' ? 'Vacant' : k} · {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`${CARD} flex flex-wrap items-center gap-2`}>
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search MLA, constituency, district or AC number…"
            className="pl-8"
            aria-label="Search constituencies and MLAs"
          />
        </div>

        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-[190px]" aria-label="Filter by district">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent className={`${SCROLLBAR} max-h-72`}>
            <SelectItem value="all">All districts (38)</SelectItem>
            {(data?.districtGroups ?? []).map((g) => (
              <SelectItem key={g.district} value={g.district}>
                {g.district} ({g.acCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={party} onValueChange={setParty}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by party">
            <SelectValue placeholder="Party" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All parties</SelectItem>
            {TALLY_ORDER.filter((k) => data.stats.tally[k] && k !== 'VACANT').map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
            <SelectItem value="VACANT">Vacant</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[130px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="CURRENT">Current</SelectItem>
            <SelectItem value="VACANT">Vacant</SelectItem>
          </SelectContent>
        </Select>

        <div role="radiogroup" aria-label="Directory view" className="flex gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="radio"
              aria-checked={view === v.key}
              onClick={() => setView(v.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                view === v.key
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === 'districts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <strong className="text-slate-800">{filteredAcs.length}</strong> of 234 assembly seats across{' '}
              <strong className="text-slate-800">{groups.length}</strong> districts
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll} aria-label="Expand all districts">
                Expand all
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll} aria-label="Collapse all districts">
                Collapse
              </Button>
            </div>
          </div>

          {groups.length === 0 ? (
            <EmptyState title="No constituencies match" hint="Try clearing the search or filters." />
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {groups.map((g) => {
                const open = openDistricts.has(g.district)
                return (
                  <div key={g.district} className={`${CARD} overflow-hidden !p-0`} data-testid={`district-${g.district}`}>
                    <button
                      type="button"
                      onClick={() => toggleDistrict(g.district)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      {open ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      )}
                      <MapPin className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {g.district}
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            {g.headquarters ? `HQ ${g.headquarters}` : null}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {g.acCount} constituency{g.acCount === 1 ? '' : 's'}
                          {g.vacant > 0 ? ` · ${g.vacant} vacant` : ''}
                        </p>
                      </div>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                        {g.acs[0]?.no}–{g.acs[g.acs.length - 1]?.no}
                      </span>
                    </button>

                    {open && (
                      <ul className="divide-y divide-slate-100 border-t border-slate-100">
                        {g.acs.map((ac) => (
                          <ACRow key={ac.id} ac={ac} open={openAC === ac.id} onToggle={() => setOpenAC(openAC === ac.id ? null : ac.id)} />
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {view === 'all' && (
        <div className={`${CARD} !p-0`}>
          <ul className="divide-y divide-slate-100">
            {filteredAcs.map((ac) => (
              <ACRow key={ac.id} ac={ac} open={openAC === ac.id} onToggle={() => setOpenAC(openAC === ac.id ? null : ac.id)} showDistrict />
            ))}
          </ul>
          {filteredAcs.length === 0 && <div className="p-6"><EmptyState title="No seats match" hint="Try clearing the search or filters." /></div>}
        </div>
      )}

      {view === 'pcs' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pcs.map((pc) => {
            const seatAcs = filteredAcs.filter((a) => a.parentNo === pc.no)
            if (filteredAcs.length !== acs.length && seatAcs.length === 0) return null
            return (
              <div key={pc.id} className={`${CARD} space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">PC {pc.no}</span>
                      {pc.name}
                      {resTag(pc.reservation) && (
                        <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">{pc.reservation}</span>
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                      <Users className="h-3 w-3 text-teal-700" aria-hidden />
                      <span className="font-medium text-slate-800">{pc.holderName ?? '—'}</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <span className="h-2 w-2 rounded-full" style={{ background: partyColor(pc.holderPartyShort) }} aria-hidden />
                        {pc.holderPartyShort ?? ''}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">{partyName(pc.holderPartyShort)} · MP since Jun 2024 (18th Lok Sabha)</p>
                  </div>
                </div>
                <ul className="space-y-1 border-t border-slate-100 pt-2">
                  {seatAcs.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-slate-400">{a.no}</span>
                      <span className="min-w-0 flex-1 truncate text-slate-700">{a.name}</span>
                      {a.holderStatus === 'VACANT' ? (
                        <VerificationBadge status="VACANT" />
                      ) : (
                        <>
                          <span className="max-w-[110px] truncate font-medium text-slate-800">{a.holderName}</span>
                          <span className="inline-flex items-center gap-1 font-medium" style={{ color: partyColor(a.holderPartyShort) }}>
                            <span className="h-2 w-2 rounded-full" style={{ background: partyColor(a.holderPartyShort) }} aria-hidden />
                            {a.holderPartyShort}
                          </span>
                        </>
                      )}
                    </li>
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
/* AC row + detail                                                     */
/* ------------------------------------------------------------------ */

function ACRow({ ac, open, onToggle, showDistrict = false }: { ac: Constituency; open: boolean; onToggle: () => void; showDistrict?: boolean }) {
  const vacant = ac.holderStatus === 'VACANT'
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-left transition hover:bg-slate-50 ${open ? 'bg-slate-50' : ''}`}
      >
        <span className="w-9 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold text-slate-600">
          {ac.no}
        </span>
        <span className="min-w-[140px] flex-1 text-sm font-medium text-slate-900">
          {ac.name}
          {resTag(ac.reservation) && (
            <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">{ac.reservation}</span>
          )}
          {showDistrict && <span className="ml-1.5 text-[11px] font-normal text-slate-400">{ac.district?.name}</span>}
        </span>

        {vacant ? (
          <span className="flex items-center gap-2">
            <span className="text-xs italic text-slate-400">Seat vacant — by-poll pending</span>
            <VerificationBadge status="VACANT" />
          </span>
        ) : (
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm text-slate-700">{ac.holderName}</span>
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ background: partyColor(ac.holderPartyShort) }}
            >
              {ac.holderPartyShort}
            </span>
          </span>
        )}
        {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden />}
      </button>

      {open && (
        <div className="space-y-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-600">
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-700">Party:</span> {partyName(ac.holderPartyShort)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Member since:</span>{' '}
              {ac.holderSince ? new Date(ac.holderSince).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}{' '}
              {ac.holderSince && new Date(ac.holderSince) > new Date('2026-10-01') ? '(Oct 2026 by-poll)' : '(2026 general election)'}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Parent Lok Sabha seat:</span> {ac.parentPC ? `${ac.parentPC.name} (PC ${ac.parentPC.no})` : '—'}
            </p>
            <p>
              <span className="font-semibold text-slate-700">MP:</span>{' '}
              {ac.parentPC?.mp ? `${ac.parentPC.mp} (${ac.parentPC.mpParty})` : '—'}
            </p>
            <p>
              <span className="font-semibold text-slate-700">2026 result:</span> {ac.electionWinner ?? '—'} ({ac.electionParty?.replace('All India Anna Dravida Munnetra Kazhagam', 'ADMK') ?? '—'}
              ){ac.electionMargin ? `, margin ${ac.electionMargin} (${ac.electionMarginPct ?? '—'}%)` : ''}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Runner-up:</span> {ac.runnerUpName ?? '—'} ({ac.runnerUpParty ?? '—'})
            </p>
            {ac.officeTitle && (
              <p className="sm:col-span-2">
                <span className="font-semibold text-slate-700">Office:</span> {ac.officeTitle}
              </p>
            )}
          </div>

          {ac.holderNotes && <p className="rounded bg-white px-2.5 py-1.5 text-[11px] leading-relaxed text-slate-500">{ac.holderNotes}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <VerificationBadge status={ac.verificationStatus === 'VERIFIED' ? 'CURRENT' : 'PENDING_VERIFICATION'} />
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>Source: {ac.sourceName}</span>
              {ac.officialSource && (
                <a
                  href={ac.officialSource}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                  aria-label={`Official source for ${ac.name}`}
                >
                  results.eci.gov.in <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  )
}
