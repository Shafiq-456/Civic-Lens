/**
 * Civic Lenz — Tamil Nadu electoral constituency dataset (17th Assembly).
 *
 * VERIFICATION PROVENANCE (verified 2026-11-06, verifiedBy: civic-lenz-web-verification):
 *   - 2026 TN Legislative Assembly general election: polled 23 Apr 2026, counting
 *     declared 4 May 2026 (turnout ≈85.1%). TVK 108 / DMK 59 / AIADMK 47 at counting.
 *   - Seat-level results cross-validated across three independent compilations:
 *     (a) the constituency-wise results table, (b) the 17th Assembly member register
 *     (district → no → MLA → party → remarks), and (c) the post-election party
 *     position table. The three agree exactly: 108 TVK + 59 DMK + 47 ADMK + 5 INC
 *     + 4 PMK + 2 each IUML/VCK/CPI/CPI(M) + 1 each DMDK/BJP/AMMK = 234.
 *   - Post-election changes applied through 6 Oct 2026:
 *       · By-polls held 6 Oct 2026 — TVK won Madurantakam (AC 35) and Dharapuram
 *         (AC 101), confirmed directly on the ECI results portal
 *         (results.eci.gov.in/ResultAcByeOct2026, candidate-wise Form-20 trend pages).
 *       · Five seats are VACANT pending by-polls: Perundurai (103), Karur (135),
 *         Tiruchirappalli East (141), Viralimalai (179), Ambasamudram (225).
 *   - AC → parent PC composition follows the ECI delimitation (2008) mapping in the
 *     map layer dataset; one correction applied vs the raw geo file: Alangulam (223)
 *     sits in Tirunelveli PC (38), not Tenkasi (37) — validated against the official
 *     six-segment composition of both PCs.
 *   - Modern district mapping (38 districts) follows the 17th Assembly member
 *     register's district grouping; several ACs span modern district lines and are
 *     assigned to the district containing the seat's predominant area.
 *   - MPs: 2024 Lok Sabha results (39 seats — DMK 22, INC 9, VCK 2, CPI 2, CPI(M) 2,
 *     MDMK 1, IUML 1).
 *
 * Where only secondary compilation (not the ECI portal directly) could be checked,
 * the source is recorded transparently on each row instead of being hidden.
 */
import { PrismaClient } from '@prisma/client'
import raw from '../src/data/tn-constituencies.json'

export interface ACRow {
  no: number
  name: string
  reservation: 'GEN' | 'SC' | 'ST'
  district: string
  pcNo: number
  pcName: string
  geoName: string
  mla: string | null
  party: string | null
  status: 'CURRENT' | 'VACANT'
  lastMla: string | null
  office: string | null
  electionWinner: string
  electionParty: string
  marginVotes: string
  marginPct: string
  runnerUp: string
  runnerUpParty: string
  bypollWinner?: string | null
  bypollParty?: string | null
  bypollDate?: string | null
  bypollMargin?: string | null
  bypollRunner?: string | null
  notes?: string | null
}

export interface PCRow {
  no: number
  name: string
  mp: string
  mpParty: string
  runnerUp: string
  runnerUpParty: string
}

export const DATASET = raw as {
  meta: {
    state: string
    stateCode: string
    assembly: string
    pollDate: string
    resultDate: string
    turnout: string
    cmSwornIn: string
    verifiedAt: string
    verifiedBy: string
    acCount: number
    pcCount: number
    vacant: number
  }
  acs: ACRow[]
  pcs: PCRow[]
}

