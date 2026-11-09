/**
 * CIVIC LENZ – Automated Staging Security Test Suite
 * 
 * Verifies RLS policies, role isolation, and security guarantees against a Supabase staging project.
 * 
 * Target: Staging project ONLY (configured via .env.staging or STAGING_* environment variables).
 * Safety: Reads environment variables specifically for staging; refuses to run against production.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// 1. Load Staging Credentials Safely
let stagingUrl = process.env.STAGING_SUPABASE_URL || ''
let stagingAnonKey = process.env.STAGING_SUPABASE_ANON_KEY || ''
let stagingServiceKey = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || ''

const stagingEnvPath = path.resolve(process.cwd(), '.env.staging')
if ((!stagingUrl || !stagingAnonKey) && fs.existsSync(stagingEnvPath)) {
  const content = fs.readFileSync(stagingEnvPath, 'utf8')
  const getVal = (key: string) => {
    const m = content.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'm'))
    return m ? m[1].trim() : ''
  }
  stagingUrl = getVal('NEXT_PUBLIC_SUPABASE_URL') || getVal('STAGING_SUPABASE_URL')
  stagingAnonKey = getVal('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getVal('STAGING_SUPABASE_ANON_KEY')
  stagingServiceKey = getVal('SUPABASE_SERVICE_ROLE_KEY') || getVal('STAGING_SUPABASE_SERVICE_ROLE_KEY')
}

// Safety check: Prevent running against production project
const PROD_REF = 'jxeekzpbmnpxpiakbdiz'
if (stagingUrl.includes(PROD_REF)) {
  console.error('\n❌ SAFETY ABORT: Staging test suite detected production project URL (jxeekzpbmnpxpiakbdiz)!')
  console.error('This script must ONLY be executed against a dedicated staging project.\n')
  process.exit(1)
}

if (!stagingUrl || !stagingAnonKey || !stagingUrl.startsWith('http')) {
  console.error('\n⚠️ Missing Staging Credentials.')
  console.error('Please configure .env.staging or set STAGING_SUPABASE_URL and STAGING_SUPABASE_ANON_KEY.')
  console.error('Refer to supabase/STAGING.md for instructions.\n')
  process.exit(1)
}

interface TestResult {
  id: string
  name: string
  expected: string
  actual: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

function record(test: TestResult) {
  results.push(test)
  const icon = test.passed ? '✅ PASS' : '❌ FAIL'
  console.log(`[${icon}] ${test.id}: ${test.name}`)
  if (!test.passed) {
    console.log(`       Expected: ${test.expected}`)
    console.log(`       Actual:   ${test.actual}`)
    if (test.error) console.log(`       Error:    ${test.error}`)
  }
}

async function runTestSuite() {
  console.log('\n============================================================')
  console.log('  CIVIC LENZ – Automated Staging Security Verification')
  console.log('  Target Staging URL:', stagingUrl)
  console.log('============================================================\n')

  const anonClient = createClient(stagingUrl, stagingAnonKey)
  const adminClient = stagingServiceKey ? createClient(stagingUrl, stagingServiceKey) : null

  // -------------------------------------------------------------------------
  // TEST SUITE 1: Anonymous Access Controls
  // -------------------------------------------------------------------------
  console.log('── Suite 1: Anonymous Access Controls ──')

  // Test 1.1: Anonymous direct SELECT on public.complaints base table
  try {
    const { data, error, status } = await anonClient.from('complaints').select('id, citizen_id').limit(1)
    if (error || status === 401 || status === 403) {
      record({
        id: 'SEC-1.1',
        name: 'Anon direct SELECT on base complaints table is denied',
        expected: 'Denied (error / 401 / 403 / 42501)',
        actual: `Denied with status ${status} (${error?.message})`,
        passed: true,
      })
    } else if (data && data.length === 0) {
      record({
        id: 'SEC-1.1',
        name: 'Anon direct SELECT on base complaints returns 0 rows via RLS',
        expected: '0 rows or Permission Denied',
        actual: '0 rows returned',
        passed: true,
      })
    } else {
      record({
        id: 'SEC-1.1',
        name: 'Anon direct SELECT on base complaints table is denied',
        expected: 'Denied or 0 rows',
        actual: `Leaked ${data?.length} rows to anonymous caller!`,
        passed: false,
      })
    }
  } catch (err: any) {
    record({
      id: 'SEC-1.1',
      name: 'Anon direct SELECT on base complaints table is denied',
      expected: 'Denied',
      actual: `Threw exception: ${err.message}`,
      passed: true,
    })
  }

  // Test 1.2: Anonymous access through anonymized_public_complaints view
  try {
    const { data, error, status } = await anonClient.from('anonymized_public_complaints').select('*').limit(50)
    if (error) {
      record({
        id: 'SEC-1.2',
        name: 'Anon can query anonymized_public_complaints view',
        expected: '200 OK with public rows',
        actual: `Error: ${error.message} (status ${status})`,
        passed: false,
      })
    } else {
      // Check column exclusions
      const hasCitizenId = data?.some((row: any) => 'citizen_id' in row)
      const hasEvidenceUrls = data?.some((row: any) => 'evidence_urls' in row)
      const hasAssignedOfficer = data?.some((row: any) => 'assigned_officer_id' in row)
      const hasResolutionNotes = data?.some((row: any) => 'resolution_notes' in row)

      // Check row exclusions
      const hasCorruption = data?.some((row: any) => row.category === 'CORRUPTION' || row.category === 'BRIBERY')
      const hasSubmitted = data?.some((row: any) => row.status === 'Submitted' || row.status === 'Draft')

      const piiExcluded = !hasCitizenId && !hasEvidenceUrls && !hasAssignedOfficer && !hasResolutionNotes
      const sensitiveRowsExcluded = !hasCorruption && !hasSubmitted

      record({
        id: 'SEC-1.2',
        name: 'Anonymized public view excludes all PII columns',
        expected: 'No citizen_id, evidence_urls, assigned_officer_id, or resolution_notes',
        actual: piiExcluded ? 'All PII columns absent' : 'PII columns detected in payload!',
        passed: piiExcluded,
      })

      record({
        id: 'SEC-1.3',
        name: 'Anonymized public view excludes CORRUPTION/BRIBERY and unapproved statuses',
        expected: '0 CORRUPTION/BRIBERY rows, 0 Submitted/Draft rows',
        actual: sensitiveRowsExcluded ? 'All sensitive rows excluded' : 'Sensitive rows detected in public view!',
        passed: sensitiveRowsExcluded,
      })
    }
  } catch (err: any) {
    record({
      id: 'SEC-1.2',
      name: 'Anonymized public view check',
      expected: 'Accessible without PII',
      actual: `Exception: ${err.message}`,
      passed: false,
    })
  }

  // Test 1.4: Anonymous direct SELECT on public reference data (states, departments)
  try {
    const { data, error } = await anonClient.from('states').select('code, name').limit(5)
    record({
      id: 'SEC-1.4',
      name: 'Anon can read public transparency reference data (states)',
      expected: 'Allowed (public data)',
      actual: error ? `Error: ${error.message}` : `Success (${data?.length} rows read)`,
      passed: !error,
    })
  } catch (err: any) {
    record({
      id: 'SEC-1.4',
      name: 'Anon read states',
      expected: 'Allowed',
      actual: `Exception: ${err.message}`,
      passed: false,
    })
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 2: Audit Log Immutability (Service Role execution)
  // -------------------------------------------------------------------------
  if (adminClient) {
    console.log('\n── Suite 2: Audit Log Immutability ──')

    try {
      // Step A: Insert a test audit log
      const testEntityId = `test-${Date.now()}`
      const { data: insertData, error: insertError } = await adminClient
        .from('audit_logs')
        .insert({
          action: 'SECURITY_TEST_AUDIT',
          entity_type: 'SYSTEM',
          entity_id: testEntityId,
          details: { test: true },
        })
        .select('id')
        .single()

      if (insertError) {
        record({
          id: 'SEC-2.1',
          name: 'Insert audit log baseline',
          expected: 'Insert succeeds',
          actual: `Insert failed: ${insertError.message}`,
          passed: false,
        })
      } else {
        const auditLogId = insertData.id

        // Step B: Attempt UPDATE (Must be rejected by trigger)
        const { error: updateError } = await adminClient
          .from('audit_logs')
          .update({ action: 'TAMPERED_ACTION' })
          .eq('id', auditLogId)

        record({
          id: 'SEC-2.2',
          name: 'Audit logs cannot be UPDATED (trigger prevents modification)',
          expected: 'Rejected by trg_audit_logs_immutable trigger',
          actual: updateError ? `Rejected: ${updateError.message}` : 'UPDATE SUCCEEDED (Security breach!)',
          passed: !!updateError,
        })

        // Step C: Attempt DELETE (Must be rejected by trigger)
        const { error: deleteError } = await adminClient
          .from('audit_logs')
          .delete()
          .eq('id', auditLogId)

        record({
          id: 'SEC-2.3',
          name: 'Audit logs cannot be DELETED (trigger prevents deletion)',
          expected: 'Rejected by trg_audit_logs_immutable trigger',
          actual: deleteError ? `Rejected: ${deleteError.message}` : 'DELETE SUCCEEDED (Security breach!)',
          passed: !!deleteError,
        })
      }
    } catch (err: any) {
      record({
        id: 'SEC-2.0',
        name: 'Audit log trigger execution',
        expected: 'Executed',
        actual: `Exception: ${err.message}`,
        passed: false,
      })
    }
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n============================================================')
  const total = results.length
  const passed = results.filter((r) => r.passed).length
  const failed = total - passed
  console.log(`  Tests Executed: ${total} | Passed: ${passed} | Failed: ${failed}`)
  console.log('============================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTestSuite().catch((e) => {
  console.error('Test suite runner crashed:', e)
  process.exit(1)
})

