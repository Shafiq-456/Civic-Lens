'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Database,
  ExternalLink,
  Info,
  Landmark,
  Map as MapIcon,
  MapPin,
  ScrollText,
  ShieldAlert,
  Vote,
} from 'lucide-react'
import { useApi } from '@/lib/civic/api'
import type { DistrictSummary, PoliticalRecord, StateSummary } from '@/lib/civic/types'
import { partyColor } from '@/lib/civic/parties'
import { OFFICE_META, formatDate, formatNum } from '@/lib/civic/format'
import GeoMap from '@/components/civic/GeoMap'
import { VerificationBadge } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, SectionTitle } from '@/components/civic/ui-bits'
import { DefRow, CARD, SCROLLBAR, normName } from './shared'

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

interface StatesResponse {
  states: StateSummary[]
}

interface DistrictsResponse {
  state: {
    id: string
    code: string
    name: string
    assemblySeats: number
    lokSabhaSeats: number
    rajyaSabhaSeats: number
    isFocusState: boolean
  }
  districts: DistrictSummary[]
  statewideRecords: PoliticalRecord[]
  focus: boolean
  note: string
}

interface RecordsResponse {
  records: PoliticalRecord[]
  total: number
}

type LayerKey = 'districts' | 'ac' | 'pc'

const LAYERS: Array<{ key: LayerKey; label: string; nameKey: string; file: string; caption: string }> = [
  {
    key: 'districts',
    label: 'Districts (38)',
    nameKey: 'district',
    file: '/geo/tamil-nadu-districts.geojson',
    caption:
      'Tamil Nadu administrative districts — Census 2011-vintage open boundaries. Mayiladuthurai (created Dec 2020) remains merged inside the Nagapattinam polygon.',
  },
  {
    key: 'ac',
    label: 'Assembly constituencies (234)',
    nameKey: 'AC_NAME',
    file: '/geo/tamil-nadu-ac.geojson',
    caption:
      'Tamil Nadu assembly constituencies — ECI delimitation (2008) boundaries; names may carry (SC)/(ST) reservation tags.',
  },
  {
    key: 'pc',
    label: 'Parliamentary constituencies (39)',
    nameKey: 'pc_name',
    file: '/geo/tamil-nadu-pc.geojson',
    caption: 'Tamil Nadu parliamentary constituencies — 2019 ECI-based boundaries, numbered 1–39.',
  },
]

const DATASETS = [
  {
    name: 'India — states & UTs',
    file: '/geo/india-states.geojson',
    count: '36 features',
    vintage: 'Census 2011 boundaries dissolved to current organisation (28 states + 8 UTs; Telangana & Ladakh present, J&K as UT).',
  },
  {
    name: 'Tamil Nadu — districts',
    file: '/geo/tamil-nadu-districts.geojson',
    count: '37 of 38 official features',
    vintage: 'Census 2011-vintage open data including all 2019–20 reorganised districts; Mayiladuthurai absent (merged in Nagapattinam polygon).',
  },
  {
    name: 'Tamil Nadu — assembly constituencies',
    file: '/geo/tamil-nadu-ac.geojson',
    count: '234 features',
    vintage: 'ECI delimitation (2008) boundaries via datameet; every AC carries AC_NO and parent PC_NAME / PC_NO.',
  },
  {
    name: 'Tamil Nadu — parliamentary constituencies',
    file: '/geo/tamil-nadu-pc.geojson',
    count: '39 features',
    vintage: '2019 ECI-based boundaries via datameet; pc_no follows ECI numbering (1 = Thiruvallur, 39 = Kanyakumari).',
  },
]

/* ------------------------------------------------------------------ */
/* MapsPanel                                                           */
/* ------------------------------------------------------------------ */

