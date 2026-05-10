'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'gray',
    posts: 3,
    features: [
      '3 posts per month',
      'Instagram, TikTok, LinkedIn',
      'Blog, Email, Ads',
      '1 SEO keyword per post',
      'Basic tone options',
      'Content history',
    ],
    missing: ['Unlimited posts', 'Priority generation', 'API access', 'Premium support'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9',
    period: 'per month',
    color: 'teal',
    posts: 50,
    popular: false,
    features: [
      '50 posts per month',
      'All platforms',
      '3 SEO keywords per post',
      'All tone options',
      'Content history',
      'Email support',
    ],
    missing: ['Unlimited posts', 'API access', 'Priority support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'per month',
    color: 'blue',
    posts: 300,
    popular: true,
    features: [
      '300 posts per month',
      'All platforms',
      '3 SEO keywords per post',
      'All tone & language options',
      'Full content history',
      'Priority generation',
      'Priority support',
    ],
    missing: ['Unlimited posts', 'API access'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$79',
    period: 'per month',
    color: 'gold',
    posts: 999999,
    features: [
      'Unlimited posts',
      'All platforms',
      '3 SEO keywords per post',
      'All tone & language options',
      'Full content history',
      'Priority generation',
      'API access',
      'Dedicated support',
    ],
    missing: [],
  },
]

const PLAN_LIMITS = { free: 3, starter: 50, pro: 300, agency: Infinity }

export default function UpgradePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) loadProfile(session.user)
      else { setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(currentUser) {
    setUser(currentUser)
    const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single()
    setProfile(data)
    setLoading(false)
  }

  const currentPlan = profile?.plan || 'free'
  const postsUsed = profile?.posts_count || 0
  const limit = PLAN_LIMITS[currentPlan] || 3
  const pct = limit === Infinity ? 100 : Math.min((postsUsed / limit) * 100, 100)
  const remaining = limit === Infinity ? '∞' : Math.max(limit - postsUsed, 0)

  const colorMap = {
    gray: { border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600', btn: 'bg-gray-800 hover:bg-gray-700 text-white', ring: '' },
    teal: { border: 'border-[#0D9488]', badge: 'bg-[#0D9488]/10 text-[#0D9488]', btn: 'bg-[#0D9488] hover:bg-[#0D9488]/90 text-white', ring: 'ring-2 ring-[#0D9488]/30' },
    blue: { border: 'border-[#1B5FA8]', badge: 'bg-[#1B5FA8]/10 text-[#1B5FA8]', btn: 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white', ring: 'ring-2 ring-[#1B5FA8]/30' },
    gold: { border: 'border-[#C9943A]', badge: 'bg-[#C9943A]/10 text-[#C9943A]', btn: 'bg-[#C9943A] hover:bg-[#C9943A]/90 text-white', ring: 'ring-2 ring-[#C9943A]/30' },
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-[#1B5FA8] text-xl font-semibold">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-[#1B5FA8]">RANKIVO</a>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Upgrade Your Plan</h1>
          <p className="text-gray-500 text-lg">Generate more content, unlock more features.</p>
        </div>

        {/* Current Usage Card */}
        {user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10 max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-400">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">{currentPlan.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Posts Used</p>
                <p className="text-xl font-bold text-gray-900">{postsUsed} <span className="text-gray-400 font-normal text-base">/ {limit === Infinity ? '∞' : limit}</span></p>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct >= 100 ? '#C9943A' : pct >= 70 ? '#F59E0B' : '#0D9488'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{postsUsed} used</span>
              <span>{remaining} remaining this month</span>
            </div>
            {pct >= 100 && (
              <div className="mt-3 bg-[#C9943A]/10 border border-[#C9943A]/30 rounded-lg px-4 py-2.5 text-sm text-[#C9943A] font-medium text-center">
                You've reached your monthly limit. Upgrade to keep generating.
              </div>
            )}
            {pct >= 70 && pct < 100 && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 text-sm text-yellow-700 font-medium text-center">
                You're running low. Consider upgrading soon.
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map(plan => {
            const colors = colorMap[plan.color]
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} className={`bg-white border-2 ${colors.border} rounded-2xl p-6 shadow-sm flex flex-col relative ${colors.ring}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-[#0D9488] text-white text-xs font-bold px-3 py-1 rounded-full">CURRENT</span>
                  </div>
                )}
                <div className="mb-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${colors.badge}`}>{plan.name}</span>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {plan.posts === 999999 ? 'Unlimited posts/month' : `${plan.posts} posts/month`}
                  </p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#0D9488] mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-0.5 shrink-0">✗</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200">
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => alert('Payment integration coming soon. Contact askhakwani@gmail.com to upgrade.')}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${colors.btn}`}
                  >
                    {plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-14 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'When does my usage reset?', a: 'Your post count resets on the 1st of every month automatically.' },
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your plan at any time from your account settings.' },
              { q: 'What happens when I hit my limit?', a: 'You will be redirected to this upgrade page. Your existing content history is always preserved.' },
              { q: 'How do I upgrade?', a: 'Payment integration is coming soon. Contact us at askhakwani@gmail.com to upgrade manually right now.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="font-semibold text-gray-800 mb-1">{item.q}</p>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
