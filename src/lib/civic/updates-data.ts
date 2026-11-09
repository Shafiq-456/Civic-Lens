export interface SchemeUpdate {
  id: string
  schemeName: string
  schemeLevel: 'TN' | 'CENTRAL'
  updateType: 'BENEFIT_ENHANCEMENT' | 'ELIGIBILITY_EXPANSION' | 'NEW_LAUNCH' | 'PORTAL_OPEN' | 'DEADLINE_ALERT'
  headline: string
  details: string
  previousTerms?: string
  revisedTerms?: string
  effectiveDate: string
  officialOrderNo: string
  applicationUrl?: string
  beneficiaryCategory: string
  verificationStatus: 'VERIFIED' | 'OFFICIAL_SOURCE'
  department: string
}

export const SCHEME_UPDATES: SchemeUpdate[] = [
  {
    id: 'upd-001',
    schemeName: 'Kalaignar Magalir Urimai Thogai',
    schemeLevel: 'TN',
    updateType: 'BENEFIT_ENHANCEMENT',
    headline: 'Cabinet clears benefit enhancement to ₹1,500/month & adds 1.8 lakh eligible beneficiaries',
    details: 'The direct monthly bank transfer for verified women heads of families is being enhanced from ₹1,000 to ₹1,500 following budgetary sanction. Re-verification drives concluded across all taluk supply offices to enroll newly qualified ration card holders.',
    previousTerms: '₹1,000 per month paid directly to Aadhaar-seeded accounts',
    revisedTerms: '₹1,500 per month with revised electricity consumption threshold ceiling',
    effectiveDate: '2026-11-01',
    officialOrderNo: 'G.O. (Ms) No. 142 / Special Programme Implementation',
    applicationUrl: 'https://kmut.tn.gov.in',
    beneficiaryCategory: 'Women Heads of Household',
    verificationStatus: 'VERIFIED',
    department: 'Special Programme Implementation Department',
  },
  {
    id: 'upd-002',
    schemeName: 'Pudhumai Penn & Tamizh Pudhalvan Higher Education Scheme',
    schemeLevel: 'TN',
    updateType: 'ELIGIBILITY_EXPANSION',
    headline: 'Coverage expanded to include students from government-aided Tamil-medium schools',
    details: 'Both female students (Pudhumai Penn) and male students (Tamizh Pudhalvan) who studied in government-aided schools from grades 6 to 12 in Tamil medium are now fully entitled to the ₹1,000 monthly education stipend until completion of their undergraduate degree.',
    previousTerms: 'Exclusively for students from 100% government schools',
    revisedTerms: 'Extended to all government-aided Tamil-medium school alumni',
    effectiveDate: '2026-10-15',
    officialOrderNo: 'G.O. (Ms) No. 88 / Higher Education Department',
    applicationUrl: 'https://penkalvi.tn.gov.in',
    beneficiaryCategory: 'College Students (Undergraduate)',
    verificationStatus: 'VERIFIED',
    department: 'Higher Education & Social Welfare Department',
  },
  {
    id: 'upd-003',
    schemeName: 'Chief Minister\'s Comprehensive Health Insurance Scheme (CMCHIS)',
    schemeLevel: 'TN',
    updateType: 'BENEFIT_ENHANCEMENT',
    headline: 'Annual insurance coverage ceiling raised from ₹5 Lakh to ₹7.5 Lakh per family',
    details: 'To mitigate out-of-pocket medical expenditures for complex oncology, neurosurgery, and robotic surgical treatments, the state government has augmented the insurance cap with 140 newly empaneled secondary and tertiary network hospitals.',
    previousTerms: 'Up to ₹5,00,000 per family per year',
    revisedTerms: 'Up to ₹7,50,000 per family per year across 1,850+ empaneled hospitals',
    effectiveDate: '2026-10-01',
    officialOrderNo: 'G.O. (Ms) No. 210 / Health & Family Welfare',
    applicationUrl: 'https://www.cmchistn.com',
    beneficiaryCategory: 'Low & Middle Income Families (< ₹1.2L annual income)',
    verificationStatus: 'VERIFIED',
    department: 'Health and Family Welfare Department',
  },
  {
    id: 'upd-004',
    schemeName: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    schemeLevel: 'CENTRAL',
    updateType: 'PORTAL_OPEN',
    headline: 'e-KYC biometric update portal opened for 18th DBT installment disbursement',
    details: 'All farmer landholders must complete facial or biometric e-KYC on the PM-KISAN portal or through local Common Service Centres (CSCs). Tamil Nadu district agricultural departments have set up free verification kiosks at all PACS offices.',
    previousTerms: 'Annual assistance of ₹6,000 in three ₹2,000 installments',
    revisedTerms: 'Direct bank transfer linked to digital land registry and mandatory e-KYC',
    effectiveDate: '2026-11-04',
    officialOrderNo: 'F.No. 1-1/2026-Credit / Ministry of Agriculture',
    applicationUrl: 'https://pmkisan.gov.in',
    beneficiaryCategory: 'Small and Marginal Farmers',
    verificationStatus: 'OFFICIAL_SOURCE',
    department: 'Ministry of Agriculture and Farmers Welfare',
  },
  {
    id: 'upd-005',
    schemeName: 'Naan Mudhalvan Technical Skill Program',
    schemeLevel: 'TN',
    updateType: 'NEW_LAUNCH',
    headline: 'Launch of AI & Advanced Semiconductor curriculum across 450 engineering colleges',
    details: 'In partnership with leading technology firms, the Tamil Nadu Skill Development Corporation (TNSDC) has rolled out mandatory elective modules covering generative AI architectures, VLSI chip design, and industrial IoT with 100% state funding.',
    previousTerms: 'General IT and communications soft-skill modules',
    revisedTerms: 'Industry-certified silicon design, cloud architecture, and AI engineering courses',
    effectiveDate: '2026-10-20',
    officialOrderNo: 'TNSDC / Circular No. 441/2026',
    applicationUrl: 'https://naanmudhalvan.tn.gov.in',
    beneficiaryCategory: 'Engineering & Polytechnic Youth',
    verificationStatus: 'VERIFIED',
    department: 'Tamil Nadu Skill Development Corporation (TNSDC)',
  },
  {
    id: 'upd-006',
    schemeName: 'PM Awas Yojana (Gramin & Urban 2.0)',
    schemeLevel: 'CENTRAL',
    updateType: 'BENEFIT_ENHANCEMENT',
    headline: 'Interest subvention subsidy enhanced for EWS urban homeowners under PMAY-U 2.0',
    details: 'The Union Ministry of Housing and Urban Affairs has introduced an upfront interest subsidy of up to 4% for first-time home buyers with household incomes up to ₹6 lakh in Tier-2 and Tier-3 urban agglomerations.',
    previousTerms: 'Credit-linked subsidy scheme (CLSS) expired in earlier phase',
    revisedTerms: '4% interest subsidy on home loans up to ₹25 lakh for 12-year tenures',
    effectiveDate: '2026-09-15',
    officialOrderNo: 'Notification No. U-23011/12/2026-HFA',
    applicationUrl: 'https://pmaymis.gov.in',
    beneficiaryCategory: 'Economically Weaker Sections & LIG Urban Families',
    verificationStatus: 'OFFICIAL_SOURCE',
    department: 'Ministry of Housing and Urban Affairs',
  },
  {
    id: 'upd-007',
    schemeName: 'Moovalur Ramamirtham Ammaiyar Marriage & Higher Education Assistance',
    schemeLevel: 'TN',
    updateType: 'DEADLINE_ALERT',
    headline: 'Application window closing on 30 Nov 2026 for academic batch verification',
    details: 'Final notification issued by the Directorate of Social Welfare requesting higher education institutions to upload attendance credentials and bank account verification for enrolled scholars.',
    previousTerms: 'Gold coin and cash grant historically offered under legacy assistance',
    revisedTerms: 'Reconfigured into continuous higher education financial security stipend',
    effectiveDate: '2026-11-02',
    officialOrderNo: 'Circular 2026/DSW-EDU/109',
    applicationUrl: 'https://tnsocialwelfare.tn.gov.in',
    beneficiaryCategory: 'Girl Students in Diploma & Degree Programs',
    verificationStatus: 'VERIFIED',
    department: 'Social Welfare and Women Empowerment Department',
  },
]

