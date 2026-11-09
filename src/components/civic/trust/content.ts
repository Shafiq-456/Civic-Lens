// Static, strictly-typed copy for the Trust, Data Governance & Deployment portal.
// Everything here is documentation: no runtime fetching, no derived state.

import type { LucideIcon } from 'lucide-react'
import {
  Ban,
  Building2,
  ClipboardCheck,
  CloudCog,
  Crosshair,
  Database,
  DatabaseBackup,
  Fingerprint,
  FlaskConical,
  GraduationCap,
  Handshake,
  KeyRound,
  Landmark,
  Layers,
  Lock,
  Network,
  Palette,
  Scale,
  ScanLine,
  ScrollText,
  ShieldCheck,
  Swords,
  Wrench,
  Zap,
} from 'lucide-react'

/** Tone vocabulary shared by all chips in this portal (matches TONE_CLASS keys in lib/civic/format). */
export type Tone = 'green' | 'amber' | 'red' | 'slate' | 'teal'

/* ------------------------------------------------------------------ */
/* Tab 1 · Platform Architecture                                       */
/* ------------------------------------------------------------------ */

export interface ProductCard {
  id: string
  icon: LucideIcon
  name: string
  role: string
  audience: string
  features: string[]
  /** Supporting cards (this portal) are rendered with a distinct treatment. */
  supporting?: boolean
}

export const PRODUCTS: ProductCard[] = [
  {
    id: 'info',
    icon: Landmark,
    name: 'Government Information Portal',
    role: 'The read-oriented public face of government data.',
    audience: 'For citizens, media & researchers',
    features: ['Interactive maps', 'Political leadership directory', 'Announcements', 'Civic calendar', 'Schemes', 'Departments'],
  },
  {
    id: 'accountability',
    icon: Scale,
    name: 'Public Accountability Portal',
    role: 'Where citizens raise issues and track how public money is spent.',
    audience: 'For citizens',
    features: ['Complaints', 'Projects', 'Citizen verification', 'Project history', 'Financial transparency'],
  },
  {
    id: 'admin',
    icon: Building2,
    name: 'Government Administration Portal',
    role: 'The working surface for officers, administrators and verifiers.',
    audience: 'For officers & authorised staff',
    features: ['Department workflows', 'Representative monitoring', 'Authorised data management', 'Audit trails', 'Reporting'],
  },
  {
    id: 'trust',
    icon: ShieldCheck,
    name: 'Trust & Docs — this portal',
    role: 'The governance, security and deployment dossier for evaluators.',
    audience: 'For evaluators & auditors',
    features: ['Data governance', 'Map accuracy dossier', 'Security assessment', 'Deployment roadmap'],
    supporting: true,
  },
]

export interface StackItem {
  icon: LucideIcon
  label: string
  detail: string
}

export const STACK: StackItem[] = [
  {
    icon: Layers,
    label: 'Next.js 16 (App Router) + TypeScript',
    detail: 'One codebase, strict types across UI, API routes and data access.',
  },
  {
    icon: Palette,
    label: 'Tailwind CSS 4 + shadcn/ui (New York)',
    detail: 'Consistent, accessible components with lucide-react icons.',
  },
  {
    icon: Network,
    label: 'REST API routes',
    detail: 'App Router route handlers; every mutation is validated and audited server-side.',
  },
  {
    icon: Database,
    label: 'Prisma ORM — SQLite (prototype) → PostgreSQL (production)',
    detail: 'Typed schema and migrations; the prototype ships seeded demonstration data.',
  },
  {
    icon: Zap,
    label: 'Local-memory cache (prototype) → managed cache (production)',
    detail: 'The prototype caches in-process; production moves to a managed cache service.',
  },
  {
    icon: Lock,
    label: 'NextAuth.js planned for production auth',
    detail: 'The prototype ships demo credentials only; production adds sessions, hashing and MFA.',
  },
  {
    icon: ScrollText,
    label: 'Audit logging on every mutation',
    detail: 'Written server-side, so the client cannot bypass or edit the trail.',
  },
]