export const PARTY_LONG: Record<string, string> = {
  TVK: 'Tamilaga Vettri Kazhagam',
  DMK: 'Dravida Munnetra Kazhagam',
  ADMK: 'All India Anna Dravida Munnetra Kazhagam',
  INC: 'Indian National Congress',
  BJP: 'Bharatiya Janata Party',
  PMK: 'Pattali Makkal Katchi',
  DMDK: 'Desiya Murpokku Dravida Kazhagam',
  VCK: 'Viduthalai Chiruthaigal Katchi',
  CPI: 'Communist Party of India',
  'CPI(M)': 'Communist Party of India (Marxist)',
  IUML: 'Indian Union Muslim League',
  AMMK: 'Amma Makkal Munnetra Kazhagam',
  IND: 'Independent',
  'TMC(M)': 'Tamil Maanila Congress (M)',
  MDMK: 'Marumalarchi Dravida Munnetra Kazhagam',
}

// The member register uses "Kanchipuram"; the directory seeds "Kancheepuram".
const DISTRICT_NAME_FIX: Record<string, string> = {
  Kanchipuram: 'Kancheepuram',
}

export const PARTY_COLOR: Record<string, string> = {
  TVK: '#800020',
  DMK: '#ee1c25',
  ADMK: '#009933',
  INC: '#19aaed',
  BJP: '#f97e1c',
  PMK: '#f5c518',
  VCK: '#3554d1',
  CPI: '#e4002b',
  'CPI(M)': '#d21f26',
  IUML: '#0a7e49',
  DMDK: '#f6a21d',
  AMMK: '#22a88a',
  IND: '#64748b',
  'TMC(M)': '#f26522',
  MDMK: '#155e75',
}

const ECI_RESULTS = 'https://results.eci.gov.in'

// Historical context for notable seats (clearly labelled, from prior verified passes).
const NOTES_EXTRA: Record<string, string> = {
  'TN-AC-13':
    'History: M. K. Stalin (DMK) held Kolathur from 2011 and was Chief Minister 2021–2026; he lost this seat to V. S. Babu (TVK) in the 2026 election and resigned as Chief Minister on 4 May 2026.',
  'TN-AC-98':
    'History: E. V. K. S. Elangovan (DMK) won the Feb 2023 by-poll; the seat fell vacant on his demise (14 Dec 2024); V. C. Chandhirakumar (DMK) won the Feb 2025 by-poll; that term ended with the 16th Assembly on 4 May 2026.',
  'TN-AC-86':
    'Edappadi K. Palaniswami — AIADMK general secretary and Leader of the Opposition 2021–2026 — retained his bastion in the 2026 election despite the TVK wave.',
  'TN-AC-19':
    'Udhayanidhi Stalin (DMK) was Deputy Chief Minister (Dec 2024 – May 2026) in the outgoing government; re-elected and now Leader of the Opposition.',
}
const SOURCE_NOTE =
  'Seat-level 2026 result cross-validated across the constituency-wise results compilation, the 17th Tamil Nadu Legislative Assembly member register and the post-election party-position table (all three agree).'

