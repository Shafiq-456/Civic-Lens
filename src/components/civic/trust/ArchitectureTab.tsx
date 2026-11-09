'use client'

// Tab 1 — Platform Architecture: the three connected products, the shared stack,
// the data flows between actors and the platform, and the explicit scope statement.

import { ArrowRight, Quote, Route, Server, ShieldAlert, Workflow } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SectionTitle } from '@/components/civic/ui-bits'
import { DATA_FLOWS, PRODUCTS, SCOPE_STATEMENT, STACK } from './content'
import SyncStatusPanel from './SyncStatusPanel'
import { AmberHead, AmberPanel, Chip, ICON_TONES, Panel, PanelHead } from './primitives'

function ProductCards() {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {PRODUCTS.map((p) => (
        <article
          key={p.id}
          className={`flex flex-col rounded-lg bg-white p-4 shadow-sm ${
            p.supporting ? 'border border-dashed border-teal-300' : 'border border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${ICON_TONES.teal}`}>
              <p.icon className="h-4.5 w-4.5" aria-hidden />
            </span>
            {p.supporting && <Chip tone="teal">This portal</Chip>}
          </div>
          <h3 className="mt-3 text-sm font-semibold leading-snug tracking-tight text-slate-900">{p.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{p.role}</p>
          <Chip tone="slate" className="mt-3 w-fit">
            {p.audience}
          </Chip>
          <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="h-1 w-1 shrink-0 rounded-full bg-teal-600" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

function ArchitectureHero() {
  return (
    <section aria-labelledby="trust-arch-hero" className="rounded-xl bg-teal-700 p-6 text-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border border-white/20 bg-white/10 text-white">One platform · Four surfaces</Badge>
        <Badge className="border border-white/20 bg-white/10 text-white">Shared database · Shared audit trail</Badge>
      </div>
      <h2 id="trust-arch-hero" className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
        Civic Lenz — one platform, three connected products
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-teal-50">
        Civic Lenz is a single Next.js application that presents three connected portals, supported by this
        documentation portal. All surfaces share one database, one REST API layer and one audit trail — so a fact
        verified once is trustworthy everywhere it appears.
      </p>
      <ProductCards />
    </section>
  )
}

function StackSummary() {
  return (
    <Panel>
      <PanelHead icon={Server} title="Architecture summary" desc="What the platform is built on, and what changes between prototype and production." />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {STACK.map((s) => (
          <li key={s.label} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-teal-700 shadow-sm">
              <s.icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span>
              <span className="block text-xs font-semibold text-slate-800">{s.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{s.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function DataFlows() {
  return (
    <Panel>
      <PanelHead icon={Route} title="Data flows" desc="Who touches the platform, through which surface, and what gets recorded on the way." />
      <ol className="space-y-4">
        {DATA_FLOWS.map((flow) => (
          <li key={flow.actor} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip tone={flow.tone}>{flow.actor}</Chip>
              {flow.steps.map((step, i) => (
                <span key={step} className="flex items-center gap-1.5">
                  {i > 0 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />}
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                    {step}
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{flow.note}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-teal-100 bg-teal-50/60 p-3">
        <Workflow className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
        <p className="text-xs leading-relaxed text-teal-900">
          The audit log is written <strong>server-side</strong> on every mutation: the client can read accountability,
          never bypass it.
        </p>
      </div>
    </Panel>
  )
}

function ScopeStatement() {
  return (
    <AmberPanel className="p-4 sm:p-5">
      <AmberHead title="Scope statement — read this before evaluating the platform" />
      <figure className="mt-2 border-l-2 border-amber-300 pl-3">
        <Quote className="h-3.5 w-3.5 text-amber-500" aria-hidden />
        <blockquote className="mt-1 text-sm leading-relaxed text-amber-900">{SCOPE_STATEMENT}</blockquote>
      </figure>
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-amber-800">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Every other tab in this portal describes work done inside that boundary.
      </p>
    </AmberPanel>
  )
}

export default function ArchitectureTab() {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Server}
        title="Platform architecture"
        subtitle="Three connected products on one stack — and one supporting portal that documents all of them."
      />
      <ArchitectureHero />
      <StackSummary />
      <SyncStatusPanel />
      <DataFlows />
      <ScopeStatement />
    </div>
  )
}
