# 🏛️ Civic Lenz — Open Government & Public Accountability Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![AI-Powered](https://img.shields.io/badge/Markus%20AI-Groq%20%2F%20Llama%203-FF6F00?style=flat)](https://groq.com/)

> **Civic Lenz** is an open-government transparency and accountability platform designed for India, with an intensive focus on Tamil Nadu. Built on a "verification-first" paradigm, every official profile, government scheme, infrastructure project, and budget allocation is tracked with verifiable sources, effective dates, and immutable audit logs.

---

## 🌟 Core Pillars & Portals

The application is structured into six comprehensive public-facing and administrative portals, unified by **Markus**, an intelligent grounded AI assistant:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CIVIC LENZ                                       │
├───────────────────┬────────────────────┬──────────────────┬─────────────┬──────────────┤
│ 1. Information    │ 2. Accountability  │ 3. Updates (New) │ 4. Admin    │ 5. Trust &   │
│    Portal         │    Portal          │    Portal        │    Portal   │    Docs      │
│                   │                    │                  │             │              │
│ • Geospatial Maps │ • File Grievance   │ • Scheme Alerts  │ • Roles     │ • Lineage    │
│ • Political Direct│ • Ticket Tracking  │ • Revised Terms  │ • Grievance │ • Audit Log  │
│ • 234 ACs / 39 PCs│ • Infra Projects   │ • G.O. Citations │ • Workflow  │ • Security   │
│ • Schemes & Depts │ • Financial Dash   │ • Eligibility    │ • Records   │ • Roadmap    │
├───────────────────┴────────────────────┴──────────────────┴─────────────┴──────────────┤
│                                6. NEWS Portal (New)                                    │
│   • Government of India (National) & Tamil Nadu Verified Gazette & Press Feed          │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            ▲
                                            │
                        ┌───────────────────┴───────────────────┐
                        │        🤖 Markus AI Assistant         │
                        │   Live Q&A Grounded in DB Snapshot    │
                        └───────────────────────────────────────┘
```

---

### 1. 🗺️ Government Information Portal
* **Interactive Choropleth Maps**: High-precision SVG maps rendered using D3 Geo projections:
  * **National Layer**: 36 States and Union Territories with MP representation.
  * **Tamil Nadu Administrative Layer**: 38 Revenue Districts with formation dates and headquarters.
  * **Tamil Nadu Electoral Layer**: All 234 Assembly Constituencies (ACs) and 39 Parliamentary Constituencies (PCs) matching Delimitation Commission / ECI numbering.
* **Political Leadership Directory**: Verified records of Executive, Legislative, and Departmental leaders (Governor, CM, Ministers, Speaker, LoP, MPs, MLAs) with verification badges, tenure dates, and official gazette citations.
* **Welfare Schemes Directory**: Central and State government schemes with target beneficiaries, eligibility rules, subsidy amounts, and application portals.
* **Announcements & Civic Calendar**: Categorized administrative orders, public notices, press releases, assembly sessions, and civic deadlines.

### 2. ⚖️ Public Accountability Portal
* **Citizen Grievance Filing**: Streamlined complaint submission generating cryptographic-style tracking tokens (`CL-YYYY-NNNNNN`).
* **Live Ticket Tracking**: Real-time status inspection (`SUBMITTED`, `ACKNOWLEDGED`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`, `REJECTED`) with official response logs.
* **Infrastructure Project Tracker**: Monitor public works across road, water, health, and urban infrastructure with progress milestones, contractor information, and sanctioned vs. utilized funds.
* **Financial Transparency Dashboards**: Interactive visualizations detailing district-wise and department-wise expenditure, budget variances, and resolution metrics.
* **Citizen Verification**: Community-driven crowd-verification workflow enabling citizens to report outdated leadership changes or inaccurate scheme data.

### 3. ✨ Government Scheme Updates Portal (NEW)
* **Real-Time Welfare Revisions**: Tracks live changes, stipend increases, and eligibility expansions across Tamil Nadu and Union Ministries.
* **Direct Comparison Engine**: "Previous Terms vs. Revised Terms" side-by-side audit view for every policy amendment.
* **Verifiable Orders (G.O.)**: Every update cites the exact Government Order number, signing department, and official gazette release date.
* **Target Demographics**: Filter updates by beneficiary group (women, students, farmers, senior citizens, entrepreneurs).

