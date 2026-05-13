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