export interface DataFlow {
  actor: string
  tone: Tone
  steps: string[]
  note: string
}

export const DATA_FLOWS: DataFlow[] = [
  {
    actor: 'Citizen',
    tone: 'teal',
    steps: ['Public Accountability Portal', 'REST API', 'Database (+ audit log)'],
    note: 'Complaints and verification submissions are written with a server-side audit entry.',
  },
  {
    actor: 'Officer / Admin',
    tone: 'amber',
    steps: ['Government Administration Portal', 'REST API (+ audit log)', 'Verification logs'],
    note: 'Workflow actions and authorised data management are recorded as they happen.',
  },
  {
    actor: 'Verifier role',
    tone: 'green',
    steps: ['Cited official sources', 'Political records reconciliation'],
    note: 'Verifiers cross-check sources and set last-verified timestamps on political records.',
  },
]

export const SCOPE_STATEMENT =
  'This is a working prototype with demonstration data. No unauthorised government deployment is attempted. ' +
  'Official integrations, production citizen records, government hosting and political data feeds require appropriate authorisation.'

/* ------------------------------------------------------------------ */
/* Tab 2 · Data Governance (political records lifecycle)               */
/* ------------------------------------------------------------------ */

export const GOVERNANCE_PRINCIPLE =
  'Political information must be maintained continuously. Maps and directories go stale quickly: they drift out of ' +
  'date after every election, cabinet reshuffle, resignation and by-election. Civic Lenz therefore treats every ' +
  'political record as a living fact and attaches verification metadata to each one.'

export const STALENESS_TRIGGERS: string[] = ['Elections', 'Cabinet reshuffles', 'Resignations', 'By-elections']

export interface SpecField {
  field: string
  purpose: string
  ui: string
}

export const REQUIRED_FIELDS: SpecField[] = [
  {
    field: 'Name and designation',
    purpose: 'Identifies the officeholder and the office held.',
    ui: 'Political directory cards; leadership sections',
  },
  {
    field: 'Constituency or department',
    purpose: 'Ties the record to an electoral seat or an administrative department.',
    ui: 'Record detail header; directory filters',
  },
  {
    field: 'Official source (URL + source name)',
    purpose: 'Proves the claim traces back to an authoritative publication.',
    ui: 'Citation line on every record',
  },
  {
    field: 'Effective date',
    purpose: 'The date from which the record is in force.',
    ui: 'Record timeline',
  },
  {
    field: 'End / period date (when applicable)',
    purpose: 'Closes a tenure so history is retained after reshuffles.',
    ui: 'Former-record and history views',
  },
  {
    field: 'Last verified date + verified by',
    purpose: 'Accountability for who checked the fact, and when.',
    ui: 'Verification badge; freshness chip',
  },
  {
    field: 'Lifecycle status',
    purpose: 'Drives UI grouping and staleness handling — Current / Former / Vacant / Pending verification.',
    ui: 'Status chips; directory tabs',
  },
  {
    field: 'Verification note',
    purpose: 'Explains the change, or the evidence behind a verification.',
    ui: 'Expandable note on record detail',
  },
]

export interface LifecycleState {
  status: string
  label: string
  tone: Tone
  meaning: string
  example: string
}

export const LIFECYCLE_STATES: LifecycleState[] = [
  {
    status: 'CURRENT',
    label: 'Current',
    tone: 'green',
    meaning: 'In office, verified.',
    example: 'Sitting ministers, the Speaker, serving MLAs.',
  },
  {
    status: 'FORMER',
    label: 'Former',
    tone: 'slate',
    meaning: 'End-dated tenure retained for history.',
    example: 'Reshuffled ministers, previous Chief Ministers.',
  },
  {
    status: 'VACANT',
    label: 'Vacant',
    tone: 'red',
    meaning: 'Seat vacancy tracked pending a by-election.',
    example: 'A constituency vacant on the demise of a sitting MLA.',
  },
  {
    status: 'PENDING_VERIFICATION',
    label: 'Pending verification',
    tone: 'amber',
    meaning: 'Reported change awaiting reconciliation with the official gazette.',
    example: 'A reported resignation not yet confirmed by an official source.',
  },
]

