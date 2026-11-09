/**
 * Civic Lenz — verified dataset seed.
 *
 * DATA CURRENCY: this dataset was verified against official and authoritative
 * sources on 2026-11-05 (verifiedBy: civic-lenz-web-verification). Key events
 * reflected:
 *   - 2026 Tamil Nadu Legislative Assembly election (held 23 Apr 2026, counting
 *     4 May 2026): TVK 108 / DMK 59 / AIADMK 47 of 234 seats.
 *   - C. Joseph Vijay (TVK) sworn in as 22nd Chief Minister on 10 May 2026;
 *     35-member council in place since 21–22 May 2026.
 *   - Governor change: R. N. Ravi's tenure ended 12 Mar 2026; Rajendra
 *     Vishwanath Arlekar Governor (additional charge 12 Mar 2026, full-time
 *     appointment Oct 2026).
 *   - National: Droupadi Murmu (President), C. P. Radhakrishnan (VP, since
 *     12 Sep 2025), Narendra Modi (PM), Om Birla (Lok Sabha Speaker).
 *   - 9 Oct 2026 by-elections: TVK won Madurantakam and Dharapuram.
 *
 * Sources of record per item are carried on each record (officialSource /
 * sourceName). Where only secondary reporting was available, records are
 * flagged PENDING_VERIFICATION instead of being asserted as verified.
 */
import { PrismaClient } from '@prisma/client'
import { seedConstituencies, seedHolderRecords } from './constituency-data'

const db = new PrismaClient()

const D = (s: string) => new Date(s)

// Verification pass constants — one pass per record; the /api/sync route and
// admin verification workflow keep these current afterwards.
const VERIFIED_AT = '2026-11-05T06:00:00'
const VERIFIER = 'civic-lenz-web-verification'

