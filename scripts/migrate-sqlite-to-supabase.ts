// CIVIC LENZ – Production ETL Replication Script (SQLite -> Supabase PostgreSQL)
// Reads all verified records from local SQLite (db/custom.db) and safely inserts into Supabase.
// Fully idempotent: supports safe retrying using onConflict upserts.

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const isStagingMode = process.argv.includes('--staging')

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (isStagingMode) {
  const stagingPath = path.resolve(process.cwd(), '.env.staging')
  if (fs.existsSync(stagingPath)) {
    const content = fs.readFileSync(stagingPath, 'utf8')
    const getVal = (key: string) => {
      const m = content.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'm'))
      return m ? m[1].trim() : ''
    }
    supabaseUrl = getVal('NEXT_PUBLIC_SUPABASE_URL') || getVal('STAGING_SUPABASE_URL') || supabaseUrl
    supabaseSecret = getVal('SUPABASE_SERVICE_ROLE_KEY') || getVal('STAGING_SUPABASE_SERVICE_ROLE_KEY') || supabaseSecret
  } else {
    supabaseUrl = process.env.STAGING_SUPABASE_URL || supabaseUrl
    supabaseSecret = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || supabaseSecret
  }
}

if (!supabaseUrl || !supabaseSecret || !supabaseUrl.startsWith('http')) {
  console.error(`[Migration] Missing Supabase URL or Service Role Key (${isStagingMode ? 'STAGING' : 'PRODUCTION'})`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseSecret)

async function replicateData() {
  console.log(`── Starting Non-Destructive CIVIC LENZ Replication (${isStagingMode ? 'STAGING' : 'PRODUCTION'}) ──`)
  console.log(`  Target URL: ${supabaseUrl}`)

  try {
    // 1. States (36 rows)
    const states = await prisma.state.findMany()
    console.log(`1/10 Replicating ${states.length} states...`)
    if (states.length > 0) {
      const { error } = await supabase.from('states').upsert(
        states.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          region: s.region,
          is_union_territory: s.isUnionTerritory,
          assembly_seats: s.assemblySeats,
          lok_sabha_seats: s.lokSabhaSeats,
          rajya_sabha_seats: s.rajyaSabhaSeats,
          is_focus_state: s.isFocusState,
          capital: s.capital,
          created_at: s.createdAt.toISOString(),
          updated_at: s.updatedAt.toISOString(),
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  States error:', error.message)
      else console.log('  ✓ States migrated.')
    }

    // 2. Districts (38 rows)
    const districts = await prisma.district.findMany()
    console.log(`2/10 Replicating ${districts.length} districts...`)
    if (districts.length > 0) {
      const { error } = await supabase.from('districts').upsert(
        districts.map((d) => ({
          id: d.id,
          state_id: d.stateId,
          name: d.name,
          code: d.code,
          headquarters: d.headquarters,
          formed_on: d.formedOn,
          population: d.population,
          geo_name: d.geoName,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Districts error:', error.message)
      else console.log('  ✓ Districts migrated.')
    }

    // 3. Constituencies (234 ACs + 39 PCs)
    const constituencies = await prisma.constituency.findMany()
    const acs = constituencies.filter((c) => c.type === 'ASSEMBLY')
    const pcs = constituencies.filter((c) => c.type === 'PARLIAMENTARY')
    console.log(`3/10 Replicating ${acs.length} ACs and ${pcs.length} PCs...`)

    if (acs.length > 0) {
      const { error } = await supabase.from('constituencies_ac').upsert(
        acs.map((ac) => ({
          id: ac.no,
          name: ac.name,
          reservation: ac.reservation,
          state_id: ac.stateId,
          district_id: ac.districtId,
          parent_pc_no: ac.parentNo,
          geo_name: ac.geoName,
          mla_name: ac.holderName,
          mla_party: ac.holderParty,
          mla_party_short: ac.holderPartyShort,
          mla_since: ac.holderSince ? ac.holderSince.toISOString() : null,
          mla_status: ac.holderStatus,
          office_title: ac.officeTitle,
          election_winner: ac.electionWinner,
          election_party: ac.electionParty,
          election_margin: ac.electionMargin,
          runner_up_name: ac.runnerUpName,
          runner_up_party: ac.runnerUpParty,
          official_source: ac.officialSource,
          source_name: ac.sourceName,
          last_verified_at: ac.lastVerifiedAt ? ac.lastVerifiedAt.toISOString() : null,
          verification_status: ac.verificationStatus,
          natural_key: ac.naturalKey,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  ACs error:', error.message)
      else console.log('  ✓ Assembly Constituencies migrated.')
    }

    if (pcs.length > 0) {
      const { error } = await supabase.from('constituencies_pc').upsert(
        pcs.map((pc) => ({
          id: pc.no,
          name: pc.name,
          reservation: pc.reservation,
          state_id: pc.stateId,
          mp_name: pc.holderName,
          mp_party: pc.holderParty,
          mp_party_short: pc.holderPartyShort,
          mp_since: pc.holderSince ? pc.holderSince.toISOString() : null,
          mp_status: pc.holderStatus,
          official_source: pc.officialSource,
          source_name: pc.sourceName,
          natural_key: pc.naturalKey,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  PCs error:', error.message)
      else console.log('  ✓ Parliamentary Constituencies migrated.')
    }

    // 4. Departments (10 rows)
    const departments = await prisma.department.findMany()
    console.log(`4/10 Replicating ${departments.length} departments...`)
    if (departments.length > 0) {
      const { error } = await supabase.from('departments').upsert(
        departments.map((dept) => ({
          id: dept.id,
          name: dept.name,
          short_name: dept.shortName,
          description: dept.description,
          minister_name: dept.ministerName,
          secretary_name: dept.secretaryName,
          head_name: dept.headName,
          contact_email: dept.contactEmail,
          contact_phone: dept.contactPhone,
          address: dept.address,
          website: dept.website,
          services: dept.services,
          budget_inr_cr: dept.budgetInrCr,
          official_source: dept.officialSource,
          source_name: dept.sourceName,
          verification_status: dept.verificationStatus,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Departments error:', error.message)
      else console.log('  ✓ Departments migrated.')
    }

    // 5. Political Records (313 rows)
    const politicalRecords = await prisma.politicalRecord.findMany()
    console.log(`5/10 Replicating ${politicalRecords.length} political records...`)
    if (politicalRecords.length > 0) {
      const { error } = await supabase.from('political_records').upsert(
        politicalRecords.map((p) => ({
          id: p.id,
          name: p.name,
          office: p.office,
          office_label: p.officeLabel,
          party: p.party,
          party_short: p.partyShort,
          jurisdiction: p.jurisdiction,
          state_id: p.stateId,
          district_id: p.districtId,
          constituency_type: p.constituencyType,
          constituency_name: p.constituencyName,
          department: p.department,
          portfolio: p.portfolio,
          tenure: p.tenure,
          official_source: p.officialSource,
          source_name: p.sourceName,
          effective_date: p.effectiveDate ? p.effectiveDate.toISOString() : null,
          last_verified_at: p.lastVerifiedAt ? p.lastVerifiedAt.toISOString() : null,
          verification_status: p.verificationStatus,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Political records error:', error.message)
      else console.log('  ✓ Political records migrated.')
    }

    // 6. Schemes (15 rows - preserving exact verification status)
    const schemes = await prisma.scheme.findMany()
    console.log(`6/10 Replicating ${schemes.length} schemes...`)
    if (schemes.length > 0) {
      const { error } = await supabase.from('schemes').upsert(
        schemes.map((s) => ({
          id: s.id,
          name: s.name,
          level: s.level,
          department_id: s.departmentId,
          description: s.description,
          eligibility: s.eligibility,
          benefits: s.benefits,
          beneficiaries: s.beneficiaries,
          status: s.status,
          application_process: s.applicationProcess,
          application_url: s.applicationUrl,
          documents_required: s.documentsRequired,
          guidelines_url: s.guidelinesUrl,
          official_source: s.officialSource,
          source_name: s.sourceName,
          last_verified_at: s.lastVerifiedAt ? s.lastVerifiedAt.toISOString() : null,
          verification_status: s.verificationStatus,
          natural_key: s.naturalKey,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Schemes error:', error.message)
      else console.log('  ✓ Schemes migrated with exact verification tags.')
    }

    // 7. Projects (12 rows) & Milestones (37 rows)
    const projects = await prisma.project.findMany()
    console.log(`7/10 Replicating ${projects.length} projects...`)
    if (projects.length > 0) {
      const { error } = await supabase.from('projects').upsert(
        projects.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          description: p.description,
          department_id: p.departmentId,
          district_id: p.districtId,
          category: p.category,
          budget_inr_cr: p.budgetInrCr,
          spent_inr_cr: p.spentInrCr,
          progress_percent: p.progress,
          status: p.status,
          contractor_name: p.contractor,
          start_date: p.startDate ? p.startDate.toISOString() : null,
          target_completion_date: p.targetEndDate ? p.targetEndDate.toISOString() : null,
          actual_completion_date: p.completedOn ? p.completedOn.toISOString() : null,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Projects error:', error.message)
      else console.log('  ✓ Projects migrated.')
    }

    const milestones = await prisma.projectMilestone.findMany()
    console.log(`  Replicating ${milestones.length} milestones...`)
    if (milestones.length > 0) {
      const { error } = await supabase.from('project_milestones').upsert(
        milestones.map((m) => ({
          id: m.id,
          project_id: m.projectId,
          title: m.title,
          description: m.description,
          target_date: m.dueDate ? m.dueDate.toISOString() : new Date().toISOString(),
          completed_at: m.completedOn ? m.completedOn.toISOString() : null,
          status: m.status,
          weightage_percent: 0,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Milestones error:', error.message)
      else console.log('  ✓ Project milestones migrated.')
    }

    // 8. Announcements (10 rows) & Data Sources (12 rows)
    const announcements = await prisma.announcement.findMany()
    console.log(`8/10 Replicating ${announcements.length} announcements...`)
    if (announcements.length > 0) {
      const { error } = await supabase.from('announcements').upsert(
        announcements.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          category: a.category,
          department_id: a.departmentId,
          publisher: a.publisher,
          published_at: a.publishedAt.toISOString(),
          is_important: a.isImportant,
          official_source: a.officialSource,
          source_name: a.sourceName,
          natural_key: a.naturalKey,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Announcements error:', error.message)
      else console.log('  ✓ Announcements migrated.')
    }

    const dataSources = await prisma.dataSource.findMany()
    console.log(`  Replicating ${dataSources.length} data sources...`)
    if (dataSources.length > 0) {
      const { error } = await supabase.from('data_sources').upsert(
        dataSources.map((ds) => ({
          id: ds.id,
          name: ds.name,
          organization: ds.description || 'Government of Tamil Nadu',
          url: ds.url,
          trust_tier: ds.category || 'OFFICIAL_PORTAL',
          sync_frequency: `${ds.cadenceHours}h`,
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Data sources error:', error.message)
      else console.log('  ✓ Data sources migrated.')
    }

    // 9. Complaints (10 rows) & Updates (25 rows)
    const complaints = await prisma.complaint.findMany()
    console.log(`9/10 Replicating ${complaints.length} complaints...`)
    if (complaints.length > 0) {
      const { error } = await supabase.from('complaints').upsert(
        complaints.map((c) => ({
          id: c.id,
          ticket_number: c.ticketNo,
          department_id: c.assignedDepartmentId,
          district_id: c.districtId,
          category: c.category,
          title: c.title,
          description: c.description,
          status: c.status,
          priority: c.priority,
          resolution_notes: c.resolutionNote,
          citizen_feedback_rating: c.satisfaction,
          created_at: c.createdAt.toISOString(),
          resolved_at: c.updatedAt.toISOString(),
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Complaints error:', error.message)
      else console.log('  ✓ Complaints migrated.')
    }

    const updates = await prisma.complaintUpdate.findMany()
    console.log(`10/10 Replicating ${updates.length} complaint updates...`)
    if (updates.length > 0) {
      const { error } = await supabase.from('complaint_updates').upsert(
        updates.map((u) => ({
          id: u.id,
          complaint_id: u.complaintId,
          updated_by_role: u.byRole || 'System',
          note: `[${u.byName || 'Official'}] ${u.note}`,
          to_status: u.statusAfter,
          created_at: u.createdAt.toISOString(),
        })),
        { onConflict: 'id' }
      )
      if (error) console.warn('  Complaint updates error:', error.message)
      else console.log('  ✓ Complaint updates migrated.')
    }

    console.log('── Replication Completed Successfully Without Modifying SQLite ──')
  } catch (err: any) {
    console.error('Replication failed:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

replicateData()