export interface WorkflowStep {
  title: string
  detail: string
}

export const VERIFICATION_WORKFLOW: WorkflowStep[] = [
  {
    title: 'Record created with a cited official source',
    detail: 'A record enters the directory only with an official source — URL and publication name.',
  },
  {
    title: 'Verifier cross-checks the source',
    detail: 'A verifier opens the cited source and cross-checks every field of the record.',
  },
  {
    title: 'Verified — last-verified timestamp set',
    detail: 'Verification stamps the record and starts a 30-day freshness cadence that flags stale entries.',
  },
  {
    title: 'Status changed with a note',
    detail: 'On elections, cabinet reshuffles or resignations the lifecycle status changes, always with a verification note.',
  },
  {
    title: 'Logged — VerificationLog + AuditLog',
    detail: 'Every action writes a VerificationLog entry plus a tamper-visible AuditLog entry.',
  },
]

export interface QualityRule {
  rule: string
  detail: string
  chips?: string[]
}

export const QUALITY_RULES: QualityRule[] = [
  {
    rule: 'No record without an official source',
    detail: 'A political record that cannot cite an authoritative publication does not enter the directory.',
  },
  {
    rule: 'Former records are never deleted',
    detail: 'End-dated tenures are retained, so the political history of the state remains reconstructable.',
  },
  {
    rule: 'Constituency and department stay distinct',
    detail: 'An MLA record carries a constituency; a ministerial or administrative record carries a department. The two are never conflated.',
  },
  {
    rule: 'Demonstration data must be reconciled before production',
    detail: 'Every prototype political record must be reconciled against the official sources below before any production use.',
    chips: ['ECI', 'TN Legislative Assembly', 'TN Secretariat gazettes', 'Raj Bhavan'],
  },
]

/* ------------------------------------------------------------------ */
/* Tab 3 · Map Accuracy                                                */
/* ------------------------------------------------------------------ */

export const MAP_PRINCIPLE =
  'Map accuracy over map appearance. The prototype uses real geographical datasets, not decorative drawings. ' +
  'Two kinds of boundaries exist — administrative district boundaries and electoral constituency boundaries — and ' +
  'they are separate layers in both the database and the UI. They must not be confused.'

export interface DatasetSpec {
  file: string
  coverage: string
  keys: string[]
  provenance: string
}

export const DATASETS: DatasetSpec[] = [
  {
    file: 'india-states.geojson',
    coverage: '36 states & UTs — current boundaries incl. Telangana, Ladakh, merged DNH-DD; J&K as a union territory.',
    keys: ['st_nm'],
    provenance: 'Open dataset (udit-001/india-maps-data) — census-vintage, dissolved from districts.',
  },
  {
    file: 'tamil-nadu-districts.geojson',
    coverage: '37 district polygons — includes the 2019–2020 reorganised districts: Chengalpattu, Ranipet, Tenkasi, Kallakurichi, Tirupathur.',
    keys: ['district'],
    provenance: 'Census-vintage open dataset.',
  },
  {
    file: 'tamil-nadu-ac.geojson',
    coverage: '234 assembly constituencies.',
    keys: ['AC_NAME', 'AC_NO', 'PC_NAME', 'PC_NO'],
    provenance: 'ECI delimitation-based (datameet) — delimitation-era 2008 boundaries; some shift vs current ground. PC fields give the parent Lok Sabha seat.',
  },
  {
    file: 'tamil-nadu-pc.geojson',
    coverage: '39 parliamentary constituencies.',
    keys: ['pc_name', 'pc_no'],
    provenance: 'ECI 2019-based open dataset (datameet) — pc_no follows ECI numbering 1–39.',
  },
]

