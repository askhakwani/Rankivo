export const PLANS = {
  free:    { searchesPerDay: 3,   keywordsPerSearch: 25   },
  starter: { searchesPerDay: 30,  keywordsPerSearch: 100  },
  pro:     { searchesPerDay: 100, keywordsPerSearch: 500  },
  agency:  { searchesPerDay: 300, keywordsPerSearch: 1000 },
}

export const PLAN_NAMES = {
  free:    'Free',
  starter: 'Starter',
  pro:     'Pro',
  agency:  'Agency',
}

export const CREDIT_PACKS = [
  { id: 'pack_100', label: '+100 searches', searches: 100, price: 5  },
  { id: 'pack_500', label: '+500 searches', searches: 500, price: 19 },
]

// What each plan gets from Keyword Research (matches the pricing page).
// clusters = how many keyword groups are shown (0 = none).
// filters  = 'none' | 'basic' (volume + competition) | 'full' (adds CPC + difficulty).
export const KEYWORD_FEATURES = {
  free:    { difficulty: false, intent: false, trend: false, clusters: 0,  csv: false, filters: 'none'  },
  starter: { difficulty: true,  intent: false, trend: false, clusters: 3,  csv: true,  filters: 'basic' },
  pro:     { difficulty: true,  intent: true,  trend: true,  clusters: 12, csv: true,  filters: 'full'  },
  agency:  { difficulty: true,  intent: true,  trend: true,  clusters: 12, csv: true,  filters: 'full'  },
}
