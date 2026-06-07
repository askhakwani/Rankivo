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
          <HireWriterTab user={user} supabase={supabase} />
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

// ── Services Data ─────────────────────────────────────────────────────────────
const SERVICES_LIST = [
  { id: 'seo-blog',      icon: '✍️', label: 'SEO Blog Writing',     desc: 'Long-form articles built to rank',           href: '/services/seo-blog-writing',     from: '$5/article'  },
  { id: 'web-copy',      icon: '🖥️', label: 'Website Copywriting',  desc: 'Pages that convert visitors into buyers',    href: '/services/website-copywriting',  from: '$15/page'    },
  { id: 'social',        icon: '📱', label: 'Social Media Content', desc: 'Human-written posts for every platform',     href: '/services/social-media-content', from: '$1.50/post'  },
  { id: 'email',         icon: '📧', label: 'Email Sequences',      desc: 'Flows that turn subscribers into customers', href: '/services/email-sequences',       from: '$5/email'    },
  { id: 'product-desc',  icon: '🛍️', label: 'Product Descriptions', desc: 'Platform-specific copy that sells',         href: '/services/product-descriptions', from: '$3/item'     },
  { id: 'strategy',      icon: '🗺️', label: 'Content Strategy',     desc: 'Keyword research + content roadmap',         href: '/services/content-strategy',     from: '$29'         },
  { id: 'video',         icon: '🎬', label: 'Video Scripts',        desc: 'Hooks, structure and CTAs that convert',     href: '/services/video-scripts',        from: '$5/script'   },
]