export default function MapsPanel() {
  const [mode, setMode] = useState<'india' | 'tn'>('india')
  const [layer, setLayer] = useState<LayerKey>('districts')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  // India basemap + state directory (fetched once).
  const { data: india, loading: indiaLoading, error: indiaError } = useApi<GeoJSON.FeatureCollection>('/geo/india-states.geojson')
  const { data: statesData, loading: statesLoading, error: statesError } = useApi<StatesResponse>('/api/states')

  // TN district directory (drives choropleth, side panel and provenance note).
  const { data: tnData, loading: tnLoading, error: tnError } = useApi<DistrictsResponse>('/api/districts?stateCode=TN')

  const activeLayer = LAYERS.find((l) => l.key === layer) ?? LAYERS[0]
  const { data: layerGeo, loading: layerLoading, error: layerError } = useApi<GeoJSON.FeatureCollection>(
    mode === 'tn' ? activeLayer.file : null,
  )

  const districts = useMemo(() => tnData?.districts ?? [], [tnData])

  /** geoName (geojson spelling) → district directory entry. */
  const districtByGeo = useMemo(() => {
    const m = new Map<string, DistrictSummary>()
    for (const d of districts) if (d.geoName) m.set(normName(d.geoName), d)
    return m
  }, [districts])

  /** Choropleth: district polygon name → number of political records. */
  const valueByName = useMemo(() => {
    const m: Record<string, number> = {}
    for (const d of districts) if (d.geoName) m[d.geoName] = d._count.records
    return m
  }, [districts])

  /** Feature name → raw feature properties (for AC_NO / PC_NAME / pc_no lookups). */
  const propsByName = useMemo(() => {
    const m = new Map<string, Record<string, unknown>>()
    if (!layerGeo) return m
    for (const f of layerGeo.features) {
      const props = (f.properties ?? {}) as Record<string, unknown>
      const raw = String(props[activeLayer.nameKey] ?? '')
      if (raw) m.set(normName(raw), props)
    }
    return m
  }, [layerGeo, activeLayer.nameKey])

  const selectedProps = selectedFeature ? propsByName.get(normName(selectedFeature)) : undefined
  const selectedDistrict =
    layer === 'districts' && selectedFeature ? districtByGeo.get(normName(selectedFeature)) ?? null : null

  const selectedStateInfo = useMemo(
    () => (selectedState ? statesData?.states.find((s) => s.name === selectedState) ?? null : null),
    [statesData, selectedState],
  )

  const propStr = (key: string) => {
    const v = selectedProps?.[key]
    return v === undefined || v === null || v === '' ? '—' : String(v)
  }

  return (
    <section aria-label="Maps and geography" className="space-y-6">
      <SectionTitle
        icon={MapIcon}
        title="Maps & Geography"
        subtitle="Real administrative and electoral boundaries rendered from open GeoJSON datasets. Click any polygon to inspect the directory behind it."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* ------------------------------ Map card (col-span-3) ------------------------------ */}
        <div className={`${CARD} lg:col-span-3`} data-testid="maps-big-map">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-teal-700" aria-hidden />
              {mode === 'india' ? 'India — states & union territories' : 'Tamil Nadu — boundary layers'}
            </h3>

            {mode === 'tn' && (
              <div className="flex flex-wrap items-center gap-2">
                <div role="radiogroup" aria-label="Boundary layer" className="flex flex-wrap gap-1.5">
                  {LAYERS.map((l) => (
                    <button
                      key={l.key}
                      type="button"
                      role="radio"
                      aria-checked={layer === l.key}
                      onClick={() => {
                        setLayer(l.key)
                        setSelectedFeature(null)
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        layer === l.key
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('india')
                    setSelectedFeature(null)
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  India
                </button>
              </div>
            )}
          </div>

          {mode === 'india' ? (
            indiaLoading ? (
              <Loading label="Loading India boundary data…" />
            ) : indiaError ? (
              <ErrorState message={`Could not load India boundaries: ${indiaError}`} />
            ) : (
              <GeoMap
                geojson={india}
                nameKey="st_nm"
                dataFill="#0f766e"
                selectedName={selectedState}
                onSelect={(name) => setSelectedState(name)}
                height={430}
                caption="States & UTs of India — Census 2011 boundary polygons organised to the current 28 states + 8 UTs. Click a state to open its directory summary."
              />
            )
          ) : layerLoading ? (
            <Loading label={`Loading ${activeLayer.label.toLowerCase()}…`} />
          ) : layerError ? (
            <ErrorState message={`Could not load boundary layer: ${layerError}`} />
          ) : (
            <GeoMap
              key={layer}
              geojson={layerGeo}
              nameKey={activeLayer.nameKey}
              dataNames={layer === 'districts' ? districts.map((d) => d.geoName).filter((g): g is string => Boolean(g)) : undefined}
              valueByName={layer === 'districts' ? valueByName : undefined}
              choroplethLabel={layer === 'districts' ? 'Political records per district — low' : undefined}
              dataFill="#0f766e"
              selectedName={selectedFeature}
              onSelect={(name) => setSelectedFeature(name)}
              height={520}
              caption={activeLayer.caption}
            />
          )}
        </div>

        {/* ------------------------------ Side panel (col-span-2) ------------------------------ */}
        <aside className={`${CARD} lg:col-span-2`} aria-label="Map selection details">
          {mode === 'india' ? (
            <StateSidePanel
              statesLoading={statesLoading}
              statesError={statesError}
              stateInfo={selectedStateInfo}
              selectedState={selectedState}
              onOpenTN={() => {
                setMode('tn')
                setLayer('districts')
                setSelectedFeature(null)
              }}
            />
          ) : tnLoading ? (
            <Loading label="Loading Tamil Nadu directory…" />
          ) : tnError ? (
            <ErrorState message={`Could not load Tamil Nadu directory: ${tnError}`} />
          ) : (
            <div className="space-y-4">
              {/* Layer-specific selection */}
              {layer === 'districts' && (
                selectedDistrict ? (
                  <DistrictDetail district={selectedDistrict} />
                ) : (
                  <div className="space-y-2">
                    <EmptyState
                      title="Click a district polygon"
                      hint="Choropleth intensity = number of verified political records mapped to the district. Select one to see headquarters, formation date and its directory records."
                    />
                    <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      Mayiladuthurai (created Dec 2020) has no separate polygon in the open dataset — it is merged inside Nagapattinam.
                    </p>
                  </div>
                )
              )}

              {layer === 'ac' && (
                selectedProps ? (
                  <ACDirectoryCard acNo={Number(propStr('AC_NO')) || null} fallbackName={propStr('AC_NAME')} pcName={propStr('PC_NAME')} pcNo={propStr('PC_NO')} />
                ) : (
                  <EmptyState
                    title="Click an assembly constituency"
                    hint="234 constituencies from the real ECI delimitation dataset. Selection shows the AC number, its MLA, party, election margin and its parent Lok Sabha constituency."
                  />
                )
              )}

              {layer === 'pc' && (
                selectedProps ? (
                  <PCDirectoryCard pcNo={Number(propStr('pc_no')) || null} fallbackName={propStr('pc_name')} />
                ) : (
                  <EmptyState
                    title="Click a parliamentary constituency"
                    hint="39 Lok Sabha seats, numbered 1–39 following ECI ordering (1 = Thiruvallur, 39 = Kanyakumari)."
                  />
                )
              )}

              <StatewideLeadership records={tnData?.statewideRecords ?? []} />
            </div>
          )}
        </aside>
      </div>

      {/* ------------------------------ Provenance card ------------------------------ */}
      <ProvenanceCard note={tnData?.note ?? null} noteLoading={tnLoading} />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Electoral directory cards (AC / PC side panels)                     */
/* ------------------------------------------------------------------ */

interface DirectoryEntry {
  id: string
  type: string
  no: number
  name: string
  reservation: string | null
  holderName: string | null
  holderParty: string | null
  holderPartyShort: string | null
  holderStatus: 'CURRENT' | 'VACANT'
  officeTitle: string | null
  electionWinner: string | null
  electionParty: string | null
  electionMargin: string | null
  electionMarginPct: string | null
  runnerUpName: string | null
  runnerUpParty: string | null
  holderNotes: string | null
  lastVerifiedAt: string | null
  verificationStatus: string
  district?: { name: string } | null
  parentPC?: { no: number; name: string; mp: string | null; mpParty: string | null } | null
}

function ACDirectoryCard({
  acNo,
  fallbackName,
  pcName,
  pcNo,
}: {
  acNo: number | null
  fallbackName: string
  pcName: string
  pcNo: string
}) {
  const { data, loading, error } = useApi<{ constituencies: DirectoryEntry[] }>(acNo ? `/api/constituencies?no=${acNo}&type=ASSEMBLY` : null)
  const entry = data?.constituencies?.[0] ?? null

  return (
    <div>
      <h4 className="font-semibold text-slate-900">{entry?.name ?? fallbackName}</h4>
      <p className="text-xs text-slate-500">Assembly constituency — ECI delimitation (2008)</p>
      <dl className="mt-3 divide-y divide-slate-100">
        <DefRow label="AC No.">{acNo ?? '—'}</DefRow>
        <DefRow label="Parent Lok Sabha PC">{pcName}</DefRow>
        <DefRow label="PC No.">{pcNo}</DefRow>
        {loading ? (
          <DefRow label="MLA">Loading directory…</DefRow>
        ) : error ? (
          <DefRow label="MLA">Directory unavailable</DefRow>
        ) : entry ? (
          <>
            <DefRow label="MLA">
              {entry.holderStatus === 'VACANT' ? (
                <span className="italic text-slate-400">Vacant — by-poll pending</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: partyColor(entry.holderPartyShort) }} aria-hidden />
                  {entry.holderName}
                </span>
              )}
            </DefRow>
            {!entry.holderStatus && entry.holderPartyShort && (
              <DefRow label="Party">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: partyColor(entry.holderPartyShort) }} aria-hidden />
                  {entry.holderPartyShort}
                </span>
              </DefRow>
            )}
            {entry.district?.name && <DefRow label="District">{entry.district.name}</DefRow>}
            {entry.electionWinner && (
              <DefRow label="2026 result">
                {entry.electionWinner} ({entry.electionParty?.replace('All India Anna Dravida Munnetra Kazhagam', 'ADMK')})
                {entry.electionMargin ? `, margin ${entry.electionMargin}` : ''}
              </DefRow>
            )}
            {entry.parentPC?.mp && (
              <DefRow label={`MP (${entry.parentPC.name})`}>
                {entry.parentPC.mp} ({entry.parentPC.mpParty})
              </DefRow>
            )}
            {entry.officeTitle && <DefRow label="Office">{entry.officeTitle}</DefRow>}
          </>
        ) : (
          <DefRow label="MLA">Not in directory</DefRow>
        )}
      </dl>
      {entry?.holderNotes && <p className="mt-2 rounded bg-slate-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-slate-500">{entry.holderNotes}</p>}
      {entry && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <VerificationBadge status={entry.verificationStatus === 'VERIFIED' ? 'CURRENT' : 'PENDING_VERIFICATION'} />
          verified {entry.lastVerifiedAt ? new Date(entry.lastVerifiedAt).toISOString().slice(0, 10) : '—'} · ECI results & Assembly register
        </p>
      )}
      <p className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        Boundaries are delimitation-era (2008) and can shift slightly vs current ground. Administrative districts and electoral seats are separate layers.
      </p>
    </div>
  )
}

function PCDirectoryCard({ pcNo, fallbackName }: { pcNo: number | null; fallbackName: string }) {
  const { data, loading, error } = useApi<{ constituencies: DirectoryEntry[] }>(pcNo ? `/api/constituencies?no=${pcNo}&type=PARLIAMENTARY` : null)
  const { data: acData } = useApi<{ constituencies: DirectoryEntry[] }>(pcNo ? `/api/constituencies?pc=${pcNo}&type=ASSEMBLY` : null)
  const entry = data?.constituencies?.[0] ?? null
  const seatAcs = acData?.constituencies ?? []

  return (
    <div>
      <h4 className="font-semibold text-slate-900">{entry?.name ?? fallbackName}</h4>
      <p className="text-xs text-slate-500">Parliamentary constituency — 2019 ECI-based</p>
      <dl className="mt-3 divide-y divide-slate-100">
        <DefRow label="PC No.">{pcNo ?? '—'}</DefRow>
        {loading ? (
          <DefRow label="MP">Loading directory…</DefRow>
        ) : error ? (
          <DefRow label="MP">Directory unavailable</DefRow>
        ) : entry ? (
          <>
            <DefRow label="MP">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: partyColor(entry.holderPartyShort) }} aria-hidden />
                {entry.holderName}
              </span>
            </DefRow>
            <DefRow label="Party">{entry.holderParty}</DefRow>
            <DefRow label="Term">18th Lok Sabha (2024 – 2029)</DefRow>
            <DefRow label="Assembly seats">{seatAcs.length || 6} ACs</DefRow>
          </>
        ) : (
          <DefRow label="MP">Not in directory</DefRow>
        )}
      </dl>
      {seatAcs.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-xs">
          {seatAcs.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2">
              <span className="font-mono text-slate-400">{a.no}</span>
              <span className="min-w-0 flex-1 truncate text-slate-700">{a.name}</span>
              {a.holderStatus === 'VACANT' ? (
                <span className="text-[10px] italic text-slate-400">vacant</span>
              ) : (
                <span className="flex items-center gap-1 text-[11px]">
                  <span className="max-w-[110px] truncate font-medium text-slate-800">{a.holderName}</span>
                  <span className="h-2 w-2 rounded-full" style={{ background: partyColor(a.holderPartyShort) }} aria-hidden />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {entry && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <VerificationBadge status={entry.verificationStatus === 'VERIFIED' ? 'CURRENT' : 'PENDING_VERIFICATION'} />
          MP elected at the 2024 general election · verified {entry.lastVerifiedAt ? new Date(entry.lastVerifiedAt).toISOString().slice(0, 10) : '—'}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* India side panel                                                    */
/* ------------------------------------------------------------------ */

function StateSidePanel({
  statesLoading,
  statesError,
  stateInfo,
  selectedState,
  onOpenTN,
}: {
  statesLoading: boolean
  statesError: string | null
  stateInfo: StateSummary | null
  selectedState: string | null
  onOpenTN: () => void
}) {
  if (statesLoading) return <Loading label="Loading state directory…" />
  if (statesError) return <ErrorState message={`Could not load states: ${statesError}`} />

  if (!selectedState || !stateInfo) {
    return (
      <EmptyState
        title="Click a state or union territory"
        hint="Every polygon is interactive. The side panel shows seat counts, the number of directory records and — for Tamil Nadu — a deep-dive into districts and constituencies."
      />
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-base font-semibold text-slate-900">{stateInfo.name}</h4>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {stateInfo.isUnionTerritory ? 'Union Territory' : 'State'}
        </span>
        {stateInfo.region && (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
            {stateInfo.region}
          </span>
        )}
      </div>

      <dl className="mt-3 divide-y divide-slate-100">
        <DefRow label="Assembly seats">
          <span className="inline-flex items-center gap-1">
            <Landmark className="h-3.5 w-3.5 text-teal-700" aria-hidden />
            {formatNum(stateInfo.assemblySeats)}
          </span>
        </DefRow>
        <DefRow label="Lok Sabha seats">
          <span className="inline-flex items-center gap-1">
            <Vote className="h-3.5 w-3.5 text-teal-700" aria-hidden />
            {formatNum(stateInfo.lokSabhaSeats)}
          </span>
        </DefRow>
        <DefRow label="Rajya Sabha seats">
          <span className="inline-flex items-center gap-1">
            <Landmark className="h-3.5 w-3.5 text-teal-700" aria-hidden />
            {formatNum(stateInfo.rajyaSabhaSeats)}
          </span>
        </DefRow>
        <DefRow label="Districts">{formatNum(stateInfo._count.districts)}</DefRow>
        <DefRow label="Political records">
          <span className="font-semibold text-teal-800">{formatNum(stateInfo._count.records)}</span>
        </DefRow>
      </dl>

      {stateInfo.isFocusState ? (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={onOpenTN}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            Open Tamil Nadu detail
          </button>
          <p className="text-xs text-slate-500">
            Switches the map to layered Tamil Nadu view: districts (choropleth by record count), 234 assembly constituencies and 39
            parliamentary constituencies.
          </p>
        </div>
      ) : (
        <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Detailed directory for this state is not part of the demonstration dataset. Statewide leadership directories exist for Tamil
          Nadu only.
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* District detail (TN mode)                                           */
/* ------------------------------------------------------------------ */

function DistrictDetail({ district }: { district: DistrictSummary }) {
  const { data, loading, error } = useApi<RecordsResponse>(`/api/records?districtId=${encodeURIComponent(district.id)}`)

  return (
    <div>
      <h4 className="text-base font-semibold text-slate-900">{district.name}</h4>
      <p className="text-xs text-slate-500">
        {district.headquarters ? `Headquarters: ${district.headquarters}` : 'Headquarters not recorded'}
        {district.formedOn ? ` · formed ${formatDate(district.formedOn)}` : ''}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat label="Records" value={district._count.records} />
        <MiniStat label="Projects" value={district._count.projects} />
        <MiniStat label="Complaints" value={district._count.complaints} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Political records</p>
      {loading ? (
        <Loading label="Loading district records…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : (data?.records.length ?? 0) === 0 ? (
        <EmptyState title="No records mapped" hint="No political records are linked to this district yet." />
      ) : (
        <ul className={`mt-2 max-h-96 space-y-2 overflow-y-auto pr-1 ${SCROLLBAR}`}>
          {data!.records.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">
                  {OFFICE_META[r.office]?.label ?? r.officeLabel ?? r.office}
                  {r.constituencyName ? ` · ${r.constituencyName}` : ''}
                </p>
              </div>
              <VerificationBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-center">
      <p className="text-base font-semibold text-slate-900">{formatNum(value)}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Statewide leadership (TN mode)                                      */
/* ------------------------------------------------------------------ */

function StatewideLeadership({ records }: { records: PoliticalRecord[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Statewide leadership</p>
      {records.length === 0 ? (
        <EmptyState title="No statewide records" hint="Governor / CM / Deputy CM / Speaker entries will appear here." />
      ) : (
        <ul className={`mt-2 max-h-64 space-y-2 overflow-y-auto pr-1 ${SCROLLBAR}`}>
          {records.map((r) => (
            <li key={r.id} className="rounded-lg border border-slate-100 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <p className="text-sm font-medium text-slate-800">
                  {OFFICE_META[r.office]?.label ?? r.office}
                  <span className="ml-1.5 text-slate-500">— {r.name}</span>
                </p>
                <VerificationBadge status={r.status} />
              </div>
              {r.sourceName && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                  {r.officialSource ? (
                    <a href={r.officialSource} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                      {r.sourceName}
                    </a>
                  ) : (
                    r.sourceName
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Boundary dataset provenance                                         */
/* ------------------------------------------------------------------ */

function ProvenanceCard({ note, noteLoading }: { note: string | null; noteLoading: boolean }) {
  return (
    <div className={`${CARD} space-y-4`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Database className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Boundary dataset provenance</h3>
          <p className="text-xs text-slate-500">
            The four real datasets behind the maps above. AC/PC layers reference the ECI delimitation; PC numbering follows ECI 1–39.
          </p>
        </div>
      </div>

      <ul className="grid gap-2 md:grid-cols-2">
        {DATASETS.map((d) => (
          <li key={d.file} className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-slate-800">
              <ScrollText className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
              {d.name}
              <span className="rounded-full border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                {d.count}
              </span>
            </p>
            <p className="mt-1 font-mono text-[10px] text-slate-400">{d.file}</p>
            <p className="mt-1 text-xs text-slate-500">{d.vintage}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <p className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            <strong>Administrative district boundaries ≠ electoral constituency boundaries</strong> — the two layers are kept separate
            and must never be cross-joined for visualisation or analysis.
          </span>
        </p>
        <p className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            <strong>Mayiladuthurai (created Dec 2020) is merged inside Nagapattinam</strong> in the open dataset; production must use
            Survey of India / EC authorised boundaries.
          </span>
        </p>
      </div>

      {noteLoading ? (
        <p className="text-xs text-slate-400">Loading dataset note…</p>
      ) : note ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-600">Dataset note: </span>
          {note}
        </p>
      ) : null}

      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Building2 className="h-3 w-3" aria-hidden />
        Administrative layer: Census/district polygons. Electoral layers: ECI delimitation. Demonstrated with open data — see
        <span className="font-mono">/public/geo/meta.json</span> for full lineage.
      </p>
    </div>
  )
}
