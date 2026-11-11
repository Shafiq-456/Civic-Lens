'use client'

import { useState } from 'react'
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Database,
  ShieldCheck,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useApi, apiSend } from '@/lib/civic/api'
import { DemoUser } from '@/lib/civic/types'
import { formatDate, formatDateTime, relativeTime } from '@/lib/civic/format'
import { Loading, ErrorState, EmptyState } from '@/components/civic/ui-bits'
import { GuardedButton } from './admin-shared'

interface CollectorStatusResponse {
  metrics: {
    totalNewsCollected: number
    totalGovernmentOrders: number
    activeSchemesTracked: number
    monitoredDistricts: number
    officialAnnouncements: number
    sourcesOnline: number
    systemHealth: string
  }
  sources: Array<{
    key: string
    name: string
    url: string
    category: string
    status: string
    intervalMinutes: number
    lastChecked: string
  }>
  lastSync: string
}

export function IntelligenceTab({ user, canEdit }: { user: DemoUser; canEdit: boolean }) {
  const { data, loading, error, refresh } = useApi<CollectorStatusResponse>('/api/collector/status')
  const [triggering, setTriggering] = useState<string | null>(null)

  async function triggerCollection(sourceKey: string = 'ALL') {
    if (!canEdit) {
      toast.error('Read-only session: Administrative permission required.')
      return
    }
    setTriggering(sourceKey)
    try {
      const res = await apiSend<{ status: string; message: string }>('/api/collector/status', 'POST', { sourceKey })
      toast.success('Collection cycle succeeded', { description: res.message })
      refresh()
    } catch (e: any) {
      toast.error(e?.message || 'Collection failed')
    } finally {
      setTriggering(null)
    }
  }

  const metrics = data?.metrics
  const sources = data?.sources || []

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Live News Articles</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{metrics?.totalNewsCollected ?? 0}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">TN DIPR & PIB Monitored</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Government Orders (G.O.)</p>
          <p className="mt-1 text-2xl font-bold text-teal-700">{metrics?.totalGovernmentOrders ?? 0}</p>
          <p className="mt-1 text-[11px] text-slate-500">Verified Secretariats</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Active Schemes</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{metrics?.activeSchemesTracked ?? 0}</p>
          <p className="mt-1 text-[11px] text-indigo-600">State & Central</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Collector Health</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-bold text-emerald-700">{metrics?.systemHealth ?? 'OPERATIONAL'}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">All 5 streams online</p>
        </div>
      </div>

      {/* Main Monitoring Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Government Intelligence Data Sources & Harvest Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Automated ingestion rules monitoring gazette feeds, district collectorates, and official press releases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GuardedButton
              canEdit={canEdit}
              disabled={Boolean(triggering)}
              onClick={() => triggerCollection('ALL')}
              className="bg-indigo-600 text-xs text-white hover:bg-indigo-700 font-semibold"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${triggering ? 'animate-spin' : ''}`} />
              Run Full Ingestion Cycle
            </GuardedButton>
          </div>
        </div>

        {loading ? (
          <Loading label="Polling collector daemon status..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="px-3.5 py-2.5">Official Stream</th>
                  <th className="px-3.5 py-2.5">Category</th>
                  <th className="px-3.5 py-2.5">Interval</th>
                  <th className="px-3.5 py-2.5">Collector Status</th>
                  <th className="px-3.5 py-2.5">Last Sync</th>
                  <th className="px-3.5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sources.map((s) => (
                  <tr key={s.key} className="hover:bg-slate-50/50">
                    <td className="px-3.5 py-3">
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
                      >
                        {s.url}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-medium text-slate-700">
                      Every {s.intervalMinutes} min
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-slate-400">
                      {relativeTime(s.lastChecked)}
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <button
                        type="button"
                        disabled={Boolean(triggering)}
                        onClick={() => triggerCollection(s.key)}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {triggering === s.key ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