export interface Limitation {
  marker: string
  title: string
  detail: string
}

export const LIMITATIONS: Limitation[] = [
  {
    marker: 'a',
    title: 'Mayiladuthurai is missing from open data',
    detail:
      'Mayiladuthurai district (created 28 Dec 2020) is absent from open datasets and remains merged inside the ' +
      'Nagapattinam polygon. Production requires Survey of India / TN government authorised boundaries.',
  },
  {
    marker: 'b',
    title: 'AC boundaries are delimitation-era',
    detail:
      'Delimitation-era assembly boundaries differ from current ground. Production must use Election Commission ' +
      'authorised delimitation data.',
  },
  {
    marker: 'c',
    title: 'Naming variants exist',
    detail:
      'Thiruvallur/Tiruvallur, Thoothukkudi/Thoothukudi and Mayiladuturai/Mayiladuthurai are handled by normalisation ' +
      'today, but production must pin every name to LGD master codes.',
  },
  {
    marker: 'd',
    title: 'Districts are not constituencies',
    detail:
      'A district contains multiple ACs, and ACs may cross district lines. The layers are kept separate in the UI — ' +
      'and must stay separate in any analysis.',
  },
]

export interface BoundaryRequirement {
  item: string
  detail: string
}

export const BOUNDARY_REQUIREMENTS: BoundaryRequirement[] = [
  {
    item: 'Election Commission delimitation order',
    detail: 'The reference document for electoral boundaries — assembly and parliamentary.',
  },
  {
    item: 'LGD (Local Government Directory) codes',
    detail: 'Master codes for administrative units, so names can never drift.',
  },
  {
    item: 'Survey of India basemap',
    detail: 'Authorised state and district basemap for production.',
  },
  {
    item: 'Versioned boundary snapshots',
    detail: 'Every boundary layer stored with an effective date, so historical maps can be reproduced faithfully.',
  },
]

/* ------------------------------------------------------------------ */
/* Tab 4 · Security Assessment                                         */
/* ------------------------------------------------------------------ */

export const SECURITY_FRAMING_QUOTE =
  'A secure-looking login screen is not evidence of a secure application.'

export const SECURITY_FRAMING_BODY =
  'Security requires independent assessment before any government handover. Every item below is REQUIRED. ' +
  'None of them is completed by this prototype — this tab is an honest statement of the gap, not a claim of compliance.'

export interface SecurityControl {
  icon: LucideIcon
  title: string
  covers: string
  matters: string
}

export const SECURITY_CONTROLS: SecurityControl[] = [
  {
    icon: Crosshair,
    title: 'Threat modelling',
    covers:
      'Per-portal asset and actor analysis (citizen, officer, admin, auditor, verifier); abuse cases such as complaint spam, record tampering and PII exposure.',
    matters: 'You cannot defend what you have not enumerated; modelling decides where scarce review effort goes.',
  },
  {
    icon: KeyRound,
    title: 'Role & permission testing',
    covers:
      'ADMIN / DEPT_OFFICER / AUDITOR / VERIFIER permission matrix, privilege-escalation tests, read-only enforcement for auditors.',
    matters: 'A single over-privileged route defeats every other control; escalation paths must be tested, not assumed.',
  },
  {
    icon: Network,
    title: 'API security testing',
    covers:
      'Authentication and authorisation on every route, input validation, rate limiting, IDOR on ticket numbers, mass-assignment protection.',
    matters: 'APIs are the only path to the data; every route is an attack surface with a citizen-facing front door.',
  },
  {
    icon: ScanLine,
    title: 'Vulnerability scanning',
    covers: 'Dependency CVE scanning (SBOM), static analysis, image/container scanning.',
    matters: 'Known vulnerabilities in dependencies are the cheapest attacks and the easiest fixes.',
  },
  {
    icon: Swords,
    title: 'Independent penetration testing',
    covers: 'Third-party testing by an authorised assessor; scope covers all portals and APIs; retest after fixes.',
    matters: 'An outside attacker sees what insiders rationalise away; independence is the point.',
  },
  {
    icon: DatabaseBackup,
    title: 'Backup & disaster recovery testing',
    covers: 'RPO/RTO targets, restore drills, database backup verification. The prototype SQLite file is not production-grade.',
    matters: 'An untested backup is a rumour; civic data must survive failure.',
  },
  {
    icon: Lock,
    title: 'Privacy & data retention review',
    covers:
      'Data minimisation (masked contact fields), PII inventory, retention schedule, RTI-compliance alignment, grievance-officer workflow.',
    matters: 'Citizens hand over data in order to complain; the state must hold it lawfully and let it go on schedule.',
  },
  {
    icon: Fingerprint,
    title: 'Audit trail integrity',
    covers: 'Tamper-evident logging (hash chaining / WORM storage), clock synchronisation, log retention.',
    matters: 'Audit logs are evidence; if they can be silently edited they protect no one.',
  },
]

