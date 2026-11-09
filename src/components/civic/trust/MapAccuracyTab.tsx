'use client'

// Tab 3 — Map Accuracy: which real datasets the maps are built from, what they get
// right, where they fall short of current ground, and what production must procure.

import { Layers, MapPinned, SquareCheck, TriangleAlert } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SectionTitle } from '@/components/civic/ui-bits'
import { BOUNDARY_REQUIREMENTS, DATASETS, LIMITATIONS, MAP_PRINCIPLE } from './content'
import { AmberHead, AmberPanel, MarkerBadge, Mono, Panel, PanelHead } from './primitives'

const AMBER_SCROLLBAR =
  '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-amber-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-300'

function PrincipleCard() {
  return (
    <Panel>
      <PanelHead
        icon={MapPinned}
        title="Principle — accuracy over appearance"
        desc="A pretty map that lies is worse than an honest map with documented limits."
      />
      <p className="text-sm leading-relaxed text-slate-700">{MAP_PRINCIPLE}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Layers className="h-3.5 w-3.5 text-teal-700" aria-hidden />
            Administrative layer
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            District boundaries — how the state organises its administration.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Layers className="h-3.5 w-3.5 text-teal-700" aria-hidden />
            Electoral layers
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Assembly constituencies (234) and parliamentary constituencies (39) — how elections are contested.
          </p>
        </div>
      </div>
    </Panel>
  )
}

function DatasetInventory() {
  return (
    <Panel>
      <PanelHead
        icon={MapPinned}
        title="Dataset inventory"
        desc="Exact real values — every layer loaded by the map, with its property keys and provenance."
      />
      <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Dataset</TableHead>
              <TableHead className="whitespace-normal">Coverage</TableHead>
              <TableHead>Property key(s)</TableHead>
              <TableHead className="whitespace-normal">Provenance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DATASETS.map((d) => (
              <TableRow key={d.file}>
                <TableCell className="align-top">
                  <Mono>{d.file}</Mono>
                </TableCell>
                <TableCell className="whitespace-normal align-top text-xs leading-relaxed text-slate-700">{d.coverage}</TableCell>
                <TableCell className="align-top">
                  <span className="flex flex-wrap gap-1">
                    {d.keys.map((k) => (
                      <Mono key={k}>{k}</Mono>
                    ))}
                  </span>
                </TableCell>
                <TableCell className="whitespace-normal align-top text-xs leading-relaxed text-slate-500">{d.provenance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

function KnownLimitations() {
  return (
    <AmberPanel className="border-amber-400 p-4 sm:p-5">
      <AmberHead title="Known limitations — read before relying on the map" />
      <p className="mt-1 text-xs leading-relaxed text-amber-800">
        The prototype is honest about where open boundary data falls short of current ground. Four issues matter:
      </p>
      <ul className={`mt-3 max-h-96 space-y-3 overflow-y-auto pr-1 ${AMBER_SCROLLBAR}`}>
        {LIMITATIONS.map((l) => (
          <li key={l.marker} className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-white/80 p-3">
            <MarkerBadge marker={l.marker} />
            <div>
              <p className="text-sm font-semibold text-slate-800">{l.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{l.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-amber-900">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        None of these is a defect of the map rendering — they are limits of the underlying open data, and each has a
        named production remedy.
      </p>
    </AmberPanel>
  )
}

function ProductionRequirements() {
  return (
    <Panel>
      <PanelHead
        icon={SquareCheck}
        title="Production boundary data requirements"
        desc="The checklist for replacing open datasets with authorised data."
      />
      <ol className="space-y-3">
        {BOUNDARY_REQUIREMENTS.map((r, i) => (
          <li key={r.item} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-700 text-[11px] font-bold text-white">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.item}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{r.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

export default function MapAccuracyTab() {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={MapPinned}
        title="Map accuracy"
        subtitle="What the maps are drawn from, what the data gets right, where it falls short — and what production must procure."
      />
      <PrincipleCard />
      <DatasetInventory />
      <KnownLimitations />
      <ProductionRequirements />
    </div>
  )
}
