'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

// ── Paddle Price IDs ──────────────────────────────────────────────────────────
const PADDLE_TOKEN = 'live_331bc96fb57b8b7c0515b1f06eb'

const PRICE_IDS = {
  starter:        'pri_01ks8qhk18m3mgm9vtd0tm1185',
  pro:            'pri_01ks8qn13dp9ryh2zgeenyt9dw',
  agency:         'pri_01ks8rmgkpjqxeh4m0y6zq0g31',
  posts10:        'pri_01ks8skffm6dhrbcybv50g16d5',
  posts50:        'pri_01ks8sh6529ypn8qxyqgp165qj',
  searches100:    'pri_01ks8sr66ypmegqvec2j4ry2gj',
  searches500:    'pri_01ks8spsgfnrd7bktgr6193jve',
}

// ── Plan definitions ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', period: 'forever',
    postsLabel: '3 posts/month', searchesLabel: '3 keyword searches/day',
    features: ['3 posts/month', '3 keyword searches/day', '25 keywords per search', 'Basic metrics only (Volume + Competition)', 'Content history'],
    missing: ['Keyword Difficulty', 'Intent Detection', 'CSV Export', 'Clustering', 'Filters'],
    color: 'gray',
  },
  {
    id: 'starter', name: 'Starter', price: '$9', period: 'per month',
    postsLabel: '30 posts/month', searchesLabel: '30 keyword searches/day',
    features: ['30 posts/month', '30 keyword searches/day', '100 keywords per search', 'CSV export', 'Basic filters', 'Limited clustering (3 groups)'],
    missing: ['Intent Detection', 'Full filters', 'Trend graphs'],
    color: 'teal',
  },
  {
    id: 'pro', name: 'Pro', price: '$29', period: 'per month',
    postsLabel: '100 posts/month', searchesLabel: '100 keyword searches/day',
    features: ['100 posts/month', '100 keyword searches/day', '500 keywords per search', 'Full filters + clustering', 'Intent detection', 'Trend graphs', 'Priority speed'],
    missing: [],
    color: 'blue', popular: true,
    anchor: 'Why pay $100+ for SEO tools when Rankivo gives you what you need for $29?',
  },
  {
    id: 'agency', name: 'Agency', price: '$79', period: 'per month',
    postsLabel: 'Unlimited posts', searchesLabel: '300 keyword searches/day',
    features: ['Unlimited posts', '300 keyword searches/day', '1000 keywords per search', 'Everything in Pro', 'API access (coming soon)', 'Team access (coming soon)'],
    missing: [],
    color: 'gold',
  },
]

const PLAN_LIMITS = {
  free:    { posts: 3,        searches: 3   },
  starter: { posts: 30,       searches: 30  },
  pro:     { posts: 100,      searches: 100 },
  agency:  { posts: Infinity, searches: 300 },
}

