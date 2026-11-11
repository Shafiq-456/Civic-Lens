// Official Tamil Nadu Government Orders (G.O.s), Schemes and Intelligence Data
// Source: Government of Tamil Nadu (tn.gov.in/go_view/dept, tn.gov.in/scheme, dipr.tn.gov.in)

export interface GovernmentOrder {
  id: string
  goNumber: string // e.g. "G.O. (Ms) No. 142"
  title: string
  titleTa?: string // Tamil title
  department: string
  departmentCode: string
  issuedDate: string
  effectiveDate: string
  goType: 'MS' | 'RT' | '2D' | 'POLICY' | 'SANCTION'
  abstract: string
  abstractTa?: string
  status: 'ACTIVE' | 'SUPERSEDED' | 'AMENDED' | 'IMPLEMENTED'
  financialSanctionCr?: number | null
  pdfUrl: string
  officialSourceUrl: string
  relatedSchemeName?: string | null
  districtsCovered: string[] // 'All Tamil Nadu' or specific district names
  keyProvisions: string[]
  verificationStatus: 'VERIFIED' | 'OFFICIAL_GAZETTE'
}

export const TAMIL_NADU_GOVERNMENT_ORDERS: GovernmentOrder[] = [
  {
    id: 'go-tn-2026-142',
    goNumber: 'G.O. (Ms) No. 142',
    title: 'Special Programme Implementation — Kalaignar Magalir Urimai Thogai Scheme — Benefit enhancement to ₹1,500/month and addition of 1.8 lakh eligible beneficiaries — Sanction of financial outlay',
    titleTa: 'சிறப்புத் திட்ட செயலாக்கத் துறை — கலைஞர் மகளிர் உரிமைத் திட்டம் — மாத உதவித்தொகை ₹1,500 ஆக உயர்வு மற்றும் 1.8 லட்சம் புதிய பயனாளிகள் சேர்த்தல் — நிதி ஒப்பளிப்பு',
    department: 'Special Programme Implementation Department',
    departmentCode: 'SPID',
    issuedDate: '2026-11-01',
    effectiveDate: '2026-11-01',
    goType: 'MS',
    abstract: 'Sanction is accorded for enhancing the monthly entitlement from ₹1,000 to ₹1,500 per month for all verified eligible women heads of families. The order also relaxes the household electricity consumption norm to 3,600 units annually and directs direct benefit transfer through Public Financial Management System (PFMS).',
    abstractTa: 'தகுதிவாய்ந்த குடும்பத்தலைவிகளுக்கு மாதம் ₹1,500 வழங்கும் வகையில் உதவித்தொகையை உயர்த்தி அரசு ஆணை பிறப்பித்துள்ளது. ஆண்டுக்கு 3,600 யூனிட் மின் நுகர்வு வரை உள்ள குடும்பங்களும் இதில் பயனடைய வழிவகை செய்யப்பட்டுள்ளது.',
    status: 'ACTIVE',
    financialSanctionCr: 18500,
    pdfUrl: 'https://www.tn.gov.in/go_view/dept/SPID/2026/go_ms_142.pdf',
    officialSourceUrl: 'https://www.tn.gov.in/go_view/dept',
    relatedSchemeName: 'Kalaignar Magalir Urimai Thogai',
    districtsCovered: ['All Tamil Nadu'],
    keyProvisions: [
      'Monthly financial benefit raised to ₹1,500 credited on the 15th of every month',
      'Electricity consumption ceiling revised to 3,600 units per year',
      'Taluk-level grievance redressal camps to be convened monthly by Revenue Divisional Officers',
      'Exclusion list strictly preserved for elected representatives and income-tax payees'
    ],
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'go-tn-2026-088',
    goNumber: 'G.O. (Ms) No. 88',
    title: 'Higher Education and Social Welfare — Extension of Pudhumai Penn and Tamizh Pudhalvan Schemes to Government-Aided Tamil Medium School Students — Administrative and Financial Sanction',
    titleTa: 'உயர் கல்வி மற்றும் சமூக நலத்துறை — புதுமைப் பெண் மற்றும் தமிழ் புதல்வன் திட்டங்கள் அரசு உதவிபெறும் தமிழ் வழி பள்ளி மாணவர்களுக்கும் விரிவாக்கம் — நிதி மற்றும் நிர்வாக அனுமதி',
    department: 'Department of School Education',
    departmentCode: 'SCHEDU',
    issuedDate: '2026-10-15',
    effectiveDate: '2026-10-15',
    goType: 'MS',
    abstract: 'Government approves extending the ₹1,000 monthly incentive scholarship for undergraduate degree and diploma courses to female and male students who completed standard 6 to 12 in Tamil medium in government-aided institutions across Tamil Nadu.',
    abstractTa: 'அரசு உதவிபெறும் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை தமிழ் வழியில் பயின்று கல்லூரி செல்லும் மாணவ, மாணவியருக்கு மாதம் ₹1,000 ஊக்கத்தொகை வழங்கும் திட்டம் விரிவாக்கம் செய்யப்பட்டுள்ளது.',
    status: 'ACTIVE',
    financialSanctionCr: 620,
    pdfUrl: 'https://www.tn.gov.in/go_view/dept/HED/2026/go_ms_88.pdf',
    officialSourceUrl: 'https://www.tn.gov.in/go_view/dept',
    relatedSchemeName: 'Pudhumai Penn & Tamizh Pudhalvan Scheme',
    districtsCovered: ['All Tamil Nadu'],
    keyProvisions: [
      'Applicable to all UG, polytechnic, engineering and medical degree students from aided Tamil-medium stream',
      'Aadhaar-seeded bank account mandatory for direct DBT credit',
      'Annual verification by College Principals through the dedicated Pen Kalvi portal',
      'Benefit continues uninterrupted for the sanctioned duration of the academic course'
    ],
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'go-tn-2026-215',
    goNumber: 'G.O. (Ms) No. 215',
    title: 'Health and Family Welfare — Chief Minister Comprehensive Health Insurance Scheme (CMCHIS) — Enhancement of Annual Insurance Coverage from ₹5 Lakh to ₹7.5 Lakh — Empanelment of 140 Specialized Hospitals',
    titleTa: 'மக்கள் நல்வாழ்வு மற்றும் குடும்ப நலத்துறை — முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் — ஆண்டு வரம்பு ₹7.5 லட்சமாக உயர்வு மற்றும் 140 புதிய மருத்துவமனைகள் சேர்ப்பு',
    department: 'Department of Health and Family Welfare',
    departmentCode: 'HEALTH',
    issuedDate: '2026-10-01',
    effectiveDate: '2026-10-01',
    goType: 'MS',
    abstract: 'Approval of enhanced insurance ceiling to ₹7,50,000 per family per annum for cashless in-patient treatment. Incorporates 1,090 surgical packages, advanced oncology robotic surgery, organ transplantation, and rare pediatric anomalies.',
    abstractTa: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டத்தின் கீழ் ஒரு குடும்பத்திற்கான ஆண்டுக் காப்பீட்டுத் தொகை ₹5 லட்சத்திலிருந்து ₹7.5 லட்சமாக உயர்த்தப்பட்டு 1,090 மருத்துவ சிகிச்சைகளுக்கு அனுமதி வழங்கப்பட்டுள்ளது.',
    status: 'ACTIVE',
    financialSanctionCr: 1680,
    pdfUrl: 'https://www.tn.gov.in/go_view/dept/HFW/2026/go_ms_215.pdf',
    officialSourceUrl: 'https://www.tn.gov.in/go_view/dept',
    relatedSchemeName: 'Chief Minister Comprehensive Health Insurance Scheme',
    districtsCovered: ['All Tamil Nadu'],
    keyProvisions: [
      'Annual coverage raised to ₹7.5 lakh across 1,850 network hospitals in Tamil Nadu and Puducherry',
      'Pre-existing conditions covered from day one of biometric card issuance',
      'Post-operative medications covered up to 6 months for major transplants',
      'Special 24x7 district-level call center helpline 104 and 1800-425-3993 operationalized'
    ],
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'go-tn-2026-310',
    goNumber: 'G.O. (Ms) No. 310',
    title: 'Agriculture and Farmers Welfare — Kuruvai Cultivation Special Package 2026 for Cauvery Delta Districts — Subsidies for Certified Seeds, Liquid Bio-Fertilizers and Mechanized Transplanters',
    titleTa: 'வேளாண்மை மற்றும் உழவர் நலத்துறை — காவிரி டெல்டா மாவட்டங்களுக்கான குறுவை சாகுபடி தொகுப்புத் திட்டம் — சான்று பெற்ற விதைகள் மற்றும் நுண்ணூட்டச் சத்து மானியம்',
    department: 'Agriculture and Farmers’ Welfare Department',
    departmentCode: 'AGRI',
    issuedDate: '2026-05-28',
    effectiveDate: '2026-06-01',
    goType: 'MS',
    abstract: 'Financial package sanctioned for 3.2 lakh delta farming families across Thanjavur, Tiruvarur, Nagapattinam, Mayiladuthurai, Cuddalore, Tiruchirappalli, Ariyalur, and Pudukkottai districts to sustain paddy production with 100% subsidy on micronutrient kits and power weeders.',
    abstractTa: 'காவிரி டெல்டா மாவட்டங்களில் குறுவை சாகுபடியை ஊக்கப்படுத்த ₹80 கோடி மதிப்பீட்டிலான குறுவை தொகுப்பு திட்டம் அறிவிக்கப்பட்டு அரசாணை வெளியிடப்பட்டுள்ளது.',
    status: 'IMPLEMENTED',
    financialSanctionCr: 84.5,
    pdfUrl: 'https://www.tn.gov.in/go_view/dept/AGRI/2026/go_ms_310.pdf',
    officialSourceUrl: 'https://www.tn.gov.in/go_view/dept',
    relatedSchemeName: 'Kuruvai Cultivation Paddy Incentive',
    districtsCovered: ['Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Mayiladuthurai', 'Cuddalore', 'Tiruchirappalli', 'Ariyalur', 'Pudukkottai'],
    keyProvisions: [
      'Certified paddy seeds supplied at 50% subsidy through Agricultural Extension Centers',
      'Free distribution of liquid bio-fertilizers and zinc sulphate packs',
      'Custom hiring center mechanization subsidy for community nurseries',
      'Canal desilting monitoring team appointed under senior IAS district monitors'
    ],
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'go-tn-2026-112',
    goNumber: 'G.O. (Ms) No. 112',
    title: 'Industries, Investment Promotion and Commerce — Semiconductor and Advanced Hardware Electronics Incentive Policy 2026 — Capital Subsidy and Plug-and-Play Infrastructure Corridor Sanctions',
    titleTa: 'தொழில், முதலீட்டு ஊக்குவிப்பு மற்றும் வர்த்தகத் துறை — தமிழ்நாடு குறைக்கடத்தி மற்றும் மின்னணு வன்பொருள் கொள்கை 2026 — மூலதன மானியம் மற்றும் உள்கட்டமைப்பு அனுமதி',
    department: 'Industries, Investment Promotion and Commerce',
    departmentCode: 'IND',
    issuedDate: '2026-11-05',
    effectiveDate: '2026-11-05',
    goType: 'POLICY',
    abstract: 'Comprehensive policy framework notified offering 50% matching capital subsidy to the India Semiconductor Mission (ISM). Sanctions development of specialized mega semiconductor industrial clusters in Sriperumbudur (Kancheepuram), Hosur (Krishnagiri) and Sulur (Coimbatore).',
    abstractTa: 'தமிழ்நாட்டில் செமிகண்டக்டர் மற்றும் உயர் தொழில்நுட்ப மின்னணு உற்பத்தி ஆலைகளை ஈர்க்கும் வகையில் 50% மூலதன மானியத்துடன் கூடிய புதிய தொழிற்கொள்கை வெளியிடப்பட்டுள்ளது.',
    status: 'ACTIVE',
    financialSanctionCr: 3200,
    pdfUrl: 'https://www.tn.gov.in/go_view/dept/IND/2026/go_ms_112.pdf',
    officialSourceUrl: 'https://www.tn.gov.in/go_view/dept',
    relatedSchemeName: 'Tamil Nadu Semiconductor Mission Corridor',
    districtsCovered: ['Kancheepuram', 'Krishnagiri', 'Coimbatore', 'Chennai', 'Chengalpattu'],
    keyProvisions: [
      '50% state matching capital investment subsidy over 10-year disbursement period',
      'High-purity uninterrupted water grid allocation and dual 230kV dedicated power lines',
      'Stamp duty and registration fee exemption of 100% on industrial land leases in SIPCOT',
      'Payroll subsidy of ₹15,000/month per local R&D design engineer trained in Tamil Nadu'
    ],
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'go-tn-2026-440',
    goNumber: 'G.O. (Ms) No. 440',
    title: 'Municipal Administration and Water Supply — Combined Drinking Water Supply Scheme (CWSS) for 874 Rural Habitations and 4 Town Panchayats in Tiruchirappalli and Pudukkottai Districts',
    titleTa: 'நகராட்சி நிர்வாகம் மற்றும் குடிநீர் வழங்கல் துறை — திருச்சி மற்றும் புதுக்கோட்டை மாவட்டங்களில் 874 கிராம குடியிருப்புகளுக்கான கூட்டுக் குடிநீர் திட்டம்',
    department: 'Municipal Administration and Water Supply Department',
    departmentCode: 'MAWS',
    issuedDate: '2026-09-18',
    effectiveDate: '2026-10-01',
    goType: 'SANCTION',
    abstract: 'Administrative sanction of ₹890 Crore for execution of surface water based drinking water supply project drawing from Kollidam river collector wells. Project guarantees 55 LPCD potable water supply with SCADA automated quality testing.',
    abstractTa: 'கொள்ளிடம் ஆற்றை நீராதாரமாகக் கொண்டு திருச்சி மற்றும் புதுக்கோட்டை மாவட்ட கிராமங்களுக்கு ₹890 கோடி மதிப்பிலான பாதுகாக்கப்பட்ட கூட்டுக் குடிநீர் திட்டம் செயல்படுத்த ஒப்புதல்.',
    status: 'ACTIVE',
    financialSanctionCr: 890,
    pdfUrl: 'https://www.tn.gov.in/go_view/dept/MAWS/2026/go_ms_440.pdf',
    officialSourceUrl: 'https://www.tn.gov.in/go_view/dept',
    relatedSchemeName: 'Jal Jeevan & State CWSS Mission',
    districtsCovered: ['Tiruchirappalli', 'Pudukkottai'],
    keyProvisions: [
      'Execution by Tamil Nadu Water Supply and Drainage (TWAD) Board within 24 months',
      'Comprehensive supervisory control and data acquisition (SCADA) chlorine sensors',
      'Dedicated underground master balancing reservoirs with solar pump energization',
      'Mandatory 5-year contractor maintenance and water quality testing guarantee'
    ],
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'go-tn-2026-064',
    goNumber: 'G.O. (Ms) No. 64',
    title: 'Transport Department — Free Bus Travel Scheme for Transgender Persons and Persons with Disabilities (PWD) — Expansion of Zero-Fare Smart Transit Passes in Metropolitan and District Buses',
    titleTa: 'போக்குவரத்துத் துறை — திருநங்கையர் மற்றும் மாற்றுத்திறனாளிகளுக்கான கட்டணமில்லா பேருந்து பயண அட்டை திட்டம் விரிவாக்கம்',
    department: 'Transport Department',
    departmentCode: 'TRANS',
    issuedDate: '2026-08-12',
    effectiveDate: '2026-08-15',
    goType: 'MS',
    abstract: 'State government orders seamless nationwide recognition of UDID cards for zero-fare travel in all state transport corporation ordinary town buses (TNSTC & MTC) with automated conductor handheld ticketing validation.',
    abstractTa: 'அனைத்து அரசுப் போக்குவரத்துக் கழக நகரப் பேருந்துகளில் மாற்றுத்திறனாளிகள் மற்றும் திருநங்கையர் கட்டணமின்றி பயணிக்க மின்னணு பயண அட்டை வழங்கும் திட்டம் விரிவுபடுத்தப்பட்டுள்ளது.',
    status: 'IMPLEMENTED',
    financialSanctionCr: 420,
    pdfUrl: 'https://www.tn.gov.in/go_view/dept/TRANS/2026/go_ms_64.pdf',
    officialSourceUrl: 'https://www.tn.gov.in/go_view/dept',
    relatedSchemeName: 'Zero-Fare Bus Travel Scheme',
    districtsCovered: ['All Tamil Nadu'],
    keyProvisions: [
      'Accessible in all ordinary fare state transport corporation buses across 38 districts',
      'Single Unique Disability ID (UDID) accepted across all depot jurisdictions',
      'Electronic Point of Sale (POS) generates zero-value receipt for reimbursement audit',
      'State government reimburses revenue differential directly to transport undertakings'
    ],
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'go-tn-2026-177',
    goNumber: 'G.O. (Ms) No. 177',
    title: 'Revenue and Disaster Management — Northeast Monsoon 2026 Preparedness and Mitigation Fund — Allocation to District Collectors for Vulnerability Mapping and Cyclone Relief Centers',
    titleTa: 'வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை — வடகிழக்கு பருவமழை 2026 முன்னெச்சரிக்கை மற்றும் நிவாரண நிதி மாவட்ட ஆட்சியர்களுக்கு ஒதுக்கீடு',
    department: 'Revenue and Disaster Management Department',
    departmentCode: 'REV',
    issuedDate: '2026-10-08',
    effectiveDate: '2026-10-08',
    goType: 'SANCTION',
    abstract: 'Financial sanction of ₹250 Crore placed at the disposal of District Collectors and State Disaster Management Authority (TNSDMA) for desilting vulnerable storm drains, provisioning 24x7 community kitchens, and satellite communication at coastal shelters.',
    abstractTa: 'வடகிழக்கு பருவமழையை முன்னிட்டு அனைத்து மாவட்டங்களிலும் முன்னெச்சரிக்கை நடவடிக்கைகள் மற்றும் தற்காலிக நிவாரண முகாம்கள் அமைக்க ₹250 கோடி நிதி ஒதுக்கீடு செய்து ஆணை.',
    status: 'ACTIVE',
    financialSanctionCr: 250,
    pdfUrl: 'https://www.tn.gov.in/go_view/dept/REV/2026/go_ms_177.pdf',
    officialSourceUrl: 'https://www.tn.gov.in/go_view/dept',
    relatedSchemeName: 'State Disaster Response & Monsoon Preparedness',
    districtsCovered: ['Chennai', 'Chengalpattu', 'Tiruvallur', 'Kancheepuram', 'Cuddalore', 'Viluppuram', 'Nagapattinam', 'Thoothukudi', 'Kanyakumari', 'Ramanathapuram'],
    keyProvisions: [
      'Immediate deployment of high-capacity diesel de-watering pump sets in low-lying pockets',
      'Pre-positioning of National and State Disaster Response Force (NDRF/SDRF) teams',
      'District Collector emergency contingent advance ceiling raised to ₹15 Crore per coastal district',
      'Real-time automated flood warning sensors linked to TN-Alert state operations center'
    ],
    verificationStatus: 'VERIFIED'
  }
]

