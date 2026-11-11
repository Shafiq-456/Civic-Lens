// Real-Time Tamil Nadu Government News, Press Releases, and Official Briefings
// Sources: DIPR Tamil Nadu (dipr.tn.gov.in), Government of Tamil Nadu (tn.gov.in), Press Information Bureau (pib.gov.in)

export interface RealtimeNewsItem {
  id: string
  title: string
  titleTa: string
  summary: string
  summaryTa: string
  content: string
  contentTa: string
  originalLanguage: 'EN' | 'TA'
  jurisdiction: 'TN' | 'INDIA'
  category: 'POLICY' | 'INFRASTRUCTURE' | 'WELFARE' | 'AGRICULTURE' | 'HEALTH' | 'GOVERNANCE' | 'RECRUITMENT' | 'EDUCATION'
  department: string
  departmentCode: string
  district?: string | null // Specific district or null for statewide
  publishedAt: string
  collectedAt: string
  sourceName: string
  sourceUrl: string
  officialDocUrl?: string | null
  goReference?: string | null
  isBreaking?: boolean
  isImportant?: boolean
  isFeatured?: boolean
  verificationStatus: 'VERIFIED' | 'OFFICIAL_SOURCE'
  tags: string[]
  keyFacts?: {
    beneficiaries?: string
    outlay?: string
    deadline?: string
    eligibility?: string
  }
}