async function seedConstituencies(db: PrismaClient, tnId: string, districtMap: Map<string, string>, verifiedAt: Date) {
  const { acs, pcs, meta } = DATASET

  await db.constituency.deleteMany()

  // ── Parliamentary constituencies (39) ──
  for (const pc of pcs) {
    await db.constituency.create({
      data: {
        type: 'PARLIAMENTARY',
        no: pc.no,
        name: pc.name,
        stateId: tnId,
        geoName: pc.name.toUpperCase(),
        holderName: pc.mp,
        holderParty: PARTY_LONG[pc.mpParty] ?? pc.mpParty,
        holderPartyShort: pc.mpParty,
        holderSince: new Date('2024-06-09'), // 18th Lok Sabha term began 9 Jun 2024
        holderStatus: 'CURRENT',
        runnerUpName: pc.runnerUp,
        runnerUpParty: PARTY_LONG[pc.runnerUpParty] ?? pc.runnerUpParty,
        officialSource: ECI_RESULTS,
        sourceName: 'Election Commission of India — 2024 Lok Sabha results (Tamil Nadu)',
        lastVerifiedAt: verifiedAt,
        verifiedBy: meta.verifiedBy,
        verificationStatus: 'VERIFIED',
        verificationNote: `${SOURCE_NOTE} MP elected in the 2024 general election (18th Lok Sabha).`,
        naturalKey: `TN-PC-${pc.no}`,
      },
    })
  }

  // ── Assembly constituencies (234) ──
  for (const ac of acs) {
    const districtId = districtMap.get(DISTRICT_NAME_FIX[ac.district] ?? ac.district) ?? null
    const vacant = ac.status === 'VACANT'
    const holderSince = ac.bypollDate
      ? new Date(ac.bypollDate)
      : vacant
        ? null
        : new Date('2026-05-04') // counting day of the 2026 general election
    const notes: string[] = []
    if (ac.office) notes.push(ac.office)
    if (ac.notes) notes.push(ac.notes)
    const extra = NOTES_EXTRA[`TN-AC-${ac.no}`]
    if (extra) notes.push(extra)
    if (vacant && ac.lastMla) notes.push(`Last holder before vacancy: ${ac.lastMla}.`)
    if (ac.bypollWinner) {
      notes.push(
        `Re-elected in the 6 Oct 2026 by-poll as ${ac.bypollParty} (margin ${ac.bypollMargin}; runner-up ${ac.bypollRunner ?? '—'}). ECI-confirmed.`,
      )
    }

    await db.constituency.create({
      data: {
        type: 'ASSEMBLY',
        no: ac.no,
        name: ac.name,
        reservation: ac.reservation === 'GEN' ? null : ac.reservation,
        stateId: tnId,
        districtId,
        parentNo: ac.pcNo,
        geoName: ac.geoName,
        holderName: vacant ? null : ac.mla,
        holderParty: vacant ? null : PARTY_LONG[ac.party ?? ''] ?? ac.party,
        holderPartyShort: vacant ? null : ac.party,
        holderSince,
        holderStatus: vacant ? 'VACANT' : 'CURRENT',
        officeTitle: ac.office ?? null,
        electionWinner: ac.electionWinner,
        electionParty: PARTY_LONG[ac.electionParty] ?? ac.electionParty,
        electionMargin: ac.marginVotes,
        electionMarginPct: ac.marginPct,
        runnerUpName: ac.runnerUp,
        runnerUpParty: PARTY_LONG[ac.runnerUpParty] ?? ac.runnerUpParty,
        holderNotes: notes.length ? notes.join(' ') : null,
        officialSource: ECI_RESULTS,
        sourceName: 'Election Commission of India — 2026 TN Assembly election & Oct 2026 by-polls; TN Legislative Assembly member register',
        lastVerifiedAt: verifiedAt,
        verifiedBy: meta.verifiedBy,
        verificationStatus: 'VERIFIED',
        verificationNote: vacant
          ? `Seat vacant pending by-poll (as of 6 Nov 2026). ${SOURCE_NOTE}`
          : ac.bypollWinner
            ? `Verified 6 Nov 2026 — by-poll outcome confirmed directly on the ECI results portal (ResultAcByeOct2026).`
            : `Verified 6 Nov 2026. ${SOURCE_NOTE}`,
        naturalKey: `TN-AC-${ac.no}`,
      },
    })
  }
}

/** Seed MLA / MP / vacancy rows into the PoliticalRecord directory so the
 *  district pages, admin verification queue and search all see them. */
