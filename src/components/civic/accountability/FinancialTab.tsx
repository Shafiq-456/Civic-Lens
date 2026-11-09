'use client'

import { useMemo } from 'react'
import { BarChart3, FileSearch, Info, Landmark, PieChart, Scale, Wallet } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataBanner } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, ProgressBar, SectionTitle, StatCard } from '@/components/civic/ui-bits'
import { useApi } from '@/lib/civic/api'
import { formatCr, formatNum } from '@/lib/civic/format'
import type { CivicStats } from '@/lib/civic/types'
import { ProjectStatusChip, type ProjectsResponse } from './shared'

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  INFRASTRUCTURE: { label: 'Infrastructure', color: '#0f766e' },
  WATER: { label: 'Water', color: '#14b8a6' },
  HEALTH: { label: 'Health', color: '#10b981' },
  EDUCATION: { label: 'Education', color: '#f59e0b' },
  ENERGY: { label: 'Energy', color: '#ea580c' },
  URBAN: { label: 'Urban development', color: '#f43f5e' },
  TRANSPORT: { label: 'Transport', color: '#64748b' },
}

const AUDIT_CHECKS = [
  {
    icon: Wallet,
    title: 'Sanction-vs-spent reconciliation',
    body: 'Every rupee spent maps to a sanctioned budget head, with variance explained for cost overruns and savings.',
  },
  {
    icon: FileSearch,
    title: 'Tender records',
    body: 'Competitive tendering is documented: published notices, bid evaluation sheets and award justifications.',
  },
  {
    icon: Landmark,
    title: 'Contractor registration',
    body: 'Executing contractors hold valid registrations, eligibility credentials and no active blacklist entries.',
  },
]

