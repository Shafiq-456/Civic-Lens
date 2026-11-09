export interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  jurisdiction: 'TN' | 'INDIA'
  category: 'POLICY' | 'INFRASTRUCTURE' | 'WELFARE' | 'AGRICULTURE' | 'HEALTH' | 'GOVERNANCE'
  publishedAt: string
  sourceName: string
  sourceUrl: string
  isFeatured?: boolean
  department?: string
  verificationStatus: 'VERIFIED' | 'OFFICIAL_SOURCE'
  tags: string[]
}

export const GOVERNMENT_NEWS: NewsItem[] = [
  {
    id: 'news-tn-2026-001',
    title: 'Tamil Nadu Cabinet approves Semiconductor & Electronics Incentive Policy 2026',
    summary: 'A ₹3,200 crore capital subsidy and infrastructure support package approved to position Sriperumbudur and Coimbatore as global fabless and testing hubs.',
    content: 'The Tamil Nadu State Cabinet in its executive session approved the Semiconductor and Advanced Hardware Incentive Policy 2026. The policy provides a 50% matching capital subsidy to the Union Government\'s India Semiconductor Mission (ISM) alongside dedicated plug-and-play industrial corridors equipped with ultra-pure water and uninterrupted power grids in Sriperumbudur, Hosur, and Coimbatore.',
    jurisdiction: 'TN',
    category: 'POLICY',
    publishedAt: '2026-11-05T10:30:00Z',
    sourceName: 'Industries Department, Govt of Tamil Nadu',
    sourceUrl: 'https://www.tn.gov.in/pressrelease',
    isFeatured: true,
    department: 'Industries, Investment Promotion and Commerce',
    verificationStatus: 'VERIFIED',
    tags: ['Semiconductor', 'Cabinet Approval', 'Investment', 'Industrial Policy'],
  },
  {
    id: 'news-in-2026-002',
    title: 'Union Ministry of Agriculture notifies nationwide PM-KISAN DBT disbursement schedule',
    summary: 'Direct benefit transfer of the 18th instalment will reach over 9.5 crore registered farmers via Aadhaar-enabled bank accounts.',
    content: 'The Ministry of Agriculture and Farmers Welfare, Government of India, has notified the official calendar for the direct bank transfer of agricultural financial assistance. In Tamil Nadu, over 24 lakh verified farmer landholders will receive direct credits. State agriculture departments have established local facilitation counters across all block offices for e-KYC updates.',
    jurisdiction: 'INDIA',
    category: 'AGRICULTURE',
    publishedAt: '2026-11-04T08:15:00Z',
    sourceName: 'Press Information Bureau (PIB Delhi)',
    sourceUrl: 'https://pib.gov.in',
    isFeatured: true,
    department: 'Ministry of Agriculture and Farmers Welfare',
    verificationStatus: 'OFFICIAL_SOURCE',
    tags: ['PM-KISAN', 'Farmers', 'Direct Benefit Transfer', 'Central Scheme'],
  },
  {
    id: 'news-tn-2026-003',
    title: 'Chief Minister\'s Breakfast Scheme expanded to 100% of government-aided primary schools',
    summary: 'All 38 revenue districts now covered, benefitting over 22 lakh primary students each working day with hot, nutritious breakfast.',
    content: 'The School Education and Social Welfare departments have operationalized the statewide expansion of the Perunthalaivar Kamarajar Breakfast Scheme. Initially piloted in municipal urban schools, the scheme now legally covers every government and government-aided primary school in all 38 districts of Tamil Nadu. District collectors have been directed to conduct weekly nutritional audits.',
    jurisdiction: 'TN',
    category: 'WELFARE',
    publishedAt: '2026-11-02T11:45:00Z',
    sourceName: 'Department of School Education, TN',
    sourceUrl: 'https://www.tnschools.gov.in',
    isFeatured: false,
    department: 'School Education Department',
    verificationStatus: 'VERIFIED',
    tags: ['Breakfast Scheme', 'Education', 'Nutrition', 'Children'],
  },
  {
    id: 'news-in-2026-004',
    title: 'National Green Hydrogen Mission: Tuticorin and Kandla designated as National Bunkering Ports',
    summary: 'Union Ministry of Ports, Shipping & Waterways issues gazette notification for specialized green ammonia and hydrogen export jetties.',
    content: 'Under the National Green Hydrogen Mission, VO Chidambaranar Port in Tuticorin, Tamil Nadu, has been formally designated as one of India\'s three premier Green Hydrogen Bunkering Ports. The project includes an initial central viability funding grant of ₹1,450 crore for cryogenic storage infrastructure and clean energy pipeline terminals.',
    jurisdiction: 'INDIA',
    category: 'INFRASTRUCTURE',
    publishedAt: '2026-10-30T14:20:00Z',
    sourceName: 'Ministry of Ports, Shipping and Waterways',
    sourceUrl: 'https://shipmin.gov.in',
    isFeatured: false,
    department: 'Ministry of New and Renewable Energy',
    verificationStatus: 'OFFICIAL_SOURCE',
    tags: ['Green Hydrogen', 'Tuticorin Port', 'Clean Energy', 'Maritime'],
  },
  {
    id: 'news-tn-2026-005',
    title: 'Tamil Nadu Health Department commissions 120 new urban health centres with tele-consultation',
    summary: 'Upgraded Primary Health Centres (PHCs) connected with district government hospitals for specialized cardiac, diabetic and pediatric care.',
    content: 'Health and Family Welfare Minister announced the inauguration of 120 modernized Urban Health and Wellness Centres across Chennai, Madurai, Tiruchirappalli, and Salem. Under the Makkalai Thedi Maruthuvam umbrella, these centres are equipped with automated diagnostic testing, 24/7 digital tele-consultation suites, and free generic drug dispensaries.',
    jurisdiction: 'TN',
    category: 'HEALTH',
    publishedAt: '2026-10-28T09:00:00Z',
    sourceName: 'Directorate of Public Health, Govt of Tamil Nadu',
    sourceUrl: 'https://www.tnhealth.tn.gov.in',
    isFeatured: false,
    department: 'Health and Family Welfare Department',
    verificationStatus: 'VERIFIED',
    tags: ['Healthcare', 'PHC', 'Tele-medicine', 'Makkalai Thedi Maruthuvam'],
  },
  {
    id: 'news-in-2026-006',
    title: 'MeitY releases operational guidelines for Digital Personal Data Protection implementation',
    summary: 'Standardized consent management architectures and data fiduciary compliance checklists published for government portals and enterprises.',
    content: 'The Ministry of Electronics and Information Technology (MeitY) has gazetted the technical compliance architecture for public and civic transparency portals. All government digital services must ensure masking of citizen contact credentials, mandatory audit retention logs for data retrieval, and verifiable citizen consent tokens.',
    jurisdiction: 'INDIA',
    category: 'GOVERNANCE',
    publishedAt: '2026-10-25T16:00:00Z',
    sourceName: 'Ministry of Electronics and Information Technology',
    sourceUrl: 'https://www.meity.gov.in',
    isFeatured: false,
    department: 'MeitY',
    verificationStatus: 'OFFICIAL_SOURCE',
    tags: ['DPDP Act', 'Data Privacy', 'Digital India', 'Cyber Security'],
  },
  {
    id: 'news-tn-2026-007',
    title: 'Tamil Nadu Water Resources Department completes pre-monsoon Cauvery delta desilting',
    summary: 'Over 4,800 km of river channels, canals, and agricultural drains across Thanjavur, Tiruvarur, and Nagapattinam desilted with ₹90 Cr grant.',
    content: 'The Water Resources Department (WRD) announced the successful conclusion of the 2026 desilting campaign across the Cauvery and Vennar sub-basins. Satellite telemetry and citizen oversight teams confirmed that flow capacity has been enhanced ahead of Northeast monsoon inflows, ensuring equitable tail-end irrigation for delta paddy cultivators.',
    jurisdiction: 'TN',
    category: 'AGRICULTURE',
    publishedAt: '2026-10-22T11:10:00Z',
    sourceName: 'Water Resources Department, TN',
    sourceUrl: 'https://wrd.tn.gov.in',
    isFeatured: false,
    department: 'Water Resources Department',
    verificationStatus: 'VERIFIED',
    tags: ['Cauvery Delta', 'Desilting', 'Water Management', 'Agriculture'],
  },
  {
    id: 'news-in-2026-008',
    title: 'National Expressway Corridor: Bengaluru-Chennai Expressway 4-lane section opened for commercial trials',
    summary: 'The 262 km access-controlled expressway reduces travel time between Chennai and Bengaluru to under 3 hours.',
    content: 'The National Highways Authority of India (NHAI) has announced the completion of the Greenfield section connecting Hoskote to Sriperumbudur. The expressway features automated toll collection, electronic weigh-in-motion sensors, and ecological animal underpasses passing through reserve forest boundaries.',
    jurisdiction: 'INDIA',
    category: 'INFRASTRUCTURE',
    publishedAt: '2026-10-18T13:30:00Z',
    sourceName: 'National Highways Authority of India (NHAI)',
    sourceUrl: 'https://nhai.gov.in',
    isFeatured: false,
    department: 'Ministry of Road Transport and Highways',
    verificationStatus: 'OFFICIAL_SOURCE',
    tags: ['Expressway', 'NHAI', 'Connectivity', 'Logistics'],
  },
]

