'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from './sidebar'

const ADMIN_EMAIL = 'askhakwani@gmail.com'
const PLAN_LIMITS = { free: 3, starter: 50, pro: 200, agency: Infinity }

// ── Create New Content tool list ──────────────────────────────────────────────
const CREATE_TOOLS = [
  { label: 'Blog Post',         href: '/tools/blog-generator',              icon: '📝', color: 'bg-[#1B5FA8]/10 text-[#1B5FA8] border-[#1B5FA8]/20' },
  { label: 'Instagram Caption', href: '/tools/instagram-caption-generator', icon: '📸', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { label: 'TikTok Caption',    href: '/tools/tiktok-caption-generator',    icon: '🎵', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { label: 'LinkedIn Post',     href: '/tools/linkedin-post-generator',     icon: '💼', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'X Post',            href: '/tools/x-post-generator',            icon: '✖️',  color: 'bg-gray-100 text-gray-900 border-gray-300' },
  { label: 'Email',             href: '/tools/email-generator',             icon: '✉️',  color: 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20' },
  { label: 'YouTube Script',    href: '/tools/youtube-script-generator',    icon: '🎬', color: 'bg-red-50 text-red-600 border-red-200' },
  { label: 'Ad Copy',           href: '/tools/ad-copy-generator',           icon: '📣', color: 'bg-[#C9943A]/10 text-[#C9943A] border-[#C9943A]/20' },
]

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
            {pct >= 100 ? 'Upgrade your plan to keep generating.' : `You've used ${used} of ${limit} posts this month.`}
          </p>
        </div>
      </div>
      <button onClick={onUpgrade} className="shrink-0 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
        Upgrade Now
      </button>
    </div>
  )
}

function LimitModal({ onUpgrade, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You've reached your limit</h3>
        <p className="text-sm text-gray-500 mb-6">You have used all your posts for this month. Upgrade to keep generating.</p>
        <div className="space-y-3">
          <button onClick={onUpgrade} className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-3 rounded-xl text-sm font-bold">View Upgrade Plans</button>
          <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Maybe Later</button>
        </div>
      </div>
    </div>
  )
}

function DashboardInner() {
  const [user, setUser]           = useState(null)
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [history, setHistory]     = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [expandedId, setExpandedId]         = useState(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [sidebarOpen, setSidebarOpen]       = useState(false)
  const [showActivated, setShowActivated]   = useState(false)
  const [showCookieBanner, setShowCookieBanner] = useState(false)

  // Settings
  const [settingsTab, setSettingsTab]   = useState('profile')
  const [profileForm, setProfileForm]   = useState({ full_name: '', country: '', city: '', state: '', zip: '', phone: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg]       = useState({ text: '', ok: true })
  const [passwordForm, setPasswordForm]   = useState({ newPass: '', confirm: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg]       = useState({ text: '', ok: true })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting]           = useState(false)

  // SEO Tool
  const [seoKeyword, setSeoKeyword] = useState('')
  const [seoResults, setSeoResults] = useState(null)
  const [seoLoading, setSeoLoading] = useState(false)

  const supabase   = createClient()
  const router     = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('activated') === 'free') {
      setShowActivated(true)
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookie = localStorage.getItem('rankivo_cookie_accepted')
      if (!cookie) setShowCookieBanner(true)
    }
  }, [])

  useEffect(() => {
    async function loadUser(currentUser) {
      setUser(currentUser)
      // Always fetch fresh profile so posts_count is current
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', currentUser.id).single()
      setProfile(profileData)
      if (profileData) {
        setProfileForm({
          full_name: profileData.full_name || '',
          country:   profileData.country   || '',
          city:      profileData.city      || '',
          state:     profileData.state     || '',
          zip:       profileData.zip       || '',
          phone:     profileData.phone     || '',
        })
      }
      const { data: hist } = await supabase
        .from('content_history').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false })
      setHistory(hist || [])
      setHistoryLoading(false)
      setLoading(false)
    }

    // Immediate session check — don't wait for an auth event
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user)
      else { setUser(null); setProfile(null); setLoading(false); setHistoryLoading(false) }
    })

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
    const { data } = await supabase
      .from('content_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setHistory(data || [])
    setHistoryLoading(false)
  }

  function acceptCookies() {
    localStorage.setItem('rankivo_cookie_accepted', 'true')
    setShowCookieBanner(false)
  }

  // Settings handlers
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

  function generateSeoResults() {
    if (!seoKeyword.trim()) return
    setSeoLoading(true); setSeoResults(null)
    setTimeout(() => {
      const base = seoKeyword.toLowerCase().trim()
      const words = base.split(' ')
      const variations = [
        `best ${base}`, `${base} tips`, `how to ${base}`, `${base} for beginners`,
        `${base} guide`, `${base} 2025`, `top ${base} strategies`, `${base} examples`,
        `why ${base} matters`, `${base} vs alternatives`,
        ...words.flatMap(w => [`${w} tools`, `${w} software`, `${w} services`]),
      ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 12)
      const questions = [
        `What is ${base}?`, `How does ${base} work?`, `Why is ${base} important?`,
        `When should you use ${base}?`, `What are the best ${base} strategies?`,
      ]
      setSeoResults({ keyword: base, variations, questions, volume: Math.floor(Math.random() * 9000 + 1000), difficulty: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] })
      setSeoLoading(false)
    }, 800)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-[#1B5FA8] text-xl font-semibold">Loading RANKIVO...</div>
    </div>
  )

  const isAdmin    = user?.email === ADMIN_EMAIL
  const planLimit  = PLAN_LIMITS[profile?.plan || 'free'] || 3
  const countries  = ['Pakistan','United States','United Kingdom','United Arab Emirates','Saudi Arabia','India','Canada','Australia','Germany','France','Other']

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">

      {showLimitModal && (
        <LimitModal
          onUpgrade={() => { setShowLimitModal(false); router.push('/upgrade') }}
          onClose={() => setShowLimitModal(false)}
        />
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

      {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/30 z-30" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed md:static z-40 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false) }} user={user} profile={profile} isAdmin={isAdmin} />
      </div>

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 overflow-x-hidden">

        {/* ── DASHBOARD ────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="max-w-3xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h2>
            <p className="text-gray-500 mb-5 text-sm">Here's your RANKIVO overview.</p>

            {showActivated && (
              <div className="bg-[#0D9488]/10 border border-[#0D9488]/30 rounded-xl px-5 py-4 mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0D9488]">Your free plan is activated!</p>
                    <p className="text-xs text-gray-500 mt-0.5">You have 3 posts/month. Start generating now.</p>
                  </div>
                </div>
                <button onClick={() => setShowActivated(false)} className="text-gray-300 hover:text-gray-500 text-xl shrink-0">×</button>
              </div>
            )}

            {user && <UpgradeBanner profile={profile} onUpgrade={() => router.push('/upgrade')} />}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Posts Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.posts_count || 0}
                  <span className="text-gray-400 text-lg font-normal"> / {planLimit === Infinity ? '∞' : planLimit}</span>
                </p>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${planLimit === Infinity ? 10 : Math.min(((profile?.posts_count || 0) / planLimit) * 100, 100)}%`,
                    backgroundColor: '#0D9488'
                  }} />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Plan</p>
                <p className="text-2xl font-bold text-[#0D9488]">{(profile?.plan || 'free').toUpperCase()}</p>
                <button onClick={() => router.push('/upgrade')} className="text-xs text-[#1B5FA8] hover:underline mt-2 block">Upgrade plan →</button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-2xl font-bold text-[#C9943A]">{planLimit === Infinity ? 'Unlimited' : 'Active'}</p>
              </div>
            </div>

            {/* ── Create New Content ───────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Create New Content</h3>
                <span className="text-xs text-gray-400">Pick a tool to get started</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CREATE_TOOLS.map(tool => (
                  <a
                    key={tool.href}
                    href={tool.href}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all hover:scale-[1.03] hover:shadow-md ${tool.color}`}
                  >
                    <span className="text-2xl">{tool.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{tool.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Recent Posts</h3>
                <button onClick={() => setActiveTab('history')} className="text-xs text-[#0D9488] hover:underline">View all</button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No content yet.</p>
                  <a href="/tools/blog-generator" className="mt-2 text-[#0D9488] text-sm hover:underline inline-block">Generate your first post →</a>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs bg-[#1B5FA8]/10 text-[#1B5FA8] px-2 py-0.5 rounded font-medium shrink-0">{item.platform}</span>
                        <p className="text-sm text-gray-600 truncate">{item.content?.slice(0, 50)}...</p>
                      </div>
                      <span className="text-xs text-gray-400 ml-2 shrink-0">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY ──────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="max-w-3xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Content History</h2>
            <p className="text-gray-500 mb-5 text-sm">All your generated content in one place.</p>
            {historyLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
                <p className="text-gray-400 mb-3">No history yet.</p>
                <a href="/tools/blog-generator" className="text-[#0D9488] text-sm hover:underline">Create your first post →</a>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs bg-[#1B5FA8]/10 text-[#1B5FA8] px-2 py-0.5 rounded font-medium shrink-0">{item.platform}</span>
                        <p className="text-sm text-gray-700 truncate">{item.content?.slice(0, 70)}...</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0">
                        <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-gray-400 text-xs">{expandedId === item.id ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expandedId === item.id && (
                      <div className="px-5 pb-5 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2 mt-3 mb-3">
                          {item.tone && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.tone}</span>}
                          {item.content_length && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.content_length}</span>}
                          {item.language && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.language}</span>}
                          {item.word_count > 0 && <span className="text-xs bg-[#0D9488]/10 text-[#0D9488] px-2 py-0.5 rounded">{item.word_count} words</span>}
                        </div>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4 mb-3 font-sans">{item.content}</pre>
                        <button
                          onClick={() => navigator.clipboard.writeText(item.content || '')}
                          className="text-xs border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
                        >
                          📋 Copy
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── KEYWORDS ─────────────────────────────────────────────────── */}
        {activeTab === 'keywords' && (
          <div className="max-w-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Keyword Research</h2>
            <p className="text-gray-500 mb-5 text-sm">Find keyword ideas and related questions.</p>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-5">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={seoKeyword}
                  onChange={e => setSeoKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateSeoResults()}
                  placeholder="Enter a keyword or topic..."
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0D9488]"
                />
                <button
                  onClick={generateSeoResults}
                  disabled={seoLoading}
                  className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {seoLoading ? 'Searching…' : 'Research'}
                </button>
              </div>
            </div>

            {seoResults && (
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Est. Volume</p>
                    <p className="text-2xl font-bold text-[#1B5FA8]">{seoResults.volume.toLocaleString()}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Difficulty</p>
                    <p className={`text-2xl font-bold ${seoResults.difficulty === 'Low' ? 'text-[#0D9488]' : seoResults.difficulty === 'Medium' ? 'text-[#C9943A]' : 'text-red-500'}`}>{seoResults.difficulty}</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-3">Keyword Variations</p>
                  <div className="flex flex-wrap gap-2">
                    {seoResults.variations.map((v, i) => (
                      <div key={i} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-gray-700">{v}</span>
                        <button onClick={() => navigator.clipboard.writeText(v)} className="text-[#1B5FA8] text-xs hover:text-[#0D9488] transition-colors" title="Copy">⧉</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-3">People Also Ask</p>
                  <div className="space-y-2">
                    {seoResults.questions.map((q, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <p className="text-sm text-gray-700">{q}</p>
                        <a href={`/tools/blog-generator`} className="text-xs text-[#0D9488] hover:underline shrink-0 ml-3">Generate →</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HIRE ─────────────────────────────────────────────────────── */}
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

        {/* ── SETTINGS ─────────────────────────────────────────────────── */}
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

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-[#1B5FA8] text-xl font-semibold">Loading RANKIVO...</div>
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
