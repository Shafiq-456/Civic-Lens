import { Landmark } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-2.5">
            <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-teal-600/30 shadow-sm ring-1 ring-amber-400/40">
              <img
                src="/civic-lenz-logo.jpg"
                alt="Civic Lenz emblem"
                className="h-full w-full object-cover"
              />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Civic Lenz</p>
              <p className="max-w-xl text-xs leading-relaxed text-slate-500">
                Three connected products in one platform: Government Information Portal · Public Accountability Portal ·
                Government Administration Portal.
              </p>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-slate-500 md:text-right">
            <p>
              <strong className="font-medium text-slate-600">Prototype disclaimer:</strong> political records were verified against official sources on 5 Nov 2026 (2026 TN election, government formation, ministry, by-elections), but this remains a prototype — authorised official feeds, security assessment and government approval are required before any production or government use.
            </p>
            <p className="mt-1">
              Boundary datasets: open census/delimitation-based GeoJSON (india-maps-data, datameet) — India states/UTs, TN districts,
              234 ACs, 39 PCs.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