### 4. 🔐 Government Administration Portal
* **Role-Based Workflows**: Tailored portals for `ADMIN` (State/District level), `DEPT_OFFICER` (Zonal officers), and `AUDITOR` (Compliance).
* **Grievance Resolution Desk**: Officers can review, assign, update lifecycle states, and append formal resolution notes.
* **Data Verification Workbench**: Review incoming citizen corrections against official gazette orders before updating public records.
* **Audit & Monitoring Console**: Comprehensive tamper-evident audit logging recording every login, modification, and data export.

### 5. 🛡️ Trust, Governance & Security Portal
* **Data Lineage**: Explicit documentation of data sources (ECI, Open Government Data, Tamil Nadu Legislative Assembly, Survey of India).
* **Boundary Integrity Caveats**: Clear demarcation between administrative and electoral boundaries, documenting known legacy variances (e.g. Mayiladuthurai district formation).
* **Enterprise Security Checklist**: Complete status mapping across OWASP Top 10, role-based access control (RBAC), CSRF protection, and audit retention.
* **MeghRaj Cloud Roadmap**: Migration blueprint from local prototype to high-availability government cloud deployment.

### 6. 📰 Government News & Public Information Portal (NEW)
* **Dual Jurisdiction Feed**: Curated, verified updates from both **Government of Tamil Nadu** (State Cabinet, Legislative & Departmental) and **Government of India** (Union Ministries, PIB).
* **Breaking & Featured Carousel**: Highlights primary policy developments such as semiconductor incentives, port hubs, and expressway completions.
* **Official Source Attribution**: Direct links to primary gazette portals (`tn.gov.in`, `pib.gov.in`, `tnschools.gov.in`).
* **Interactive Article Reader**: Full briefing modal detailing policy scope, citizen impact, and departmental tags.