export interface PrototypeControl {
  control: string
  productionGap: string
}

export const PROTOTYPE_CONTROLS: PrototypeControl[] = [
  {
    control: 'Server-side audit logging on mutations',
    productionGap: 'Tamper-evident storage (hash chaining / WORM) and centralised retention.',
  },
  {
    control: 'Masked citizen contact fields',
    productionGap: 'A formal data-minimisation and consent policy, with a maintained PII inventory.',
  },
  {
    control: 'Demo authentication — username and password in the database, PLAINTEXT (demo only)',
    productionGap: 'NextAuth.js v4 with hashed credentials, MFA and session management.',
  },
  {
    control: 'Read-only role flag for auditors',
    productionGap: 'A fully tested RBAC matrix (ADMIN / DEPT_OFFICER / AUDITOR / VERIFIER) with escalation tests.',
  },
  {
    control: 'No PII beyond names and masked references',
    productionGap: 'Retention schedule, RTI-compliance alignment and a grievance-officer workflow.',
  },
]

export interface DemoCredential {
  role: string
  username: string
  password: string
  scope: string
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'Administrator', username: 'admin', password: 'Admin@123', scope: 'Full administration access' },
  { role: 'Department officer', username: 'officer', password: 'Officer@123', scope: 'Department workflow access' },
  { role: 'Auditor', username: 'auditor', password: 'Auditor@123', scope: 'Read-only audit access' },
]

export const CREDENTIALS_NOTE =
  'These credentials are printed here deliberately. Hard-coded demonstration logins are not a design to harden — ' +
  'they are the evidence that authentication must be replaced wholesale before any real use.'

export const AUTH_REPLACEMENT: string[] = [
  'Replace demo auth with NextAuth.js v4',
  'Hash credentials (bcrypt or argon2) — never store plaintext',
  'MFA for privileged roles',
  'Server-side session management with expiry',
  'Rate limiting on authentication endpoints',
]

/* ------------------------------------------------------------------ */
/* Tab 5 · Deployment Roadmap                                          */
/* ------------------------------------------------------------------ */

export interface Phase {
  id: number
  icon: LucideIcon
  title: string
  summary: string
  status: string
  statusTone: Tone
  items: string[]
}

