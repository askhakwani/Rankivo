'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from './sidebar'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

const PLATFORM_CONFIG = {
  Instagram:  { lengths: ['Short'], meta: false },
  TikTok:     { lengths: ['Short'], meta: false },
  LinkedIn:   { lengths: ['Short', 'Medium'], meta: false },
  Blog:       { lengths: ['Short', 'Medium', 'Long'], meta: true },
  Email:      { lengths: ['Short', 'Medium'], meta: false },
  Ads:        { lengths: ['Short'], meta: false },
  YouTube:    { lengths: ['Short', 'Medium', 'Long'], meta: false },
  'Twitter/X':{ lengths: ['Short'], meta: false },
  Pinterest:  { lengths: ['Short'], meta: false },
}

const LENGTH_INFO = {
  Short:  { label: 'Short',  words: '~150 words', actual: 150 },
  Medium: { label: 'Medium', words: '~400 words', actual: 400 },
  Long:   { label: 'Long',   words: '~800 words', actual: 800 },
}

const PLAN_LIMITS = { free: 3, pro: 50, premium: 300, agency: Infinity }

const TEMPLATES = [
  { label: 'Product Launch', platform: 'Instagram', topic: 'New product launch announcement', tone: 'Persuasive', cta: 'Buy Now' },
  { label: 'Blog Post Intro', platform: 'Blog', topic: 'How to grow your business with AI tools', tone: 'Informative', cta: 'Learn More' },
  { label: 'LinkedIn Thought Leadership', platform: 'LinkedIn', topic: 'The future of work and AI automation', tone: 'Professional', cta: 'None' },
  { label: 'YouTube Script', platform: 'YouTube', topic: 'Top 5 productivity tips for entrepreneurs', tone: 'Casual', cta: 'Sign Up' },
  { label: 'Email Newsletter', platform: 'Email', topic: 'Monthly updates and tips for our subscribers', tone: 'Casual', cta: 'Learn More' },
  { label: 'Ad Copy', platform: 'Ads', topic: 'Limited time offer for new customers', tone: 'Persuasive', cta: 'Buy Now' },
]

function GuestBanner({ onSignup }) {
  return (
    <div className="bg-[#1B5FA8]/5 border border-[#1B5FA8]/20 rounded-xl px-5 py-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0">👋</span>
        <div>
          <p className="text-sm font-semibold text-[#1B5FA8]">You're using RANKIVO as a guest</p>
          <p className="text-xs text-gray-500 mt-0.5">Sign up free to save your work, access content history and get 3 posts/month.</p>
        </div>
      </div>
      <button onClick={onSignup} className="shrink-0 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
        Sign Up Free
      </button>
    </div>
  )
}

