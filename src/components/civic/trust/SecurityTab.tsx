'use client'

// Tab 4 — Security Assessment: an independent, pre-handover checklist. This tab
// deliberately reports the gap, not compliance — every control is REQUIRED and none
// is complete in the prototype.

import { KeyRound, Quote, ShieldAlert, ShieldQuestion, UserRoundX } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SectionTitle } from '@/components/civic/ui-bits'
import {
  AUTH_REPLACEMENT,
  CREDENTIALS_NOTE,
  DEMO_CREDENTIALS,
  PROTOTYPE_CONTROLS,
  SECURITY_CONTROLS,
  SECURITY_FRAMING_BODY,
  SECURITY_FRAMING_QUOTE,
} from './content'
import { AmberHead, AmberPanel, Chip, Mono, Panel, PanelHead } from './primitives'

function FramingAlert() {
  return (
    <AmberPanel className="p-5">
      <AmberHead title="Independent assessment required before handover" />
      <figure className="mt-2 border-l-2 border-amber-400 pl-3">
        <Quote className="h-3.5 w-3.5 text-amber-500" aria-hidden />
        <blockquote className="mt-1 text-base font-semibold leading-snug text-amber-950">
          “{SECURITY_FRAMING_QUOTE}”
        </blockquote>
      </figure>
      <p className="mt-3 text-sm leading-relaxed text-amber-900">{SECURITY_FRAMING_BODY}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip tone="red">8 controls required</Chip>
        <Chip tone="amber">0 completed by this prototype</Chip>
        <Chip tone="slate">Scope: all portals + APIs</Chip>
      </div>
    </AmberPanel>
  )
}

function ControlChecklist() {
  return (
    <section aria-label="Required security controls">
      <div className="grid gap-4 md:grid-cols-2">
        {SECURITY_CONTROLS.map((c, i) => (
          <article key={c.title} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <c.icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                    <span className="mr-1.5 text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                    {c.title}
                  </h3>
                </div>
              </div>
              <Chip tone="amber" className="shrink-0">
                Required before handover
              </Chip>
            </div>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">What it covers</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-slate-600">{c.covers}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Why it matters</dt>
                <dd className="mt-0.5 text-xs italic leading-relaxed text-slate-500">{c.matters}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

function PrototypeControls() {
  return (
    <Panel>
      <PanelHead
        icon={ShieldQuestion}
        title="Current prototype controls — an honest inventory"
        desc="What exists today, and the specific gap between it and a production-grade control."
      />
      <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[38%]">Control present in prototype</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="whitespace-normal">What production must add</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PROTOTYPE_CONTROLS.map((c) => (
              <TableRow key={c.control}>
                <TableCell className="whitespace-normal align-top text-xs font-medium leading-relaxed text-slate-800">
                  {c.control}
                </TableCell>
                <TableCell className="align-top">
                  <Chip tone="amber">Prototype-level</Chip>
                </TableCell>
                <TableCell className="whitespace-normal align-top text-xs leading-relaxed text-slate-500">{c.productionGap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

function DemoCredentials() {
  return (
    <Panel className="border-rose-200">
      <PanelHead
        icon={UserRoundX}
        title="Demo credentials — disclosed by design"
        desc="Printed here on purpose; their existence is the finding."
        right={<Chip tone="red">Demo only</Chip>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Role</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_CREDENTIALS.map((c) => (
                <TableRow key={c.username}>
                  <TableCell className="whitespace-normal align-top">
                    <span className="text-xs font-semibold text-slate-800">{c.role}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{c.scope}</span>
                  </TableCell>
                  <TableCell className="align-top">
                    <Mono>{c.username}</Mono>
                  </TableCell>
                  <TableCell className="align-top">
                    <Mono>{c.password}</Mono>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <p className="text-xs leading-relaxed text-slate-600">{CREDENTIALS_NOTE}</p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <KeyRound className="h-3.5 w-3.5 text-teal-700" aria-hidden />
            Replacement requirements
          </p>
          <ul className="mt-2 space-y-1.5">
            {AUTH_REPLACEMENT.map((r) => (
              <li key={r} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-600" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">
            Plaintext passwords in the database are demonstration scaffolding. Production replaces this wholesale with
            NextAuth.js v4 — not incrementally on top of it.
          </p>
        </div>
      </div>
    </Panel>
  )
}

export default function SecurityTab() {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={ShieldAlert}
        title="Security assessment — independent, pre-handover"
        subtitle="What must be true before any government handover, and an honest account of what the prototype does and does not do."
      />
      <FramingAlert />
      <ControlChecklist />
      <PrototypeControls />
      <DemoCredentials />
    </div>
  )
}
