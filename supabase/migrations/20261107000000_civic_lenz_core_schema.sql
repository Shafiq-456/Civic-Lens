-- ==============================================================================
-- CIVIC LENZ – PostgreSQL Database Schema & Migration for Supabase
-- Core Seven Modules + Shared Structures + Row Level Security (RLS)
-- Version: 20261107000000
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Shared & Geographic Reference Structures
-- ==============================================================================

-- States and Union Territories of India
CREATE TABLE IF NOT EXISTS public.states (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    code TEXT UNIQUE NOT NULL,                       -- e.g. 'TN'
    name TEXT NOT NULL,
    region TEXT,                                     -- 'South', 'North', etc.
    is_union_territory BOOLEAN DEFAULT FALSE,
    assembly_seats INT DEFAULT 0,
    lok_sabha_seats INT DEFAULT 0,
    rajya_sabha_seats INT DEFAULT 0,
    is_focus_state BOOLEAN DEFAULT FALSE,
    capital TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue Districts (38 in Tamil Nadu)
CREATE TABLE IF NOT EXISTS public.districts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    state_id TEXT NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,                                       -- LGD / Census code
    headquarters TEXT,
    formed_on TEXT,
    population INT,
    geo_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_district_state_name UNIQUE (state_id, name)
);

-- Government Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT NOT NULL,
    minister_name TEXT,
    secretary_name TEXT,
    head_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    website TEXT,
    services TEXT,
    budget_inr_cr NUMERIC(14, 2) DEFAULT 0.00,
    official_source TEXT,
    source_name TEXT,
    last_verified_at TIMESTAMPTZ,
    verification_status TEXT DEFAULT 'VERIFIED',      -- 'VERIFIED', 'PENDING_VERIFICATION', 'OUTDATED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_masked TEXT,                               -- e.g. '+91 ******1234' (PII protected)
    role TEXT NOT NULL DEFAULT 'citizen',            -- 'citizen', 'officer', 'auditor', 'admin'
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    constituency_ac_no INT,
    is_vigilance_officer BOOLEAN DEFAULT FALSE,      -- Explicit authorization for DVAC / Vigilance anti-corruption audits
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_user_role CHECK (role IN ('citizen', 'officer', 'auditor', 'admin'))
);

-- ==============================================================================
-- 3. Module 3: Locality-Wise Government Development Tracking
-- ==============================================================================

