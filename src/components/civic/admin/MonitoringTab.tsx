'use client'

import { useMemo } from 'react'
import { toast } from 'sonner'
import {
  BadgeCheck,
  Gavel,
  History,
  Landmark,
  RefreshCw,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/lib/civic/api'
import { OFFICE_META } from '@/lib/civic/format'
import type { PoliticalRecord } from '@/lib/civic/types'
import { FreshnessBadge, GenericChip } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, StatCard } from '@/components/civic/ui-bits'

type DistRow = { label: string; count: number }

function DistributionBars({ rows }: { rows: DistRow[] }) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0) || 1
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-2 sm:grid-cols-[9rem_1fr_2.5rem]">
          <span className="truncate text-xs font-medium text-slate-700" title={row.label}>{row.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <span
              className="block h-full rounded-full bg-teal-600 transition-all duration-500"
              style={{ width: `${Math.max(4, Math.round((row.count / max) * 100))}%` }}
            />
          </span>
          <span className="text-right text-xs tabular-nums text-slate-600" aria-label={`${row.count} records`}>
            {row.count}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function MonitoringTab() {
  const { data, error, loading, refresh } = useApi<{ records: PoliticalRecord[] }>('/api/records')
  const records = data?.records ?? []

  const stats = useMemo(() => {
    const total = records.length
    const byStatus: Record<string, number> = { CURRENT: 0, FORMER: 0, VACANT: 0, PENDING_VERIFICATION: 0 }
    const parties = new Map<string, number>()
    const offices = new Map<string, number>()
    const districts = new Map<string, number>()
    let verified = 0

    for (const r of records) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
      const party = r.partyShort ?? 'Unknown'
      parties.set(party, (parties.get(party) ?? 0) + 1)
      const office = OFFICE_META[r.office]?.label ?? r.officeLabel ?? r.office
      offices.set(office, (offices.get(office) ?? 0) + 1)
      if (r.district?.name) districts.set(r.district.name, (districts.get(r.district.name) ?? 0) + 1)
      if (r.lastVerifiedAt) verified += 1
    }

    const toRows = (m: Map<string, number>): DistRow[] =>
      Array.from(m.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)

    const watchlist = records
      .filter((r) => r.freshness === 'STALE' || r.freshness === 'NEVER_VERIFIED')
      .slice()
      .sort((a, b) => {
        if (a.freshness !== b.freshness) return a.freshness === 'NEVER_VERIFIED' ? -1 : 1
        return new Date(a.lastVerifiedAt ?? 0).getTime() - new Date(b.lastVerifiedAt ?? 0).getTime()
      })

    return {
      total,
      current: byStatus.CURRENT ?? 0,
      former: byStatus.FORMER ?? 0,
      vacant: byStatus.VACANT ?? 0,
      pending: byStatus.PENDING_VERIFICATION ?? 0,
      coveragePct: total === 0 ? 0 : Math.round((verified / total) * 100),
      parties: toRows(parties),
      offices: toRows(offices),
      districts: toRows(districts),
      watchlist,
    }
  }, [records])

  if (loading) return <Loading label="Aggregating representative data…" />
  if (error) {
    return (
      <div className="space-y-3">
        <ErrorState message={error} />
        <Button variant="outline" size="sm" onClick={() => { refresh(); toast.info('Retrying…') }}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
        </Button>
      </div>
    )
  }
  if (stats.total === 0) {
    return <EmptyState title="No political records yet" hint="Records appear here once the directory is seeded." />
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <Landmark className="h-5 w-5 text-teal-700" aria-hidden />
          Representative Monitoring
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Aggregate view of the political directory — composition, representation and verification health.
        </p>
      </div>

      {/* KPI cards */}
      <section aria-label="Directory figures" className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total records" value={stats.total} icon={Landmark} tone="teal" />
        <StatCard label="Current officeholders" value={stats.current} icon={BadgeCheck} tone="emerald" />
        <StatCard label="Former tracked" value={stats.former} icon={History} tone="slate" />
        <StatCard label="Vacant seats" value={stats.vacant} icon={Gavel} tone="rose" />
        <StatCard label="Pending verification" value={stats.pending} icon={ShieldQuestion} tone="amber" />
        <StatCard label="Verification coverage" value={`${stats.coveragePct}%`} sub="records with a last-verified date" icon={ShieldCheck} tone="teal" />
      </section>

      {/* Distributions */}
      <div className="grid gap-4 md:grid-cols-2">
        <section aria-label="Party distribution" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Party distribution</h3>
          <p className="mb-3 text-xs text-slate-500">Records by party affiliation.</p>
          {stats.parties.length === 0 ? <EmptyState title="No party data" /> : <DistributionBars rows={stats.parties} />}
        </section>
        <section aria-label="Office distribution" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Office distribution</h3>
          <p className="mb-3 text-xs text-slate-500">Records by office type.</p>
          {stats.offices.length === 0 ? <EmptyState title="No office data" /> : <DistributionBars rows={stats.offices} />}
        </section>
      </div>

      {/* District representation */}
      <section aria-label="District representation" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">District representation</h3>
        <p className="mb-3 text-xs text-slate-500">Number of records per district (records linked to a district).</p>
        {stats.districts.length === 0 ? (
          <EmptyState title="No district-linked records" hint="Only records with a district link are shown here." />
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                  <TableHead className="w-[40%]">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.districts.map((d) => (
                  <TableRow key={d.label}>
                    <TableCell className="font-medium text-slate-800">{d.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100" aria-hidden>
                          <span
                            className="block h-full rounded-full bg-teal-600"
                            style={{ width: `${Math.max(4, Math.round((d.count / (stats.districts[0]?.count || 1)) * 100))}%` }}
                          />
                        </span>
                        <span className="text-xs text-slate-400">{d.count === 1 ? '1 record' : `${d.count} records`}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Verification watchlist */}
      <section aria-label="Verification watchlist" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Verification watchlist</h3>
        <p className="mb-3 text-xs text-slate-500">
          Records that are stale (last verified more than 30 days ago) or never verified — re-verify these first.
        </p>
        {stats.watchlist.length === 0 ? (
          <EmptyState
            title="All records are fresh"
            hint="Every record has been verified within the last 30 days."
          />
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Last verified</TableHead>
                  <TableHead>Freshness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.watchlist.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-slate-800">{r.name}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {r.officeLabel ?? OFFICE_META[r.office]?.label ?? r.office}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{r.partyShort ?? '—'}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-slate-500">
                      {r.lastVerifiedAt ? new Date(r.lastVerifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'never'}
                    </TableCell>
                    <TableCell>
                      {r.freshness === 'NEVER_VERIFIED' ? (
                        <GenericChip tone="red">Never verified</GenericChip>
                      ) : (
                        <FreshnessBadge freshness={r.freshness} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