function UpgradeBanner({ profile, onUpgrade }) {
  const plan = profile?.plan || 'free'
  const used = profile?.posts_count || 0
  const limit = PLAN_LIMITS[plan] || 3
  if (limit === Infinity) return null
  const pct = Math.min((used / limit) * 100, 100)
  const remaining = Math.max(limit - used, 0)
  if (pct < 70) return null
  return (
    <div className={`mb-6 rounded-xl border px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${pct >= 100 ? 'bg-[#C9943A]/10 border-[#C9943A]/40' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0">{pct >= 100 ? '🚫' : '⚠️'}</span>
        <div>
          <p className={`text-sm font-semibold ${pct >= 100 ? 'text-[#C9943A]' : 'text-yellow-800'}`}>
            {pct >= 100 ? 'Monthly limit reached' : `Only ${remaining} post${remaining !== 1 ? 's' : ''} remaining`}
          </p>
          <p className={`text-xs mt-0.5 ${pct >= 100 ? 'text-[#C9943A]/80' : 'text-yellow-700'}`}>
            {pct >= 100 ? 'Upgrade your plan to keep generating.' : `You've used ${used} of ${limit} posts.`}
          </p>
        </div>
      </div>
      <button onClick={onUpgrade} className="shrink-0 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
        Upgrade Now
      </button>
    </div>
  )
}

function LimitModal({ isGuest, onUpgrade, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7 text-center">
        <div className="text-5xl mb-4">{isGuest ? '👋' : '🚀'}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{isGuest ? 'Create a free account' : "You've reached your limit"}</h3>
        <p className="text-sm text-gray-500 mb-6">
          {isGuest ? 'Sign up free to get 3 posts per month and save your content history.' : 'You have used all your posts for this month. Upgrade when payments launch.'}
        </p>
        <div className="space-y-3">
          <button onClick={onUpgrade} className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-3 rounded-xl text-sm font-bold">{isGuest ? 'Sign Up Free' : 'View Upgrade Plans'}</button>
          <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Maybe Later</button>
        </div>
      </div>
    </div>
  )
}

function OnboardingBanner({ onDismiss }) {
  const [step, setStep] = useState(0)
  const steps = [
    { title: 'Welcome to RANKIVO! 🎉', desc: 'You have 3 free posts this month. Let\'s generate your first piece of content.', action: 'Next' },
    { title: 'Choose a Platform', desc: 'Select from Instagram, TikTok, LinkedIn, Blog, YouTube and more. Each platform is optimized differently.', action: 'Next' },
    { title: 'Add Your Topic & Keywords', desc: 'Enter your topic and up to 3 SEO keywords. The AI will weave them naturally into your content.', action: 'Next' },
    { title: 'Generate & Copy', desc: 'Hit Generate and your SEO-optimized content is ready in seconds. Copy it and publish!', action: "Let's Go!" },
  ]
  const current = steps[step]
  return (
    <div className="bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5 border border-[#1B5FA8]/20 rounded-xl p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-[#1B5FA8]' : i < step ? 'bg-[#0D9488]' : 'bg-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400">{step + 1}/{steps.length}</span>
          </div>
          <p className="font-semibold text-gray-900 text-sm">{current.title}</p>
          <p className="text-xs text-gray-500 mt-1">{current.desc}</p>
        </div>
        <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 text-lg shrink-0">×</button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => step < steps.length - 1 ? setStep(step + 1) : onDismiss()}
          className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          {current.action}
        </button>
        <button onClick={onDismiss} className="text-gray-400 text-xs hover:text-gray-600 px-2">Skip</button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [generateError, setGenerateError] = useState('')
  const [cookieAccepted, setCookieAccepted] = useState(false)
  const [showCookieBanner, setShowCookieBanner] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isGuestLimit, setIsGuestLimit] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Settings
  const [settingsTab, setSettingsTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ full_name: '', country: '', city: '', state: '', zip: '', phone: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ text: '', ok: true })
  const [passwordForm, setPasswordForm] = useState({ newPass: '', confirm: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ text: '', ok: true })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  // SEO Tool
  const [seoKeyword, setSeoKeyword] = useState('')
  const [seoResults, setSeoResults] = useState(null)
  const [seoLoading, setSeoLoading] = useState(false)

  const [form, setForm] = useState({
    platform: 'Instagram', topic: '', keywords: ['', '', ''],
    tone: 'Professional', audience: '', cta: 'None', length: 'Short', language: 'English',
  })

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookie = localStorage.getItem('rankivo_cookie_accepted')
      if (!cookie) setShowCookieBanner(true)
      else setCookieAccepted(true)
      const onboarded = localStorage.getItem('rankivo_onboarded')
      if (!onboarded) setShowOnboarding(true)
    }
  }, [])

  useEffect(() => {
    async function loadUser(currentUser) {
      setUser(currentUser)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single()
      setProfile(profileData)
      if (profileData) {
        setProfileForm({ full_name: profileData.full_name || '', country: profileData.country || '', city: profileData.city || '', state: profileData.state || '', zip: profileData.zip || '', phone: profileData.phone || '' })
      }
      const { data: hist } = await supabase.from('content_history').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false })
      setHistory(hist || [])
      setHistoryLoading(false)
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser(session.user)
      else { setUser(null); setProfile(null); setLoading(false); setHistoryLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (activeTab === 'logout') supabase.auth.signOut().then(() => { window.location.href = '/auth' })
    if (activeTab === 'history' && user) fetchHistory()
  }, [activeTab, user])

  async function fetchHistory() {
    if (!user) return
    setHistoryLoading(true)
    const { data } = await supabase.from('content_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setHistory(data || [])
    setHistoryLoading(false)
  }

  function acceptCookies() {
    localStorage.setItem('rankivo_cookie_accepted', 'true')
    setCookieAccepted(true)
    setShowCookieBanner(false)
  }

  function dismissOnboarding() {
    localStorage.setItem('rankivo_onboarded', 'true')
    setShowOnboarding(false)
  }

  function selectPlatform(p) {
    const config = PLATFORM_CONFIG[p]
    setForm({ ...form, platform: p, length: config.lengths[0] })
    setResult(null)
    setGenerateError('')
  }

  function applyTemplate(t) {
    setForm(prev => ({ ...prev, platform: t.platform, topic: t.topic, tone: t.tone, cta: t.cta, length: PLATFORM_CONFIG[t.platform].lengths[0] }))
    setActiveTab('generate')
    setResult(null)
  }

  function getKeywordLimit() {
    return form.length === 'Short' ? 1 : form.length === 'Medium' ? 2 : 3
  }

  async function checkPostLimit() {
    if (user) {
      const { data: fp } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (fp) setProfile(fp)
      const limit = PLAN_LIMITS[fp?.plan || 'free'] || 3
      if (limit === Infinity) return true
      const now = new Date()
      if (fp?.reset_date && new Date(fp.reset_date) < now) {
        await supabase.from('profiles').update({ posts_count: 0, reset_date: new Date(now.setMonth(now.getMonth() + 1)) }).eq('id', user.id)
        return true
      }
      return (fp?.posts_count || 0) < limit
    }
    return parseInt(localStorage.getItem('rankivo_guest_posts') || '0') < 1
  }

  async function incrementPostCount() {
    if (user && profile) {
      const newCount = (profile.posts_count || 0) + 1
      await supabase.from('profiles').update({ posts_count: newCount }).eq('id', user.id)
      setProfile(prev => ({ ...prev, posts_count: newCount }))
    } else {
      localStorage.setItem('rankivo_guest_posts', '1')
    }
  }

  async function saveToHistory(contentObj) {
    if (!user) return
    const contentText = typeof contentObj === 'string' ? contentObj : contentObj?.content || ''
    await supabase.from('content_history').insert({
      user_id: user.id, platform: form.platform, content: contentText,
      keywords: form.keywords.filter(k => k.trim()),
      hashtags: contentText?.match(/#\w+/g) || [],
      meta_title: contentObj?.metaTitle || null,
      meta_description: contentObj?.metaDescription || null,
      h1: contentObj?.titles?.[0] || null,
      word_count: contentText.trim().split(/\s+/).length,
      content_length: form.length, language: form.language,
      tone: form.tone, audience: form.audience, cta: form.cta,
    })
  }

  async function generateContent() {
    if (!cookieAccepted) { setShowCookieBanner(true); return }
    if (!form.topic.trim()) { document.getElementById('topic-input')?.focus(); setGenerateError('Please enter a topic.'); return }
    setGenerateError('')
    const allowed = await checkPostLimit()
    if (!allowed) {
      setIsGuestLimit(!user)
      setShowLimitModal(true)
      return
    }
    setGenerating(true); setResult(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, keywords: form.keywords.slice(0, getKeywordLimit()).filter(k => k.trim()), wordCount: LENGTH_INFO[form.length].actual }),
      })
      const data = await res.json()
      if (data.content) {
        setResult(data.content)
        await incrementPostCount()
        await saveToHistory(data.content)
        await fetchHistory()
      } else {
        setGenerateError('Generation failed. Please try again.')
      }
    } catch {
      setGenerateError('Generation failed. Please try again.')
    }
    setGenerating(false)
  }

  // SEO Tool
  function generateSeoResults() {
    if (!seoKeyword.trim()) return
    setSeoLoading(true)
    setSeoResults(null)
    setTimeout(() => {
      const base = seoKeyword.toLowerCase().trim()
      const words = base.split(' ')
      const variations = [
        `best ${base}`,
        `${base} tips`,
        `how to ${base}`,
        `${base} for beginners`,
        `${base} guide`,
        `${base} 2025`,
        `top ${base} strategies`,
        `${base} examples`,
        `why ${base} matters`,
        `${base} vs alternatives`,
        ...words.flatMap(w => [`${w} tools`, `${w} software`, `${w} services`]),
      ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 12)

      const questions = [
        `What is ${base}?`,
        `How does ${base} work?`,
        `Why is ${base} important?`,
        `When should you use ${base}?`,
        `What are the best ${base} strategies?`,
      ]

      setSeoResults({ keyword: base, variations, questions, volume: Math.floor(Math.random() * 9000 + 1000), difficulty: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] })
      setSeoLoading(false)
    }, 800)
  }

  // Settings
  async function saveProfile() {
    setProfileSaving(true); setProfileMsg({ text: '', ok: true })
    const { error } = await supabase.from('profiles').update(profileForm).eq('id', user.id)
    if (error) setProfileMsg({ text: 'Error saving. Please try again.', ok: false })
    else { setProfileMsg({ text: 'Profile updated!', ok: true }); setProfile(prev => ({ ...prev, ...profileForm })) }
    setProfileSaving(false)
  }

  async function changePassword() {
    setPasswordMsg({ text: '', ok: true })
    if (!passwordForm.newPass) { setPasswordMsg({ text: 'Enter a new password.', ok: false }); return }
    if (passwordForm.newPass.length < 6) { setPasswordMsg({ text: 'Min 6 characters.', ok: false }); return }
    if (passwordForm.newPass !== passwordForm.confirm) { setPasswordMsg({ text: 'Passwords do not match.', ok: false }); return }
    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass })
    if (error) setPasswordMsg({ text: error.message, ok: false })
    else { setPasswordMsg({ text: 'Password updated!', ok: true }); setPasswordForm({ newPass: '', confirm: '' }) }
    setPasswordSaving(false)
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    await supabase.from('content_history').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-[#1B5FA8] text-xl font-semibold">Loading RANKIVO...</div>
    </div>
  )

  const config = PLATFORM_CONFIG[form.platform]
  const isAdmin = user?.email === ADMIN_EMAIL
  const platforms = Object.keys(PLATFORM_CONFIG)
  const tones = ['Professional', 'Casual', 'Persuasive', 'Informative']
  const ctas = ['None', 'Buy Now', 'Contact Us', 'Sign Up', 'Learn More', 'Visit Us', 'Book Now']
  const languages = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Urdu']
  const countries = ['Pakistan','United States','United Kingdom','United Arab Emirates','Saudi Arabia','India','Canada','Australia','Germany','France','Other']
  const planLimit = PLAN_LIMITS[profile?.plan || 'free'] || 3

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">

      {showLimitModal && (
        <LimitModal isGuest={isGuestLimit} onUpgrade={() => { setShowLimitModal(false); if (isGuestLimit) router.push('/auth'); else router.push('/upgrade') }} onClose={() => setShowLimitModal(false)} />
      )}

      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <p className="text-gray-600 text-sm">RANKIVO uses cookies to provide your content generation.</p>
          <div className="flex gap-3">
            <button onClick={acceptCookies} className="bg-[#0D9488] text-white px-6 py-2 rounded-lg text-sm font-semibold">Accept</button>
            <button onClick={() => router.push('/')} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">Decline</button>
          </div>
        </div>
      )}

      {/* Mobile menu toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="w-5 h-0.5 bg-gray-600"></span>
          <span className="w-5 h-0.5 bg-gray-600"></span>
          <span className="w-5 h-0.5 bg-gray-600"></span>
        </div>
      </button>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/30 z-30" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed md:static z-40 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false) }} user={user} profile={profile} isAdmin={isAdmin} />
      </div>

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 overflow-x-hidden">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="max-w-3xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h2>
            <p className="text-gray-500 mb-5 text-sm">Here's your RANKIVO overview.</p>

            {!user && <GuestBanner onSignup={() => router.push('/auth?mode=signup')} />}
            {user && showOnboarding && <OnboardingBanner onDismiss={dismissOnboarding} />}
            {user && <UpgradeBanner profile={profile} onUpgrade={() => router.push('/upgrade')} />}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Posts Used</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.posts_count || 0}<span className="text-gray-400 text-lg font-normal"> / {planLimit === Infinity ? '∞' : planLimit}</span></p>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${planLimit === Infinity ? 10 : Math.min(((profile?.posts_count || 0) / planLimit) * 100, 100)}%`, backgroundColor: '#0D9488' }} />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Plan</p>
                <p className="text-2xl font-bold text-[#0D9488]">{(profile?.plan || 'free').toUpperCase()}</p>
                <button onClick={() => router.push('/upgrade')} className="text-xs text-[#1B5FA8] hover:underline mt-2 block">Upgrade plan →</button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-2xl font-bold text-[#C9943A]">{planLimit === Infinity ? 'Unlimited' : 'Limited'}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Generate</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {TEMPLATES.slice(0, 3).map(t => (
                  <button key={t.label} onClick={() => applyTemplate(t)} className="text-xs bg-gray-50 hover:bg-[#1B5FA8]/10 hover:text-[#1B5FA8] border border-gray-200 hover:border-[#1B5FA8]/30 text-gray-600 px-3 py-1.5 rounded-lg transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveTab('generate')} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">Generate New Content</button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Recent Posts</h3>
                <button onClick={() => setActiveTab('history')} className="text-xs text-[#0D9488] hover:underline">View all</button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No content yet.</p>
                  <button onClick={() => setActiveTab('generate')} className="mt-2 text-[#0D9488] text-sm hover:underline">Generate your first post →</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs bg-[#1B5FA8]/10 text-[#1B5FA8] px-2 py-0.5 rounded font-medium shrink-0">{item.platform}</span>
                        <p className="text-sm text-gray-600 truncate">{item.content?.slice(0, 50)}...</p>
                      </div>
                      <span className="text-xs text-gray-400 ml-2 shrink-0">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GENERATE */}
        {activeTab === 'generate' && (
          <div className="max-w-3xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Generate Content</h2>
            <p className="text-gray-500 mb-5 text-sm">Fill in the details and let AI create your content.</p>

            {!user && <GuestBanner onSignup={() => router.push('/auth?mode=signup')} />}
            {user && <UpgradeBanner profile={profile} onUpgrade={() => router.push('/upgrade')} />}

            {/* Templates */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Templates</p>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.label} onClick={() => applyTemplate(t)} className="text-xs bg-gray-50 hover:bg-[#1B5FA8]/10 hover:text-[#1B5FA8] border border-gray-200 hover:border-[#1B5FA8]/30 text-gray-600 px-3 py-1.5 rounded-lg transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button key={p} onClick={() => selectPlatform(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.platform === p ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1B5FA8]'}`}>{p}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input id="topic-input" type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Best coffee shop in New York" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
                <div className="flex gap-2">
                  {['Short', 'Medium', 'Long'].map(l => {
                    const available = config.lengths.includes(l)
                    return (
                      <button key={l} onClick={() => available && setForm({ ...form, length: l })} disabled={!available} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${form.length === l ? 'bg-[#0D9488] text-white border-[#0D9488]' : available ? 'bg-white border-gray-200 text-gray-600 hover:border-[#0D9488]' : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                        {l}
                        <span className="block text-xs mt-0.5 opacity-70">{LENGTH_INFO[l].words}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Keywords <span className="text-gray-400 text-xs">({getKeywordLimit()} max)</span></label>
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <input key={i} type="text" value={form.keywords[i]} onChange={e => { const k = [...form.keywords]; k[i] = e.target.value; setForm({ ...form, keywords: k }) }} disabled={i >= getKeywordLimit()} placeholder={i >= getKeywordLimit() ? 'N/A' : `Keyword ${i + 1}`} className={`flex-1 bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9488] ${i >= getKeywordLimit() ? 'border-gray-100 opacity-40 cursor-not-allowed bg-gray-50' : 'border-gray-200'}`} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map(t => <button key={t} onClick={() => setForm({ ...form, tone: t })} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.tone === t ? 'bg-[#C9943A] text-white border-[#C9943A]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#C9943A]'}`}>{t}</button>)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <input type="text" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} placeholder="e.g. small business owners" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA</label>
                <div className="flex flex-wrap gap-2">
                  {ctas.map(c => <button key={c} onClick={() => setForm({ ...form, cta: c })} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.cta === c ? 'bg-[#C9943A] text-white border-[#C9943A]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#C9943A]'}`}>{c}</button>)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => <button key={l} onClick={() => setForm({ ...form, language: l })} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.language === l ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1B5FA8]'}`}>{l}</button>)}
                </div>
              </div>
            </div>

            {generateError && <p className="mt-3 text-red-500 text-sm">{generateError}</p>}

            <button onClick={generateContent} disabled={generating} className="w-full mt-5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 transition-colors">
              {generating ? 'Generating...' : 'Generate Content'}
            </button>

            {result && !result.error && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-[#0D9488]">Generated Content</h3>
                {config.meta && result.metaTitle && <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-[#C9943A] mb-1 font-medium uppercase">Meta Title</p><p className="text-gray-800">{result.metaTitle}</p></div>}
                {config.meta && result.metaDescription && <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-[#C9943A] mb-1 font-medium uppercase">Meta Description</p><p className="text-gray-800">{result.metaDescription}</p></div>}
                {config.meta && result.titles?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-[#C9943A] mb-2 font-medium uppercase">H1 Options</p>
                    {result.titles.map((t, i) => <p key={i} className="text-gray-800 mb-1"><span className="text-[#0D9488] font-bold text-xs mr-2">#{i+1}</span>{t}</p>)}
                  </div>
                )}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-[#C9943A] mb-2 font-medium uppercase">Content</p>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{result.content}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(result.content)} className="w-full bg-gray-50 hover:bg-gray-100 text-[#0D9488] py-3 rounded-lg font-medium border border-gray-200">Copy Content</button>
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
          <div className="max-w-3xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Content History</h2>
            <p className="text-gray-500 mb-5 text-sm">All your previously generated content.</p>
            {!user && <GuestBanner onSignup={() => router.push('/auth?mode=signup')} />}
            {historyLoading ? <div className="text-center py-16 text-[#1B5FA8]">Loading...</div> : history.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <p className="text-gray-400 mb-3">{user ? 'No content yet.' : 'Sign up to save your content history.'}</p>
                <button onClick={() => user ? setActiveTab('generate') : router.push('/auth?mode=signup')} className="bg-[#0D9488] text-white px-6 py-2 rounded-lg text-sm font-semibold">{user ? 'Generate First Post' : 'Sign Up Free'}</button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="bg-[#1B5FA8]/10 text-[#1B5FA8] text-xs font-semibold px-2 py-0.5 rounded shrink-0">{item.platform}</span>
                        <span className="bg-[#0D9488]/10 text-[#0D9488] text-xs px-2 py-0.5 rounded shrink-0">{item.content_length}</span>
                        <span className="text-xs text-gray-400 truncate hidden sm:block">{item.tone}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-gray-400">{expandedId === item.id ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expandedId === item.id && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                        {item.meta_title && <div><p className="text-xs text-[#C9943A] font-medium uppercase mb-1">Meta Title</p><p className="text-sm text-gray-700">{item.meta_title}</p></div>}
                        {item.meta_description && <div><p className="text-xs text-[#C9943A] font-medium uppercase mb-1">Meta Description</p><p className="text-sm text-gray-700">{item.meta_description}</p></div>}
                        <div><p className="text-xs text-[#C9943A] font-medium uppercase mb-1">Content</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p></div>
                        {item.keywords?.length > 0 && <div><p className="text-xs text-gray-400 uppercase mb-1">Keywords</p><div className="flex flex-wrap gap-1">{item.keywords.map((k, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{k}</span>)}</div></div>}
                        {item.hashtags?.length > 0 && <div><p className="text-xs text-gray-400 uppercase mb-1">Hashtags</p><p className="text-xs text-[#0D9488]">{item.hashtags.join(' ')}</p></div>}
                        <button onClick={() => navigator.clipboard.writeText(item.content)} className="w-full bg-gray-50 hover:bg-gray-100 text-[#0D9488] py-2 rounded-lg text-sm font-medium border border-gray-200">Copy</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEO TOOLS */}
        {activeTab === 'seo' && (
          <div className="max-w-3xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">SEO Keyword Tool</h2>
            <p className="text-gray-500 mb-6 text-sm">Generate keyword variations and content ideas for any topic.</p>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter your main keyword</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={seoKeyword}
                  onChange={e => setSeoKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateSeoResults()}
                  placeholder="e.g. content marketing, SEO tools, AI writing"
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm"
                />
                <button onClick={generateSeoResults} disabled={seoLoading || !seoKeyword.trim()} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors whitespace-nowrap">
                  {seoLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {seoResults && (
              <div className="space-y-5">
                {/* Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-xs text-gray-400 mb-1">Est. Monthly Volume</p>
                    <p className="text-2xl font-bold text-[#1B5FA8]">{seoResults.volume.toLocaleString()}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-xs text-gray-400 mb-1">Competition</p>
                    <p className={`text-2xl font-bold ${seoResults.difficulty === 'Low' ? 'text-[#0D9488]' : seoResults.difficulty === 'Medium' ? 'text-[#C9943A]' : 'text-red-500'}`}>{seoResults.difficulty}</p>
                  </div>
                </div>

                {/* Variations */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-3">Keyword Variations</p>
                  <div className="flex flex-wrap gap-2">
                    {seoResults.variations.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[#1B5FA8]/5 border border-[#1B5FA8]/20 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-gray-700">{v}</span>
                        <button onClick={() => navigator.clipboard.writeText(v)} className="text-[#1B5FA8] text-xs hover:text-[#0D9488] transition-colors" title="Copy">⧉</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-3">People Also Ask</p>
                  <div className="space-y-2">
                    {seoResults.questions.map((q, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <p className="text-sm text-gray-700">{q}</p>
                        <button onClick={() => { setForm(prev => ({ ...prev, topic: q })); setActiveTab('generate') }} className="text-xs text-[#0D9488] hover:underline shrink-0 ml-3">Generate →</button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => { setForm(prev => ({ ...prev, topic: seoResults.keyword })); setActiveTab('generate') }} className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-3 rounded-xl font-semibold transition-colors">
                  Generate Content for "{seoResults.keyword}"
                </button>
              </div>
            )}
          </div>
        )}

        {/* HIRE */}
        {activeTab === 'hire' && (
          <div className="max-w-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Hire a Writer</h2>
            <p className="text-gray-500 mb-6 text-sm">Get your AI-generated content polished by a professional human writer.</p>
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
              <div className="text-5xl mb-4">✍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Human Writer Marketplace</h3>
              <p className="text-gray-500 mb-5 text-sm">Connect with professional writers who can polish your AI drafts into publication-ready content.</p>
              <a href="/contact" className="inline-block bg-[#C9943A] hover:bg-[#C9943A]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm">Contact Us to Get Started</a>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Account Settings</h2>
            <p className="text-gray-500 mb-5 text-sm">Manage your profile, password and account.</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {[{ id: 'profile', label: 'Edit Profile' }, { id: 'password', label: 'Change Password' }, { id: 'danger', label: 'Danger Zone' }].map(t => (
                <button key={t.id} onClick={() => setSettingsTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${settingsTab === t.id ? (t.id === 'danger' ? 'bg-red-500 text-white border-red-500' : 'bg-[#1B5FA8] text-white border-[#1B5FA8]') : 'bg-white border-gray-200 text-gray-600'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {settingsTab === 'profile' && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select value={profileForm.country} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]">
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input type="text" value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label><input type="text" value={profileForm.zip} onChange={e => setProfileForm({ ...profileForm, zip: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" /></div>
                </div>
                {profileMsg.text && <p className={`text-sm font-medium ${profileMsg.ok ? 'text-[#0D9488]' : 'text-red-500'}`}>{profileMsg.text}</p>}
                <button onClick={saveProfile} disabled={profileSaving} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">{profileSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            )}

            {settingsTab === 'password' && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <p className="text-sm text-gray-500">You are already logged in so no current password is needed.</p>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={passwordForm.newPass} onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label><input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" /></div>
                {passwordMsg.text && <p className={`text-sm font-medium ${passwordMsg.ok ? 'text-[#0D9488]' : 'text-red-500'}`}>{passwordMsg.text}</p>}
                <button onClick={changePassword} disabled={passwordSaving} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">{passwordSaving ? 'Updating...' : 'Update Password'}</button>
              </div>
            )}

            {settingsTab === 'danger' && (
              <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-red-500 font-semibold">Delete Account</h3>
                <p className="text-sm text-gray-500">Permanently deletes your account, profile and all content history.</p>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="font-bold text-red-500">DELETE</span> to confirm</label>
                  <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" className="w-full border border-red-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-red-400" />
                </div>
                <button onClick={deleteAccount} disabled={deleting || deleteConfirm !== 'DELETE'} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40">{deleting ? 'Deleting...' : 'Delete My Account'}</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