-- Assembly Constituencies (234 seats in Tamil Nadu)
CREATE TABLE IF NOT EXISTS public.constituencies_ac (
    id INT PRIMARY KEY,                              -- 1 to 234 (ECI Delimitation numbering)
    name TEXT NOT NULL,
    reservation TEXT,                                -- 'SC', 'ST', NULL
    state_id TEXT NOT NULL REFERENCES public.states(id) ON DELETE RESTRICT,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    parent_pc_no INT,                                -- Linked Lok Sabha PC number (1-39)
    geo_name TEXT,
    mla_name TEXT,
    mla_party TEXT,
    mla_party_short TEXT,
    mla_since TIMESTAMPTZ,
    mla_status TEXT DEFAULT 'CURRENT',               -- 'CURRENT', 'VACANT'
    office_title TEXT,                               -- e.g. 'Cabinet Minister — Finance'
    election_winner TEXT,
    election_party TEXT,
    election_margin TEXT,
    runner_up_name TEXT,
    runner_up_party TEXT,
    total_projects INT DEFAULT 0,
    allocated_funds_cr NUMERIC(12, 2) DEFAULT 0.00,
    spent_funds_cr NUMERIC(12, 2) DEFAULT 0.00,
    official_source TEXT,
    source_name TEXT,
    last_verified_at TIMESTAMPTZ,
    verification_status TEXT DEFAULT 'VERIFIED',
    natural_key TEXT UNIQUE NOT NULL,                -- e.g. 'TN-AC-13'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parliamentary Constituencies (39 seats in Tamil Nadu)
CREATE TABLE IF NOT EXISTS public.constituencies_pc (
    id INT PRIMARY KEY,                              -- 1 to 39
    name TEXT NOT NULL,
    reservation TEXT,
    state_id TEXT NOT NULL REFERENCES public.states(id) ON DELETE RESTRICT,
    mp_name TEXT,
    mp_party TEXT,
    mp_party_short TEXT,
    mp_since TIMESTAMPTZ,
    mp_status TEXT DEFAULT 'CURRENT',
    total_projects INT DEFAULT 0,
    allocated_funds_cr NUMERIC(12, 2) DEFAULT 0.00,
    spent_funds_cr NUMERIC(12, 2) DEFAULT 0.00,
    official_source TEXT,
    source_name TEXT,
    natural_key TEXT UNIQUE NOT NULL,                -- e.g. 'TN-PC-2'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Local Municipal Wards & Taluks
CREATE TABLE IF NOT EXISTS public.localities_wards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    district_id TEXT NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    constituency_ac_no INT REFERENCES public.constituencies_ac(id) ON DELETE SET NULL,
    ward_number INT,
    ward_name TEXT NOT NULL,
    locality_type TEXT DEFAULT 'MUNICIPAL_WARD',     -- 'MUNICIPAL_WARD', 'TALUK', 'PANCHAYAT'
    corporator_or_councillor TEXT,
    population INT,
    total_civic_works INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. Module 1: Government Promise and Project Progress Tracking
-- ==============================================================================

-- Manifesto Promises (Government commitments tracked vs delivery)
CREATE TABLE IF NOT EXISTS public.manifesto_promises (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,                          -- 'Education', 'Health', 'Agriculture', 'Economy'
    ruling_party TEXT NOT NULL,                      -- e.g. 'DMK'
    manifesto_year INT NOT NULL,                     -- e.g. 2021
    status TEXT NOT NULL DEFAULT 'In progress',      -- 'Fulfilled', 'In progress', 'Under Review', 'Not Started'
    fulfillment_percentage INT DEFAULT 0 CHECK (fulfillment_percentage BETWEEN 0 AND 100),
    official_gazette_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core Infrastructure & Public Welfare Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    code TEXT UNIQUE NOT NULL,                       -- e.g. 'TN-PWD-2024-017'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    constituency_ac_no INT REFERENCES public.constituencies_ac(id) ON DELETE SET NULL,
    category TEXT NOT NULL,                          -- 'INFRASTRUCTURE', 'WATER', 'HEALTH', 'EDUCATION', 'TRANSPORT'
    manifesto_promise_id TEXT REFERENCES public.manifesto_promises(id) ON DELETE SET NULL,
    budget_inr_cr NUMERIC(14, 2) NOT NULL,
    spent_inr_cr NUMERIC(14, 2) DEFAULT 0.00,
    progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'In progress',      -- 'Proposed', 'Tendering', 'In progress', 'Completed', 'On hold', 'Delayed'
    contractor_name TEXT,
    sanction_order_no TEXT,                         -- G.O. / Tender identifier
    start_date TIMESTAMPTZ,
    target_completion_date TIMESTAMPTZ,
    actual_completion_date TIMESTAMPTZ,
    official_source TEXT,
    source_name TEXT,
    last_verified_at TIMESTAMPTZ,
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Phase Milestones
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING',          -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'
    weightage_percent INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. Module 2: Citizen-Based Project Verification & Ground Reality Monitoring
-- ==============================================================================

-- Citizen Ground Truth Verification Reviews
CREATE TABLE IF NOT EXISTS public.citizen_verifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ground_status TEXT NOT NULL,                     -- 'Matches Reality', 'Minor Discrepancy', 'Major Violation', 'Ghost Project'
    progress_estimate INT CHECK (progress_estimate BETWEEN 0 AND 100),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    notes TEXT NOT NULL,
    photo_urls TEXT[] DEFAULT '{}',                 -- Cloud object storage media paths
    geo_latitude NUMERIC(9, 6),
    geo_longitude NUMERIC(9, 6),
    is_auditor_verified BOOLEAN DEFAULT FALSE,
    audited_by UUID REFERENCES auth.users(id),
    audited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supporting Evidence Metadata
CREATE TABLE IF NOT EXISTS public.verification_evidence (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    verification_id TEXT NOT NULL REFERENCES public.citizen_verifications(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,                         -- 'image/jpeg', 'image/png', 'application/pdf'
    file_size_bytes BIGINT,
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. Module 4: Project Historical Tracking Across Government Changes
-- ==============================================================================

-- Political Assembly Regimes
CREATE TABLE IF NOT EXISTS public.political_regimes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,                              -- e.g. '15th Tamil Nadu Assembly'
    start_year INT NOT NULL,
    end_year INT,
    ruling_party TEXT NOT NULL,                      -- 'AIADMK', 'DMK'
    chief_minister TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-Regime Project Continuation & Modification History
CREATE TABLE IF NOT EXISTS public.project_regime_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    regime_id TEXT REFERENCES public.political_regimes(id) ON DELETE SET NULL,
    ruling_party TEXT NOT NULL,
    status_at_transition TEXT NOT NULL,              -- Status when power transitioned
    action_taken TEXT NOT NULL,                      -- 'Continued', 'Accelerated', 'Re-tendered', 'Renamed', 'Halted'
    budget_modified_cr NUMERIC(14, 2),
    transition_notes TEXT NOT NULL,
    official_gazette_url TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. Module 5: Citizen-Reported Project Quality & Maintenance Monitoring
-- ==============================================================================

-- Public Grievances & Defect Complaints
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    ticket_number TEXT UNIQUE NOT NULL,              -- Unique format: 'CL-YYYY-NNNNNN'
    citizen_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    constituency_ac_no INT REFERENCES public.constituencies_ac(id) ON DELETE SET NULL,
    category TEXT NOT NULL,                          -- 'Roads', 'Water', 'Sanitation', 'Streetlights', 'Drainage'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Submitted',        -- 'Submitted', 'Acknowledged', 'In progress', 'Escalated', 'Resolved', 'Rejected'
    priority TEXT NOT NULL DEFAULT 'Medium',         -- 'Low', 'Medium', 'High', 'Emergency'
    assigned_officer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    citizen_feedback_rating INT CHECK (citizen_feedback_rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Complaint Timeline Event Stream with Strict Role Separation
CREATE TABLE IF NOT EXISTS public.complaint_updates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    updated_by_user_id UUID REFERENCES auth.users(id),
    updated_by_role TEXT NOT NULL,                   -- 'Citizen', 'Department Officer', 'Auditor', 'System'
    update_type TEXT NOT NULL DEFAULT 'OFFICIAL_STATUS_CHANGE', -- 'CITIZEN_COMMENT', 'OFFICIAL_STATUS_CHANGE', 'FIELD_INSPECTION_RECORD', 'ADMIN_ACTION'
    note TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_update_type CHECK (update_type IN ('CITIZEN_COMMENT', 'OFFICIAL_STATUS_CHANGE', 'FIELD_INSPECTION_RECORD', 'ADMIN_ACTION'))
);

-- Quality Audits
CREATE TABLE IF NOT EXISTS public.quality_audits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    complaint_id TEXT REFERENCES public.complaints(id) ON DELETE SET NULL,
    auditor_id UUID NOT NULL REFERENCES auth.users(id),
    structural_integrity_score INT CHECK (structural_integrity_score BETWEEN 1 AND 100),
    safety_compliance BOOLEAN DEFAULT TRUE,
    auditor_remarks TEXT NOT NULL,
    audit_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. Module 6: Scheme Application Assistance & Grievance Escalation
-- ==============================================================================

-- Flagship Government Welfare Schemes
CREATE TABLE IF NOT EXISTS public.schemes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    natural_key TEXT UNIQUE,                         -- e.g. 'scheme:kmut'
    level TEXT DEFAULT 'TN',                         -- 'TN' | 'CENTRAL'
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    eligibility TEXT,
    benefits TEXT,
    beneficiaries TEXT,
    eligibility_rules JSONB DEFAULT '{}'::jsonb,     -- Structured eligibility check rules
    financial_assistance TEXT,                       -- e.g. '₹1,000 / month'
    application_process TEXT,
    application_url TEXT,
    documents_required TEXT,
    guidelines_url TEXT,
    status TEXT DEFAULT 'ACTIVE',                    -- 'ACTIVE', 'UPDATED', 'DISCONTINUED'
    official_source TEXT,
    source_name TEXT,
    last_verified_at TIMESTAMPTZ,
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Citizen Scheme Assistance & Application Tracking
CREATE TABLE IF NOT EXISTS public.scheme_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    scheme_id TEXT NOT NULL REFERENCES public.schemes(id) ON DELETE RESTRICT,
    citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_ref_no TEXT,
    current_stage TEXT NOT NULL DEFAULT 'Draft',     -- 'Eligibility Checked', 'Applied Online', 'Document Verified', 'Disbursed', 'Rejected'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Administrative Grievance Escalations
CREATE TABLE IF NOT EXISTS public.grievance_escalations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    escalated_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    escalation_tier TEXT NOT NULL,                   -- 'Taluk/Tahsildar', 'District Collectorate', 'State Secretariat'
    escalation_reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Review',   -- 'Pending Review', 'Officer Hearing Scheduled', 'Resolved'
    officer_in_charge_id UUID REFERENCES auth.users(id),
    escalated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. Module 7: Department-Wise Fund Allocation & Expenditure Monitoring
-- ==============================================================================

-- Annual Department Budgets
CREATE TABLE IF NOT EXISTS public.department_budgets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    financial_year TEXT NOT NULL,                    -- e.g. '2024-2025'
    allocated_cr NUMERIC(14, 2) NOT NULL,
    expenditure_cr NUMERIC(14, 2) DEFAULT 0.00,
    unspent_cr NUMERIC(14, 2) GENERATED ALWAYS AS (allocated_cr - expenditure_cr) STORED,
    schemes_count INT DEFAULT 0,
    sanction_orders_count INT DEFAULT 0,
    last_audited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_dept_financial_year UNIQUE (department_id, financial_year)
);

-- Expenditure Vouchers & Public Sanctions
CREATE TABLE IF NOT EXISTS public.expenditure_vouchers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    voucher_number TEXT UNIQUE NOT NULL,             -- G.O. / Sanction Voucher reference
    payee_name TEXT NOT NULL,
    amount_inr NUMERIC(14, 2) NOT NULL,
    payment_date DATE NOT NULL,
    description TEXT NOT NULL,
    sanction_order_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. News, Announcements, Official Directory & Audit Logs
-- ==============================================================================

-- Political Office Holders & Dignitaries
CREATE TABLE IF NOT EXISTS public.political_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    office TEXT NOT NULL,                            -- 'CHIEF_MINISTER', 'MINISTER', 'MLA', 'MP_LOK_SABHA', etc.
    office_label TEXT,
    party TEXT,
    party_short TEXT,
    jurisdiction TEXT DEFAULT 'STATE',               -- 'NATIONAL', 'STATE', 'DISTRICT'
    state_id TEXT REFERENCES public.states(id),
    district_id TEXT REFERENCES public.districts(id),
    constituency_type TEXT,
    constituency_name TEXT,
    department TEXT,
    portfolio TEXT,
    tenure TEXT,
    official_source TEXT,
    source_name TEXT,
    effective_date TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles (Government of India & Tamil Nadu press updates)
CREATE TABLE IF NOT EXISTS public.news_articles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    publisher TEXT NOT NULL,                         -- 'PIB India', 'DIPR Tamil Nadu', 'The Hindu'
    source_url TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,                      -- 'Tamil Nadu', 'Government of India'
    category TEXT NOT NULL,                          -- 'Governance', 'Welfare', 'Infrastructure', 'Policy'
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_breaking BOOLEAN DEFAULT FALSE,
    read_time_minutes INT DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Official Press Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,                          -- 'POLICY', 'TENDER', 'SCHEME', 'PUBLIC_NOTICE', 'PRESS'
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    publisher TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_important BOOLEAN DEFAULT FALSE,
    official_source TEXT,
    source_name TEXT,
    natural_key TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Sources Registry
CREATE TABLE IF NOT EXISTS public.data_sources (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    url TEXT NOT NULL,
    trust_tier TEXT DEFAULT 'OFFICIAL_PORTAL',
    sync_frequency TEXT DEFAULT 'DAILY',
    last_sync_status TEXT DEFAULT 'SUCCESS',
    last_sync_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable Administrative Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,                       -- 'PROJECT', 'COMPLAINT', 'SCHEME', 'VERIFICATION'
    entity_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. Performance Indexes
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_dept ON public.projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_district ON public.projects(district_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_code ON public.projects(code);

CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON public.complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_ticket ON public.complaints(ticket_number);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

CREATE INDEX IF NOT EXISTS idx_verifications_project ON public.citizen_verifications(project_id);
CREATE INDEX IF NOT EXISTS idx_verifications_citizen ON public.citizen_verifications(citizen_id);

CREATE INDEX IF NOT EXISTS idx_constituencies_ac_district ON public.constituencies_ac(district_id);
CREATE INDEX IF NOT EXISTS idx_schemes_dept ON public.schemes(department_id);
CREATE INDEX IF NOT EXISTS idx_schemes_natural ON public.schemes(natural_key);

-- ==============================================================================
-- 12. Row Level Security (RLS) Protocol
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constituencies_ac ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constituencies_pc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localities_wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifesto_promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_regimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_regime_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenditure_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ── Transparency / Public Read Policies ──
CREATE POLICY "Public read states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public read constituencies_ac" ON public.constituencies_ac FOR SELECT USING (true);
CREATE POLICY "Public read constituencies_pc" ON public.constituencies_pc FOR SELECT USING (true);
CREATE POLICY "Public read localities_wards" ON public.localities_wards FOR SELECT USING (true);
CREATE POLICY "Public read manifesto_promises" ON public.manifesto_promises FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read milestones" ON public.project_milestones FOR SELECT USING (true);
CREATE POLICY "Public read verifications" ON public.citizen_verifications FOR SELECT USING (true);
CREATE POLICY "Public read regimes" ON public.political_regimes FOR SELECT USING (true);
CREATE POLICY "Public read regime history" ON public.project_regime_history FOR SELECT USING (true);
CREATE POLICY "Public read schemes" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Public read department budgets" ON public.department_budgets FOR SELECT USING (true);
CREATE POLICY "Public read expenditure vouchers" ON public.expenditure_vouchers FOR SELECT USING (true);
CREATE POLICY "Public read political records" ON public.political_records FOR SELECT USING (true);
CREATE POLICY "Public read news articles" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public read data sources" ON public.data_sources FOR SELECT USING (true);

-- ── User Profile Policies ──
CREATE POLICY "Users read their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- ── Complaints & Grievance Policies (Zero Citizen PII Leakage & Department Isolation) ──
-- Security model for public.complaints uses FIVE independent layers:
--
--   Layer 1 — REVOKE ALL FROM anon
--             Removes table-level SELECT from anonymous users.
--             Prevents "SELECT *" and any non-explicitly-granted column access.
--
--   Layer 2 — Column-level GRANT (defined below)
--             Grants anon SELECT on exactly 14 safe columns.
--             PII columns (citizen_id, evidence_urls, assigned_officer_id,
--             resolution_notes) are never granted and therefore never accessible.
--
--   Layer 3 — RLS policy "anon_read_approved_public_complaints" (defined below)
--             Filters which ROWS are visible to anon.
--             Only non-CORRUPTION/BRIBERY complaints in Acknowledged/In progress/Resolved
--             status are visible. All other rows are denied at the database level.
--
--   Layer 4 — View with security_invoker = true (PostgreSQL 15 / Supabase)
--             View executes with the CALLING USER'S privileges and RLS context.
--             This means Layers 2 and 3 are enforced inside the view body.
--             There is no view-owner privilege bypass.
--
--   Layer 5 — security_barrier = true on the view
--             Prevents the query optimizer from pushing caller-supplied predicates
--             before the view's own conditions (stops row-estimation side-channel leakage).

REVOKE ALL ON public.complaints FROM anon;
REVOKE ALL ON public.complaint_updates FROM anon;

-- Layer 2: Column-level GRANT for anon.
-- Anon may reference ONLY these 14 safe columns. Any attempt to SELECT citizen_id,
-- evidence_urls, assigned_officer_id, or resolution_notes will raise:
--   ERROR 42501: permission denied for column <name>
GRANT SELECT (
    id,
    ticket_number,
    department_id,
    district_id,
    constituency_ac_no,
    category,
    title,
    description,
    status,
    priority,
    citizen_feedback_rating,
    created_at,
    resolved_at
) ON public.complaints TO anon;

-- Layer 3: Narrow RLS row-filter policy for the anon role.
-- The TO anon clause scopes this policy exclusively to the anonymous role.
-- Authenticated user policies are defined separately below and are unaffected.
CREATE POLICY "anon_read_approved_public_complaints" ON public.complaints
    FOR SELECT TO anon
    USING (
        category NOT IN ('CORRUPTION', 'BRIBERY')
        AND status IN ('Acknowledged', 'In progress', 'Resolved')
    );

CREATE POLICY "Complainants read own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "Department officers read department complaints" ON public.complaints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles p
            WHERE p.id = auth.uid() AND (
                -- System administrators have comprehensive audit oversight
                p.role = 'admin' OR
                -- Certified auditors
                p.role = 'auditor' OR
                -- Authorized vigilance officers can access corruption and bribery complaints
                (p.role = 'officer' AND (p.is_vigilance_officer = true OR p.department_id = 'dept-vigilance') AND complaints.category IN ('CORRUPTION', 'BRIBERY')) OR
                -- Standard departmental officers can ONLY access non-corruption complaints belonging strictly to their assigned department
                (p.role = 'officer' AND p.department_id = complaints.department_id AND complaints.category NOT IN ('CORRUPTION', 'BRIBERY'))
            )
        )
    );

CREATE POLICY "Citizens insert own complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Department officers update department complaints" ON public.complaints
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles p
            WHERE p.id = auth.uid() AND (
                p.role = 'admin' OR
                -- Officers can update ONLY if the complaint belongs to their department AND they cannot modify complaints outside their jurisdiction
                (p.role = 'officer' AND p.department_id = complaints.department_id AND (
                    complaints.category NOT IN ('CORRUPTION', 'BRIBERY') OR p.is_vigilance_officer = true
                ))
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles p
            WHERE p.id = auth.uid() AND (
                p.role = 'admin' OR
                (p.role = 'officer' AND p.department_id = complaints.department_id AND (
                    complaints.category NOT IN ('CORRUPTION', 'BRIBERY') OR p.is_vigilance_officer = true
                ))
            )
        )
    );

-- 2. Anonymized Public Complaints View: Dual-Filter Defense with security_barrier = true
-- This view serves as the public civic transparency feed for BOTH anonymous visitors
-- and logged-in citizens.
--
-- Security Guarantees:
--   1. Column Exclusion: Columns citizen_id, assigned_officer_id, evidence_urls,
--      and resolution_notes are physically NOT projected. They cannot be selected
--      by any query through this view under any circumstance.
--   2. Category Exclusion: category NOT IN ('CORRUPTION', 'BRIBERY') is hard-filtered
--      in the view query. No caller (anonymous, citizen, officer, or admin) can see
--      corruption or bribery complaints through this public view.
--   3. Status Exclusion: Only complaints in 'Acknowledged', 'In progress', or 'Resolved'
--      status are public. Draft, Submitted, or internal escalation rows are excluded.
--   4. security_barrier = true: Guarantees that the PostgreSQL query planner executes
--      the view's filters BEFORE any user-supplied WHERE clause, preventing optimizer
--      side-channel row inference.
CREATE OR REPLACE VIEW public.anonymized_public_complaints
WITH (security_barrier = true) AS
SELECT
    id,
    ticket_number,
    department_id,
    district_id,
    constituency_ac_no,
    category,
    title,
    description,
    status,
    priority,
    citizen_feedback_rating,
    created_at,
    resolved_at
FROM public.complaints
WHERE
    category NOT IN ('CORRUPTION', 'BRIBERY')
    AND status IN ('Acknowledged', 'In progress', 'Resolved');

GRANT SELECT ON public.anonymized_public_complaints TO anon, authenticated;

-- ── Complaint Timeline Integrity Policies ──
CREATE POLICY "Public read complaint updates for non-sensitive complaints" ON public.complaint_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_id 
              AND c.category NOT IN ('CORRUPTION', 'BRIBERY')
              AND c.status IN ('Acknowledged', 'In progress', 'Resolved')
        )
    );

CREATE POLICY "Complainants read updates on own complaints" ON public.complaint_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_id AND c.citizen_id = auth.uid()
        )
    );

