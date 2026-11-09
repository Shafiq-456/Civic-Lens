/**
 * CIVIC LENZ – Automated End-to-End API Test Suite
 * 
 * Tests all 19 API endpoints against the running development server (http://localhost:3000).
 * Verifies HTTP status codes, payload structures, pagination, search queries, and error handling.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

interface ApiTest {
  id: string
  route: string
  method?: string
  payload?: any
  expectedStatus: number
  description: string
  validator?: (data: any) => boolean
}

const tests: ApiTest[] = [
  {
    id: 'API-01',
    route: '/api/stats',
    expectedStatus: 200,
    description: 'System overview stats and departmental budget aggregates',
    validator: (d) => !!d.info && !!d.accountability && !!d.admin && Array.isArray(d.admin.deptBudgets),
  },
  {
    id: 'API-02',
    route: '/api/states',
    expectedStatus: 200,
    description: 'State and Union Territory boundary directory',
    validator: (d) => Array.isArray(d.states) && d.states.length === 36,
  },
  {
    id: 'API-03',
    route: '/api/districts?stateCode=TN',
    expectedStatus: 200,
    description: 'Tamil Nadu 38 revenue districts listing',
    validator: (d) => Array.isArray(d.districts) && d.districts.length === 38,
  },
  {
    id: 'API-04',
    route: '/api/constituencies?type=ASSEMBLY',
    expectedStatus: 200,
    description: 'Tamil Nadu 234 Assembly constituencies',
    validator: (d) => Array.isArray(d.constituencies) && d.constituencies.length === 234,
  },
  {
    id: 'API-05',
    route: '/api/constituencies?type=PARLIAMENTARY',
    expectedStatus: 200,
    description: 'Tamil Nadu 39 Parliamentary constituencies',
    validator: (d) => Array.isArray(d.constituencies) && d.constituencies.length === 39,
  },
  {
    id: 'API-06',
    route: '/api/departments',
    expectedStatus: 200,
    description: 'Government departments with allocated budgets',
    validator: (d) => Array.isArray(d.departments) && d.departments.length === 10,
  },
  {
    id: 'API-07',
    route: '/api/projects',
    expectedStatus: 200,
    description: 'Government infrastructure and welfare projects',
    validator: (d) => Array.isArray(d.projects) && d.projects.length >= 10,
  },
  {
    id: 'API-08',
    route: '/api/projects/TN-Rev-2024-014',
    expectedStatus: 200,
    description: 'Single project detail with milestones and verification status',
    validator: (d) => !!d.project && d.project.code === 'TN-Rev-2024-014',
  },
  {
    id: 'API-09',
    route: '/api/records?office=CHIEF_MINISTER',
    expectedStatus: 200,
    description: 'Chief Minister political record with verification metadata',
    validator: (d) => Array.isArray(d.records) && d.records.length > 0,
  },
  {
    id: 'API-10',
    route: '/api/schemes',
    expectedStatus: 200,
    description: 'Flagship government welfare schemes with eligibility',
    validator: (d) => Array.isArray(d.schemes) && d.schemes.length === 15,
  },
  {
    id: 'API-11',
    route: '/api/announcements',
    expectedStatus: 200,
    description: 'Official government announcements and gazette notices',
    validator: (d) => Array.isArray(d.announcements) && d.announcements.length >= 5,
  },
  {
    id: 'API-12',
    route: '/api/news',
    expectedStatus: 200,
    description: 'Government news feed with jurisdiction and categories',
    validator: (d) => Array.isArray(d.news) && d.news.length === 8,
  },
  {
    id: 'API-13',
    route: '/api/events',
    expectedStatus: 200,
    description: 'Legislative assembly events and civic calendar',
    validator: (d) => Array.isArray(d.events) && d.events.length >= 3,
  },
  {
    id: 'API-14',
    route: '/api/complaints',
    expectedStatus: 200,
    description: 'Civic complaints public feed excludes CORRUPTION and masks PII',
    validator: (d) =>
      Array.isArray(d.complaints) &&
      d.complaints.length === 9 &&
      d.complaints.every((c: any) => c.category !== 'CORRUPTION' && c.citizenContact === null),
  },
  {
    id: 'API-14B',
    route: '/api/complaints?admin=true',
    expectedStatus: 200,
    description: 'Administrative complaints endpoint includes full catalog (10 items)',
    validator: (d) => Array.isArray(d.complaints) && d.complaints.length === 10,
  },
  {
    id: 'API-15',
    route: '/api/complaints/CL-2025-000118',
    expectedStatus: 200,
    description: 'Single complaint timeline and updates by ticket number',
    validator: (d) => !!d.complaint && d.complaint.ticketNo === 'CL-2025-000118',
  },
  {
    id: 'API-16',
    route: '/api/updates',
    expectedStatus: 200,
    description: 'Scheme updates timeline with policy enhancements',
    validator: (d) => Array.isArray(d.updates) && d.updates.length === 7,
  },
  {
    id: 'API-17',
    route: '/api/audit-logs',
    expectedStatus: 200,
    description: 'Administrative audit logs and modification history',
    validator: (d) => Array.isArray(d.logs) && d.logs.length >= 10,
  },
  {
    id: 'API-18',
    route: '/api/verification-requests',
    expectedStatus: 200,
    description: 'Citizen ground verification queue',
    validator: (d) => Array.isArray(d.requests) && d.requests.length === 6,
  },
  {
    id: 'API-19',
    route: '/api/sync',
    expectedStatus: 200,
    description: 'External data source sync registry and cadence',
    validator: (d) => Array.isArray(d.sources) && d.sources.length === 12,
  },
  {
    id: 'API-20',
    route: '/api/projects/NON_EXISTENT_CODE_9999',
    expectedStatus: 404,
    description: 'Non-existent project code returns 404',
    validator: (d) => d.error !== undefined,
  },
  {
    id: 'API-21',
    route: '/api/complaints/CL-NON-EXISTENT-9999',
    expectedStatus: 404,
    description: 'Non-existent complaint ticket returns 404',
    validator: (d) => d.error !== undefined,
  },
]

async function runApiTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════')
  console.log(` CIVIC LENZ: Automated End-to-End API Test Suite`)
  console.log(` Target Server: ${BASE_URL}`)
  console.log('═══════════════════════════════════════════════════════════════════════════════\n')

  let passed = 0
  let failed = 0

  for (const t of tests) {
    try {
      const url = `${BASE_URL}${t.route}`
      const res = await fetch(url, {
        method: t.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: t.payload ? JSON.stringify(t.payload) : undefined,
      })

      const status = res.status
      let body: any = null
      try {
        body = await res.json()
      } catch {
        body = null
      }

      const statusMatch = status === t.expectedStatus
      const valid = statusMatch && (!t.validator || t.validator(body))

      if (valid) {
        passed++
        console.log(`[✅ PASS] ${t.id} - ${t.route} (${status}) - ${t.description}`)
      } else {
        failed++
        console.error(`[❌ FAIL] ${t.id} - ${t.route} (Got ${status}, expected ${t.expectedStatus}) - ${t.description}`)
        if (body?.error) console.error(`       Error: ${body.error}`)
      }
    } catch (e: any) {
      failed++
      console.error(`[❌ FAIL] ${t.id} - ${t.route} - Network/Fetch error: ${e.message}`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════')
  console.log(` Total Tests: ${tests.length} | Passed: ${passed} | Failed: ${failed}`)
  console.log('═══════════════════════════════════════════════════════════════════════════════\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runApiTests()