const STATUS_CONFIG = {
  awaiting_brief:  { label: 'Awaiting Brief',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200',  icon: '📋' },
  brief_received:  { label: 'Brief Received',  color: 'bg-blue-100 text-blue-700 border-blue-200',        icon: '📨' },
  in_progress:     { label: 'In Progress',     color: 'bg-purple-100 text-purple-700 border-purple-200',  icon: '⚡' },
  review:          { label: 'Under Review',    color: 'bg-orange-100 text-orange-700 border-orange-200',  icon: '👀' },
  complete:        { label: 'Complete',        color: 'bg-green-100 text-green-700 border-green-200',     icon: '✅' },
  cancelled:       { label: 'Cancelled',       color: 'bg-red-100 text-red-700 border-red-200',           icon: '❌' },
}

const BATCH_STATUS_CONFIG = {
  pending:     { label: 'Pending',    color: 'text-gray-500'   },
  in_progress: { label: 'Working',   color: 'text-purple-600' },
  delivered:   { label: 'Delivered', color: 'text-blue-600'   },
  approved:    { label: 'Approved',  color: 'text-green-600'  },
}

// ── HireWriterTab Component ────────────────────────────────────────────────────
function HireWriterTab({ user, supabase }) {
  const [view, setView]               = useState('home')     // home | new-order | orders | order-detail
  const [orders, setOrders]           = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [batches, setBatches]         = useState([])
  const [messages, setMessages]       = useState([])
  const [newMessage, setNewMessage]   = useState('')
  const [sendingMsg, setSendingMsg]   = useState(false)

  // New order form
  const [orderForm, setOrderForm] = useState({
    service: '', description: '', batchDesc: '', batchAmount: '',
  })
  const [orderStep, setOrderStep]   = useState(1) // 1=service, 2=details, 3=batch, 4=pay
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    if (user) fetchOrders()
  }, [user])

  async function fetchOrders() {
    setOrdersLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setOrdersLoading(false)
  }

  async function fetchOrderDetail(order) {
    setSelectedOrder(order)
    setView('order-detail')
    const [{ data: b }, { data: m }] = await Promise.all([
      supabase.from('order_batches').select('*').eq('order_id', order.id).order('batch_number'),
      supabase.from('order_messages').select('*').eq('order_id', order.id).order('created_at'),
    ])
    setBatches(b || [])
    setMessages(m || [])
  }

  async function submitOrder() {
    if (!orderForm.service || !orderForm.description || !orderForm.batchDesc || !orderForm.batchAmount) {
      setOrderError('Please fill in all fields.')
      return
    }
    const amount = parseFloat(orderForm.batchAmount)
    if (isNaN(amount) || amount <= 0) {
      setOrderError('Please enter a valid amount.')
      return
    }
    setSubmitting(true)
    setOrderError('')
    try {
      // Create order
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        user_id:      user.id,
        user_email:   user.email,
        service:      orderForm.service,
        description:  orderForm.description,
        total_amount: amount,
        status:       'awaiting_brief',
        project_id:   '',
      }).select().single()

      if (orderErr) throw orderErr

      // Create first batch
      await supabase.from('order_batches').insert({
        order_id:       order.id,
        batch_number:   1,
        description:    orderForm.batchDesc,
        amount:         amount,
        payment_status: 'unpaid',
        work_status:    'pending',
      })

      await fetchOrders()
      setOrderForm({ service: '', description: '', batchDesc: '', batchAmount: '' })
      setOrderStep(1)
      setView('orders')
    } catch (e) {
      setOrderError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedOrder) return
    setSendingMsg(true)
    await supabase.from('order_messages').insert({
      order_id:     selectedOrder.id,
      sender_role:  'user',
      sender_email: user.email,
      message:      newMessage.trim(),
    })
    setNewMessage('')
    const { data: m } = await supabase.from('order_messages').select('*').eq('order_id', selectedOrder.id).order('created_at')
    setMessages(m || [])
    setSendingMsg(false)
  }

  async function addBatch() {
    if (!selectedOrder) return
    const desc   = prompt('Describe this batch (e.g. "5 blog articles on SEO topics"):')
    const amount = prompt('Amount for this batch ($):')
    if (!desc || !amount) return
    const batchNum = batches.length + 1
    await supabase.from('order_batches').insert({
      order_id:       selectedOrder.id,
      batch_number:   batchNum,
      description:    desc,
      amount:         parseFloat(amount),
      payment_status: 'unpaid',
      work_status:    'pending',
    })
    const { data: b } = await supabase.from('order_batches').select('*').eq('order_id', selectedOrder.id).order('batch_number')
    setBatches(b || [])
  }

  // ── HOME VIEW ──────────────────────────────────────────────────────────────
  if (view === 'home') {
    // Redirect admin to admin panel orders tab
    if (user?.email === 'askhakwani@gmail.com') return (
      <div className="max-w-xl">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Order Management</h2>
        <p className="text-gray-500 text-sm mb-6">As admin, manage all client orders from the Admin Panel.</p>
        <div className="bg-white border-2 border-[#C9943A]/30 rounded-xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Go to Order Management</h3>
          <p className="text-gray-500 mb-5 text-sm">View all orders, update statuses, manage batches, reply to client messages and add deliverable links.</p>
          <a href="/admin?tab=orders" className="inline-block bg-[#C9943A] hover:bg-[#C9943A]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm">
            Open Admin Orders →
          </a>
        </div>
      </div>
    )

    return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Hire a Writer</h2>
          <p className="text-gray-500 text-sm">Expert-crafted content — SEO optimised, Copyscape verified, delivered to your inbox.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchOrders(); setView('orders') }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#1B5FA8] hover:text-[#1B5FA8] transition-colors">
            My Orders
          </button>
          <button onClick={() => setView('new-order')}
            className="px-4 py-2 rounded-lg bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white text-sm font-semibold transition-colors">
            + New Order
          </button>
        </div>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {SERVICES_LIST.map(s => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1B5FA8]/40 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-bold text-[#0D9488]">{s.from}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{s.label}</h3>
            <p className="text-xs text-gray-400 mb-3">{s.desc}</p>
            <div className="flex gap-2">
              <button onClick={() => { setOrderForm(f => ({ ...f, service: s.label })); setView('new-order') }}
                className="flex-1 text-center py-1.5 rounded-lg bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white text-xs font-semibold transition-colors">
                Order
              </button>
              <a href={s.href} target="_blank" rel="noreferrer"
                className="px-2 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 text-xs font-semibold transition-colors">
                Details
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1B5FA8]/5 border border-[#1B5FA8]/20 rounded-xl p-4 text-sm text-gray-500 text-center">
        All communication via <strong className="text-gray-700">sales@rankivo.co</strong> · We reply within 24 hours · Milestone-based payments
      </div>
    </div>
  )
  } // end home view

  // ── NEW ORDER VIEW ─────────────────────────────────────────────────────────
  if (view === 'new-order') return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('home')} className="text-gray-400 hover:text-gray-600 transition-colors">←</button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">New Order</h2>
          <p className="text-gray-500 text-sm">Step {orderStep} of 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {['Service', 'Brief', 'First Batch'].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              orderStep > i + 1 ? 'bg-[#0D9488] text-white' : orderStep === i + 1 ? 'bg-[#1B5FA8] text-white' : 'bg-gray-100 text-gray-400'
            }`}>{orderStep > i + 1 ? '✓' : i + 1}</div>
            <span className={`text-xs font-medium ${orderStep === i + 1 ? 'text-[#1B5FA8]' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {/* Step 1 — Service */}
        {orderStep === 1 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Which service do you need?</h3>
            <div className="space-y-2 mb-6">
              {SERVICES_LIST.map(s => (
                <button key={s.id} onClick={() => setOrderForm(f => ({ ...f, service: s.label }))}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    orderForm.service === s.label ? 'border-[#1B5FA8] bg-[#1B5FA8]/5' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.from}</p>
                  </div>
                  {orderForm.service === s.label && <span className="w-5 h-5 rounded-full bg-[#1B5FA8] flex items-center justify-center text-white text-xs font-bold shrink-0">✓</span>}
                </button>
              ))}
            </div>
            <button onClick={() => orderForm.service && setOrderStep(2)}
              disabled={!orderForm.service}
              className="w-full py-3 rounded-xl bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 disabled:opacity-40 text-white font-semibold text-sm transition-colors">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Brief */}
        {orderStep === 2 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Tell us about your project</h3>
            <p className="text-sm text-gray-400 mb-4">Selected: <strong className="text-gray-600">{orderForm.service}</strong></p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Description *</label>
              <textarea value={orderForm.description} onChange={e => setOrderForm(f => ({ ...f, description: e.target.value }))}
                rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] resize-none"
                placeholder="Describe your project — topic, audience, tone, keywords, any specific requirements…" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setOrderStep(1)} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-300 transition-colors">← Back</button>
              <button onClick={() => orderForm.description && setOrderStep(3)}
                disabled={!orderForm.description}
                className="flex-1 py-3 rounded-xl bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 disabled:opacity-40 text-white font-semibold text-sm transition-colors">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — First Batch */}
        {orderStep === 3 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Set your first milestone</h3>
            <p className="text-sm text-gray-400 mb-4">You only pay for this batch now. Add more batches later as you go.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Description *</label>
              <input value={orderForm.batchDesc} onChange={e => setOrderForm(f => ({ ...f, batchDesc: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
                placeholder="e.g. 5 blog articles on SEO topics, 1,000 words each" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
              <input type="number" value={orderForm.batchAmount} onChange={e => setOrderForm(f => ({ ...f, batchAmount: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
                placeholder="e.g. 25" min="1" />
              <p className="text-xs text-gray-400 mt-1">We'll send you a Paddle payment link after confirming your order via email.</p>
            </div>
            {orderError && <p className="text-red-500 text-sm mb-3">{orderError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setOrderStep(2)} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-300 transition-colors">← Back</button>
              <button onClick={submitOrder} disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0D9488]/90 disabled:opacity-50 text-white font-bold text-sm transition-colors">
                {submitting ? 'Placing Order…' : 'Place Order →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── ORDERS LIST VIEW ───────────────────────────────────────────────────────
  if (view === 'orders') return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('home')} className="text-gray-400 hover:text-gray-600 transition-colors">←</button>
          <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
        </div>
        <button onClick={() => setView('new-order')}
          className="px-4 py-2 rounded-lg bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white text-sm font-semibold transition-colors">
          + New Order
        </button>
      </div>

      {ordersLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-semibold text-gray-700 mb-1">No orders yet</p>
          <p className="text-sm text-gray-400 mb-4">Place your first order to get started</p>
          <button onClick={() => setView('new-order')} className="px-5 py-2 bg-[#1B5FA8] text-white rounded-lg text-sm font-semibold hover:bg-[#1B5FA8]/90 transition-colors">
            + New Order
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.awaiting_brief
            return (
              <div key={order.id} onClick={() => fetchOrderDetail(order)}
                className="bg-white border border-gray-200 hover:border-[#1B5FA8]/40 rounded-xl p-5 cursor-pointer transition-all hover:shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400 font-mono">{order.project_id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{order.service}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{order.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">${order.total_amount}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // ── ORDER DETAIL VIEW ──────────────────────────────────────────────────────
  if (view === 'order-detail' && selectedOrder) {
    const st = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.awaiting_brief
    return (
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setView('orders'); fetchOrders() }} className="text-gray-400 hover:text-gray-600 transition-colors">←</button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{selectedOrder.service}</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.color}`}>{st.icon} {st.label}</span>
            </div>
            <p className="text-xs text-gray-400 font-mono">{selectedOrder.project_id}</p>
          </div>
        </div>

        {/* Milestone tracker */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Project Timeline</p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            {['awaiting_brief', 'brief_received', 'in_progress', 'review', 'complete'].map((s, i, arr) => {
              const cfg    = STATUS_CONFIG[s]
              const active = selectedOrder.status === s
              const done   = arr.indexOf(selectedOrder.status) > i
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex flex-col items-center`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 font-bold ${
                      done   ? 'bg-[#0D9488] border-[#0D9488] text-white' :
                      active ? 'bg-[#1B5FA8] border-[#1B5FA8] text-white' :
                               'bg-white border-gray-200 text-gray-300'
                    }`}>{done ? '✓' : cfg.icon}</div>
                    <p className={`text-[10px] mt-1 font-medium text-center ${active ? 'text-[#1B5FA8]' : done ? 'text-[#0D9488]' : 'text-gray-300'}`}>
                      {cfg.label}
                    </p>
                  </div>
                  {i < arr.length - 1 && <div className={`h-px w-6 mb-4 ${done ? 'bg-[#0D9488]' : 'bg-gray-200'}`} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Project brief */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Brief</p>
          <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder.description}</p>
        </div>

        {/* Batches */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Milestones / Batches</p>
            <button onClick={addBatch} className="text-xs font-semibold text-[#1B5FA8] hover:underline">+ Add Batch</button>
          </div>
          {batches.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No batches yet</p>
          ) : (
            <div className="space-y-3">
              {batches.map(batch => {
                const ws = BATCH_STATUS_CONFIG[batch.work_status]
                return (
                  <div key={batch.id} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-500">Batch {batch.batch_number}</span>
                        <span className={`text-xs font-semibold ${ws.color}`}>{ws.label}</span>
                      </div>
                      <p className="text-sm text-gray-700">{batch.description}</p>
                      {batch.deliverable_url && (
                        <a href={batch.deliverable_url} target="_blank" rel="noreferrer"
                          className="text-xs text-[#1B5FA8] hover:underline font-semibold mt-1 inline-block">
                          📥 Download Deliverable
                        </a>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">${batch.amount}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        batch.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {batch.payment_status === 'paid' ? '✓ Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Total paid</span>
            <span className="font-bold text-gray-900">${selectedOrder.paid_amount || 0} / ${selectedOrder.total_amount}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Messages</p>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No messages yet — send us a note below</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender_role === 'user'
                      ? 'bg-[#1B5FA8] text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                  }`}>
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                      {msg.sender_role === 'admin' ? 'Rankivo Team · ' : ''}{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
              placeholder="Type a message…" />
            <button onClick={sendMessage} disabled={sendingMsg || !newMessage.trim()}
              className="px-4 py-2.5 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
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
