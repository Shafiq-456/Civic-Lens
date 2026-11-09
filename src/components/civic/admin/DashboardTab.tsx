'use client'

import {
  ArrowRight,
  BadgeCheck,
  CirclePause,
  MessageSquareWarning,
  RefreshCw,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/lib/civic/api'
import { formatCr, formatNum, relativeTime } from '@/lib/civic/format'
import type { CivicStats } from '@/lib/civic/types'
import { EmptyState, ErrorState, Loading, StatCard } from '@/components/civic/ui-bits'
import type { AdminTab } from './admin-shared'

const QUICK_ACTIONS: Array<{ tab: AdminTab; label: string; hint: string; icon: typeof ShieldCheck }> = [
  { tab: 'records', label: 'Review verification queue', hint: 'Stale & never-verified political records', icon: ShieldCheck },
  { tab: 'complaints', label: 'Triage complaints', hint: 'Acknowledge, escalate, resolve', icon: MessageSquareWarning },
  { tab: 'citizen', label: 'Process citizen requests', hint: 'Verification requests awaiting decision', icon: UserCheck },
  { tab: 'audit', label: 'Inspect audit trail', hint: 'Every mutation, logged server-side', icon: ScrollText },
]

export function DashboardTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const { data, error, loading, refresh } = useApi<CivicStats>('/api/stats')

  if (loading) return <Loading label="Loading dashboard…" />
  if (error) {
    return (
      <div className="space-y-3">
        <ErrorState message={error} />
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
        </Button>
      </div>
    )
  }
  if (!data) return <EmptyState title="No statistics available" hint="The stats endpoint returned no data." />

  const { admin, info, accountability } = data
  const budgets = [...admin.deptBudgets].sort((a, b) => b.budgetInrCr - a.budgetInrCr)

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <section aria-label="Key figures" className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Verification queue"
          value={formatNum(admin.verificationQueue)}
          sub="pending + stale > 30d"
          icon={ShieldAlert}
          tone="amber"
        />
        <StatCard
          label="Records verified"
          value={`${info.verifiedPct}%`}
          sub={`${formatNum(info.verified)} of ${formatNum(info.recordsTotal)} records`}
          icon={BadgeCheck}
          tone="emerald"
        />
        <StatCard
          label="Pending citizen requests"
          value={formatNum(admin.pendingCitizenRequests)}
          sub={`${formatNum(admin.citizenRequestsTotal)} total submitted`}
          icon={UserCheck}
          tone="amber"
        />
        <StatCard
          label="Open complaints"
          value={formatNum(accountability.complaintsOpen)}
          sub={`${formatNum(accountability.complaintsTotal)} total`}
          icon={MessageSquareWarning}
          tone="rose"
        />
        <StatCard
          label="Audit entries"
          value={formatNum(admin.auditCount)}
          sub="mutations & decisions logged"
          icon={ScrollText}
          tone="slate"
        />
        <StatCard
          label="Projects on hold"
          value={formatNum(accountability.onHold)}
          sub="require attention"
          icon={CirclePause}
          tone="rose"
        />
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Quick actions</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.tab}
              type="button"
              onClick={() => onNavigate(qa.tab)}
              className="group rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"
              aria-label={`Go to ${qa.label}`}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-slate-800 group-hover:text-teal-800">
                <qa.icon className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                {qa.label}
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" aria-hidden />
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{qa.hint}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Department budgets */}
      <section aria-label="Department budgets" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Department budgets</h3>
            <p className="text-xs text-slate-500">Allocated budget and portfolio size per department.</p>
          </div>
          <p className="text-xs text-slate-400">Updated {relativeTime(data.generatedAt)}</p>
        </div>
        {budgets.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No departments registered" hint="Department budget data will appear here." />
          </div>
        ) : (
          <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                  <TableHead className="text-right">Schemes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((b) => (
                  <TableRow key={b.name}>
                    <TableCell>
                      <span className="font-medium text-slate-800">{b.name}</span>
                      {b.shortName && <span className="ml-1.5 text-xs text-slate-400">{b.shortName}</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCr(b.budgetInrCr)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNum(b._count.projects)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNum(b._count.schemes)}</TableCell>
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