### 🤖 Markus AI Assistant
* **Grounded Intelligence**: Powered by Groq's high-throughput LLaMA models (`openai/gpt-oss-120b`), OpenAI, or Google Gemini.
* **Anti-Hallucination Pipeline**: Markus constructs responses strictly from a runtime database snapshot of verified platform records, refusing to fabricate political appointments or budget allocations.
* **Dynamic Query-Aware Context**: Intelligently matches user queries against the 234 Assembly Constituencies and 39 Parliamentary seats while staying within API rate limits.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16.4.5](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict typing, no `any`) |
| **UI & Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/) |
| **Geospatial** | [d3-geo](https://d3js.org/d3-geo) (Custom responsive TopoJSON / GeoJSON projection) |
| **Charts** | [Recharts](https://recharts.org/) & CSS Custom SVG Graphs |
| **Database** | [SQLite](https://www.sqlite.org/) (Local file-based, easily portable to PostgreSQL) |
| **ORM** | [Prisma ORM 6.19](https://www.prisma.io/) (Type-safe client, relations, and migrations) |
| **AI / LLM** | Groq API (`openai/gpt-oss-120b`), OpenAI, or Google Gemini via OpenAI-compatible route |
| **Validation** | [Zod](https://zod.dev/) (Runtime API request/response validation) |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher (v22+ recommended)
* **npm** or **bun**

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd workspace-43b497ba-89a1-4766-b2a7-d5b589fd0116
npm install
```

### 2. Configure Environment Variables
Create or verify your `.env` file in the project root:
```env
# Supabase Postgres — transaction pooler (runtime) and session pooler (schema pushes)
DATABASE_URL="postgresql://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

# AI Chatbot Configuration (Provide ANY of the following):
GROQ_API_KEY=gsk_your_groq_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Initialize Database & Generate Prisma Client
```bash
npm run db:prepare   # creates the tables in Supabase and seeds them if the database is empty
```

*(Note: the seed loads 234 assembly seats, 39 parliamentary seats, 38 districts, schemes, projects, and leadership records. `npm run build` runs the same step automatically on every deploy, and never re-seeds a database that already has data).*

### 4. Run Development Server
```bash
npx next dev --webpack -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demonstration Credentials

To explore the **Government Administration Portal**, use any of the pre-configured demonstration accounts:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | **ADMIN** | District Administrator (Full access, system audits) |
| `officer` | `Officer@123` | **DEPT_OFFICER** | Municipal Administration & Water Supply Officer |
| `auditor` | `Auditor@123` | **AUDITOR** | Independent Compliance & Verification Auditor |

---

## 📡 REST API Directory

Civic Lenz exposes a structured, RESTful JSON API secured with rate limiting and input validation:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/states` | `GET` | All 36 States/UTs with legislative seat counts |
| `/api/districts` | `GET` | 38 Tamil Nadu districts with demographic data |
| `/api/constituencies` | `GET` | 234 Assembly & 39 Parliamentary constituencies |
| `/api/records` | `GET` | Political leadership directory with filter parameters |
| `/api/records/[id]` | `GET` | Audit-grade verification history of an officeholder |
| `/api/departments` | `GET` | Government departments, ministers, and secretaries |
| `/api/schemes` | `GET` | Central and state public welfare schemes |
| `/api/updates` | `GET` | Recent scheme amendments, revisions & welfare notices |
| `/api/news` | `GET` | Verified Government of India & Tamil Nadu news feed |
| `/api/announcements` | `GET` | Administrative notices and gazette announcements |
| `/api/events` | `GET` | Legislative calendar, public holidays, and deadlines |
| `/api/projects` | `GET`, `POST` | Infrastructure projects registry and expenditure |
| `/api/projects/[code]` | `GET` | Milestone and budget breakdown for a project |
| `/api/complaints` | `GET`, `POST` | Public grievances and automated ticket generation |
| `/api/complaints/[ticketNo]` | `GET`, `PATCH`| Track grievance lifecycle or update status |
| `/api/markus` | `POST` | Grounded AI assistant chat completion |
| `/api/audit-logs` | `GET` | Immutable system event and login audit log |
| `/api/demo-auth` | `POST` | Prototype authentication for admin users |

---

## 📂 Project Directory Structure

```
├── db/
│   └── custom.db                 # SQLite database carrying verified demonstration dataset
├── prisma/
│   ├── schema.prisma             # 18 relational models with audit & verification fields
│   ├── seed.ts                   # Comprehensive data seeder
│   └── constituency-data.ts      # 234 AC and 39 PC geographic mappings
├── public/
│   └── geo/                      # D3 TopoJSON / GeoJSON boundary datasets
│       ├── india-states.geojson
│       ├── tamil-nadu-districts.geojson
│       ├── tamil-nadu-ac.geojson
│       └── tamil-nadu-pc.geojson
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # 20+ REST API Route Handlers
│   │   ├── globals.css           # Tailwind CSS v4 styling & color tokens
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Portal state switcher & root controller
│   ├── components/
│   │   ├── civic/
│   │   │   ├── Header.tsx        # Top navigation with portal switching
│   │   │   ├── Footer.tsx        # Footnotes, disclaimer, and official links
│   │   │   ├── GeoMap.tsx        # Responsive SVG map with D3 projection
│   │   │   ├── MarkusChat.tsx    # Floating Markus AI assistant widget
│   │   │   ├── info/             # Information portal tabs & views
│   │   │   ├── accountability/   # Grievances, projects, financials tabs
│   │   │   ├── admin/            # Role-gated management consoles
│   │   │   └── trust/            # Data governance, security, and roadmap
│   │   └── ui/                   # Reusable shadcn/ui primitives
│   └── lib/
│       ├── db.ts                 # Prisma Client singleton
│       ├── api-helpers.ts        # Audit logging, responses, and error handling
│       └── civic/
│           ├── markus-context.ts # Snapshot compiler for AI grounding
│           └── format.ts         # Indian currency (₹ Lakh/Cr), date formatters
├── .env                          # Local environment configuration
└── package.json                  # Dependencies & execution scripts
```

---

## 📄 License & Ethical Disclaimer

Civic Lenz is an open-source demonstration prototype. 
* All political, financial, and geographic figures displayed in the demonstration instance are curated for prototype evaluation.
* Production deployments must integrate with official state gazettes, verified ECI electoral feeds, and audited financial reporting feeds.
* Civic Lenz maintains strict non-partisan political neutrality and strictly adheres to Indian citizen privacy guidelines (all personal citizen contacts are masked).