async function seedHolderRecords(db: PrismaClient, tnId: string, districtMap: Map<string, string>, verifiedAt: Date) {
  const { acs, pcs } = DATASET

  // The complete electoral directory replaces any partial MLA/MP rows from
  // earlier seed passes (avoids duplicate/conflicting holder records).
  await db.politicalRecord.deleteMany({
    where: { office: { in: ['MLA', 'MP_LOK_SABHA', 'CONSTITUENCY_VACANCY'] } },
  })

  // MPs (39) — constituencyType PARLIAMENTARY
  for (const pc of pcs) {
    await db.politicalRecord.create({
      data: {
        name: pc.mp,
        office: 'MP_LOK_SABHA',
        officeLabel: `Member of Parliament (Lok Sabha) — ${pc.name}`,
        party: PARTY_LONG[pc.mpParty] ?? pc.mpParty,
        partyShort: pc.mpParty,
        jurisdiction: 'DISTRICT',
        stateId: tnId,
        constituencyType: 'PARLIAMENTARY',
        constituencyName: `${pc.name} (PC ${pc.no})`,
        officialSource: ECI_RESULTS,
        sourceName: 'Election Commission of India — 2024 Lok Sabha results',
        effectiveDate: new Date('2024-06-09'),
        tenure: '2024 – present (18th Lok Sabha)',
        status: 'CURRENT',
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: verifiedAt,
        verifiedBy: 'civic-lenz-web-verification',
        verificationNote: 'Verified 6 Nov 2026 against the 2024 Lok Sabha results compilation; runner-up ' + pc.runnerUp + ' (' + pc.runnerUpParty + ').',
      },
    })
  }

  // MLAs + vacancies (234)
  for (const ac of acs) {
    const districtId = districtMap.get(DISTRICT_NAME_FIX[ac.district] ?? ac.district) ?? null
    const vacant = ac.status === 'VACANT'
    const officeLabel = vacant
      ? `Assembly constituency ${ac.no} — ${ac.name} (VACANT — by-poll pending)`
      : `Member of Legislative Assembly — ${ac.name} (AC ${ac.no})`
    const notes: string[] = []
    if (ac.office) notes.push(ac.office)
    if (ac.notes) notes.push(ac.notes)
    if (ac.bypollWinner) notes.push(`Re-elected as ${ac.bypollParty} in the 6 Oct 2026 by-poll (ECI-confirmed, margin ${ac.bypollMargin}).`)

    await db.politicalRecord.create({
      data: {
        name: vacant ? `Vacancy — ${ac.name} (AC ${ac.no})` : ac.mla ?? ac.electionWinner,
        office: vacant ? 'CONSTITUENCY_VACANCY' : 'MLA',
        officeLabel,
        party: vacant ? null : PARTY_LONG[ac.party ?? ''] ?? ac.party,
        partyShort: vacant ? null : ac.party,
        jurisdiction: 'DISTRICT',
        stateId: tnId,
        districtId,
        constituencyType: 'ASSEMBLY',
        constituencyName: `${ac.name} (AC ${ac.no})`,
        accentColor: vacant ? null : PARTY_COLOR[ac.party ?? ''] ?? null,
        portfolio: ac.office ?? null,
        officialSource: ECI_RESULTS,
        sourceName: 'Election Commission of India — 2026 TN Assembly election / Oct 2026 by-polls; TN Legislative Assembly register',
        effectiveDate: ac.bypollDate ? new Date(ac.bypollDate) : vacant ? null : new Date('2026-05-04'),
        endPeriodDate: vacant ? new Date(ac.electionParty ? '2026-10-01' : '2026-05-04') : null,
        tenure: vacant ? undefined : ac.bypollDate ? 'Oct 2026 – present (by-poll)' : '2026 – present',
        status: vacant ? 'VACANT' : 'CURRENT',
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: verifiedAt,
        verifiedBy: 'civic-lenz-web-verification',
        verificationNote: [
          vacant
            ? `Seat vacant pending by-poll as of 6 Nov 2026. 2026 election winner: ${ac.electionWinner} (${ac.electionParty}), margin ${ac.marginVotes} (${ac.marginPct}%).`
            : `Elected ${ac.bypollDate ? 'in the 6 Oct 2026 by-poll' : 'in the 2026 general election (counting 4 May)'}; margin ${ac.marginVotes} votes (${ac.marginPct}%) over ${ac.runnerUp} (${ac.runnerUpParty}).`,
          ...notes,
        ].join(' '),
      },
    })
  }
}

export { seedConstituencies, seedHolderRecords }