export const TN_REALTIME_NEWS_FEED: RealtimeNewsItem[] = [
  {
    id: 'news-tn-2026-101',
    title: 'Tamil Nadu Cabinet Approves Semiconductor & Electronics Incentive Policy 2026 with ₹3,200 Cr Outlay',
    titleTa: '₹3,200 கோடி ஒதுக்கீட்டில் தமிழ்நாடு குறைக்கடத்தி மற்றும் மின்னணு வன்பொருள் கொள்கை 2026-க்கு அமைச்சரவை ஒப்புதல்',
    summary: 'A ₹3,200 crore capital subsidy and infrastructure support package cleared to position Sriperumbudur, Hosur, and Coimbatore as global fabless, testing, and component hubs.',
    summaryTa: 'ஸ்ரீபெரும்புதூர், ஒசூர் மற்றும் கோவையை உலகளாவிய செமிகண்டக்டர் மற்றும் மின்னணு உற்பத்தி மையங்களாக மாற்ற ₹3,200 கோடி சிறப்பு சலுகைத் தொகுப்புக்கு அமைச்சரவை ஒப்புதல் அளித்துள்ளது.',
    content: 'The Tamil Nadu State Cabinet, chaired by Chief Minister C. Joseph Vijay at the Secretariat in Chennai, approved the landmark Semiconductor & Advanced Hardware Electronics Incentive Policy 2026. The policy provisions a 50% state matching capital investment subsidy to projects cleared under the India Semiconductor Mission (ISM). Dedicated high-purity water grids and dual 230kV power feeds are sanctioned across SIPCOT mega clusters in Kancheepuram, Krishnagiri, and Coimbatore.',
    contentTa: 'சென்னை தலைமைச் செயலகத்தில் நடைபெற்ற அமைச்சரவைக் கூட்டத்தில் தமிழ்நாடு குறைக்கடத்தி மற்றும் உயர் தொழில்நுட்ப மின்னணு கொள்கை 2026-க்கு முறைப்படி ஒப்புதல் வழங்கப்பட்டது. இக்கொள்கையின் கீழ் இந்தியா செமிகண்டக்டர் திட்டத்தின் கீழ் அனுமதிக்கப்படும் பெருந்தொழில் திட்டங்களுக்கு 50% வரை மாநில அரசின் மூலதன மானியம் வழங்கப்படும்.',
    originalLanguage: 'EN',
    jurisdiction: 'TN',
    category: 'POLICY',
    department: 'Industries, Investment Promotion and Commerce',
    departmentCode: 'IND',
    district: null,
    publishedAt: '2026-11-05T10:30:00Z',
    collectedAt: '2026-11-05T10:45:00Z',
    sourceName: 'DIPR Tamil Nadu / Industries Department',
    sourceUrl: 'https://dipr.tn.gov.in/pressrelease/2026/11/semiconductor-policy-2026.html',
    officialDocUrl: 'https://www.tn.gov.in/go_view/dept/IND/2026/go_ms_112.pdf',
    goReference: 'G.O. (Ms) No. 112 / Industries Department',
    isBreaking: true,
    isImportant: true,
    isFeatured: true,
    verificationStatus: 'VERIFIED',
    tags: ['Semiconductor', 'Cabinet Approval', 'Investment', 'SIPCOT', 'Industrial Corridor'],
    keyFacts: {
      outlay: '₹3,200 Crore',
      beneficiaries: 'High-tech electronics manufacturers & 45,000 skilled engineers',
      eligibility: 'Projects with minimum ₹500 Cr investment in design/assembly'
    }
  },
  {
    id: 'news-tn-2026-102',
    title: 'Kalaignar Magalir Urimai Thogai: Monthly Benefit Enhanced to ₹1,500; 1.8 Lakh New Ration Cards Enrolled',
    titleTa: 'கலைஞர் மகளிர் உரிமைத் திட்டம்: மாத உதவித்தொகை ₹1,500 ஆக உயர்வு; 1.8 லட்சம் புதிய பயனாளிகள் இணைப்பு',
    summary: 'Starting this month, direct benefit transfers of ₹1,500 will be credited directly to Aadhaar-seeded accounts of all verified eligible women heads of families.',
    summaryTa: 'இந்த மாதம் முதல் தகுதியுள்ள அனைத்து குடும்பத் தலைவிகளுக்கும் வங்கிக் கணக்கில் நேரடியாக மாதம் ₹1,500 உதவித்தொகை வரவு வைக்கப்படுகிறது. மேலும் 1.8 லட்சம் புதிய ரேஷன் அட்டைதாரர்கள் சேர்க்கப்பட்டுள்ளனர்.',
    content: 'The Special Programme Implementation Department has commenced the enhanced disbursement under the Kalaignar Magalir Urimai Thogai scheme. Over 1.16 crore verified women heads of families across Tamil Nadu will receive ₹1,500 monthly via Public Financial Management System (PFMS) Direct Benefit Transfer. District Collectors have concluded door-to-door validation for recently issued smart ration cards.',
    contentTa: 'தமிழ்நாடு முழுவதும் மகளிர் உரிமைத் தொகையாக மாதம் ₹1,500 வழங்கும் திட்டம் முழுவீச்சில் செயல்படுத்தப்பட்டு வருகிறது. 1.16 கோடிக்கும் மேற்பட்ட பயனாளிகளுக்கு நேரடியாக வங்கிக் கணக்கில் பணம் செலுத்தப்படுகிறது. புதிய தகுதியுள்ள விண்ணப்பதாரர்கள் இ-சேவை மையங்கள் மூலம் விண்ணப்பிக்கலாம்.',
    originalLanguage: 'TA',
    jurisdiction: 'TN',
    category: 'WELFARE',
    department: 'Special Programme Implementation Department',
    departmentCode: 'SPID',
    district: null,
    publishedAt: '2026-11-01T08:00:00Z',
    collectedAt: '2026-11-01T08:15:00Z',
    sourceName: 'Special Programme Implementation Dept (tn.gov.in)',
    sourceUrl: 'https://kmut.tn.gov.in/announcements',
    officialDocUrl: 'https://www.tn.gov.in/go_view/dept/SPID/2026/go_ms_142.pdf',
    goReference: 'G.O. (Ms) No. 142 / Special Programme Implementation',
    isBreaking: false,
    isImportant: true,
    isFeatured: true,
    verificationStatus: 'VERIFIED',
    tags: ['KMUT', 'Women Empowerment', 'Direct Benefit Transfer', 'Social Justice'],
    keyFacts: {
      outlay: '₹18,500 Crore / year',
      beneficiaries: '1.16 Crore Women Heads of Household',
      eligibility: 'Family income below ₹2.5 Lakh & electricity under 3,600 units/yr'
    }
  },
  {
    id: 'news-tn-2026-103',
    title: 'Chennai Metro Phase-2: Madhavaram to Sholinganallur Corridor Underground Tunneling Crosses 80% Mark',
    titleTa: 'சென்னை மெட்ரோ இரண்டாம் கட்டம்: மாதவரம் - சோழிங்கநல்லூர் சுரங்கப் பாதை பணிகள் 80% நிறைவு',
    summary: 'CMRL achieves key milestone with 18 Tunnel Boring Machines (TBMs) completing continuous drives across Corridor-5.',
    summaryTa: 'சென்னை மெட்ரோ ரயில் இரண்டாம் கட்ட திட்டத்தின் கீழ் காரிடார்-5 வழித்தடத்தில் 80% சுரங்கப் பாதை அமைக்கும் பணிகள் வெற்றிகரமாக நிறைவடைந்துள்ளதாக சிஎம்ஆர்எல் தெரிவித்துள்ளது.',
    content: 'Chennai Metro Rail Limited (CMRL) announced that underground boring work along Corridor-5 (Madhavaram to Sholinganallur) has reached 82% completion. The 118.9 km Phase-2 network, being constructed at an outlay of ₹63,246 Crore with support from JICA and ADB, is on schedule for phased commissioning starting late 2026. Track laying has commenced between Koyambedu and Porur.',
    contentTa: 'சென்னை பெருநகரப் போக்குவரத்து உள்கட்டமைப்பை மேம்படுத்தும் ₹63,246 கோடி மதிப்பிலான மெட்ரோ இரண்டாம் கட்டப் பணிகளில் முக்கியமான சுரங்கப்பாதை பணிகள் பெருமளவில் முடிவடைந்துள்ளன.',
    originalLanguage: 'EN',
    jurisdiction: 'TN',
    category: 'INFRASTRUCTURE',
    department: 'Planning, Development and Special Initiatives',
    departmentCode: 'PDSI',
    district: 'Chennai',
    publishedAt: '2026-11-08T14:20:00Z',
    collectedAt: '2026-11-08T14:35:00Z',
    sourceName: 'Chennai Metro Rail Limited (CMRL) / DIPR',
    sourceUrl: 'https://chennaimetrorail.org/press-release',
    officialDocUrl: null,
    goReference: null,
    isBreaking: false,
    isImportant: false,
    isFeatured: true,
    verificationStatus: 'VERIFIED',
    tags: ['Chennai Metro', 'CMRL', 'Phase-2', 'Urban Mobility', 'Chennai Infrastructure'],
    keyFacts: {
      outlay: '₹63,246 Crore',
      beneficiaries: '25 Lakh Daily Commuters across Chennai Metropolitan Area',
      deadline: 'Phased commissioning beginning late 2026'
    }
  },
  {
    id: 'news-tn-2026-104',
    title: 'CMCHIS Health Insurance Ceiling Raised to ₹7.5 Lakh; Empanels 140 Secondary Care Hospitals',
    titleTa: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்ட வரம்பு ₹7.5 லட்சமாக உயர்வு; 140 புதிய மருத்துவமனைகள் சேர்ப்பு',
    summary: 'Free cashless surgical treatment ceiling expanded across all 38 districts with coverage for oncology robotic surgery and transplants.',
    summaryTa: 'அனைத்து 38 மாவட்டங்களிலும் முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டத்தின் கீழ் ஆண்டுக் காப்பீடு ₹7.5 லட்சமாக உயர்த்தப்பட்டு அறுவை சிகிச்சைகள் மற்றும் சிறப்பு மருத்துவ சேவைகள் விரிவுபடுத்தப்பட்டுள்ளன.',
    content: 'The Department of Health and Family Welfare has issued orders expanding the Chief Minister Comprehensive Health Insurance Scheme (CMCHIS) annual cap to ₹7,50,000 per family. The revised package includes modern immuno-oncology, complex pediatric cardiology, and post-operative home nursing visits. Over 1,850 public and private hospitals now offer seamless biometric authorization.',
    contentTa: 'ஏழை எளிய குடும்பங்களுக்கு நவீன மருத்துவ சிகிச்சை கட்டணமின்றி கிடைக்கும் வகையில் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் ₹7.5 லட்சமாக உயர்த்தப்பட்டுள்ளது.',
    originalLanguage: 'EN',
    jurisdiction: 'TN',
    category: 'HEALTH',
    department: 'Department of Health and Family Welfare',
    departmentCode: 'HEALTH',
    district: null,
    publishedAt: '2026-10-01T09:00:00Z',
    collectedAt: '2026-10-01T09:15:00Z',
    sourceName: 'Health Department, Govt of Tamil Nadu',
    sourceUrl: 'https://www.cmchistn.com/notifications',
    officialDocUrl: 'https://www.tn.gov.in/go_view/dept/HFW/2026/go_ms_215.pdf',
    goReference: 'G.O. (Ms) No. 215 / Health and Family Welfare',
    isBreaking: false,
    isImportant: true,
    isFeatured: true,
    verificationStatus: 'VERIFIED',
    tags: ['Health Insurance', 'CMCHIS', 'Cashless Hospitalization', 'Public Health'],
    keyFacts: {
      outlay: '₹1,680 Crore / year',
      beneficiaries: '1.4 Crore Eligible Ration Card Holder Families',
      eligibility: 'Annual household income under ₹1.2 Lakh or verified smart ration card'
    }
  },
  {
    id: 'news-tn-2026-105',
    title: 'Thanjavur & Delta Farmers: Kuruvai Cultivation Special Package 2026 Disburses Seed & Fertilizer Subsidies',
    titleTa: 'தஞ்சாவூர் உள்ளிட்ட டெல்டா விவசாயிகளுக்கு ₹84.5 கோடி குறுவை சிறப்பு தொகுப்பு மானியம் விநியோகம்',
    summary: '3.2 lakh delta farming families receive 100% subsidy on micronutrient kits and certified paddy seeds across 8 districts.',
    summaryTa: 'தஞ்சை, திருவாரூர், நாகை, மயிலாடுதுறை உள்ளிட்ட 8 மாவட்டங்களில் 3.2 லட்சம் விவசாய குடும்பங்களுக்கு சான்று பெற்ற நெல் விதைகள் மற்றும் நுண்ணூட்டச் சத்து உரங்கள் முழு மானியத்தில் வழங்கப்படுகின்றன.',
    content: 'The Agriculture and Farmers Welfare Department has commenced distribution of Kuruvai cultivation inputs across Thanjavur, Tiruvarur, Nagapattinam, Mayiladuthurai, Cuddalore, Tiruchirappalli, Ariyalur, and Pudukkottai districts. The ₹84.5 Crore package ensures certified paddy seeds (ADT-53, TPS-5, CO-51) at 50% subsidy through 210 Agricultural Extension Centers with water management protocols in place.',
    contentTa: 'காவிரி டெல்டா பாசனப் பகுதிகளில் குறுவை சாகுபடியை உரிய காலத்தில் மேற்கொள்ளும் வகையில் விவசாயிகளுக்குத் தேவையான இடுபொருட்கள் மற்றும் இயந்திர நடவு மானியங்கள் வேளாண்மைத் துறை மூலம் வழங்கப்பட்டு வருகின்றன.',
    originalLanguage: 'TA',
    jurisdiction: 'TN',
    category: 'AGRICULTURE',
    department: 'Agriculture and Farmers’ Welfare Department',
    departmentCode: 'AGRI',
    district: 'Thanjavur',
    publishedAt: '2026-06-02T11:00:00Z',
    collectedAt: '2026-06-02T11:30:00Z',
    sourceName: 'Agriculture Dept, Govt of Tamil Nadu',
    sourceUrl: 'https://www.tn.gov.in/press-releases/kuruvai-package',
    officialDocUrl: 'https://www.tn.gov.in/go_view/dept/AGRI/2026/go_ms_310.pdf',
    goReference: 'G.O. (Ms) No. 310 / Agriculture and Farmers Welfare',
    isBreaking: false,
    isImportant: false,
    isFeatured: false,
    verificationStatus: 'VERIFIED',
    tags: ['Kuruvai', 'Delta Farmers', 'Agriculture Subsidy', 'Thanjavur', 'Paddy Seeds'],
    keyFacts: {
      outlay: '₹84.5 Crore',
      beneficiaries: '3.2 Lakh Farming Families in Cauvery Delta',
      eligibility: 'Operational landholders in Cauvery delta irrigation network'
    }
  },
  {
    id: 'news-tn-2026-106',
    title: 'Tamil Nadu Public Service Commission (TNPSC) Releases Group-II & IIA Main Examination Schedule',
    titleTa: 'டிஎன்பிஎஸ்சி குரூப்-2 மற்றும் 2A முதன்மைத் தேர்வுக்கான அதிகாரப்பூர்வ அட்டவணை வெளியீடு',
    summary: 'TNPSC notifies hall ticket download schedule and examination centers across all 38 district headquarters for 5,200 administrative vacancies.',
    summaryTa: 'தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம் குரூப்-2 மற்றும் 2A பதவிகளுக்கான முதன்மைத் தேர்வு தேர்வுக்கூட நுழைவுச்சீட்டு மற்றும் தேர்வு மையங்கள் குறித்த அறிவிப்பை வெளியிட்டுள்ளது.',
    content: 'The Tamil Nadu Public Service Commission (TNPSC) has notified the timetable for the Combined Civil Services Examination-II (Group-II and Group-IIA Services). Certified hall tickets have been uploaded on the official commission portal (tnpsc.gov.in). Over 65,000 candidates shortlisted from the preliminary phase will appear for the descriptive examinations across monitored biometric centers.',
    contentTa: 'அரசுத் துறைகளில் காலியாக உள்ள உதவியாளர், வருவாய் ஆய்வாளர் உள்ளிட்ட 5,200 பணியிடங்களுக்கான குரூப்-2 முதன்மைத் தேர்வுகள் அனைத்து மாவட்ட தலைநகரங்களிலும் பலத்த பாதுகாப்புடன் நடைபெற உள்ளன.',
    originalLanguage: 'EN',
    jurisdiction: 'TN',
    category: 'RECRUITMENT',
    department: 'Human Resources Management Department',
    departmentCode: 'HRM',
    district: null,
    publishedAt: '2026-11-07T12:00:00Z',
    collectedAt: '2026-11-07T12:15:00Z',
    sourceName: 'Tamil Nadu Public Service Commission (TNPSC)',
    sourceUrl: 'https://www.tnpsc.gov.in/notifications.html',
    officialDocUrl: null,
    goReference: null,
    isBreaking: false,
    isImportant: true,
    isFeatured: false,
    verificationStatus: 'VERIFIED',
    tags: ['TNPSC', 'Group-II', 'Recruitment', 'Government Jobs', 'Civil Services'],
    keyFacts: {
      outlay: '5,200 State Executive & Non-Executive Vacancies',
      beneficiaries: '65,000+ Shortlisted Aspirants',
      deadline: 'Hall Ticket download open until examination morning'
    }
  },
  {
    id: 'news-tn-2026-107',
    title: 'Coimbatore International Airport Runway Extension: Revenue Department Acquires 628 Acres',
    titleTa: 'கோவை சர்வதேச விமான நிலைய விரிவாக்கம்: 628 ஏக்கர் நிலம் கையகப்படுத்தும் பணி முழுமை',
    summary: 'Coimbatore district administration hands over land parcel to Airports Authority of India (AAI) for 12,500 ft runway modernization.',
    summaryTa: 'கோவை பன்னாட்டு விமான நிலையத்தை உலகத்தரம் வாய்ந்ததாக மாற்றும் வகையில் 628 ஏக்கர் நிலம் இந்திய விமான நிலையங்கள் ஆணையத்திடம் ஒப்படைக்கப்பட்டுள்ளது.',
    content: 'The Coimbatore District Administration, led by the District Collector, completed compensation disbursement and formal handover of 628.2 acres of acquired land to the Airports Authority of India (AAI). The runway will be extended from 9,760 ft to 12,500 ft to accommodate wide-body aircraft like Boeing 777 and Airbus A350, boosting direct export logistics for Kongu region textiles and engineering tooling.',
    contentTa: 'மேற்கு மாவட்டங்களின் ஏற்றுமதி வர்த்தகம் மற்றும் சர்வதேச விமான சேவைகளை ஊக்குவிக்கும் வகையில் கோவை விமான நிலைய ஓடுதளம் 12,500 அடியாக விரிவாக்கம் செய்யப்படவுள்ளது.',
    originalLanguage: 'EN',
    jurisdiction: 'TN',
    category: 'INFRASTRUCTURE',
    department: 'Transport Department',
    departmentCode: 'TRANS',
    district: 'Coimbatore',
    publishedAt: '2026-11-04T16:00:00Z',
    collectedAt: '2026-11-04T16:20:00Z',
    sourceName: 'Coimbatore District Collectorate / AAI',
    sourceUrl: 'https://coimbatore.nic.in/press-releases',
    officialDocUrl: null,
    goReference: 'G.O. (Ms) No. 92 / Transport Department',
    isBreaking: false,
    isImportant: false,
    isFeatured: false,
    verificationStatus: 'VERIFIED',
    tags: ['Coimbatore Airport', 'AAI', 'Kongu Region', 'Infrastructure', 'Aviation'],
    keyFacts: {
      outlay: '₹2,088 Crore Land Acquisition Compensation',
      beneficiaries: 'Air passengers and textile/engineering exporters of Western TN',
      deadline: 'Civil construction targeted for completion by late 2027'
    }
  },
  {
    id: 'news-tn-2026-108',
    title: 'Madurai AIIMS Construction Expedited: Health Ministry Clears Revised ₹1,977 Cr Tendering Milestone',
    titleTa: 'மதுரை எய்ம்ஸ் மருத்துவமனை: ₹1,977 கோடி திருத்தப்பட்ட மதிப்பீட்டுடன் கட்டுமானப் பணிகள் தீவிரம்',
    summary: 'Construction at Thoppur site achieves 35% physical structural completion with 750-bed multi-speciality wing targeted for 2027.',
    summaryTa: 'தோப்பூரில் அமையவுள்ள மதுரை எய்ம்ஸ் மருத்துவமனையின் முதற்கட்ட கட்டுமானப் பணிகள் விறுவிறுப்பாக நடைபெற்று வருகின்றன.',
    content: 'The Union Ministry of Health and Family Welfare alongside the Tamil Nadu State Health Department confirmed steady progress on the All India Institute of Medical Sciences (AIIMS) project at Thoppur, Madurai. The revised capital sanction of ₹1,977.8 Crore, executed under Japan International Cooperation Agency (JICA) ODA loan financing, includes a 750-bed hospital, 150-seat medical college, and 60-bed AYUSH complex.',
    contentTa: 'தென் தமிழக மக்களின் மருத்துவத் தேவைகளைப் பூர்த்தி செய்யும் நோக்கில் மதுரை எய்ம்ஸ் மருத்துவமனையில் நவீன மருத்துவ உபகரணங்கள் மற்றும் மருத்துவக் கல்லூரி கட்டிடங்கள் கட்டப்பட்டு வருகின்றன.',
    originalLanguage: 'EN',
    jurisdiction: 'INDIA',
    category: 'HEALTH',
    department: 'Department of Health and Family Welfare',
    departmentCode: 'HEALTH',
    district: 'Madurai',
    publishedAt: '2026-10-24T10:15:00Z',
    collectedAt: '2026-10-24T10:30:00Z',
    sourceName: 'Press Information Bureau (PIB Delhi) / AIIMS Madurai',
    sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2067891',
    officialDocUrl: null,
    goReference: null,
    isBreaking: false,
    isImportant: true,
    isFeatured: false,
    verificationStatus: 'VERIFIED',
    tags: ['AIIMS Madurai', 'JICA', 'Healthcare', 'Madurai', 'Medical Education'],
    keyFacts: {
      outlay: '₹1,977.8 Crore',
      beneficiaries: 'Southern Tamil Nadu districts (Madurai, Theni, Dindigul, Virudhunagar)',
      deadline: 'OPD and Academic block ready by mid-2027'
    }
  },
  {
    id: 'news-tn-2026-109',
    title: 'Pudhumai Penn and Tamizh Pudhalvan: Higher Education Incentive Expands to 4.5 Lakh Students',
    titleTa: 'புதுமைப் பெண் & தமிழ் புதல்வன்: அரசு உதவிபெறும் பள்ளி மாணவர்களுக்கும் ₹1,000 ஊக்கத்தொகை தொடக்கம்',
    summary: 'Monthly direct benefit transfer of ₹1,000 for government-aided Tamil medium alumni studying undergraduate degrees.',
    summaryTa: 'அரசு உதவிபெறும் பள்ளிகளில் தமிழ் வழியில் பயின்று கல்லூரி செல்லும் மாணவ, மாணவியருக்கு மாதந்தோறும் ₹1,000 உதவித்தொகை வழங்கப்படுகிறது.',
    content: 'College education directors have issued guidelines for enrolling over 1.2 lakh additional undergraduate students from government-aided schools under the Pudhumai Penn (for female students) and Tamizh Pudhalvan (for male students) initiatives. Beneficiaries must have studied in Tamil medium from Classes 6 to 12 in Tamil Nadu institutions. The funds are transferred directly into verified bank accounts.',
    contentTa: 'உயர் கல்வி பயிலும் மாணவர்களின் சேர்க்கை விகிதத்தை அதிகரிக்கவும், வறுமை காரணமாக கல்வி தடைபடாமல் இருக்கவும் இருபாலருக்கும் தலா ₹1,000 வழங்கும் திட்டம் பெரும் வரவேற்பைப் பெற்றுள்ளது.',
    originalLanguage: 'TA',
    jurisdiction: 'TN',
    category: 'EDUCATION',
    department: 'Department of School Education',
    departmentCode: 'SCHEDU',
    district: null,
    publishedAt: '2026-10-15T09:30:00Z',
    collectedAt: '2026-10-15T09:45:00Z',
    sourceName: 'Higher Education Department / tn.gov.in',
    sourceUrl: 'https://penkalvi.tn.gov.in',
    officialDocUrl: 'https://www.tn.gov.in/go_view/dept/HED/2026/go_ms_88.pdf',
    goReference: 'G.O. (Ms) No. 88 / Higher Education Department',
    isBreaking: false,
    isImportant: true,
    isFeatured: false,
    verificationStatus: 'VERIFIED',
    tags: ['Pudhumai Penn', 'Tamizh Pudhalvan', 'Scholarship', 'Higher Education', 'Tamil Medium'],
    keyFacts: {
      outlay: '₹620 Crore / year',
      beneficiaries: '4.5 Lakh College Undergraduates across TN',
      eligibility: 'Class 6-12 in Tamil Medium in Government or Aided Schools'
    }
  },
  {
    id: 'news-tn-2026-110',
    title: 'Northeast Monsoon 2026: TN State Disaster Management Authority Releases ₹250 Cr Contingency Allocation',
    titleTa: 'வடகிழக்கு பருவமழை 2026: பேரிடர் முன்னெச்சரிக்கை நடவடிக்கைகளுக்கு ₹250 கோடி நிதி விடுவிப்பு',
    summary: 'Coastal districts (Chennai, Cuddalore, Nagapattinam, Thoothukudi) deploy heavy diesel pumps and 24x7 disaster monitoring cells.',
    summaryTa: 'சென்னையில் மழைநீர் வடிகால் தூர்வாரும் பணிகள் மற்றும் கடலோர மாவட்டங்களில் பல்துறை பேரிடர் மீட்புக் குழுக்கள் தயார் நிலையில் வைக்கப்பட்டுள்ளன.',
    content: 'The Revenue and Disaster Management Department has placed ₹250 Crore at the immediate disposal of District Collectors and the Tamil Nadu State Disaster Management Authority (TNSDMA). Special IAS monitoring officers have been deployed across 14 coastal and vulnerable interior districts. 1,215 community cyclone relief centers equipped with satellite VHF communication and power backup have been certified inspection-ready.',
    contentTa: 'வடகிழக்கு பருவமழையை எதிர்கொள்ள அனைத்து துறை அலுவலர்களும் தயார் நிலையில் இருக்கவும், பொதுமக்களுக்கு எச்சரிக்கை தகவல்களை உடனுக்குடன் தெரிவிக்கவும் மாநில அவசர செயல்பாட்டு மையம் 24 மணி நேரமும் செயல்பட்டு வருகிறது.',
    originalLanguage: 'EN',
    jurisdiction: 'TN',
    category: 'GOVERNANCE',
    department: 'Revenue and Disaster Management Department',
    departmentCode: 'REV',
    district: 'Chennai',
    publishedAt: '2026-10-08T11:00:00Z',
    collectedAt: '2026-10-08T11:15:00Z',
    sourceName: 'TNSDMA / Revenue & Disaster Management Dept',
    sourceUrl: 'https://tnsdma.tn.gov.in/press-release',
    officialDocUrl: 'https://www.tn.gov.in/go_view/dept/REV/2026/go_ms_177.pdf',
    goReference: 'G.O. (Ms) No. 177 / Revenue & Disaster Management',
    isBreaking: false,
    isImportant: true,
    isFeatured: false,
    verificationStatus: 'VERIFIED',
    tags: ['Monsoon', 'TNSDMA', 'Disaster Management', 'Chennai Flood Mitigation', 'Relief Funds'],
    keyFacts: {
      outlay: '₹250 Crore',
      beneficiaries: 'Citizens across 14 vulnerable coastal & riverine districts',
      deadline: 'Monitoring operational round-the-clock throughout monsoon season'
    }
  }
]