const colorMap = {
  gray: { border: 'border-gray-200', btn: 'border-2 border-gray-300 text-gray-500 hover:border-gray-400', badge: 'bg-gray-100 text-gray-600' },
  teal: { border: 'border-[#0D9488]', btn: 'bg-[#0D9488] hover:bg-[#0D9488]/90 text-white', badge: 'bg-[#0D9488]/10 text-[#0D9488]', ring: 'ring-2 ring-[#0D9488]/20' },
  blue: { border: 'border-[#1B5FA8]', btn: 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white', badge: 'bg-[#1B5FA8]/10 text-[#1B5FA8]', ring: 'ring-2 ring-[#1B5FA8]/20' },
  gold: { border: 'border-[#C9943A]', btn: 'bg-[#C9943A] hover:bg-[#C9943A]/90 text-white', badge: 'bg-[#C9943A]/10 text-[#C9943A]', ring: 'ring-2 ring-[#C9943A]/20' },
}

// ── Load Paddle.js ────────────────────────────────────────────────────────────
function loadPaddle() {
  return new Promise((resolve) => {
    if (window.Paddle) return resolve(window.Paddle)
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.onload = () => {
      window.Paddle.Initialize({ token: PADDLE_TOKEN })
      resolve(window.Paddle)
    }
    document.head.appendChild(script)
  })
}

export default function UpgradePage() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)

  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(id) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    setProfile(data)
    setLoading(false)
  }

  // ── Open Paddle Checkout ────────────────────────────────────────────────────
  async function openCheckout(priceId, label) {
    if (!user) {
      router.push('/auth?mode=signup&redirect=upgrade')
      return
    }
    setCheckoutLoading(label)
    try {
      const Paddle = await loadPaddle()
      Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email },
        customData: { userId: user.id },
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en',
          successUrl: `https://www.rankivo.co/upgrade?success=true`,
        },
      })
    } catch (err) {
      console.error('Paddle error:', err)
      alert('Something went wrong opening checkout. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  // ── Success message ─────────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') setShowSuccess(true)
    }
  }, [])

  const currentPlan  = user ? (profile?.plan || 'free') : null
  const postsUsed    = profile?.posts_count || 0
  const searchesUsed = profile?.searches_count || 0
  const postLimit    = PLAN_LIMITS[currentPlan]?.posts ?? 3
  const searchLimit  = PLAN_LIMITS[currentPlan]?.searches ?? 3
  const postPct      = postLimit === Infinity ? 10 : Math.min((postsUsed / postLimit) * 100, 100)
  const remaining    = postLimit === Infinity ? '∞' : Math.max(postLimit - postsUsed, 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-[#1B5FA8] font-semibold">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">

        {/* Success Banner */}
        {showSuccess && (
          <div className="bg-[#0D9488]/10 border border-[#0D9488]/30 rounded-xl px-6 py-4 mb-8 flex items-center gap-3 max-w-2xl mx-auto">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-[#0D9488]">Payment successful! Welcome to your new plan.</p>
              <p className="text-gray-500 text-sm">Your account has been upgraded. It may take a minute to reflect.</p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-10">
          <span className="inline-block bg-[#C9943A]/10 text-[#C9943A] text-sm px-4 py-2 rounded-full font-medium mb-4 border border-[#C9943A]/20">Upgrade Your Plan</span>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Scale Your Content Output</h1>
          <p className="text-gray-500 text-lg">Generate more content, unlock more features.</p>
        </div>

        {/* Current usage */}
        {user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10 max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">{(currentPlan || 'free').toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Posts Used</p>
                <p className="text-xl font-bold text-gray-900">{postsUsed} <span className="text-gray-400 font-normal text-base">/ {postLimit === Infinity ? '∞' : postLimit}</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Searches Used</p>
                <p className="text-xl font-bold text-gray-900">{searchesUsed} <span className="text-gray-400 font-normal text-base">/ {searchLimit}</span></p>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${postPct}%`, backgroundColor: postPct >= 100 ? '#C9943A' : postPct >= 70 ? '#F59E0B' : '#0D9488' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{postsUsed} used</span>
              <span>{remaining} posts remaining this month</span>
            </div>
            {postPct >= 100 && (
              <div className="mt-3 bg-[#C9943A]/10 border border-[#C9943A]/30 rounded-lg px-4 py-2.5 text-sm text-[#C9943A] font-medium text-center">
                Monthly post limit reached. Upgrade or buy post credits below.
              </div>
            )}
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {PLANS.map(plan => {
            const c        = colorMap[plan.color]
            const isCurrent = currentPlan !== null && currentPlan === plan.id
            const priceId  = PRICE_IDS[plan.id]
            const isLoading = checkoutLoading === plan.id

            return (
              <div key={plan.id} className={`bg-white border-2 ${c.border} rounded-2xl p-6 flex flex-col relative shadow-sm ${c.ring || ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#0D9488] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">MOST POPULAR</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full">CURRENT</span>
                  </div>
                )}
                <div className="mb-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${c.badge}`}>{plan.name}</span>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-xs text-[#0D9488] font-medium mt-1">{plan.postsLabel}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{plan.searchesLabel}</p>
                  {plan.anchor && (
                    <p className="text-xs text-[#C9943A] font-medium mt-2 bg-[#C9943A]/10 px-2 py-1 rounded-lg">💡 {plan.anchor}</p>
                  )}
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[#0D9488] shrink-0 mt-0.5">✓</span>{f}
                    </li>
                  ))}
                  {plan.missing.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="shrink-0 mt-0.5">✗</span>{f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">Current Plan</button>
                ) : plan.id === 'free' ? (
                  <button onClick={() => router.push('/auth?mode=signup')} className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors">
                    Get Started Free
                  </button>
                ) : (
                  <button
                    onClick={() => openCheckout(priceId, plan.id)}
                    disabled={isLoading}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${c.btn} disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? 'Opening...' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Pay As You Go */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">💳 Pay As You Go</h2>
            <p className="text-gray-500 text-sm mt-1">Need more without upgrading? Buy extra credits anytime. Credits never expire.</p>
          </div>

          {/* Post Credits */}
          <p className="text-sm font-semibold text-gray-700 mb-3">✍️ Post Credits</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border-2 border-[#0D9488] rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-1">$5</div>
              <div className="text-[#0D9488] font-semibold text-sm mb-1">+10 Posts</div>
              <div className="text-gray-400 text-xs mb-4">$0.50 per post</div>
              <button
                onClick={() => openCheckout(PRICE_IDS.posts10, 'posts10')}
                disabled={checkoutLoading === 'posts10'}
                className="w-full bg-[#0D9488] hover:bg-[#0D9488]/90 text-white py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {checkoutLoading === 'posts10' ? 'Opening...' : 'Buy Now'}
              </button>
            </div>
            <div className="bg-white border-2 border-[#1B5FA8] rounded-2xl p-6 text-center shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">BEST VALUE</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">$19</div>
              <div className="text-[#1B5FA8] font-semibold text-sm mb-1">+50 Posts</div>
              <div className="text-gray-400 text-xs mb-4">$0.38 per post</div>
              <button
                onClick={() => openCheckout(PRICE_IDS.posts50, 'posts50')}
                disabled={checkoutLoading === 'posts50'}
                className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {checkoutLoading === 'posts50' ? 'Opening...' : 'Buy Now'}
              </button>
            </div>
          </div>

          {/* Search Credits */}
          <p className="text-sm font-semibold text-gray-700 mb-3">🔎 Search Credits</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-[#0D9488] rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-1">$5</div>
              <div className="text-[#0D9488] font-semibold text-sm mb-1">+100 Searches</div>
              <div className="text-gray-400 text-xs mb-4">$0.05 per search</div>
              <button
                onClick={() => openCheckout(PRICE_IDS.searches100, 'searches100')}
                disabled={checkoutLoading === 'searches100'}
                className="w-full bg-[#0D9488] hover:bg-[#0D9488]/90 text-white py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {checkoutLoading === 'searches100' ? 'Opening...' : 'Buy Now'}
              </button>
            </div>
            <div className="bg-white border-2 border-[#1B5FA8] rounded-2xl p-6 text-center shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">BEST VALUE</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">$19</div>
              <div className="text-[#1B5FA8] font-semibold text-sm mb-1">+500 Searches</div>
              <div className="text-gray-400 text-xs mb-4">Save $6 vs 5 packs</div>
              <button
                onClick={() => openCheckout(PRICE_IDS.searches500, 'searches500')}
                disabled={checkoutLoading === 'searches500'}
                className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {checkoutLoading === 'searches500' ? 'Opening...' : 'Buy Now'}
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">Credits never expire. Use them anytime across all tools.</p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'When does my usage reset?', a: 'Your post and search counts reset on the 1st of every month automatically.' },
              { q: 'Will my free posts carry over?', a: 'Free plan usage resets monthly and does not carry over. Paid plan upgrades take effect immediately.' },
              { q: 'Do credits expire?', a: 'No — pay-as-you-go credits never expire. Use them anytime across all tools.' },
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription anytime from your account settings. No questions asked.' },
              { q: 'How do I get support?', a: 'Contact us through the Contact page or email askhakwani@gmail.com.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="font-semibold text-gray-800 mb-1">{item.q}</p>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}