export const PHASES: Phase[] = [
  {
    id: 1,
    icon: FlaskConical,
    title: 'Prototype with demonstration data',
    summary: 'This application — built and running, with documented limitations and a full governance trail.',
    status: 'Complete',
    statusTone: 'green',
    items: [
      'Three portals plus this trust portal',
      'Real open geo datasets with documented limitations',
      'Demonstration political records with full verification metadata',
      'Server-side audit log on every mutation',
    ],
  },
  {
    id: 2,
    icon: Handshake,
    title: 'Authorised pilot',
    summary: 'A bounded pilot with a government authority — licensed data, accountable verification, real users.',
    status: 'Requires authorisation',
    statusTone: 'amber',
    items: [
      'Engage the appropriate government authority',
      'Licensed boundary data (ECI / Survey of India / LGD)',
      'Live verified political feed process with accountable verifiers',
      'UAT with department users',
    ],
  },
  {
    id: 3,
    icon: Wrench,
    title: 'Production hardening',
    summary: 'Infrastructure and assurance work that turns a pilot into a system a government can depend on.',
    status: 'Planned',
    statusTone: 'teal',
    items: [
      'PostgreSQL migration and managed cache',
      'NextAuth.js authentication',
      'Independent security assessment (Tab 4 checklist)',
      'Load testing, monitoring and alerting',
      'Backup and disaster-recovery drills',
    ],
  },
  {
    id: 4,
    icon: GraduationCap,
    title: 'Handover & operations',
    summary: 'Day-2 operations: the people, process and change control that keep data trustworthy after handover.',
    status: 'Planned',
    statusTone: 'slate',
    items: [
      'Training for department users and verifiers',
      'Runbooks and SLAs',
      'Data governance board',
      'Change-control for political data',
    ],
  },
]

export interface NonGoal {
  icon: LucideIcon
  title: string
  detail: string
}

export const NON_GOALS: NonGoal[] = [
  {
    icon: Ban,
    title: 'No unauthorised government deployment',
    detail: 'The prototype is not connected to any government system, and no deployment is attempted without authority.',
  },
  {
    icon: Ban,
    title: 'No production citizen records',
    detail: 'Every complaint, citizen account and contact detail in this prototype is demonstration data.',
  },
  {
    icon: Ban,
    title: 'No scraping of personal data',
    detail: 'No personal data is collected from social media or any private source.',
  },
  {
    icon: Ban,
    title: 'Authorised political feeds only',
    detail: 'Political data enters only from authorised sources, each with an authorisation trail.',
  },
]

export interface MigrationRow {
  from: string
  to: string
  why: string
}

export const MIGRATIONS: MigrationRow[] = [
  { from: 'SQLite', to: 'PostgreSQL', why: 'Concurrent access, real backups and production-grade reliability.' },
  { from: 'In-memory cache', to: 'Managed cache', why: 'Cache that survives restarts and scales beyond a single process.' },
  { from: 'Demo auth', to: 'NextAuth.js', why: 'Hashed credentials, sessions and MFA for privileged roles.' },
  { from: 'Local logs', to: 'Centralised audit store', why: 'Tamper-evident, searchable and retained under a schedule.' },
  { from: 'Single-node', to: 'HA hosting in government cloud', why: 'MeghRaj-aligned, subject to authority approval.' },
]

export interface ReviewStep {
  title: string
  detail: string
}

export const REVIEW_ORDER: ReviewStep[] = [
  {
    title: 'Start here — the Trust portal',
    detail: 'Governance, map accuracy, security posture and deployment plan, all in one place.',
  },
  {
    title: 'Government Information Portal',
    detail: 'Maps and the political directory, with verification metadata on every record.',
  },
  {
    title: 'Public Accountability Portal',
    detail: 'Complaints, projects and financial transparency, from the citizen view.',
  },
  {
    title: 'Government Administration Portal',
    detail: 'Officer workflows, authorised data management and the audit trail.',
  },
]

export interface Artefact {
  name: string
  detail: string
  icon: LucideIcon
}

export const ARTEFACTS: Artefact[] = [
  { name: 'Database schema', detail: 'The Prisma schema — every table, relation and index.', icon: Database },
  { name: 'API contract', detail: 'Route inventory with methods, role requirements and validation rules.', icon: ClipboardCheck },
  { name: 'Audit samples', detail: 'Exported AuditLog and VerificationLog entries for independent review.', icon: ScrollText },
  { name: 'Boundary dataset provenance', detail: 'Source, vintage and licence for every geojson layer in the map.', icon: CloudCog },
]

export const ROADMAP_CTA =
  'The artefacts are ready to walk through with any authorised evaluator; nothing in this platform is deployed ' +
  'beyond this prototype without a documented authorisation trail.'
