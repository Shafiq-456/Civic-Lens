'use client'

// Tab 5 — Deployment Roadmap: the four phases from prototype to handover, the
// explicit non-goals that bound the prototype, the tech migration path, and what
// an authorised evaluator should review and request first.

import { ArrowRight, Ban, ClipboardList, FileText, Rocket } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SectionTitle } from '@/components/civic/ui-bits'
import { ARTEFACTS, MIGRATIONS, NON_GOALS, PHASES, REVIEW_ORDER, ROADMAP_CTA } from './content'
import { Chip, Mono, Panel, PanelHead } from './primitives'

function PhaseCards() {
  return (
    <section aria-label="Deployment phases">
      <div className="grid gap-4 md:grid-cols-2">
        {PHASES.map((p) => (
          <article key={p.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
                  {p.id}
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900">{p.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{p.summary}</p>
                </div>
              </div>
              <Chip tone={p.statusTone} className="shrink-0">
                {p.status}
              </Chip>
            </div>
            <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
              {p.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

function NonGoals() {
  return (
    <Panel className="border-slate-300">
      <PanelHead
        icon={Ban}
        title="Explicit non-goals & guardrails"
        desc="What this prototype deliberately does not do — the boundaries that make everything above honest."
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {NON_GOALS.map((g) => (
          <li key={g.title} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600">
              <g.icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{g.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{g.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function MigrationTable() {
  return (
    <Panel>
      <PanelHead icon={ArrowRight} title="Technology migration path" desc="Prototype stack → production stack, and why each move is needed." />
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[28%]">From (prototype)</TableHead>
              <TableHead className="w-[28%]">To (production)</TableHead>
              <TableHead className="whitespace-normal">Why</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MIGRATIONS.map((m) => (
              <TableRow key={m.from}>
                <TableCell className="align-top">
                  <Mono>{m.from}</Mono>
                </TableCell>
                <TableCell className="align-top">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <ArrowRight className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                    {m.to}
                  </span>
                </TableCell>
                <TableCell className="whitespace-normal align-top text-xs leading-relaxed text-slate-500">{m.why}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

function NextSteps() {
  return (
    <Panel className="p-6">
      <PanelHead
        icon={Rocket}
        title="Contact & next steps for a government evaluator"
        desc="A suggested path through the platform, and the artefacts to request alongside it."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Suggested review order</p>
          <ol className="mt-3 space-y-3">
            {REVIEW_ORDER.map((s, i) => (
              <li key={s.title} className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Artefacts to request</p>
          <ul className="mt-3 space-y-3">
            {ARTEFACTS.map((a) => (
              <li key={a.name} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-teal-700 shadow-sm">
                  <a.icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{a.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-lg border border-teal-100 bg-teal-50/60 p-3">
        <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
        <p className="text-xs leading-relaxed text-teal-900">{ROADMAP_CTA}</p>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
        <FileText className="h-3 w-3" aria-hidden />
        Trust, Data Governance &amp; Deployment portal · Civic Lenz prototype documentation
      </p>
    </Panel>
  )
}

export default function RoadmapTab() {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Rocket}
        title="Deployment roadmap"
        subtitle="From this prototype to a handover-ready system — in four phases, with the guardrails written down."
      />
      <PhaseCards />
      <NonGoals />
      <MigrationTable />
      <NextSteps />
    </div>
  )
}
