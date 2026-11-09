'use client'

import { useMemo, useState } from 'react'
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Handshake,
  History,
  Landmark,
  MapPin,
  Search,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { EmptyState, ErrorState, Loading, ProgressBar, SectionTitle } from '@/components/civic/ui-bits'
import { useApi } from '@/lib/civic/api'
import { PROJECT_STATUS_META, formatCr, formatDate } from '@/lib/civic/format'
import type { ProjectDetail } from '@/lib/civic/types'
import { ProjectStatusChip, TONE_DOT, useDistricts, type ProjectsResponse } from './shared'

const CATEGORY_LABEL: Record<string, string> = {
  INFRASTRUCTURE: 'Infrastructure',
  WATER: 'Water',
  HEALTH: 'Health',
  EDUCATION: 'Education',
  ENERGY: 'Energy',
  URBAN: 'Urban development',
  TRANSPORT: 'Transport',
}

const MILESTONE_TONE: Record<string, string> = { DONE: 'green', IN_PROGRESS: 'teal', DELAYED: 'red', PENDING: 'slate' }
const MILESTONE_LABEL: Record<string, string> = { DONE: 'Done', IN_PROGRESS: 'In progress', DELAYED: 'Delayed', PENDING: 'Pending' }

function ProjectDialogBody({ project }: { project: ProjectDetail }) {
  const utilisation = project.sanctionedInrCr > 0 ? Math.round((project.spentInrCr / project.sanctionedInrCr) * 100) : 0
  const milestones = [...project.milestones].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-xs text-slate-500">{project.code}</p>
          <h3 className="mt-0.5 text-lg font-semibold leading-snug text-slate-900">{project.name}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusChip status={project.status} />
          <GenericChip tone="slate">{CATEGORY_LABEL[project.category] ?? project.category}</GenericChip>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-600">{project.description}</p>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-900">Financials</h4>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Budget (estimate)</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCr(project.budgetInrCr)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sanctioned</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCr(project.sanctionedInrCr)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Spent</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCr(project.spentInrCr)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Utilisation (spent / sanctioned)</TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold text-teal-700">{utilisation}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
            <span>Physical progress</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} />
        </div>
      </div>

      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Funded by</dt>
            <dd className="font-medium text-slate-800">{project.fundedBy ?? '—'}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Handshake className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Contractor</dt>
            <dd className="font-medium text-slate-800">{project.contractor ?? 'Not yet awarded'}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Started</dt>
            <dd className="font-medium text-slate-800">{formatDate(project.startDate)}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              {project.status === 'COMPLETED' ? 'Completed on' : 'Target completion'}
            </dt>
            <dd className={`font-medium ${project.status === 'COMPLETED' ? 'text-emerald-700' : 'text-slate-800'}`}>
              {formatDate(project.status === 'COMPLETED' ? project.completedOn : project.targetEndDate)}
            </dd>
          </div>
        </div>
      </dl>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-900">
          Milestones <span className="font-normal text-slate-500">({milestones.length})</span>
        </h4>
        {milestones.length === 0 ? (
          <EmptyState title="No milestones recorded" hint="Milestone-level fund release and completion appear here once scheduled." />
        ) : (
          <ol className="relative max-h-96 space-y-5 overflow-y-auto border-l-2 border-slate-200 pl-6" aria-label="Project milestones">
            {milestones.map((m) => {
              const tone = MILESTONE_TONE[m.status] ?? 'slate'
              return (
                <li key={m.id} className="relative">
                  <span
                    className={`absolute -left-8 top-1.5 h-3 w-3 rounded-full border-2 border-white ring-2 ring-slate-200 ${TONE_DOT[tone]}`}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">{m.title}</p>
                    <GenericChip tone={tone}>{MILESTONE_LABEL[m.status] ?? m.status}</GenericChip>
                  </div>
                  {m.description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{m.description}</p>}
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" aria-hidden />
                      Due {formatDate(m.dueDate)}
                    </span>
                    {m.completedOn && (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                        Completed {formatDate(m.completedOn)}
                      </span>
                    )}
                    {m.amountReleasedCr != null && (
                      <span className="inline-flex items-center gap-1 text-teal-700">
                        <Landmark className="h-3 w-3" aria-hidden />
                        {formatCr(m.amountReleasedCr)} released
                      </span>
                    )}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}

/** Tab 4 — browse the project register, open delivery detail, and surface completed history. */
export default function ProjectsTab() {
  const districts = useDistricts()

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [districtFilter, setDistrictFilter] = useState('ALL')
  const [q, setQ] = useState('')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  const listQs = useMemo(() => {
    const p = new URLSearchParams()
    if (statusFilter !== 'ALL') p.set('status', statusFilter)
    if (categoryFilter !== 'ALL') p.set('category', categoryFilter)
    if (districtFilter !== 'ALL') p.set('districtId', districtFilter)
    const s = p.toString()
    return s ? `?${s}` : ''
  }, [statusFilter, categoryFilter, districtFilter])

  const projects = useApi<ProjectsResponse>(`/api/projects${listQs}`)
  const completed = useApi<ProjectsResponse>('/api/projects?status=COMPLETED')
  const detail = useApi<{ project: ProjectDetail }>(selectedCode ? `/api/projects/${encodeURIComponent(selectedCode)}` : null)

  const visible = useMemo(() => {
    const all = projects.data?.projects ?? []
    const needle = q.trim().toLowerCase()
    if (!needle) return all
    return all.filter((p) => p.name.toLowerCase().includes(needle) || p.code.toLowerCase().includes(needle))
  }, [projects.data, q])

  const completedList = completed.data?.projects ?? []

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Project filters">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="pj-status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="pj-status" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="ALL">All statuses</SelectItem>
                {Object.entries(PROJECT_STATUS_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pj-category">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="pj-category" className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="ALL">All categories</SelectItem>
                {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pj-district">District</Label>
            <Select value={districtFilter} onValueChange={setDistrictFilter} disabled={districts.loading}>
              <SelectTrigger id="pj-district" className="w-full">
                <SelectValue placeholder={districts.loading ? 'Loading…' : 'All districts'} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="ALL">All districts</SelectItem>
                {districts.data?.districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pj-q">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input
                id="pj-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Project name or code…"
                className="pl-8"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500" aria-live="polite">
            Showing {visible.length} of {projects.data?.projects.length ?? 0} projects
          </p>
          <Button
            size="sm"
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            className={
              statusFilter === 'COMPLETED'
                ? 'gap-1.5 bg-teal-700 text-white hover:bg-teal-800'
                : 'gap-1.5'
            }
            onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
            aria-pressed={statusFilter === 'COMPLETED'}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Completed projects
          </Button>
        </div>
      </section>

      {/* Project grid */}
      {projects.loading ? (
        <Loading label="Loading projects…" />
      ) : projects.error ? (
        <ErrorState message={projects.error} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No projects match these filters"
          hint="Try a different status or district, or clear the search text."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2" aria-label="Project list">
          {visible.map((p) => {
            const spentPct = p.sanctionedInrCr > 0 ? Math.round((p.spentInrCr / p.sanctionedInrCr) * 100) : 0
            const isDone = p.status === 'COMPLETED'
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedCode(p.code)}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                aria-label={`Open details for project ${p.name} (${p.code})`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-500">{p.code}</span>
                  <ProjectStatusChip status={p.status} />
                </div>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{p.name}</h3>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 shrink-0" aria-hidden />
                    {p.department?.shortName ?? p.department?.name ?? 'Department unassigned'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                    {p.district?.name ?? 'State-wide'}
                  </p>
                </div>
                <div className="mt-3">
                  <ProgressBar value={p.progress} />
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                    <span>{p.progress}% complete</span>
                    <span>
                      {p._count?.milestones ?? 0} milestone{(p._count?.milestones ?? 0) === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
                <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-600">
                  Budget {formatCr(p.budgetInrCr)} · Spent {formatCr(p.spentInrCr)}{' '}
                  <span className="text-slate-400">({spentPct}% of sanctioned)</span>
                </p>
                <p className="mt-1.5 text-xs">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      Completed on {formatDate(p.completedOn)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Target className="h-3 w-3" aria-hidden />
                      Target {formatDate(p.targetEndDate)}
                    </span>
                  )}
                </p>
              </button>
            )
          })}
        </div>
      )}

      {/* Completed history strip */}
      {statusFilter !== 'COMPLETED' && completedList.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Completed project history">
          <SectionTitle
            icon={History}
            title="Completed project history"
            subtitle="Delivered works with their actual completion dates — the record of what got done."
            right={
              <Button variant="outline" size="sm" onClick={() => setStatusFilter('COMPLETED')}>
                View all completed
              </Button>
            }
          />
          <div className="flex gap-3 overflow-x-auto pb-1">
            {completed.data?.projects.slice(0, 8).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedCode(p.code)}
                className="w-56 shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-teal-300 hover:bg-white"
                aria-label={`Open details for completed project ${p.name}`}
              >
                <p className="font-mono text-[11px] text-slate-500">{p.code}</p>
                <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-snug text-slate-800">{p.name}</p>
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden />
                  Completed on {formatDate(p.completedOn)}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Detail dialog */}
      <Dialog
        open={selectedCode != null}
        onOpenChange={(open) => {
          if (!open) setSelectedCode(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Project detail</DialogTitle>
            <DialogDescription>Financials, contractor and milestone timeline for the selected project.</DialogDescription>
          </DialogHeader>
          {detail.loading && <Loading label="Loading project detail…" />}
          {detail.error && <ErrorState message={detail.error} />}
          {detail.data?.project && <ProjectDialogBody project={detail.data.project} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