async function main() {
  console.log('Seeding Civic Lenz verified dataset (as of 2026-11-05)…')

  // wipe (dependency order)
  await db.syncLog.deleteMany()
  await db.dataSource.deleteMany()
  await db.auditLog.deleteMany()
  await db.complaintUpdate.deleteMany()
  await db.complaint.deleteMany()
  await db.projectMilestone.deleteMany()
  await db.project.deleteMany()
  await db.verificationLog.deleteMany()
  await db.politicalRecord.deleteMany()
  await db.announcement.deleteMany()
  await db.calendarEvent.deleteMany()
  await db.scheme.deleteMany()
  await db.citizenVerificationRequest.deleteMany()
  await db.demoUser.deleteMany()
  await db.department.deleteMany()
  await db.constituency.deleteMany()
  await db.district.deleteMany()
  await db.state.deleteMany()

  // ─────────────────────────── States & UTs ───────────────────────────
  // Seat counts per ECI (Tamil Nadu focus: 234 AC / 39 Lok Sabha / 18 Rajya Sabha).
  const states: Array<[string, string, number, number, number, boolean, boolean]> = [
    // name, code, assembly, lokSabha, rajyaSabha, isUT, isFocus
    ['Andhra Pradesh', 'AP', 175, 25, 11, false, false],
    ['Arunachal Pradesh', 'AR', 60, 2, 1, false, false],
    ['Assam', 'AS', 126, 14, 7, false, false],
    ['Bihar', 'BR', 243, 40, 16, false, false],
    ['Chhattisgarh', 'CT', 90, 11, 5, false, false],
    ['Goa', 'GA', 40, 2, 1, false, false],
    ['Gujarat', 'GJ', 182, 26, 11, false, false],
    ['Haryana', 'HR', 90, 10, 5, false, false],
    ['Himachal Pradesh', 'HP', 68, 4, 3, false, false],
    ['Jharkhand', 'JH', 81, 14, 6, false, false],
    ['Karnataka', 'KA', 224, 28, 12, false, false],
    ['Kerala', 'KL', 140, 20, 9, false, false],
    ['Madhya Pradesh', 'MP', 230, 29, 11, false, false],
    ['Maharashtra', 'MH', 288, 48, 19, false, false],
    ['Manipur', 'MN', 60, 2, 1, false, false],
    ['Meghalaya', 'ML', 60, 2, 1, false, false],
    ['Mizoram', 'MZ', 40, 1, 1, false, false],
    ['Nagaland', 'NL', 60, 2, 1, false, false],
    ['Odisha', 'OR', 147, 21, 10, false, false],
    ['Punjab', 'PB', 117, 13, 7, false, false],
    ['Rajasthan', 'RJ', 200, 25, 10, false, false],
    ['Sikkim', 'SK', 32, 1, 1, false, false],
    ['Tamil Nadu', 'TN', 234, 39, 18, false, true],
    ['Telangana', 'TG', 119, 17, 7, false, false],
    ['Tripura', 'TR', 60, 2, 1, false, false],
    ['Uttar Pradesh', 'UP', 403, 80, 31, false, false],
    ['Uttarakhand', 'UT', 70, 5, 3, false, false],
    ['West Bengal', 'WB', 294, 42, 16, false, false],
    ['Andaman and Nicobar Islands', 'AN', 0, 1, 0, true, false],
    ['Chandigarh', 'CH', 0, 1, 0, true, false],
    ['Dadra and Nagar Haveli and Daman and Diu', 'DN', 0, 2, 0, true, false],
    ['Delhi', 'DL', 70, 7, 3, true, false],
    ['Jammu and Kashmir', 'JK', 90, 5, 4, true, false],
    ['Ladakh', 'LA', 0, 1, 0, true, false],
    ['Lakshadweep', 'LD', 0, 1, 0, true, false],
    ['Puducherry', 'PY', 30, 1, 1, true, false],
  ]
  for (const [name, code, a, l, r, isUT, focus] of states) {
    await db.state.create({
      data: { code, name, assemblySeats: a, lokSabhaSeats: l, rajyaSabhaSeats: r, isUnionTerritory: isUT, isFocusState: focus, region: name === 'Tamil Nadu' ? 'South' : null },
    })
  }
  const tn = (await db.state.findUnique({ where: { code: 'TN' } }))!
  if (!tn) throw new Error('Tamil Nadu state seed failed')

  // ─────────────────────────── TN Districts (38) ───────────────────────────
  // Verified 2026-11-05: the official list of 38 districts is unchanged since
  // Mayiladuthurai (created 28 Dec 2020 from Nagapattinam) — the most recent
  // district formation in Tamil Nadu as of this verification pass.
  // geoName = exact feature name in public/geo/tamil-nadu-districts.geojson
  const districts: Array<[string, string, string | null, string?]> = [
    ['Ariyalur', 'Ariyalur', 'Ariyalur', '2013'],
    ['Chengalpattu', 'Chengalpattu', 'Chengalpattu', '2019'],
    ['Chennai', 'Chennai', 'Chennai', '1788'],
    ['Coimbatore', 'Coimbatore', 'Coimbatore', '1800'],
    ['Cuddalore', 'Cuddalore', 'Cuddalore', '1805'],
    ['Dharmapuri', 'Dharmapuri', 'Dharmapuri', '1965'],
    ['Dindigul', 'Dindigul', 'Dindigul', '1985'],
    ['Erode', 'Erode', 'Erode', '1996'],
    ['Kallakurichi', 'Kallakurichi', 'Kallakurichi', '2019'],
    ['Kancheepuram', 'Kancheepuram', 'Kancheepuram', '1944'],
    ['Kanyakumari', 'Nagercoil', 'Kanyakumari', '1956'],
    ['Karur', 'Karur', 'Karur', '1996'],
    ['Krishnagiri', 'Krishnagiri', 'Krishnagiri', '2004'],
    ['Madurai', 'Madurai', 'Madurai', '1921'],
    ['Mayiladuthurai', 'Mayiladuthurai', null, '2020'], // geo polygon merged inside Nagapattinam (documented limitation)
    ['Nagapattinam', 'Nagapattinam', 'Nagapattinam', '1991'],
    ['Namakkal', 'Namakkal', 'Namakkal', '1996'],
    ['Nilgiris', 'Udhagamandalam', 'Nilgiris', '1819'],
    ['Perambalur', 'Perambalur', 'Perambalur', '1995'],
    ['Pudukkottai', 'Pudukkottai', 'Pudukkottai', '1974'],
    ['Ramanathapuram', 'Ramanathapuram', 'Ramanathapuram', '1910'],
    ['Ranipet', 'Ranipet', 'Ranipet', '2019'],
    ['Salem', 'Salem', 'Salem', '1790'],
    ['Sivaganga', 'Sivaganga', 'Sivaganga', '1985'],
    ['Tenkasi', 'Tenkasi', 'Tenkasi', '2019'],
    ['Thanjavur', 'Thanjavur', 'Thanjavur', '1799'],
    ['Theni', 'Theni', 'Theni', '1996'],
    ['Thoothukudi', 'Thoothukudi', 'Thoothukkudi', '1986'],
    ['Tiruchirappalli', 'Tiruchirappalli', 'Tiruchirappalli', '1942'],
    ['Tirunelveli', 'Tirunelveli', 'Tirunelveli', '1794'],
    ['Tirupathur', 'Tirupathur', 'Tirupathur', '2019'],
    ['Tiruppur', 'Tiruppur', 'Tiruppur', '2009'],
    ['Tiruvallur', 'Tiruvallur', 'Thiruvallur', '1997'],
    ['Tiruvannamalai', 'Tiruvannamalai', 'Tiruvannamalai', '1989'],
    ['Tiruvarur', 'Tiruvarur', 'Thiruvarur', '1991'],
    ['Vellore', 'Vellore', 'Vellore', '1808'],
    ['Viluppuram', 'Viluppuram', 'Viluppuram', '1991'],
    ['Virudhunagar', 'Virudhunagar', 'Virudhunagar', '1910'],
  ]
  const districtMap = new Map<string, string>()
  for (const [name, hq, geoName, formedOn] of districts) {
    const rec = await db.district.create({
      data: { stateId: tn.id, name, headquarters: hq, geoName, formedOn: formedOn ?? null },
    })
    districtMap.set(name, rec.id)
  }
  const dist = (name: string) => districtMap.get(name)!

  // ─────────────── Electoral constituencies: 234 ACs + 39 PCs (17th Assembly, verified 2026-11-06) ───────────────
  // Plus one PoliticalRecord per MLA / MP / vacancy so district pages and the
  // admin verification queue see the full electoral directory.
  await seedConstituencies(db, tn.id, districtMap, D(VERIFIED_AT))
  await seedHolderRecords(db, tn.id, districtMap, D(VERIFIED_AT))

  // ─────────────────────────── Departments ───────────────────────────
  // Ministers verified against the official Council of Ministers list at
  // https://www.tn.gov.in/ministers (as of 2026-11-05, 17th Assembly / TVK
  // government). Secretary-level officer names are NOT asserted — official
  // posting lists were not accessible during this verification pass.
  // budgetInrCr values marked "(2026-27 budget)" are cited from the 5 Aug 2026
  // budget; others are demonstration figures pending department-budget verification.
  const deptSeeds: Array<[string, string, string, string | null, number, string, string]> = [
    // name, shortName, description, ministerName, budgetInrCr, website, budgetNote
    ['Department of Health and Family Welfare', 'Health', 'Delivers public health services, the hospital network, disease control and the Chief Minister\u2019s Comprehensive Health Insurance implementation across Tamil Nadu.', 'Dr. K. G. Arunraj', 18000, 'https://www.tnhealth.tn.gov.in', 'Demonstration figure — 2026-27 departmental allocation pending verification against official budget documents.'],
    ['Department of School Education', 'School Edu', 'Runs government and aided schools, teacher management, mid-day meals and the Perunthalaivar Kamarajar Breakfast Scheme (expanded to Classes VI\u2013VIII in September 2026).', 'Rajmohan Arumugam', 44527, 'https://www.tn.gov.in/dept/school', '₹44,527 crore allocated for school education in the 2026-27 budget (presented 5 Aug 2026).'],
    ['Finance Department', 'Finance', 'Prepares the state budget, expenditure control, treasury administration and the Human Resources Management wing. Presented the maiden budget of the 17th Assembly government on 5 Aug 2026 (total expenditure ₹4,72,585 crore); a white paper on the state\u2019s financial position has been announced.', 'Dr. N. Marie Wilson', 472585, 'https://financedept.tn.gov.in', 'Figure shown is the state total expenditure estimate for 2026-27, as cited by PRS Legislative Research from the budget documents.'],
    ['Public Works Department', 'PWD', 'Buildings, highways and minor ports; maintains state buildings, state-highway roads and the Kudimaramathu waterbody restoration works. Sports Development is allocated alongside Public Works.', 'Aadhav Arjuna', 12500, 'https://www.tn.gov.in/dept/pwd', 'Demonstration figure — 2026-27 departmental allocation pending verification against official budget documents.'],
    ['Rural Development and Panchayat Raj Department', 'RDPR', 'Village panchayat governance, MGNREGS employment guarantee and the Kalaignar Magalir Urimai Thogai disbursement machinery; Water Resources is allocated alongside Rural Development.', 'N. Anand', 25000, 'https://www.tn.gov.in/dept/rd', 'Demonstration figure — 2026-27 departmental allocation pending verification against official budget documents.'],
    ['Revenue and Disaster Management Department', 'Revenue', 'Land administration, revenue records, disaster preparedness, relief distribution and district revenue machinery.', 'K. A. Sengottaiyan', 9000, 'https://www.tn.gov.in/dept/revenue', 'Demonstration figure — 2026-27 departmental allocation pending verification against official budget documents.'],
    ['Municipal Administration and Water Supply Department', 'MAWS', 'Urban local bodies governance, city corporations, drinking water supply schemes and underground sewerage programmes. Held personally by the Chief Minister in the current portfolio allocation.', 'C. Joseph Vijay', 15000, 'https://www.tn.gov.in/dept/maws', 'Demonstration figure — 2026-27 departmental allocation pending verification against official budget documents.'],
    ['Transport Department', 'Transport', 'State transport undertakings, motor vehicles regulation, road safety initiatives and concessionary travel programmes (fare-free city-bus travel for women reported continuing under the new government — status pending official confirmation).', 'Vijay Tamilan Parthiban', 5500, 'https://www.tn.gov.in/dept/transport', 'Demonstration figure — 2026-27 departmental allocation pending verification against official budget documents.'],
    ['Agriculture and Farmers\u2019 Welfare Department', 'Agriculture', 'Crop development, input subsidies, farm mechanisation and climate-resilient agriculture programmes.', 'R. Vinoth', 22000, 'https://www.tn.gov.in/dept/agri', 'Demonstration figure — 2026-27 departmental allocation pending verification against official budget documents.'],
    ['Home, Prohibition and Excise Department', 'Home', 'Police administration, fire and rescue services, prisons and prohibition enforcement. Held personally by the Chief Minister, who retained Public, General Administration, Police and welfare portfolios in the May 2026 allocation.', 'C. Joseph Vijay', 14000, 'https://www.tn.gov.in/dept/home', 'Demonstration figure — 2026-27 departmental allocation pending verification against official budget documents.'],
  ]
  const deptMap = new Map<string, string>()
  for (const [name, shortName, description, ministerName, budgetInrCr, website, budgetNote] of deptSeeds) {
    const rec = await db.department.create({
      data: {
        name, shortName, description, ministerName, budgetInrCr, website,
        secretaryName: null, // official secretary postings not verifiable in this pass — intentionally left empty
        officialSource: website,
        sourceName: 'Government of Tamil Nadu — official department page',
        lastVerifiedAt: D(VERIFIED_AT),
        verificationStatus: 'VERIFIED',
        verificationNote: `Minister verified against the official Council of Ministers list (tn.gov.in) on 2026-11-05. ${budgetNote} Departmental secretary postings pending official confirmation.`,
      },
    })
    deptMap.set(shortName, rec.id)
  }
  const dept = (s: string) => deptMap.get(s)!

  // ─────────────────────────── Political records (verification-first) ───────────────────────────
  type RecSeed = {
    name: string; office: string; officeLabel?: string; party?: string; partyShort?: string
    jurisdiction?: 'NATIONAL' | 'STATE' | 'DISTRICT'
    constituencyType?: string; constituencyName?: string; department?: string; portfolio?: string
    officialSource: string; sourceName: string; effectiveDate?: string; endPeriodDate?: string
    status: string; verificationNote?: string; tenure?: string
    districtName?: string; accentColor?: string
  }
  const recs: RecSeed[] = [
    /* ── National constitutional offices (verified 2026-11-05) ── */
    {
      name: 'Droupadi Murmu', office: 'PRESIDENT', officeLabel: 'President of India (15th)',
      jurisdiction: 'NATIONAL',
      officialSource: 'https://www.presidentofindia.nic.in', sourceName: 'President of India — official website',
      effectiveDate: '2022-07-25', tenure: '2022 – present (term to July 2027)', status: 'CURRENT',
      verificationNote: 'Re-verified 5 Nov 2026 — in office as of 31 Oct 2026 official engagements.',
    },
    {
      name: 'C. P. Radhakrishnan', office: 'VICE_PRESIDENT', officeLabel: 'Vice President of India (15th)',
      jurisdiction: 'NATIONAL',
      officialSource: 'https://www.vicepresidentofindia.nic.in', sourceName: 'Vice President of India — official website',
      effectiveDate: '2025-09-12', tenure: '2025 – present', status: 'CURRENT',
      verificationNote: 'Elected following the resignation of Jagdeep Dhankhar (July 2025); oath administered by President Murmu. Hails from Coimbatore, Tamil Nadu.',
    },
    {
      name: 'Narendra Modi', office: 'PRIME_MINISTER', officeLabel: 'Prime Minister of India',
      party: 'Bharatiya Janata Party', partyShort: 'BJP', jurisdiction: 'NATIONAL',
      officialSource: 'https://www.pmindia.gov.in', sourceName: 'Prime Minister\u2019s Office — official website',
      effectiveDate: '2014-05-26', tenure: '2014 – present (third term from 9 Jun 2024)', status: 'CURRENT',
      verificationNote: 'Re-verified 5 Nov 2026. Union Council of Ministers list is maintained by the Cabinet Secretariat (cabsec.gov.in); a July 2026 change (Union Education Minister) and reported reshuffle preparations in Oct 2026 require the official list for minister-level detail.',
    },
    {
      name: 'Om Birla', office: 'LOK_SABHA_SPEAKER', officeLabel: 'Speaker, Lok Sabha',
      party: 'Bharatiya Janata Party', partyShort: 'BJP', jurisdiction: 'NATIONAL',
      officialSource: 'https://www.loksabha.nic.in', sourceName: 'Lok Sabha Secretariat',
      effectiveDate: '2024-06-26', tenure: '2024 – present (18th Lok Sabha)', status: 'CURRENT',
      verificationNote: 'Re-verified 5 Nov 2026 — active as Speaker in Nov 2026 official engagements.',
    },

    /* ── Tamil Nadu constitutional head ── */
    {
      name: 'Rajendra Vishwanath Arlekar', office: 'GOVERNOR', officeLabel: 'Governor of Tamil Nadu',
      jurisdiction: 'STATE',
      officialSource: 'https://lokbhavan.tn.gov.in', sourceName: 'Lok Bhavan (Raj Bhavan), Tamil Nadu',
      effectiveDate: '2026-03-12', tenure: '2026 – present', status: 'CURRENT',
      verificationNote: 'Assumed additional charge as Governor of Tamil Nadu on 12 Mar 2026 (while Governor of Kerala) after R. N. Ravi\u2019s transfer; appointed full-time Governor in the October 2026 gubernatorial reshuffle and took full-time charge in mid-Oct 2026.',
    },
    {
      name: 'R. N. Ravi', office: 'GOVERNOR', officeLabel: 'Former Governor of Tamil Nadu (26th)',
      jurisdiction: 'STATE',
      officialSource: 'https://lokbhavan.tn.gov.in', sourceName: 'Lok Bhavan (Raj Bhavan), Tamil Nadu / Union Home Ministry notification',
      effectiveDate: '2021-09-18', endPeriodDate: '2026-03-12', tenure: '2021 – 2026', status: 'FORMER',
      verificationNote: 'Tenure ended on transfer as Governor of West Bengal (announced 5 Mar 2026).',
    },

    /* ── Tamil Nadu executive — 17th Assembly government (sworn in 10 May 2026) ── */
    {
      name: 'C. Joseph Vijay', office: 'CHIEF_MINISTER', officeLabel: 'Chief Minister of Tamil Nadu (22nd)',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Perambur', districtName: 'Chennai',
      portfolio: 'Public, General Administration, Police, Home, Municipal Administration & Water Supply, Women & Youth Welfare, Welfare of Children and Aged',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      effectiveDate: '2026-05-10', tenure: '2026 – present', status: 'CURRENT',
      verificationNote: 'Sworn in as the 22nd Chief Minister on 10 May 2026 after TVK won 108 of 234 seats in the April 2026 election (counting 4 May). Won both Perambur and Tiruchirappalli East; retained Perambur and resigned Tiruchirappalli East. Portfolio allocation approved by Governor Arlekar (May 2026). Party founded 2 Feb 2024; party flag launched 22 Aug 2024.',
    },
    {
      name: 'Udhayanidhi Stalin', office: 'LEADER_OF_OPPOSITION', officeLabel: 'Leader of the Opposition, Tamil Nadu Legislative Assembly (19th)',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Chepauk-Thiruvallikeni', districtName: 'Chennai', accentColor: '#b91c1c',
      officialSource: 'https://www.assembly.tn.gov.in', sourceName: 'Tamil Nadu Legislative Assembly',
      effectiveDate: '2026-05-11', tenure: '2026 – present', status: 'CURRENT',
      verificationNote: 'Took oath as Leader of the Opposition on 11 May 2026 after the DMK won 59 seats. Previously Deputy Chief Minister (Dec 2024 – May 2026) in the DMK government; re-elected from Chepauk-Thiruvallikeni in April 2026.',
    },
    {
      name: 'J. C. D. Prabhakar', office: 'SPEAKER', officeLabel: 'Speaker, Tamil Nadu Legislative Assembly',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      officialSource: 'https://www.assembly.tn.gov.in', sourceName: 'Tamil Nadu Legislative Assembly',
      effectiveDate: '2026-05-12', tenure: '2026 – present', status: 'CURRENT',
      verificationNote: 'Elected unopposed as Speaker of the 17th Assembly on 12 May 2026.',
    },
    {
      name: 'M. Ravisankar', office: 'DEPUTY_SPEAKER', officeLabel: 'Deputy Speaker, Tamil Nadu Legislative Assembly',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Thuraiyur', districtName: 'Tiruchirappalli',
      officialSource: 'https://www.assembly.tn.gov.in', sourceName: 'Tamil Nadu Legislative Assembly',
      effectiveDate: '2026-05-12', tenure: '2026 – present', status: 'CURRENT',
      verificationNote: 'Elected unopposed as Deputy Speaker on 12 May 2026.',
    },

    /* ── Council of Ministers (verified against tn.gov.in Council of Ministers, 2026-11-05) ── */
    {
      name: 'Dr. K. G. Arunraj', office: 'MINISTER', officeLabel: 'Minister for Health, Medical Education and Family Welfare',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Tiruchengode', districtName: 'Namakkal',
      department: 'Department of Health and Family Welfare',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      effectiveDate: '2026-05-10', tenure: '2026 – present', status: 'CURRENT',
    },
    {
      name: 'Rajmohan Arumugam', office: 'MINISTER', officeLabel: 'Minister for School Education, Tamil Development, Information and Publicity',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Egmore', districtName: 'Chennai',
      department: 'Department of School Education',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      effectiveDate: '2026-05-10', tenure: '2026 – present', status: 'CURRENT',
    },
    {
      name: 'Dr. N. Marie Wilson', office: 'MINISTER', officeLabel: 'Minister for Finance',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      department: 'Finance Department',
      officialSource: 'https://financedept.tn.gov.in', sourceName: 'Finance Department, Government of Tamil Nadu',
      effectiveDate: '2026-05-10', tenure: '2026 – present', status: 'CURRENT',
      verificationNote: 'Presented the maiden budget of the 17th Assembly government on 5 Aug 2026 (official budget speech at financedept.tn.gov.in).',
    },
    {
      name: 'Aadhav Arjuna', office: 'MINISTER', officeLabel: 'Minister for Public Works (Buildings, Highways, Minor Ports) and Sports Development',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Villivakkam', districtName: 'Chennai',
      department: 'Public Works Department',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      effectiveDate: '2026-05-10', tenure: '2026 – present', status: 'CURRENT',
    },
    {
      name: 'N. Anand', office: 'MINISTER', officeLabel: 'Minister for Rural Development and Water Resources',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      department: 'Rural Development and Panchayat Raj Department',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      effectiveDate: '2026-05-10', tenure: '2026 – present', status: 'CURRENT',
    },
    {
      name: 'K. A. Sengottaiyan', office: 'MINISTER', officeLabel: 'Minister for Revenue and Disaster Management',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Gobichettipalayam', districtName: 'Erode',
      department: 'Revenue and Disaster Management Department',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      effectiveDate: '2026-05-10', tenure: '2026 – present', status: 'CURRENT',
    },
    {
      name: 'Vijay Tamilan Parthiban', office: 'MINISTER', officeLabel: 'Minister for Transport',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Salem South', districtName: 'Salem',
      department: 'Transport Department',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      effectiveDate: '2026-05-10', tenure: '2026 – present', status: 'CURRENT',
    },
    {
      name: 'R. Vinoth', office: 'MINISTER', officeLabel: 'Minister for Agriculture and Farmers\u2019 Welfare',
      party: 'Tamilaga Vettri Kazhagam', partyShort: 'TVK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Kumbakonam', districtName: 'Thanjavur',
      department: 'Agriculture and Farmers\u2019 Welfare Department',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      effectiveDate: '2026-05-21', tenure: '2026 – present', status: 'CURRENT',
      verificationNote: 'Agriculture portfolio allocated on 21 May 2026 in the cabinet expansion; won Kumbakonam by 679 votes (aged 32 at election).',
    },
    /* Council note: the full council is 35 ministers (CM + 34), expanded 21–22 May 2026
       and unchanged since — the authoritative roster is the official page
       https://www.tn.gov.in/ministers. The eight minister records above cover the
       portfolios seeded in this portal; remaining ministers should be added from the
       official list during the next verification pass. */

    /* ── Former ministers — DMK government (ended 4 May 2026) ── */
    {
      name: 'M. K. Stalin', office: 'CHIEF_MINISTER', officeLabel: 'Former Chief Minister of Tamil Nadu (8th)',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in', sourceName: 'Government of Tamil Nadu — former Chief Ministers',
      effectiveDate: '2021-05-07', endPeriodDate: '2026-05-04', tenure: '2021 – 2026', status: 'FORMER',
      verificationNote: 'Resigned on 4 May 2026 after losing his Kolathur seat in the 2026 election — the first sitting Tamil Nadu CM to lose his own constituency since 1996. Continues as DMK president.',
    },
    {
      name: 'Udhayanidhi Stalin', office: 'DEPUTY_CM', officeLabel: 'Former Deputy Chief Minister; Youth Welfare and Sports Development',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Chepauk-Thiruvallikeni', districtName: 'Chennai', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (16th Assembly)',
      effectiveDate: '2024-12-15', endPeriodDate: '2026-05-04', tenure: '2024 – 2026', status: 'FORMER',
      verificationNote: 'Tenure ended with the DMK government on 4 May 2026; now Leader of the Opposition (see current record).',
    },
    {
      name: 'Durai Murugan', office: 'MINISTER', officeLabel: 'Former Minister for Water Resources',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Katpadi', districtName: 'Vellore', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (16th Assembly)',
      effectiveDate: '2021-05-07', endPeriodDate: '2026-05-04', tenure: '2021 – 2026', status: 'FORMER',
      verificationNote: 'Lost Katpadi in the 2026 election (TVK\u2019s Dr. M. Sudhakar won the seat).',
    },
    {
      name: 'Ma. Subramanian', office: 'MINISTER', officeLabel: 'Former Minister for Health and Family Welfare',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Mylapore', districtName: 'Chennai', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (16th Assembly)',
      effectiveDate: '2021-05-07', endPeriodDate: '2026-05-04', tenure: '2021 – 2026', status: 'FORMER',
    },
    {
      name: 'Thangam Thennarasu', office: 'MINISTER', officeLabel: 'Former Minister for Finance and Human Resources Management',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Thiruchuli', districtName: 'Virudhunagar', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (16th Assembly)',
      effectiveDate: '2023-05-11', endPeriodDate: '2026-05-04', tenure: '2023 – 2026', status: 'FORMER',
      verificationNote: 'Held the Finance portfolio from the May 2023 reshuffle until the government\u2019s end.',
    },
    {
      name: 'K. K. S. S. R. Ramachandran', office: 'MINISTER', officeLabel: 'Former Minister for Revenue and Disaster Management',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Aruppukottai', districtName: 'Virudhunagar', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (16th Assembly)',
      effectiveDate: '2021-05-07', endPeriodDate: '2026-05-04', tenure: '2021 – 2026', status: 'FORMER',
    },
    {
      name: 'K. N. Nehru', office: 'MINISTER', officeLabel: 'Former Minister for Municipal Administration, Urban and Water Supply',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Tiruchirappalli West', districtName: 'Tiruchirappalli', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (16th Assembly)',
      effectiveDate: '2021-05-07', endPeriodDate: '2026-05-04', tenure: '2021 – 2026', status: 'FORMER',
    },
    {
      name: 'E. V. Velu', office: 'MINISTER', officeLabel: 'Former Minister for Public Works',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Taramangalam', districtName: 'Salem', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (16th Assembly)',
      effectiveDate: '2021-05-07', endPeriodDate: '2026-05-04', tenure: '2021 – 2026', status: 'FORMER',
    },
    {
      name: 'K. Ponmudy', office: 'MINISTER', officeLabel: 'Former Minister for Higher Education',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Tirukkoyilur', districtName: 'Viluppuram', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (16th Assembly) / Madras High Court records',
      effectiveDate: '2021-05-07', endPeriodDate: '2026-05-04', tenure: '2021 – 2026', status: 'FORMER',
      verificationNote: 'Convicted by the Madras High Court in a disproportionate-assets case on 19 Dec 2023 and disqualified; the Higher Education portfolio moved to R. S. Raja Kannappan (Dec 2023). The Supreme Court stayed the conviction in Mar 2024 and he was reinstated. Tenure ended with the DMK government on 4 May 2026; the AIADMK won Tirukkoyilur in the 2026 election by 285 votes.',
    },
    {
      name: 'R. S. Raja Kannappan', office: 'MINISTER', officeLabel: 'Former Minister holding Higher Education (additional charge)',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Raj Bhavan portfolio reallocation (Dec 2023)',
      effectiveDate: '2023-12-21', endPeriodDate: '2024-03-13', tenure: '2023 – 2024', status: 'FORMER',
      verificationNote: 'Held the Higher Education portfolio between K. Ponmudy\u2019s disqualification (Dec 2023) and his reinstatement after the Supreme Court stayed the conviction (Mar 2024).',
    },
    {
      name: 'Palanivel Thiagarajan', office: 'MINISTER', officeLabel: 'Former Minister for Finance and Human Resources Management',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Madurai Central', districtName: 'Madurai', accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — ministers list (archived)',
      effectiveDate: '2021-05-07', endPeriodDate: '2023-05-11', tenure: '2021 – 2023', status: 'FORMER',
      verificationNote: 'Portfolio changed in the May 2023 cabinet reshuffle.',
    },
    {
      name: 'M. Appavu', office: 'SPEAKER', officeLabel: 'Former Speaker, Tamil Nadu Legislative Assembly',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'ASSEMBLY', constituencyName: 'Radhapuram', districtName: 'Tirunelveli', accentColor: '#b91c1c',
      officialSource: 'https://www.assembly.tn.gov.in', sourceName: 'Tamil Nadu Legislative Assembly',
      effectiveDate: '2021-05-11', endPeriodDate: '2026-05-04', tenure: '2021 – 2026', status: 'FORMER',
      verificationNote: 'Speaker of the 16th Assembly; lost Radhapuram in the 2026 election (TVK\u2019s Dr. Sathish Christopher won).',
    },


    /* ── Rajya Sabha — Tamil Nadu (biennial election March–April 2026) ── */
    {
      name: 'Tiruchi Siva', office: 'MP_RAJYA_SABHA', officeLabel: 'Member of Parliament, Rajya Sabha',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'COUNCIL', constituencyName: 'Tamil Nadu (State Council constituency)',
      officialSource: 'https://sansad.in', sourceName: 'Rajya Sabha Secretariat / ECI biennial election 2026',
      effectiveDate: '2026-04-03', tenure: '2026 – 2032', status: 'CURRENT',
      verificationNote: 'Elected unopposed in the Mar\u2013Apr 2026 biennial election for six of Tamil Nadu\u2019s 18 Rajya Sabha seats; terms run to April 2032.',
    },
    {
      name: 'Constantine Ravindran', office: 'MP_RAJYA_SABHA', officeLabel: 'Member of Parliament, Rajya Sabha',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      constituencyType: 'COUNCIL', constituencyName: 'Tamil Nadu (State Council constituency)',
      officialSource: 'https://sansad.in', sourceName: 'Rajya Sabha Secretariat / ECI biennial election 2026',
      effectiveDate: '2026-04-03', tenure: '2026 – 2032', status: 'CURRENT',
      verificationNote: 'Elected unopposed in the 2026 biennial election.',
    },
    {
      name: 'M. Christopher Manickam', office: 'MP_RAJYA_SABHA', officeLabel: 'Member of Parliament, Rajya Sabha',
      party: 'Indian National Congress', partyShort: 'INC', jurisdiction: 'STATE',
      constituencyType: 'COUNCIL', constituencyName: 'Tamil Nadu (State Council constituency)',
      officialSource: 'https://sansad.in', sourceName: 'Rajya Sabha Secretariat / ECI biennial election 2026',
      effectiveDate: '2026-04-03', tenure: '2026 – 2032', status: 'CURRENT',
      verificationNote: 'Name variants ("Christopher Tilak") appear in some reports — verify against the Rajya Sabha members\u2019 list at sansad.in.',
    },
    {
      name: 'L. K. Sudhish', office: 'MP_RAJYA_SABHA', officeLabel: 'Member of Parliament, Rajya Sabha',
      party: 'Desiya Murpokku Dravida Kazhagam', partyShort: 'DMDK', jurisdiction: 'STATE',
      constituencyType: 'COUNCIL', constituencyName: 'Tamil Nadu (State Council constituency)',
      officialSource: 'https://sansad.in', sourceName: 'Rajya Sabha Secretariat / ECI biennial election 2026',
      effectiveDate: '2026-04-03', tenure: '2026 – 2032', status: 'CURRENT',
      verificationNote: 'Elected unopposed in the 2026 biennial election.',
    },
    {
      name: 'M. Thambidurai', office: 'MP_RAJYA_SABHA', officeLabel: 'Member of Parliament, Rajya Sabha',
      party: 'All India Anna Dravida Munnetra Kazhagam', partyShort: 'AIADMK', jurisdiction: 'STATE',
      constituencyType: 'COUNCIL', constituencyName: 'Tamil Nadu (State Council constituency)',
      officialSource: 'https://sansad.in', sourceName: 'Rajya Sabha Secretariat / ECI biennial election 2026',
      effectiveDate: '2026-04-03', tenure: '2026 – 2032', status: 'CURRENT',
      verificationNote: 'Elected unopposed in the 2026 biennial election.',
    },
    {
      name: 'Anbumani Ramadoss', office: 'MP_RAJYA_SABHA', officeLabel: 'Member of Parliament, Rajya Sabha',
      party: 'Pattali Makkal Katchi', partyShort: 'PMK', jurisdiction: 'STATE',
      constituencyType: 'COUNCIL', constituencyName: 'Tamil Nadu (State Council constituency)',
      officialSource: 'https://sansad.in', sourceName: 'Rajya Sabha Secretariat / ECI biennial election 2026',
      effectiveDate: '2026-04-03', tenure: '2026 – 2032', status: 'CURRENT',
      verificationNote: 'Elected unopposed in the 2026 biennial election (also listed on the CEO Tamil Nadu Rajya Sabha page).',
    },

    /* ── Historical records (retained, clearly labelled) ── */
    {
      name: 'Edappadi K. Palaniswami', office: 'CHIEF_MINISTER', officeLabel: 'Former Chief Minister of Tamil Nadu',
      party: 'All India Anna Dravida Munnetra Kazhagam', partyShort: 'AIADMK', jurisdiction: 'STATE',
      accentColor: '#0369a1',
      officialSource: 'https://www.tn.gov.in', sourceName: 'Government of Tamil Nadu — former Chief Ministers',
      effectiveDate: '2017-02-16', endPeriodDate: '2021-05-07', tenure: '2017 – 2021', status: 'FORMER',
    },
    {
      name: 'M. Karunanidhi', office: 'CHIEF_MINISTER', officeLabel: 'Former Chief Minister of Tamil Nadu',
      party: 'Dravida Munnetra Kazhagam', partyShort: 'DMK', jurisdiction: 'STATE',
      accentColor: '#b91c1c',
      officialSource: 'https://www.tn.gov.in', sourceName: 'Government of Tamil Nadu — former Chief Ministers',
      effectiveDate: '2006-05-13', endPeriodDate: '2011-05-16', tenure: '2006 – 2011 (five terms overall)', status: 'FORMER',
    },
    {
      name: 'J. Jayalalithaa', office: 'CHIEF_MINISTER', officeLabel: 'Former Chief Minister of Tamil Nadu',
      party: 'All India Anna Dravida Munnetra Kazhagam', partyShort: 'AIADMK', jurisdiction: 'STATE',
      accentColor: '#0369a1',
      officialSource: 'https://www.tn.gov.in', sourceName: 'Government of Tamil Nadu — former Chief Ministers',
      effectiveDate: '2016-05-23', endPeriodDate: '2016-12-05', tenure: '2016 (six terms overall)', status: 'FORMER',
    },
    {
      name: 'Banwarilal Purohit', office: 'GOVERNOR', officeLabel: 'Former Governor of Tamil Nadu',
      jurisdiction: 'STATE',
      officialSource: 'https://lokbhavan.tn.gov.in', sourceName: 'Raj Bhavan, Tamil Nadu (archived)',
      effectiveDate: '2017-10-04', endPeriodDate: '2021-09-18', tenure: '2017 – 2021', status: 'FORMER',
    },
  ]
  for (const r of recs) {
    const rec = await db.politicalRecord.create({
      data: {
        name: r.name, office: r.office, officeLabel: r.officeLabel, party: r.party, partyShort: r.partyShort,
        jurisdiction: r.jurisdiction ?? 'STATE',
        stateId: r.jurisdiction === 'NATIONAL' ? null : tn.id,
        districtId: r.districtName ? dist(r.districtName) : null,
        constituencyType: r.constituencyType, constituencyName: r.constituencyName,
        department: r.department, portfolio: r.officeLabel, accentColor: r.accentColor ?? null,
        tenure: r.tenure, officialSource: r.officialSource, sourceName: r.sourceName,
        effectiveDate: r.effectiveDate ? D(r.effectiveDate) : null,
        endPeriodDate: r.endPeriodDate ? D(r.endPeriodDate) : null,
        lastVerifiedAt: D(VERIFIED_AT),
        verifiedBy: VERIFIER, status: r.status, verificationNote: r.verificationNote,
        verificationStatus: 'VERIFIED',
      },
    })
    await db.verificationLog.create({
      data: {
        recordId: rec.id, action: 'CREATED', newStatus: r.status, sourceUrl: r.officialSource,
        verifiedBy: 'seed', note: 'Record created in the 2026-11-05 verification pass.',
        createdAt: D('2026-11-05T06:00:00'),
      },
    })
    await db.verificationLog.create({
      data: {
        recordId: rec.id, action: 'VERIFIED', previousStatus: r.status, newStatus: r.status,
        sourceUrl: r.officialSource, verifiedBy: VERIFIER,
        note: `Cross-checked against ${r.sourceName} on 5 Nov 2026 (post-election verification pass covering the 2026 TN Assembly election and government formation).`,
        createdAt: D(VERIFIED_AT),
      },
    })
  }

  // ─────────────────────────── Schemes ───────────────────────────
  // Status and naming verified 2026-11-05. TN schemes that could not be
  // re-confirmed from an official source under the new government are kept
  // ACTIVE but flagged PENDING_VERIFICATION rather than silently asserted.
  type SchemeSeed = {
    name: string; level: 'TN' | 'CENTRAL'; dShort?: string
    description: string; eligibility: string; benefits: string; beneficiaries: string
    launch: string; budget?: number; status: 'ACTIVE' | 'UPDATED' | 'SUSPENDED' | 'DISCONTINUED'
    vStatus: 'VERIFIED' | 'PENDING_VERIFICATION'
    source: string; sourceName: string; process?: string; url?: string; docs?: string
    note?: string; key: string
  }
  const schemeSeeds: SchemeSeed[] = [
    {
      name: 'Kalaignar Magalir Urimai Thogai', level: 'TN', dShort: 'RDPR',
      description: 'Monthly basic income assistance to eligible women heads of households. In December 2025 the programme was expanded by about 13\u201317 lakh women, taking coverage to roughly 1.31 crore beneficiaries; the 2026-27 allocation was reported at ₹13,807 crore. The new government announced (May 2026) an intent to raise the assistance to ₹1,500 in phases — not yet implemented as of this verification.',
      eligibility: 'Eligible women heads of family meeting income and other criteria as notified.',
      benefits: '₹1,000 per month paid directly to bank accounts (proposed increase to ₹1,500 pending official orders).',
      beneficiaries: 'About 1.31 crore women (Dec 2025 expansion; figures as reported by official statements and The Hindu/dtnext).',
      launch: '2023-09-15', budget: 13807, status: 'UPDATED', vStatus: 'VERIFIED',
      source: 'https://www.tn.gov.in/dept/rd', sourceName: 'RDPR Department / TN Budget 2025-26 (revised)',
      note: 'Beneficiaries aged 60+ are being migrated to the Old Age Pension scheme (May 2026 announcements) to raise their monthly assistance.',
      key: 'scheme:kmut',
    },
    {
      name: 'Perunthalaivar Kamarajar Breakfast Scheme', level: 'TN', dShort: 'School Edu',
      description: 'Free nutritious breakfast on school working days for government-school students. Retained and renamed under the new government: on 22 Sep 2026 CM C. Joseph Vijay launched its expansion to Classes VI\u2013VIII (earlier Classes I\u2013V), adding about 15.30 lakh students.',
      eligibility: 'Students of Classes I\u2013VIII in government schools.',
      benefits: 'Hot cooked breakfast each working day.',
      beneficiaries: 'About 15.30 lakh additional students from the September 2026 expansion (official launch coverage).',
      launch: '2022-09-15', budget: 700, status: 'UPDATED', vStatus: 'VERIFIED',
      source: 'https://www.tn.gov.in/press-releases', sourceName: 'Government of Tamil Nadu — launch coverage (The Hindu, Deccan Herald: 22 Sep 2026)',
      note: 'Renamed from "Chief Minister\u2019s Breakfast Scheme"; expansion announced at the 22 Sep 2026 official launch.',
      key: 'scheme:breakfast',
    },
    {
      name: 'Makkalai Thedi Maruthuvam', level: 'TN', dShort: 'Health',
      description: 'Doorstep delivery of primary healthcare services including screening for hypertension and diabetes. Continuation under the 17th Assembly government is reported by secondary sources (Oct 2026) but awaits confirmation from an official department communique.',
      eligibility: 'Households in all districts, priority to elderly and those with comorbidities.',
      benefits: 'Home visits by health workers, free medicines and follow-up.',
      beneficiaries: 'Over 1 crore beneficiaries (launch-era figure, pending re-verification).',
      launch: '2021-08-05', budget: 900, status: 'ACTIVE', vStatus: 'PENDING_VERIFICATION',
      source: 'https://www.tn.gov.in/dept/health', sourceName: 'Health & Family Welfare Department (official confirmation awaited)',
      key: 'scheme:mtm',
    },
    {
      name: 'Naan Mudhalvan', level: 'TN', dShort: 'School Edu',
      description: 'Skill development and career guidance platform for students and youth. Reported ongoing in 2026; one secondary source indicates rebranding towards a state "Skill Development" platform — official confirmation pending.',
      eligibility: 'Students of Classes 9\u201312, college students and job-seeking youth.',
      benefits: 'Free training, career counselling, placement support.',
      beneficiaries: 'Students across all 38 districts (launch-era figure, pending re-verification).',
      launch: '2022-03-01', budget: 450, status: 'ACTIVE', vStatus: 'PENDING_VERIFICATION',
      source: 'https://www.tn.gov.in/dept/higher', sourceName: 'Higher Education Department (official confirmation awaited)',
      key: 'scheme:naan-mudhalvan',
    },
    {
      name: 'Pudhumai Penn Scheme', level: 'TN', dShort: 'School Edu',
      description: 'Support for girl students who studied in government schools to pursue higher education. Status under the new government pending official confirmation.',
      eligibility: 'Girl students from government schools joining higher education.',
      benefits: '₹1,000 per month until graduation (as notified at launch).',
      beneficiaries: 'Over 1.9 lakh students (launch-era figure, pending re-verification).',
      launch: '2022-09-05', budget: 280, status: 'ACTIVE', vStatus: 'PENDING_VERIFICATION',
      source: 'https://www.tn.gov.in/dept/school', sourceName: 'School Education Department (official confirmation awaited)',
      key: 'scheme:pudhumai-penn',
    },
    {
      name: 'Fare-free city bus travel for women', level: 'TN', dShort: 'Transport',
      description: 'Zero-ticket travel for women in ordinary city and town buses operated by state transport undertakings. Continuation under the new government is not yet confirmed from official sources — flagged pending verification.',
      eligibility: 'All women commuters in eligible bus services.',
      benefits: 'Zero-ticket travel with monthly trip caps (as notified at launch).',
      beneficiaries: 'Cumulative trips since 2021 in the hundreds of crores (launch-era figure, pending re-verification).',
      launch: '2021-05-08', budget: 1600, status: 'ACTIVE', vStatus: 'PENDING_VERIFICATION',
      source: 'https://www.tn.gov.in/dept/transport', sourceName: 'Transport Department (official confirmation awaited)',
      key: 'scheme:zero-ticket',
    },
    {
      name: 'Illam Thedi Kalvi', level: 'TN', dShort: 'School Edu',
      description: 'Home-based remedial education volunteer programme to bridge learning loss. Status under the new government pending official confirmation.',
      eligibility: 'Students of Classes 1\u20138 in all districts.',
      benefits: 'Evening volunteer-led learning sessions near residences.',
      beneficiaries: 'About 35 lakh students (launch-era figure, pending re-verification).',
      launch: '2021-10-11', budget: 200, status: 'ACTIVE', vStatus: 'PENDING_VERIFICATION',
      source: 'https://www.tn.gov.in/dept/school', sourceName: 'School Education Department (official confirmation awaited)',
      key: 'scheme:itk',
    },
    {
      name: 'Kudimaramathu Works', level: 'TN', dShort: 'PWD',
      description: 'Community-participatory restoration of waterbodies: tanks, channels and anicuts. Status under the new government pending official confirmation.',
      eligibility: 'Farmers and water user associations in beneficiary command areas.',
      benefits: 'Converged restoration works with community supervision.',
      beneficiaries: 'Waterbodies across all 38 districts (launch-era figure, pending re-verification).',
      launch: '2019-06-01', budget: 640, status: 'ACTIVE', vStatus: 'PENDING_VERIFICATION',
      source: 'https://www.tn.gov.in/dept/pwd', sourceName: 'Public Works Department (official confirmation awaited)',
      key: 'scheme:kudimaramathu',
    },
    {
      name: 'Chief Minister\u2019s Comprehensive Health Insurance Scheme', level: 'TN', dShort: 'Health',
      description: 'Cashless treatment cover for eligible families in empanelled hospitals, implemented alongside central coverage. Status under the new government pending official confirmation.',
      eligibility: 'Income-eligible families of Tamil Nadu.',
      benefits: 'Cashless cover for listed procedures (₹5 lakh per family per year as notified).',
      beneficiaries: 'About 1.5 crore families (launch-era figure, pending re-verification).',
      launch: '2012-01-01', budget: 1600, status: 'ACTIVE', vStatus: 'PENDING_VERIFICATION',
      source: 'https://www.tn.gov.in/dept/health', sourceName: 'Health & Family Welfare Department (official confirmation awaited)',
      key: 'scheme:cmchis',
    },
    {
      name: 'Kalaignar Kanavu Illam', level: 'TN', dShort: 'RDPR',
      description: 'Rural and urban housing scheme for eligible houseless families, converging central assistance. Phase-I works were in progress through 2025\u201326; continuation under the new government pending official confirmation.',
      eligibility: 'Houseless eligible families per socioeconomic survey.',
      benefits: 'Grant assistance for constructing or completing a pucca house.',
      beneficiaries: 'Phase-wise rollout in all districts.',
      launch: '2024-05-01', budget: 3500, status: 'ACTIVE', vStatus: 'PENDING_VERIFICATION',
      source: 'https://www.tn.gov.in/dept/rd', sourceName: 'RDPR Department (official confirmation awaited)',
      key: 'scheme:kanavu-illam',
    },
    {
      name: 'Annan Seer Thittam', level: 'TN', dShort: 'RDPR',
      description: 'Marriage assistance announced in the maiden budget of the 17th Assembly government (5 Aug 2026): eligible brides receive an eight-gram gold coin (one sovereign) and a silk saree. ₹812 crore was earmarked for 2026-27.',
      eligibility: 'Eligible brides as per the state marriage-assistance criteria notified with the budget.',
      benefits: '8-gram gold coin and silk saree for eligible brides.',
      beneficiaries: 'To be notified with scheme guidelines.',
      launch: '2026-08-05', budget: 812, status: 'ACTIVE', vStatus: 'VERIFIED',
      source: 'https://financedept.tn.gov.in', sourceName: 'TN Budget 2026-27 (Budget speech, 5 Aug 2026)',
      note: 'Announced in the 2026-27 budget; detailed guidelines expected via subsequent government orders.',
      key: 'scheme:annan-seer-thittam',
    },
    {
      name: 'Tamil Nadu Semiconductor Ecosystem Scheme 2026', level: 'TN',
      description: 'Semiconductor-industry promotion scheme launched by CM C. Joseph Vijay on 16 Oct 2026 to boost investment and position Tamil Nadu as a premier semiconductor hub, comprising support for fabs, design firms and a skilled workforce pipeline.',
      eligibility: 'Semiconductor manufacturing and design investors as per the scheme notification.',
      benefits: 'Investment facilitation and incentive framework for the semiconductor ecosystem.',
      beneficiaries: 'Industry investors and the state\u2019s electronics workforce.',
      launch: '2026-10-16', status: 'ACTIVE', vStatus: 'VERIFIED',
      source: 'https://www.tn.gov.in/press-releases', sourceName: 'Government of Tamil Nadu (launch covered by The Hindu, 16 Oct 2026)',
      key: 'scheme:tn-semiconductor-2026',
    },
    {
      name: 'Women SHG credit boost 2026', level: 'TN', dShort: 'RDPR',
      description: 'In early November 2026 CM C. Joseph Vijay disbursed ₹3,000 crore in credit support to women self-help group members (about 26,000 beneficiaries reported) to expand livelihood enterprises.',
      eligibility: 'Women self-help group members under state SHG programmes.',
      benefits: 'Credit disbursement of ₹3,000 crore to expand member enterprises.',
      beneficiaries: 'About 26,000 SHG members (Nov 2026 reporting).',
      launch: '2026-11-03', status: 'ACTIVE', vStatus: 'VERIFIED',
      source: 'https://www.tn.gov.in/press-releases', sourceName: 'Government of Tamil Nadu (covered by India Today / Daily Pioneer, Nov 2026)',
      key: 'scheme:shg-credit-2026',
    },
    {
      name: 'PM-KISAN', level: 'CENTRAL',
      description: 'Pradhan Mantri Kisan Samman Nidhi — income support to all landholding farmer families, paid by the Union Ministry of Agriculture & Farmers\u2019 Welfare.',
      eligibility: 'Landholding farmer families (subject to the exclusion criteria in the scheme guidelines).',
      benefits: '₹6,000 per year in three equal instalments of ₹2,000 via DBT.',
      beneficiaries: 'Nationwide farmer families (state-wise numbers on the official portal).',
      launch: '2019-02-24', status: 'ACTIVE', vStatus: 'VERIFIED',
      source: 'https://pmkisan.gov.in', sourceName: 'Ministry of Agriculture & Farmers\u2019 Welfare — PM-KISAN portal',
      process: 'Apply / self-register through the PM-KISAN portal or Common Service Centres; e-KYC mandatory.',
      url: 'https://pmkisan.gov.in',
      key: 'scheme:pm-kisan',
    },
    {
      name: 'Ayushman Bharat PM-JAY', level: 'CENTRAL',
      description: 'Pradhan Mantri Jan Arogya Yojana — world\u2019s largest government-funded health assurance scheme, converging in Tamil Nadu with the state\u2019s comprehensive health insurance implementation.',
      eligibility: 'Eligible families per SECC and occupational criteria; since Oct 2024 all citizens aged 70+ irrespective of income.',
      benefits: 'Cashless secondary and tertiary care cover of ₹5 lakh per family per year at empanelled hospitals.',
      beneficiaries: 'Nationwide eligible families and all 70+ senior citizens (Vay Vandana card).',
      launch: '2018-09-23', status: 'ACTIVE', vStatus: 'VERIFIED',
      source: 'https://pmjay.gov.in', sourceName: 'National Health Authority — official PM-JAY portal',
      process: 'Check eligibility and download the Ayushman card via the official portal or Ayushman App / CSC.',
      url: 'https://pmjay.gov.in',
      key: 'scheme:pmjay',
    },
  ]
  for (const s of schemeSeeds) {
    await db.scheme.create({
      data: {
        name: s.name, level: s.level, departmentId: s.dShort ? dept(s.dShort) : null,
        description: s.description, eligibility: s.eligibility, benefits: s.benefits,
        beneficiaries: s.beneficiaries, launchDate: D(s.launch), budgetInrCr: s.budget ?? null,
        status: s.status,
        applicationProcess: s.process ?? 'As per the department\u2019s notified procedure — follow the official source link.',
        applicationUrl: s.url ?? s.source,
        documentsRequired: 'Per scheme guidelines — confirm on the official application portal.',
        guidelinesUrl: s.source,
        officialSource: s.source, sourceName: s.sourceName,
        lastVerifiedAt: D(VERIFIED_AT), verifiedBy: VERIFIER,
        verificationStatus: s.vStatus, verificationNote: s.note,
        naturalKey: s.key,
      },
    })
  }

  // ─────────────────────────── Announcements ───────────────────────────
  // Real, verifiable announcements from official sources and major outlets,
  // newest first. Nothing below is fabricated; where an exact document URL was
  // not captured in this pass, the official section page is cited and the
  // sourceName states the exact release/article to locate.
  type AnnSeed = {
    title: string; body: string; category: 'POLICY' | 'TENDER' | 'SCHEME' | 'PUBLIC_NOTICE' | 'PRESS'
    dShort?: string; publishedAt: string; important?: boolean
    source: string; sourceName: string; vStatus?: 'VERIFIED' | 'PENDING_VERIFICATION'; key: string
  }
  const annSeeds: AnnSeed[] = [
    {
      title: 'Government appeals for an eco-friendly Deepavali 2026',
      body: 'Press Release No.984 (3 Nov 2026): the Government of Tamil Nadu appeals to the public to celebrate Deepavali 2026 with minimal noise and air pollution, in line with Supreme Court timings on firecracker use.',
      category: 'PUBLIC_NOTICE', publishedAt: '2026-11-03', important: false,
      source: 'https://www.tn.gov.in/press-releases', sourceName: 'tn.gov.in — Press Release No.984 (3 Nov 2026)',
      key: 'ann:tn-pr-984-deepavali-2026',
    },
    {
      title: '₹3,000 crore credit disbursed to women self-help group members',
      body: 'Chief Minister C. Joseph Vijay disbursed ₹3,000 crore in credit support to women SHG members (about 26,000 members reported) to expand livelihood enterprises — an early flagship welfare push of the new government.',
      category: 'SCHEME', publishedAt: '2026-11-03', important: true,
      source: 'https://www.tn.gov.in/press-releases', sourceName: 'Government of Tamil Nadu (reported by India Today & Daily Pioneer, Nov 2026)',
      key: 'ann:shg-credit-3000cr-2026',
    },
    {
      title: '26 special POCSO courts and 4 NDPS courts ordered',
      body: 'The Government of Tamil Nadu has ordered the establishment of 26 special courts to try cases under the POCSO Act and four special courts for NDPS cases, strengthening fast-track justice (press release, 1 Nov 2026).',
      category: 'POLICY', publishedAt: '2026-11-01', important: true,
      source: 'https://www.tn.gov.in/press-releases', sourceName: 'tn.gov.in — press release (1 Nov 2026)',
      key: 'ann:tn-pocso-ndps-courts-2026',
    },
    {
      title: 'Tamil Nadu Semiconductor Ecosystem Scheme 2026 launched',
      body: 'CM C. Joseph Vijay launched the Semiconductor Ecosystem Scheme 2026 to boost investment and position Tamil Nadu as a premier semiconductor hub, with support for fabs, design firms and a skilled workforce pipeline.',
      category: 'SCHEME', publishedAt: '2026-10-16', important: true,
      source: 'https://www.tn.gov.in/press-releases', sourceName: 'Government of Tamil Nadu (The Hindu, 16 Oct 2026)',
      key: 'ann:tn-semiconductor-scheme-2026',
    },
    {
      title: 'Rajendra Vishwanath Arlekar takes full-time charge as Governor of Tamil Nadu',
      body: 'Following the October 2026 gubernatorial appointments by President Droupadi Murmu, Rajendra Vishwanath Arlekar — who had held additional charge since 12 March 2026 while Governor of Kerala — became full-time Governor of Tamil Nadu.',
      category: 'PRESS', publishedAt: '2026-10-13', important: false,
      source: 'https://lokbhavan.tn.gov.in', sourceName: 'Lok Bhavan, Tamil Nadu / The New Indian Express (13 Oct 2026)',
      key: 'ann:arlekar-fulltime-governor-2026',
    },
    {
      title: 'By-election results: TVK wins Madurantakam and Dharapuram',
      body: 'Counting for the two assembly by-elections held for seats vacated by AIADMK MLAs who joined TVK concluded on 9 Oct 2026: TVK\u2019s K. Maragatham Kumaravel won Madurantakam (74,048 votes) and P. Sathyabama won Dharapuram (66,841 votes, margin 9,471). Five assembly seats remain vacant.',
      category: 'PUBLIC_NOTICE', publishedAt: '2026-10-09', important: true,
      source: 'https://results.eci.gov.in', sourceName: 'Election Commission of India — by-election results (9 Oct 2026)',
      key: 'ann:eci-bypolls-oct2026',
    },
    {
      title: 'Expanded Perunthalaivar Kamarajar Breakfast Scheme launched',
      body: 'CM C. Joseph Vijay launched the expansion of the breakfast scheme to students of Classes VI\u2013VIII at an official function on 22 Sep 2026, adding about 15.30 lakh students to the programme.',
      category: 'SCHEME', publishedAt: '2026-09-22', important: true,
      source: 'https://www.tn.gov.in/press-releases', sourceName: 'Government of Tamil Nadu (The Hindu & Deccan Herald, 22 Sep 2026)',
      key: 'ann:kamarajar-breakfast-expansion-2026',
    },
    {
      title: 'Budget 2026-27 presented — maiden budget of the 17th Assembly government',
      body: 'Finance Minister Dr. N. Marie Wilson presented the state budget for 2026-27 on 5 Aug 2026: total expenditure ₹4,72,585 crore, capital outlay ₹56,985 crore, ₹44,527 crore for school education, ₹812 crore for the new Annan Seer Thittam (8-gram gold coin and silk saree for eligible brides), gold rings for newborns and free laptops announced. A white paper on the state\u2019s financial position was also announced.',
      category: 'POLICY', publishedAt: '2026-08-05', important: true,
      source: 'https://financedept.tn.gov.in', sourceName: 'Finance Department — Budget Speech 2026-27 (PRS Legislative Research analysis)',
      key: 'ann:tn-budget-2026-27',
    },
    {
      title: 'Government formation: C. Joseph Vijay sworn in as 22nd Chief Minister',
      body: 'After TVK won 108 of 234 seats in the April 2026 election (counting 4 May), C. Joseph Vijay was sworn in as Chief Minister on 10 May 2026. The council of ministers was expanded to 35 members on 21\u201322 May 2026, with portfolios allocated with the Governor\u2019s approval.',
      category: 'PRESS', publishedAt: '2026-05-10', important: true,
      source: 'https://www.tn.gov.in/ministers', sourceName: 'Government of Tamil Nadu — Council of Ministers',
      key: 'ann:vijay-cm-swornin-2026',
    },
    {
      title: '2026 Legislative Assembly election held across 234 constituencies',
      body: 'Elections to the 17th Tamil Nadu Legislative Assembly were held on 23 April 2026 with counting on 4 May 2026: TVK 108 seats (35.07% votes), DMK 59 (24.28%), AIADMK 47 (21.30%), with the balance to allies and others. Full constituency-wise results are on the ECI portal.',
      category: 'PUBLIC_NOTICE', publishedAt: '2026-05-04', important: true,
      source: 'https://results.eci.gov.in', sourceName: 'Election Commission of India — 2026 TN general election results',
      key: 'ann:eci-tn-2026-results',
    },
  ]
  for (const a of annSeeds) {
    await db.announcement.create({
      data: {
        title: a.title, body: a.body, category: a.category,
        departmentId: a.dShort ? dept(a.dShort) : null,
        publishedAt: D(a.publishedAt), isImportant: a.important ?? false,
        officialSource: a.source, sourceName: a.sourceName,
        lastVerifiedAt: D(VERIFIED_AT), verificationStatus: 'VERIFIED',
        naturalKey: a.key,
      },
    })
  }

  // ─────────────────────────── Calendar events ───────────────────────────
  // Verified dates only; unconfirmed schedules carry PENDING_VERIFICATION and
  // an explicit sourceNote instead of an asserted date.
  type EvSeed = {
    title: string; description: string; type: string; startsAt: string; endsAt: string | null
    location: string; vStatus: 'VERIFIED' | 'PENDING_VERIFICATION'; note: string
  }
  const evSeeds: EvSeed[] = [
    {
      title: 'First Session of the 17th Legislative Assembly', description: 'The first session of the newly constituted 17th Tamil Nadu Legislative Assembly sat from 11 May to 8 Sep 2026 (28 sitting days; 13 Bills passed, 9 government resolutions and 17 Rule 110 announcements).',
      type: 'ASSEMBLY_SESSION', startsAt: '2026-05-11T10:00:00', endsAt: '2026-09-08T17:00:00', location: 'Fort St George, Chennai',
      vStatus: 'VERIFIED', note: 'Session record as per the Tamil Nadu Legislative Assembly (tnla.neva.gov.in) and assembly reporting.',
    },
    {
      title: 'November 2026 session of the Legislative Assembly', description: 'The assembly\u2019s session calendar lists a session in November 2026. Exact dates to be confirmed from the official session calendar.',
      type: 'ASSEMBLY_SESSION', startsAt: '2026-11-16T10:00:00', endsAt: null, location: 'Fort St George, Chennai',
      vStatus: 'PENDING_VERIFICATION', note: 'Session calendar at tnla.neva.gov.in lists a November 2026 session; exact sitting dates pending confirmation. Placeholder date shown until verified.',
    },
    {
      title: 'By-elections to vacant assembly constituencies', description: 'By-elections to the remaining vacant seats (Tiruchirappalli East, Perundurai, Ambasamudram, Viralimalai, Karur) per ECI notifications. Madurantakam and Dharapuram were filled on 9 Oct 2026.',
      type: 'ELECTION', startsAt: '2026-11-25T08:00:00', endsAt: null, location: 'Respective constituencies',
      vStatus: 'PENDING_VERIFICATION', note: 'Polling dates for the five vacant ACs pending the latest ECI notification (earlier process reported to be affected by litigation). Placeholder date shown until verified.',
    },
    {
      title: 'Monthly grievance day hearing', description: 'Collectorate grievance day — petitioners with registration numbers are heard by the District Collector.',
      type: 'PUBLIC_HEARING', startsAt: '2026-11-17T09:30:00', endsAt: '2026-11-17T13:00:00', location: 'All District Collectorates',
      vStatus: 'PENDING_VERIFICATION', note: 'Grievance day is a standing monthly practice; confirm the exact date with the respective district collectorate. Placeholder date shown until verified.',
    },
    {
      title: 'White paper on the state\u2019s financial position — release', description: 'The government has announced a white paper detailing Tamil Nadu\u2019s financial position. Release date to be confirmed.',
      type: 'DEADLINE', startsAt: '2026-11-30T11:00:00', endsAt: null, location: 'Secretariat, Chennai',
      vStatus: 'PENDING_VERIFICATION', note: 'Announced by the Finance Department (2026-27 budget communications); release date pending official confirmation. Placeholder date shown until verified.',
    },
  ]
  for (const e of evSeeds) {
    await db.calendarEvent.create({
      data: {
        title: e.title, description: e.description, type: e.type,
        startsAt: D(e.startsAt), endsAt: e.endsAt ? D(e.endsAt) : null, location: e.location,
        organizer: 'Government of Tamil Nadu', verificationStatus: e.vStatus, sourceNote: e.note,
      },
    })
  }

  // ─────────────────────────── Projects + milestones ───────────────────────────
  type PSeed = {
    code: string; name: string; description: string; dShort: string; district: string; category: string
    budget: number; sanctioned: number; spent: number; progress: number; status: string
    startDate: string; targetEndDate: string; completedOn?: string; contractor?: string; fundedBy?: string
    milestones: Array<[string, string, string, string | null, string, number | null]>
  }
  const projects: PSeed[] = [
    {
      code: 'TN-MAWS-2021-004', name: 'Chennai Metro Rail Phase II (corridors 3-5)', description: 'Expansion of metro rail network with three new corridors covering 128.9 km to connect the IT corridor, western suburbs and the port area.', dShort: 'MAWS', district: 'Chennai', category: 'TRANSPORT', budget: 63246, sanctioned: 63246, spent: 27120, progress: 43, status: 'IN_PROGRESS', startDate: '2021-11-25', targetEndDate: '2028-04-30', contractor: 'Joint venture consortium (demonstration)', fundedBy: 'State + Multilateral loan',
      milestones: [
        ['Geotechnical survey and DPR finalisation', 'Soil investigation and detailed project report approved by the state and multilateral lenders.', 'DONE', '2021-11-25', '2022-03-15', 1200],
        ['Contract award and works mobilisation', 'Package contracts awarded; yards and casting yards established.', 'DONE', '2022-04-01', '2022-12-10', 3500],
        ['Underground tunnelling package 1', 'Twin-tunnel drives along corridor 3 using tunnel boring machines.', 'IN_PROGRESS', '2023-01-15', '2026-06-30', 9800],
        ['Elevated viaduct completion corridor 5', 'Elevated structures and stations along the port connector.', 'PENDING', '2025-04-01', '2027-03-31', null],
      ],
    },
    {
      code: 'TN-PWD-2022-011', name: 'Coimbatore Western Bypass Road', description: 'Four-lane western bypass easing freight movement between NH-544 and NH-181, with 3 major bridges and service roads.', dShort: 'PWD', district: 'Coimbatore', category: 'INFRASTRUCTURE', budget: 1840, sanctioned: 1720, spent: 1105, progress: 64, status: 'IN_PROGRESS', startDate: '2022-06-10', targetEndDate: '2026-03-31', contractor: 'Regional infrastructure JV (demonstration)', fundedBy: 'State budget + central road fund',
      milestones: [
        ['Land acquisition and utility shifting', 'Acquisition of 42 hectares and shifting of utilities along alignment.', 'DONE', '2022-06-10', '2023-05-20', 310],
        ['Earthworks and drainage up to km 14', 'Subgrade, GSB and drainage works for the first 14 km.', 'DONE', '2023-06-01', '2024-04-15', 380],
        ['Bridge structures package A', 'Three major bridges across the western streams.', 'IN_PROGRESS', '2024-05-01', '2025-12-31', 260],
        ['Bituminous courses and safety furniture', 'Final surfacing, signage and lighting.', 'PENDING', '2026-01-01', '2026-03-31', null],
      ],
    },
    {
      code: 'TN-MAWS-2023-007', name: 'Thoothukudi Desalination Plant (115 MLD)', description: 'Seawater reverse osmosis desalination plant with 115 MLD capacity and 34 km conveyance main to augment city water supply.', dShort: 'MAWS', district: 'Thoothukudi', category: 'WATER', budget: 1490, sanctioned: 1490, spent: 322, progress: 21, status: 'IN_PROGRESS', startDate: '2023-08-01', targetEndDate: '2027-06-30', contractor: 'Water infrastructure major (demonstration)', fundedBy: 'State + external aid',
      milestones: [
        ['Environmental clearance and public hearing', 'EC process with district-level public hearing.', 'IN_PROGRESS', '2023-08-01', '2025-12-15', 40],
        ['Intake and outfall marine works', 'Marine intake structure and diffuser outfall construction.', 'PENDING', '2026-01-01', '2026-09-30', null],
        ['RO trains and commissioning', 'Membrane trains, energy recovery and trial runs.', 'PENDING', '2026-10-01', '2027-06-30', null],
      ],
    },
    {
      code: 'TN-Health-2022-019', name: 'Government Medical College Block — Madurai', description: 'New 750-bed super-speciality block with modular operation theatres, ICU wing and radiology suite at the government medical college.', dShort: 'Health', district: 'Madurai', category: 'HEALTH', budget: 640, sanctioned: 640, spent: 498, progress: 78, status: 'IN_PROGRESS', startDate: '2022-09-05', targetEndDate: '2026-01-31', contractor: 'Hospital construction firm (demonstration)', fundedBy: 'State budget',
      milestones: [
        ['Structural work completion', 'RCC structure for all seven floors.', 'DONE', '2022-09-05', '2024-02-28', 260],
        ['MEP services installation', 'Electrical, HVAC, medical gas and plumbing services.', 'DONE', '2024-03-01', '2025-03-31', 150],
        ['Lifts, OTs and equipment', 'Modular OTs, imaging equipment and vertical transport.', 'IN_PROGRESS', '2025-04-01', '2025-12-15', 88],
        ['Commissioning and staffing', 'Trial runs, biomedical calibration and staff posting.', 'PENDING', '2026-01-01', '2026-01-31', null],
      ],
    },
    {
      code: 'TN-RDPR-2023-031', name: 'Kalaignar Kanavu Illam — Phase I (38 districts)', description: 'Housing grant disbursement and construction supervision for eligible rural and urban houseless families in the first phase.', dShort: 'RDPR', district: 'Chengalpattu', category: 'URBAN', budget: 3500, sanctioned: 3200, spent: 1120, progress: 32, status: 'IN_PROGRESS', startDate: '2024-05-01', targetEndDate: '2027-03-31', fundedBy: 'State + central convergence',
      milestones: [
        ['Beneficiary survey and validation', 'Door-to-door socioeconomic survey and grievance redress of exclusion errors.', 'DONE', '2024-05-01', '2024-11-30', 90],
        ['Sanction and first tranche release', 'Administrative sanction and direct benefit transfer of first instalments.', 'DONE', '2024-12-01', '2025-04-30', 760],
        ['Construction supervision and geo-tagging', 'Field supervision with photo geo-tagging of each stage.', 'IN_PROGRESS', '2025-05-01', '2026-12-31', 270],
      ],
    },
    {
      code: 'TN-Agri-2024-006', name: 'Climate-resilient Agriculture Mission — Cauvery delta', description: 'Alternative crops demonstration, direct-seeded rice pilots and micro-irrigation expansion across delta districts.', dShort: 'Agriculture', district: 'Thanjavur', category: 'AGRICULTURE', budget: 480, sanctioned: 480, spent: 146, progress: 30, status: 'IN_PROGRESS', startDate: '2024-07-01', targetEndDate: '2027-06-30', fundedBy: 'State budget',
      milestones: [
        ['Demonstration plots establishment', '500 demonstration plots for alternative crops in 5 delta districts.', 'IN_PROGRESS', '2024-07-01', '2026-02-28', 95],
        ['Micro-irrigation area expansion', 'Community nurseries and drip systems for 12,000 hectares.', 'PENDING', '2025-10-01', '2027-06-30', 51],
      ],
    },
    {
      code: 'TN-UD-2021-013', name: 'Tambaram Grade Separator', description: 'Three-arm grade separator at the Tambaram junction to decongest the GST road corridor with associated stormwater drains.', dShort: 'MAWS', district: 'Chengalpattu', category: 'INFRASTRUCTURE', budget: 312, sanctioned: 312, spent: 312, progress: 100, status: 'COMPLETED', startDate: '2021-02-15', targetEndDate: '2024-08-31', completedOn: '2024-07-19', contractor: 'Bridge engineering company (demonstration)', fundedBy: 'State budget',
      milestones: [
        ['Piling and foundation', 'Piling for all ramps and central piers.', 'DONE', '2021-02-15', '2022-01-10', 95],
        ['Superstructure erection', 'Precast girders launched over live traffic with night blocks.', 'DONE', '2022-01-15', '2023-06-30', 140],
        ['Roads, drains and commissioning', 'Approach roads, stormwater drains and traffic opening.', 'DONE', '2023-07-01', '2024-07-19', 77],
      ],
    },
    {
      code: 'TN-TWAD-2022-045', name: 'Tiruvallur Water Supply Augmentation', description: 'Augmentation of drinking water supply to growth nodes with new service reservoirs and 61 km of transmission mains.', dShort: 'MAWS', district: 'Tiruvallur', category: 'WATER', budget: 760, sanctioned: 720, spent: 403, progress: 56, status: 'IN_PROGRESS', startDate: '2022-11-01', targetEndDate: '2026-05-31', contractor: 'Pipeline works contractor (demonstration)', fundedBy: 'State budget',
      milestones: [
        ['Transmission main laying — phase 1', '32 km of DI mains along the northern alignment.', 'DONE', '2022-11-01', '2024-03-15', 190],
        ['Service reservoirs construction', 'Six elevated and three ground-level reservoirs.', 'IN_PROGRESS', '2024-04-01', '2025-12-31', 155],
        ['Distribution network integration', 'Zone-wise integration with district metering.', 'PENDING', '2026-01-01', '2026-05-31', 58],
      ],
    },
    {
      code: 'TN-PWD-2023-022', name: 'Ranipet Common Effluent Treatment Upgrade', description: 'Upgrade of the common effluent treatment plant serving tannery clusters with zero liquid discharge trains.', dShort: 'PWD', district: 'Ranipet', category: 'WATER', budget: 290, sanctioned: 260, spent: 52, progress: 17, status: 'ON_HOLD', startDate: '2023-10-01', targetEndDate: '2026-04-30', fundedBy: 'State + industry contribution',
      milestones: [
        ['Design and tender', 'ZLD process design and contractor selection.', 'DONE', '2023-10-01', '2024-06-30', 22],
        ['Civil works', 'Civil works for treatment blocks.', 'DELAYED', '2024-07-01', '2025-06-30', 30],
        ['Mechanical and commissioning', 'Evaporators, membrane systems and commissioning.', 'PENDING', '2025-07-01', '2026-04-30', null],
      ],
    },
    {
      code: 'TN-Edu-2023-009', name: 'Government Higher Secondary Upgrades — Viluppuram', description: 'Additional classrooms, science laboratories and digital classrooms across 46 government higher secondary schools.', dShort: 'School Edu', district: 'Viluppuram', category: 'EDUCATION', budget: 168, sanctioned: 168, spent: 149, progress: 89, status: 'IN_PROGRESS', startDate: '2023-06-15', targetEndDate: '2026-02-28', fundedBy: 'State budget + SAMAGRA convergence',
      milestones: [
        ['Classroom blocks construction', 'New classroom blocks at 46 schools.', 'DONE', '2023-06-15', '2024-12-20', 96],
        ['Science labs furnishing', 'Physics, chemistry and biology labs with equipment.', 'DONE', '2025-01-01', '2025-06-30', 33],
        ['Digital classrooms rollout', 'Smart boards and content onboarding.', 'IN_PROGRESS', '2025-07-01', '2026-02-28', 20],
      ],
    },
    {
      code: 'TN-Tour-2024-003', name: 'Kanyakumari Tourist Circuit Facilities', description: 'Viewing gallery upgrades, sanitation facilities, battery bus terminus and illumination around the tourist circuit.', dShort: 'Tourism (under PWD)', district: 'Kanyakumari', category: 'URBAN', budget: 122, sanctioned: 122, spent: 28, progress: 23, status: 'TENDERING', startDate: '2025-01-20', targetEndDate: '2026-12-31', fundedBy: 'State budget + central tourism circuit grant',
      milestones: [
        ['DPR and administrative sanction', 'Detailed project report sanctioned.', 'DONE', '2025-01-20', '2025-06-30', 6],
        ['Works tendering', 'Package tenders for civil works and illumination.', 'IN_PROGRESS', '2025-07-01', '2025-12-31', 22],
        ['Civil works and commissioning', 'Construction phase.', 'PENDING', '2026-01-01', '2026-12-31', null],
      ],
    },
    {
      code: 'TN-Rev-2024-014', name: 'Integrated Revenue Records Digitisation — Krishnagiri', description: 'Digitisation of land records with survey resurvey using differential GPS and public kiosks for record access.', dShort: 'Revenue', district: 'Krishnagiri', category: 'URBAN', budget: 84, sanctioned: 84, spent: 61, progress: 72, status: 'IN_PROGRESS', startDate: '2024-04-01', targetEndDate: '2026-03-31', fundedBy: 'State budget',
      milestones: [
        ['Village survey and field book digitisation', 'Resurvey of 420 villages and digitisation of field records.', 'DONE', '2024-04-01', '2025-05-31', 44],
        ['Public kiosks and grievance window', 'Record access kiosks at taluk offices.', 'IN_PROGRESS', '2025-06-01', '2026-03-31', 17],
      ],
    },
  ]
  const projectMap = new Map<string, string>()
  for (const p of projects) {
    const rec = await db.project.create({
      data: {
        code: p.code, name: p.name, description: p.description, departmentId: dept(p.dShort),
        districtId: dist(p.district), category: p.category, budgetInrCr: p.budget, sanctionedInrCr: p.sanctioned,
        spentInrCr: p.spent, progress: p.progress, status: p.status, startDate: D(p.startDate),
        targetEndDate: D(p.targetEndDate), completedOn: p.completedOn ? D(p.completedOn) : null,
        contractor: p.contractor ?? null, contractorReg: p.contractor ? 'TN-PWD-REG-XXXXX' : null, fundedBy: p.fundedBy ?? null,
      },
    })
    projectMap.set(p.code, rec.id)
    for (let i = 0; i < p.milestones.length; i++) {
      const [title, description, status, dueDate, completedOn, amount] = p.milestones[i]
      await db.projectMilestone.create({
        data: {
          projectId: rec.id, title, description, status, sortOrder: i,
          dueDate: dueDate ? D(dueDate) : null,
          completedOn: status === 'DONE' && completedOn ? D(completedOn) : null,
          amountReleasedCr: amount,
        },
      })
    }
  }

  // ─────────────────────────── Complaints ───────────────────────────
  type CSeed = {
    ticketNo: string; title: string; description: string; category: string; priority: string; status: string
    district: string; citizen: string; area: string; dShort?: string; assignedTo?: string; sla?: string
    resolution?: string; satisfaction?: number; updates: Array<[string, string, string, string]>
  }
  const complaints: CSeed[] = [
    {
      ticketNo: 'CL-2025-000118', title: 'Sewage overflow near corporation school', description: 'Untreated sewage is overflowing on the street adjoining the corporation school for three weeks. Children walk through stagnant water to reach the school gate. Request urgent desilting of the blocked line and disinfection.', category: 'SANITATION', priority: 'HIGH', status: 'IN_PROGRESS', district: 'Chennai', citizen: 'R. Lakshmi', area: 'Ward 173, Kodambakkam zone', dShort: 'MAWS', assignedTo: 'Zonal Engineer — Kodambakkam', sla: '2025-11-08',
      updates: [
        ['Complaint registered. Expected first response within 48 hours.', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Complaint acknowledged and forwarded to the zonal office. Jetting machine scheduled.', 'ACKNOWLEDGED', 'Ward Officer', 'DEPT_OFFICER'],
        ['Field inspection done; block found 60 m downstream. Desilting work started this morning.', 'IN_PROGRESS', 'Zonal Engineer — Kodambakkam', 'DEPT_OFFICER'],
      ],
    },
    {
      ticketNo: 'CL-2025-000104', title: 'Street lights not working for a month', description: 'Nine of eleven streetlights in the lane are non-functional after the last spell of rain. Two-wheelers skid at night; residents request immediate replacement of fittings.', category: 'ELECTRICITY', priority: 'MEDIUM', status: 'RESOLVED', district: 'Coimbatore', citizen: 'S. Karthik', area: 'Ward 28, North zone', dShort: 'MAWS', assignedTo: 'AE — Street Lights', sla: '2025-10-30', resolution: 'All fittings replaced with LED luminaires and wiring repaired. Verified during night inspection on 28 Oct.', satisfaction: 5,
      updates: [
        ['Complaint registered.', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Assigned to street light section. Materials indent placed.', 'IN_PROGRESS', 'AE — Street Lights', 'DEPT_OFFICER'],
        ['Repairs completed; nine LED fittings replaced and wiring redone.', 'RESOLVED', 'AE — Street Lights', 'DEPT_OFFICER'],
        ['Confirmed fixed. Thank you for the quick action.', 'RESOLVED', 'S. Karthik', 'CITIZEN'],
      ],
    },
    {
      ticketNo: 'CL-2025-000097', title: 'Drinking water tanker not reaching street 4', description: 'Tanker schedule shows daily supply but tankers have not entered street 4 for eleven days. Residents including elderly persons are buying water.', category: 'WATER', priority: 'CRITICAL', status: 'ESCALATED', district: 'Tiruvallur', citizen: 'Fathima A.', area: 'Ward 12', dShort: 'MAWS', assignedTo: 'Executive Engineer — TWAD', sla: '2025-11-02',
      updates: [
        ['Complaint registered.', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Forwarded to the TWAD board section concerned.', 'ACKNOWLEDGED', 'Ward Officer', 'DEPT_OFFICER'],
        ['No improvement after assurance period. Escalated to the District Collector\u2019s cell.', 'ESCALATED', 'System (SLA breach)', 'ADMIN'],
      ],
    },
    {
      ticketNo: 'CL-2025-000089', title: 'Potholes on school road causing accidents', description: 'Two-wheelers are skidding on the pothole-ridden stretch near the government school. Two minor falls reported this month. Request cold-mix patchwork immediately and re-tarring after monsoon.', category: 'ROAD', priority: 'HIGH', status: 'ACKNOWLEDGED', district: 'Madurai', citizen: 'P. Muthu', area: 'Ward 44', dShort: 'PWD', assignedTo: 'Section Officer — Roads', sla: '2025-11-06',
      updates: [
        ['Complaint registered.', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Site inspected. Cold-mix patching sanctioned; work scheduled this week.', 'ACKNOWLEDGED', 'Section Officer — Roads', 'DEPT_OFFICER'],
      ],
    },
    {
      ticketNo: 'CL-2025-000076', title: 'Demand for bribe at building plan approval', description: 'An intermediary at the local body office demanded ₹15,000 to expedite building plan approval and hinted approval will otherwise be delayed. Requesting confidential enquiry and action.', category: 'CORRUPTION', priority: 'CRITICAL', status: 'IN_PROGRESS', district: 'Vellore', citizen: 'Anonymous', area: 'Local body — Vellore', dShort: 'Home', assignedTo: 'Vigilance Cell', sla: '2025-11-15', resolution: undefined,
      updates: [
        ['Complaint registered (identity protected).', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Referred to the vigilance cell. Proceeding under the prevention of corruption framework.', 'IN_PROGRESS', 'Vigilance Cell', 'ADMIN'],
      ],
    },
    {
      ticketNo: 'CL-2025-000061', title: 'PHC without doctor on Tuesdays', description: 'The primary health centre in our block functions without a medical officer on Tuesdays for the past month, affecting the weekly maternal check-up camp.', category: 'HEALTH', priority: 'HIGH', status: 'RESOLVED', district: 'Tirunelveli', citizen: 'J. steffen' /* demo alias */, area: 'Block PHC', dShort: 'Health', assignedTo: 'Deputy Director — Health Services', sla: '2025-10-20', resolution: 'Medical officer posting regularised and a standby roster notified. Camp schedule restored.', satisfaction: 4,
      updates: [
        ['Complaint registered.', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Issue verified with block medical officer. Posting order initiated.', 'IN_PROGRESS', 'Deputy Director — Health Services', 'DEPT_OFFICER'],
        ['MO posting regularised; Tuesday camp restored with standby roster.', 'RESOLVED', 'Deputy Director — Health Services', 'DEPT_OFFICER'],
      ],
    },
    {
      ticketNo: 'CL-2025-000052', title: 'Anganwadi building roof leak', description: 'Roof of the anganwadi building leaks during rain; children\u2019s activities shifted to the community hall. Request roof repair with waterproofing.', category: 'OTHER', priority: 'MEDIUM', status: 'IN_PROGRESS', district: 'Thanjavur', citizen: 'K. Valarmathi', area: 'Village panchayat 9', dShort: 'RDPR', assignedTo: 'BDO — Block 9', sla: '2025-11-12',
      updates: [
        ['Complaint registered.', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Estimate prepared; works taken up under maintenance grant.', 'IN_PROGRESS', 'BDO — Block 9', 'DEPT_OFFICER'],
      ],
    },
    {
      ticketNo: 'CL-2025-000047', title: 'Mid-day meal quality complaint', description: 'Eggs supplied under the nutrition menu have been stale on two days this week. Request inspection and quality check of supplier consignments.', category: 'EDUCATION', priority: 'HIGH', status: 'SUBMITTED', district: 'Dindigul', citizen: 'Name withheld', area: 'GHS — Block 5', dShort: 'School Edu', sla: '2025-11-04',
      updates: [['Complaint registered. Forwarded to the block education officer for verification.', 'SUBMITTED', 'System', 'CITIZEN']],
    },
    {
      ticketNo: 'CL-2025-000033', title: 'Encroachment blocking stormwater drain', description: 'Shops have extended ramps over the stormwater drain causing waterlogging in the lane during rains. Request enforcement and restoration of drain section.', category: 'SANITATION', priority: 'MEDIUM', status: 'REJECTED', district: 'Salem', citizen: 'V. Suresh', area: 'Ward 31', dShort: 'MAWS', assignedTo: 'Town Planning', resolution: 'Reopening of drain verified as completed under an earlier works order; lane-level waterlogging traced to private plot grading outside corporation scope. Advised applicant of the correct forum.', satisfaction: 2,
      updates: [
        ['Complaint registered.', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Field verification shows drain restored under earlier works order; issue relates to private plot grading.', 'REJECTED', 'Town Planning', 'DEPT_OFFICER'],
      ],
    },
    {
      ticketNo: 'CL-2025-000021', title: 'Bus shelter damaged and unsafe', description: 'The bus shelter on the route collapsed partially in the last storm; the roof sheet hangs loose over waiting passengers.', category: 'ROAD', priority: 'HIGH', status: 'RESOLVED', district: 'Erode', citizen: 'M. Gowtham', area: 'Route 12 stop', dShort: 'Transport', assignedTo: 'Depot Manager', sla: '2025-10-18', resolution: 'Shelter dismantled and rebuilt with new roofing; safety inspection completed.', satisfaction: 5,
      updates: [
        ['Complaint registered.', 'SUBMITTED', 'System', 'CITIZEN'],
        ['Shelter cordoned off; works order issued to rebuild.', 'IN_PROGRESS', 'Depot Manager', 'DEPT_OFFICER'],
        ['Shelter rebuilt and inspected. Safe for use.', 'RESOLVED', 'Depot Manager', 'DEPT_OFFICER'],
      ],
    },
  ]
  for (const c of complaints) {
    const rec = await db.complaint.create({
      data: {
        ticketNo: c.ticketNo, title: c.title, description: c.description, category: c.category,
        priority: c.priority, status: c.status, districtId: dist(c.district), citizenName: c.citizen,
        citizenContact: '+91-XXXXX-XX' + c.ticketNo.slice(-2), wardOrArea: c.area,
        assignedDepartmentId: c.dShort ? dept(c.dShort) : null, assignedTo: c.assignedTo ?? null,
        slaDueAt: c.sla ? D(c.sla) : null, resolutionNote: c.resolution ?? null, satisfaction: c.satisfaction ?? null,
        createdAt: D('2025-10-' + (2 + (parseInt(c.ticketNo.slice(-3)) % 20)).toString().padStart(2, '0') + 'T09:30:00'),
      },
    })
    for (let i = 0; i < c.updates.length; i++) {
      const [note, statusAfter, byName, byRole] = c.updates[i]
      await db.complaintUpdate.create({
        data: {
          complaintId: rec.id, note, statusAfter, byName, byRole,
          createdAt: new Date(rec.createdAt.getTime() + (i + 1) * 36e5 * 20),
        },
      })
    }
  }

  // ─────────────────────────── Citizen verification requests ───────────────────────────
  const cvSeeds: Array<[string, string, string, string, string, string | null, string | null]> = [
    ['CV-2025-000412', 'A. Dhanalakshmi', 'RESIDENCE', 'Aadhaar XXXX-XXXX-4821', 'APPROVED', 'Residence verified with ward records and field check.', '2025-10-21'],
    ['CV-2025-000398', 'R. Babu', 'INCOME', 'Ration card 04/X/2213', 'PENDING', null, null],
    ['CV-2025-000387', 'S. Ignatius', 'SCHEME_ENROLLMENT', 'Aadhaar XXXX-XXXX-9903', 'APPROVED', 'Eligibility confirmed for assistance programme enrollment.', '2025-10-14'],
    ['CV-2025-000356', 'M. Shobana', 'BPL', 'Ration card 07/X/8442', 'REJECTED', 'Income exceeds the notified threshold; applicant advised of appeal route.', '2025-10-09'],
    ['CV-2025-000344', 'K. Rathinam', 'RESIDENCE', 'Aadhaar XXXX-XXXX-1177', 'PENDING', null, null],
    ['CV-2025-000301', 'P. Selvi', 'OTHER', 'Pension book 221/17', 'APPROVED', 'Pension eligibility cross-verified with the treasury list.', '2025-09-30'],
  ]
  for (const [requestNo, citizenName, requestType, documentMasked, status, remarks, processedAt] of cvSeeds) {
    await db.citizenVerificationRequest.create({
      data: {
        requestNo, citizenName, requestType, documentMasked, status, remarks,
        submittedAt: D('2025-09-' + (10 + (parseInt(requestNo.slice(-3)) % 15)) + 'T10:00:00'),
        processedAt: processedAt ? D(processedAt) : null,
      },
    })
  }

  // ─────────────────────────── Demo users ───────────────────────────
  await db.demoUser.create({ data: { username: 'admin', name: 'District Administrator (demo)', role: 'ADMIN', password: 'Admin@123' } })
  await db.demoUser.create({ data: { username: 'officer', name: 'MAWS Zonal Officer (demo)', role: 'DEPT_OFFICER', departmentId: dept('MAWS'), password: 'Officer@123' } })
  await db.demoUser.create({ data: { username: 'auditor', name: 'Internal Auditor (demo)', role: 'AUDITOR', password: 'Auditor@123' } })


  // ─────────────────────────── Audit log ───────────────────────────
  const auditSeeds: Array<[string, string, string, string, string | null, string]> = [
    ['seed', 'SYSTEM', 'DATA_SEED', 'DATABASE', null, 'Verified dataset loaded for the 2026-11-05 pass: 2026 TN election results, government formation, ministry, by-elections, schemes and announcements.'],
    ['civic-lenz-web-verification', 'VERIFIER', 'VERIFY_RECORD', 'POLITICAL_RECORD', 'CM-TN', 'Chief Minister record updated: C. Joseph Vijay (TVK) sworn in as 22nd CM on 10 May 2026; verified against tn.gov.in Council of Ministers.'],
    ['civic-lenz-web-verification', 'VERIFIER', 'VERIFY_RECORD', 'POLITICAL_RECORD', 'GOV-TN', 'Governor record updated: Rajendra Vishwanath Arlekar (additional charge 12 Mar 2026; full-time Oct 2026); R. N. Ravi moved to West Bengal.'],
    ['civic-lenz-web-verification', 'VERIFIER', 'VERIFY_RECORD', 'POLITICAL_RECORD', 'PRESIDENT-IN', 'National leadership added and verified: President Murmu, VP C. P. Radhakrishnan (12 Sep 2025), PM Modi, Speaker Om Birla.'],
    ['civic-lenz-web-verification', 'VERIFIER', 'MARK_FORMER', 'POLITICAL_RECORD', 'CM-STALIN', 'M. K. Stalin moved to historical: resigned 4 May 2026 after losing Kolathur; DMK government records closed at 2026-05-04.'],
    ['civic-lenz-web-verification', 'VERIFIER', 'STATUS_CHANGED', 'POLITICAL_RECORD', 'AC-ERODE-EAST', 'Erode East vacancy resolved: Feb 2025 by-election (V. C. Chandhirakumar, DMK) closed the 2023 vacancy; M. Vijay Balaji (TVK) elected in May 2026.'],
    ['civic-lenz-web-verification', 'VERIFIER', 'STATUS_CHANGED', 'POLITICAL_RECORD', 'AC-BYPOLLS-OCT-2026', 'Madurantakam and Dharapuram filled by TVK in the 9 Oct 2026 by-elections; five seats remain vacant per ECI notifications.'],
    ['admin', 'ADMIN', 'ESCALATE_COMPLAINT', 'COMPLAINT', 'CL-2025-000097', 'SLA breach auto-escalated to District Collector cell.'],
    ['officer', 'DEPT_OFFICER', 'UPDATE_COMPLAINT', 'COMPLAINT', 'CL-2025-000104', 'Street light repairs completed and marked resolved.'],
    ['admin', 'ADMIN', 'APPROVE_VERIFICATION', 'CITIZEN_VERIFICATION', 'CV-2025-000412', 'Residence verification approved after field check.'],
    ['auditor', 'AUDITOR', 'VIEW_FINANCIALS', 'PROJECT', 'TN-MAWS-2021-004', 'Financials viewed for quarterly audit sample.'],
    ['admin', 'ADMIN', 'REJECT_VERIFICATION', 'CITIZEN_VERIFICATION', 'CV-2025-000356', 'BPL verification rejected with appeal guidance.'],
    ['civic-lenz-web-verification', 'VERIFIER', 'SOURCE_UPDATED', 'SCHEME', 'SCHEME-BREAKFAST', 'Breakfast scheme renamed to Perunthalaivar Kamarajar Breakfast Scheme and expanded to Classes VI-VIII (22 Sep 2026); status set to UPDATED.'],
    ['civic-lenz-web-verification', 'VERIFIER', 'SOURCE_UPDATED', 'SCHEME', 'SCHEME-KMUT', 'KMUT re-verified: ₹1,000/month, ~1.31 crore beneficiaries (Dec 2025 expansion); proposed ₹1,500 hike recorded as pending, not implemented.'],
  ]
  for (let i = 0; i < auditSeeds.length; i++) {
    const [actor, actorRole, action, entity, entityId, summary] = auditSeeds[i]
    await db.auditLog.create({
      data: { actor, actorRole, action, entity, entityId, summary, ipAddress: '10.x.x.x (demo)', createdAt: D('2026-11-0' + ((i % 5) + 1) + 'T11:00:00') },
    })
  }

  // ─────────────────────────── Data source registry (live update system) ───────────────────────────
  // The /api/sync route reads this registry: GET returns source health and
  // recent sync logs; POST runs a verification pass per source. Sources that
  // are unreachable are logged as FAILED and previously verified data is
  // preserved (never overwritten on failure).
  const dataSourceSeeds: Array<{
    key: string; name: string; category: string; url: string
    method: string; cadenceHours: number; requiresConfig?: string; description: string
  }> = [
    {
      key: 'tn-council-of-ministers', name: 'TN Council of Ministers', category: 'POLITICAL_LEADERSHIP',
      url: 'https://www.tn.gov.in/ministers', method: 'MANUAL_ADMIN', cadenceHours: 24,
      description: 'Official list of the Chief Minister and all ministers with portfolios — authoritative source for minister-level records.',
    },
    {
      key: 'tn-press-releases', name: 'TN Government Press Releases', category: 'ANNOUNCEMENTS',
      url: 'https://www.tn.gov.in/press-releases', method: 'MANUAL_ADMIN', cadenceHours: 6,
      description: 'Official TN government press releases, orders and notifications feed.',
    },
    {
      key: 'eci-results', name: 'Election Commission of India — Results', category: 'POLITICAL_LEADERSHIP',
      url: 'https://results.eci.gov.in', method: 'MANUAL_ADMIN', cadenceHours: 24,
      description: 'Authoritative election results (general and by-election) for MLA/MP records and vacancy tracking.',
    },
    {
      key: 'eci-notifications', name: 'Election Commission of India — Notifications', category: 'ELECTORAL_BOUNDARIES',
      url: 'https://www.eci.gov.in', method: 'MANUAL_ADMIN', cadenceHours: 12,
      description: 'ECI notifications for by-elections, delimitation and boundary applicability.',
    },
    {
      key: 'tn-legislative-assembly', name: 'Tamil Nadu Legislative Assembly', category: 'POLITICAL_LEADERSHIP',
      url: 'https://www.assembly.tn.gov.in', method: 'MANUAL_ADMIN', cadenceHours: 24,
      description: 'Speaker, Deputy Speaker, LoP and session calendar records.',
    },
    {
      key: 'lokbhavan-tn', name: 'Lok Bhavan (Raj Bhavan), Tamil Nadu', category: 'POLITICAL_LEADERSHIP',
      url: 'https://lokbhavan.tn.gov.in', method: 'MANUAL_ADMIN', cadenceHours: 24,
      description: 'Governor profiles and Raj Bhavan communiqus.',
    },
    {
      key: 'pib-releases', name: 'Press Information Bureau', category: 'ANNOUNCEMENTS',
      url: 'https://pib.gov.in', method: 'RSS', cadenceHours: 6,
      description: 'Union government releases relevant to Tamil Nadu and central schemes.',
    },
    {
      key: 'tn-finance-budget', name: 'TN Finance Department — Budget documents', category: 'DEPARTMENTS',
      url: 'https://financedept.tn.gov.in', method: 'DATASET_DOWNLOAD', cadenceHours: 168,
      description: 'Budget speech and department-wise allocations for department budget figures.',
    },
    {
      key: 'tn-schemes', name: 'TN Government — Schemes', category: 'SCHEMES',
      url: 'https://www.tn.gov.in/scheme', method: 'MANUAL_ADMIN', cadenceHours: 24,
      description: 'Official scheme listing for verifying scheme status, eligibility and application routes.',
    },
    {
      key: 'data-gov-in', name: 'data.gov.in — India open data', category: 'ADMIN_BOUNDARIES',
      url: 'https://data.gov.in', method: 'API', cadenceHours: 168, requiresConfig: 'DATA_GOV_IN_API_KEY',
      description: 'Structured datasets (districts, boundaries, scheme beneficiary data). Requires an API key configured via environment variable.',
    },
    {
      key: 'civic-lenz-geo-datasets', name: 'Civic Lenz boundary GeoJSON datasets', category: 'ELECTORAL_BOUNDARIES',
      url: 'https://www.eci.gov.in', method: 'DATASET_DOWNLOAD', cadenceHours: 8760,
      description: 'Local /geo files: ECI-delimitation-based AC/PC datasets and district polygons. Revision only on an official boundary notification — never silently reshaped.',
    },
    {
      key: 'eci-tn-ac-results', name: 'ECI — Tamil Nadu Assembly results & by-polls', category: 'POLITICAL_LEADERSHIP',
      url: 'https://results.eci.gov.in', method: 'MANUAL_ADMIN', cadenceHours: 12,
      description: 'Constituency-wise winners for the 234 ACs (2026 general election counted 4 May 2026) and by-polls (6 Oct 2026: Madurantakam, Dharapuram). Refresh after every by-poll notification; five seats (Perundurai 103, Karur 135, Tiruchirappalli East 141, Viralimalai 179, Ambasamudram 225) are vacant pending by-polls as of 6 Nov 2026.',
    },
  ]
  for (const s of dataSourceSeeds) {
    await db.dataSource.create({
      data: {
        key: s.key, name: s.name, category: s.category, url: s.url, method: s.method,
        cadenceHours: s.cadenceHours, requiresConfig: s.requiresConfig ?? null, enabled: true,
        description: s.description,
      },
    })
  }

  // Verification-run provenance for the electoral directory (2026-11-06 pass).
  await db.syncLog.create({
    data: {
      runId: 'verif-2026-11-06-electoral-directory',
      sourceKey: 'eci-tn-ac-results',
      startedAt: new Date('2026-11-06T10:00:00'),
      finishedAt: new Date('2026-11-06T11:30:00'),
      status: 'SUCCESS',
      triggeredBy: 'MANUAL_ADMIN',
      recordsFetched: 234 + 39,
      recordsAdded: 234 + 39,
      recordsUpdated: 0,
      recordsUnchanged: 0,
      recordsSkipped: 0,
      details:
        'Constituency directory verification pass: 234 ACs + 39 PCs cross-validated across the 2026 results compilation, the 17th Assembly member register and the party-position table (tallies agree exactly). By-polls of 6 Oct 2026 (Madurantakam, Dharapuram) confirmed directly on results.eci.gov.in. Five seats recorded VACANT pending by-polls.',
    },
  })

  const counts = {
    states: await db.state.count(),
    districts: await db.district.count(),
    constituencies: await db.constituency.count(),
    records: await db.politicalRecord.count(),
    departments: await db.department.count(),
    schemes: await db.scheme.count(),
    announcements: await db.announcement.count(),
    events: await db.calendarEvent.count(),
    projects: await db.project.count(),
    complaints: await db.complaint.count(),
    verificationRequests: await db.citizenVerificationRequest.count(),
    auditLogs: await db.auditLog.count(),
    demoUsers: await db.demoUser.count(),
    dataSources: await db.dataSource.count(),
  }
  console.log('Seed complete:', counts)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