/** Tab 5 — budget utilisation stats, spend charts and the full financial register. */
export default function FinancialTab() {
  const stats = useApi<CivicStats>('/api/stats')
  const projects = useApi<ProjectsResponse>('/api/projects')

  const projectList = projects.data?.projects ?? []
  const acc = stats.data?.accountability ?? null

  // Top 8 projects by sanctioned outlay — sanctioned (teal) vs spent (amber).
  const top8 = useMemo(
    () =>
      [...projectList]
        .sort((a, b) => b.sanctionedInrCr - a.sanctionedInrCr)
        .slice(0, 8)
        .map((p) => ({ name: p.code, Sanctioned: p.sanctionedInrCr, Spent: p.spentInrCr })),
    [projectList],
  )

  // Spend share aggregated by project category (client-side).
  const categoryData = useMemo(() => {
    const totals = new Map<string, number>()
    for (const p of projectList) totals.set(p.category, (totals.get(p.category) ?? 0) + p.spentInrCr)
    const grand = Array.from(totals.values()).reduce((s, v) => s + v, 0)
    return Array.from(totals.entries())
      .map(([key, value]) => ({
        name: CATEGORY_META[key]?.label ?? key,
        value,
        fill: CATEGORY_META[key]?.color ?? '#94a3b8',
        pct: grand > 0 ? Math.round((value / grand) * 100) : 0,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [projectList])

  const loading = stats.loading || projects.loading
  const error = stats.error ?? projects.error

  return (
    <div className="space-y-6">
      {/* Headline financial stats */}
      {loading ? (
        <Loading label="Loading financial data…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : acc ? (
        <section aria-label="Headline financial statistics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total budget" value={formatCr(acc.totalBudget)} sub="across all tracked projects" icon={Landmark} tone="slate" />
            <StatCard label="Sanctioned" value={formatCr(acc.totalSanctioned)} sub="administrative approval issued" icon={Scale} tone="teal" />
            <StatCard label="Spent" value={formatCr(acc.totalSpent)} sub="recorded expenditure to date" icon={Wallet} tone="amber" />
            <StatCard label="Utilisation" value={`${acc.utilisationPct}%`} sub="spent as a share of sanctioned" icon={BarChart3} tone="emerald" />
          </div>
        </section>
      ) : null}

      {/* Top projects: sanctioned vs spent */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-label="Top projects by sanctioned outlay">
        <SectionTitle
          icon={BarChart3}
          title="Top projects by sanctioned outlay"
          subtitle="Sanctioned vs spent (₹ Cr) for the eight largest projects. Teal = sanctioned · amber = spent."
        />
        {loading ? (
          <Loading label="Preparing chart…" />
        ) : top8.length === 0 ? (
          <EmptyState title="No project financials to chart yet" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top8} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" height={58} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => v.toLocaleString('en-IN')} width={72} />
                <Tooltip
                  formatter={(value) => formatCr(Number(value))}
                  contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Sanctioned" fill="#0f766e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Spend share by category */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-label="Spend share by category">
        <SectionTitle
          icon={PieChart}
          title="Spend share by category"
          subtitle="Recorded expenditure aggregated by project category across the full register."
        />
        {loading ? (
          <Loading label="Aggregating category spend…" />
        ) : categoryData.length === 0 ? (
          <EmptyState title="No spend recorded yet" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 lg:items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2} stroke="#ffffff" strokeWidth={1}>
                    {categoryData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCr(Number(value))} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2.5">
              {categoryData.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: d.fill }} aria-hidden />
                  <span className="flex-1 text-slate-700">{d.name}</span>
                  <span className="font-mono text-xs text-slate-600">{formatCr(d.value)}</span>
                  <span className="w-10 text-right text-xs font-semibold text-slate-500">{d.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Full financial register */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Full project financial register">
        <SectionTitle
          icon={Landmark}
          title="Project financial register"
          subtitle="Budget, sanction and expenditure for every tracked project — sortable by eye, filterable in the Projects tab."
        />
        {loading ? (
          <Loading label="Loading register…" />
        ) : projects.error ? (
          <ErrorState message={projects.error} />
        ) : projectList.length === 0 ? (
          <EmptyState title="No projects in the register" />
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-50">
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Sanctioned</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="hidden w-28 lg:table-cell">Spent %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectList.map((p) => {
                    const spentPct = p.sanctionedInrCr > 0 ? Math.round((p.spentInrCr / p.sanctionedInrCr) * 100) : 0
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="whitespace-nowrap font-mono text-xs text-slate-600">{p.code}</TableCell>
                        <TableCell className="max-w-[13rem] truncate font-medium text-slate-800" title={p.name}>
                          {p.name}
                        </TableCell>
                        <TableCell className="hidden text-xs text-slate-600 md:table-cell">
                          {p.department?.shortName ?? p.department?.name ?? '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right font-mono text-xs">{formatCr(p.budgetInrCr)}</TableCell>
                        <TableCell className="hidden whitespace-nowrap text-right font-mono text-xs sm:table-cell">
                          {formatCr(p.sanctionedInrCr)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right font-mono text-xs">{formatCr(p.spentInrCr)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={spentPct} tone={spentPct > 90 ? 'amber' : 'teal'} />
                            <span className="w-8 text-right text-xs tabular-nums text-slate-600">{spentPct}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ProjectStatusChip status={p.status} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Figures are demonstration data for the transparency workflow. Production deployment requires audited finance feeds
              reconciled with treasury records ({formatNum(projectList.length)} projects listed).
            </p>
          </>
        )}
      </section>

      {/* Integrity note */}
      <section className="rounded-xl border border-teal-200 bg-teal-50 p-4 sm:p-6" aria-label="Independent audit guidance">
        <SectionTitle
          icon={Scale}
          title="What independent audits should verify"
          subtitle="The Trust portal publishes the audit trail; this portal exposes the money trail that reconciliation runs against."
        />
        <ul className="grid gap-3 sm:grid-cols-3">
          {AUDIT_CHECKS.map((item) => (
            <li key={item.title} className="rounded-lg border border-teal-200/70 bg-white p-4">
              <item.icon className="h-5 w-5 text-teal-700" aria-hidden />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.body}</p>
            </li>
          ))}
        </ul>
        <DataBanner className="mt-4">
          Financial figures here are demonstration data. Audit conclusions in production must come from authorised, audited
          finance feeds — never from this surface alone.
        </DataBanner>
      </section>
    </div>
  )
}
