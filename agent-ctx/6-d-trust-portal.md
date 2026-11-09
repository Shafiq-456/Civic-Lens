# Task 6-d — Trust, Data Governance & Deployment portal (work record)

## Status: COMPLETE

## Files created (all inside `src/components/civic/trust/`)
- `TrustPortal.tsx` — default export `TrustPortal()` (no props). shadcn Tabs, `defaultValue="architecture"`, 5 tabs (Platform Architecture / Data Governance / Map Accuracy / Security Assessment / Deployment Roadmap) with icons, horizontally scrollable tab list on mobile, overview StatCard row (3 portals, 4 geo layers, 8 security controls, 4 phases).
- `content.ts` — strictly typed static copy for all 5 tabs (`Tone` type, PRODUCTS, STACK, DATA_FLOWS, SCOPE_STATEMENT, REQUIRED_FIELDS, LIFECYCLE_STATES, VERIFICATION_WORKFLOW, QUALITY_RULES, DATASETS, LIMITATIONS, BOUNDARY_REQUIREMENTS, SECURITY_CONTROLS, PROTOTYPE_CONTROLS, DEMO_CREDENTIALS, AUTH_REPLACEMENT, PHASES, NON_GOALS, MIGRATIONS, REVIEW_ORDER, ARTEFACTS).
- `primitives.tsx` — shared bits: `Panel` (rounded-xl border slate-200 bg-white shadow-sm p-4), `AmberPanel` (role=note), `PanelHead`, `Chip`, `Mono`, `CheckItem`, `NumberedStep`, `ScrollBox` (max-h-96 overflow-y-auto + styled scrollbar), `MarkerBadge`, `AmberHead`.
- `ArchitectureTab.tsx` — teal hero (p-6) with 4 product cards (3 portals + supporting Trust & Docs card, dashed border); architecture summary (Next.js 16 + TS, Tailwind/shadcn, REST routes, Prisma SQLite→PostgreSQL, in-memory→managed cache, NextAuth planned, server-side audit log); 3 actor data-flow chains with ArrowRight chips; amber scope statement (exact required quote).
- `GovernanceTab.tsx` — core-principle card + staleness trigger chips; required-fields spec table (8 rows, field/purpose/where-in-UI) in scroll box; 4 lifecycle cards (CURRENT/FORMER/VACANT/PENDING_VERIFICATION) using `GenericChip` tones; 5-step numbered verification workflow with 30-day cadence + VerificationLog/AuditLog note; 4 data-quality rules with authority chips (ECI, TN Legislative Assembly, TN Secretariat gazettes, Raj Bhavan).
- `MapAccuracyTab.tsx` — accuracy-over-appearance principle + separate admin vs electoral layer mini-cards; dataset inventory table with EXACT values (india-states.geojson 36 states/UTs `st_nm` udit-001/india-maps-data; tamil-nadu-districts.geojson 37 districts `district`; tamil-nadu-ac.geojson 234 ACs `AC_NAME`/`AC_NO`/`PC_NAME`/`PC_NO` datameet 2008 delimitation; tamil-nadu-pc.geojson 39 PCs `pc_name`/`pc_no` ECI 2019); prominent amber known-limitations card (a Mayiladuthurai missing/merged in Nagapattinam, b delimitation-era ACs, c naming variants→LGD codes, d districts≠constituencies); 4-item production boundary requirements checklist.
- `SecurityTab.tsx` — amber framing alert (“A secure-looking login screen is not evidence of a secure application.”, 8 required / 0 complete); 8 checklist cards (threat modelling, role & permission testing, API security, vuln scanning, pentest, backup & DR, privacy & retention, audit trail integrity) each with icon + covers + why + “Required before handover” chip; honest prototype-controls table (5 rows, “Prototype-level” chips + production gap); demo-credentials disclosure card (admin/Admin@123, officer/Officer@123, auditor/Auditor@123 in mono table) + replacement requirements (NextAuth v4, hashing, MFA, sessions, rate limiting).
- `RoadmapTab.tsx` — 4 phase cards (1 Prototype=Complete/green, 2 Authorised pilot=Requires authorisation/amber, 3 Production hardening=Planned/teal, 4 Handover=Planned/slate) with item lists; explicit non-goals card (4 Ban items); tech migration table (SQLite→PostgreSQL, in-memory→managed cache, demo auth→NextAuth, local logs→centralised audit store, single-node→HA government cloud MeghRaj-aligned); evaluator next-steps card (review order + artefacts to request).

## Reused shared components
- `@/components/civic/ui-bits`: SectionTitle, StatCard. `@/components/civic/VerificationBadge`: GenericChip. shadcn: Tabs, Table, Badge. No new packages, no API routes, no images.

## Verification
- `bunx tsc --noEmit`: 0 errors in trust/ (fixed one: added `icon: LucideIcon` to `Artefact`).
- `bun run lint`: 0 errors in trust/. Remaining repo errors are NOT mine: `src/app/page.tsx` and `src/lib/civic/api.ts` (react-hooks/set-state-in-effect — other agents' files, left untouched per instructions).

## Caveats for next agents
- `src/app/page.tsx` currently fails to compile because `InfoPortal`/`AccountabilityPortal`/`AdminPortal` do not exist yet (parallel tasks). `TrustPortal` itself resolves and is wired as the `trust` case.
- Dev server log confirms only the missing sibling portals error; no errors reference `components/civic/trust/`.
