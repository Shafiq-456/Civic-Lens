// Party metadata for the Tamil Nadu electoral directory (client-safe).

export const PARTY_META: Record<string, { name: string; color: string; tone: string }> = {
  TVK: { name: 'Tamilaga Vettri Kazhagam', color: '#800020', tone: 'maroon' },
  DMK: { name: 'Dravida Munnetra Kazhagam', color: '#ee1c25', tone: 'red' },
  ADMK: { name: 'All India Anna Dravida Munnetra Kazhagam', color: '#009933', tone: 'green' },
  INC: { name: 'Indian National Congress', color: '#19aaed', tone: 'sky' },
  BJP: { name: 'Bharatiya Janata Party', color: '#f97e1c', tone: 'orange' },
  PMK: { name: 'Pattali Makkal Katchi', color: '#d4a017', tone: 'amber' },
  DMDK: { name: 'Desiya Murpokku Dravida Kazhagam', color: '#f6a21d', tone: 'amber' },
  VCK: { name: 'Viduthalai Chiruthaigal Katchi', color: '#3554d1', tone: 'blue' },
  CPI: { name: 'Communist Party of India', color: '#e4002b', tone: 'red' },
  'CPI(M)': { name: 'Communist Party of India (Marxist)', color: '#d21f26', tone: 'red' },
  IUML: { name: 'Indian Union Muslim League', color: '#0a7e49', tone: 'green' },
  AMMK: { name: 'Amma Makkal Munnetra Kazhagam', color: '#22a88a', tone: 'teal' },
  IND: { name: 'Independent', color: '#64748b', tone: 'slate' },
  'TMC(M)': { name: 'Tamil Maanila Congress (M)', color: '#f26522', tone: 'orange' },
  MDMK: { name: 'Marumalarchi Dravida Munnetra Kazhagam', color: '#155e75', tone: 'cyan' },
}

export function partyName(short?: string | null): string {
  if (!short) return '—'
  return PARTY_META[short]?.name ?? short
}

export function partyColor(short?: string | null): string {
  return PARTY_META[short ?? '']?.color ?? '#64748b'
}

/** Fixed order for tally chips: government, opposition, others, vacancies. */
export const TALLY_ORDER = ['TVK', 'DMK', 'ADMK', 'INC', 'PMK', 'VCK', 'CPI', 'CPI(M)', 'IUML', 'DMDK', 'BJP', 'AMMK', 'IND', 'VACANT']