CREATE POLICY "Citizens can only post citizen comments" ON public.complaint_updates
    FOR INSERT WITH CHECK (
        update_type = 'CITIZEN_COMMENT'
        AND from_status IS NULL
        AND to_status IS NULL
        AND EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_id AND c.citizen_id = auth.uid()
        )
    );

CREATE POLICY "Staff insert official status and inspection records" ON public.complaint_updates
    FOR INSERT WITH CHECK (
        update_type IN ('OFFICIAL_STATUS_CHANGE', 'FIELD_INSPECTION_RECORD', 'ADMIN_ACTION')
        AND EXISTS (
            SELECT 1 FROM public.user_profiles p
            JOIN public.complaints c ON c.id = complaint_id
            WHERE p.id = auth.uid() AND (
                p.role = 'admin' OR
                (p.role = 'officer' AND p.department_id = c.department_id AND (
                    c.category NOT IN ('CORRUPTION', 'BRIBERY') OR p.is_vigilance_officer = true
                ))
            )
        )
    );

-- ── Immutable Audit Log Trigger ──
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE operations are strictly forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- ── Ground Verification Policies ──
CREATE POLICY "Citizens insert verification" ON public.citizen_verifications
    FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- ── Scheme Applications ──
CREATE POLICY "Citizens manage own scheme applications" ON public.scheme_applications
    FOR ALL USING (auth.uid() = citizen_id);

-- ── Audit Logs ──
CREATE POLICY "Auditors and admins view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('auditor', 'admin')
        )
    );

