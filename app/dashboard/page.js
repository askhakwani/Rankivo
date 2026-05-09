'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Sidebar from './sidebar'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

const PLATFORM_CONFIG = {
  Instagram: { lengths: ['Short'], keywords: true, meta: false },
  TikTok:    { lengths: ['Short'], keywords: true, meta: false },
  LinkedIn:  { lengths: ['Short', 'Medium'], keywords: true, meta: false },
  Blog:      { lengths: ['Short', 'Medium', 'Long'], keywords: true, meta: true },
  Email:     { lengths: ['Short', 'Medium'], keywords: true, meta: false },
  Ads:       { lengths: ['Short'], keywords: true, meta: false },
}

const LENGTH_INFO = {
  Short:  { label: 'Short',  words: '~150 words', actual: 150 },
  Medium: { label: 'Medium', words: '~400 words', actual: 400 },
  Long:   { label: 'Long',   words: '~800 words', actual: 800 },
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [cookieAccepted, setCookieAccepted] = useState(false)
  const [showCookieBanner, setShowCookieBanner] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const [form, setForm] = useState({
    platform: 'Instagram',
    topic: '',
    keywords: ['', '', ''],
    tone: 'Professional',
    audience: '',
    cta: 'None',
    length: 'Short',
    language: 'English',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookie = localStorage.getItem('rankivo_cookie_accepted')
      if (!cookie) setShowCookieBanner(true)
      else setCookieAccepted(true)
    }
    getUser()
  }, [])

  // Handle logout tab trigger
  useEffect(() => {
    if (activeTab === 'logout') {
      supabase.auth.signOut().then(() => router.push('/auth'))
    }
  }, [activeTab])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)
    }
    setLoading(false)
  }

  function acceptCookies() {
    localStorage.setItem('rankivo_cookie_accepted', 'true')
    setCookieAccepted(true)
    setShowCookieBanner(false)
  }

  function selectPlatform(p) {
    const config = PLATFORM_CONFIG[p]
    const defaultLength = config.lengths[0]
    setForm({ ...form, platform: p, length: defaultLength })
    setResult(null)
  }

  function getKeywordLimit() {
    if (form.length === 'Short') return 1
    if (form.length === 'Medium') return 2
    return 3
  }

  async function checkPostLimit() {
    if (user) {
      const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (freshProfile) setProfile(freshProfile)
      if (freshProfile?.plan && freshProfile.plan !== 'free') return true
      const now = new Date()
      if (freshProfile?.reset_date && new Date(freshProfile.reset_date) < now) {
        await supabase.from('profiles').update({
          posts_count: 0,
          reset_date: new Date(now.setMonth(now.getMonth() + 1))
        }).eq('id', user.id)
        return true
      }
      if ((freshProfile?.posts_count || 0) >= 3) return false
      return true
    } else {
      const guestPosts = parseInt(localStorage.getItem('rankivo_guest_posts') || '0')
      return guestPosts < 1
    }
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
    if (!user) { console.log('saveToHistory: no user'); return }
    const contentText = typeof contentObj === 'string' ? contentObj : contentObj?.content || ''
    const { error } = await supabase.from('content_history').insert({
      user_id: user.id,
      platform: form.platform,
      content: contentText,
      keywords: form.keywords.filter(k => k.trim()),
      hashtags: contentText?.match(/#\w+/g) || [],
      meta_title: contentObj?.metaTitle || null,
      meta_description: contentObj?.metaDescription || null,
      content_length: form.length,
      language: form.language,
      tone: form.tone,
      audience: form.audience,
      cta: form.cta,
    })
    if (error) {
      console.error('History save error FULL:', JSON.stringify(error))
      console.error('History save error message:', error.message)
      console.error('History save error code:', error.code)
    } else {
      console.log('History saved successfully')
    }
  }

  async function generateContent() {
    if (!cookieAccepted) { setShowCookieBanner(true); return }
    if (!form.topic.trim()) { alert('Please enter a topic!'); return }
    const allowed = await checkPostLimit()
    if (!allowed) {
      if (user) alert('You have used all 3 free posts this month. Please upgrade to continue!')
      else { alert('You have used your 1 free guest post. Create a free account for 3 posts/month!'); router.push('/auth') }
      return
    }
    setGenerating(true)
    setResult(null)
    try {
      const activeKeywords = form.keywords.slice(0, getKeywordLimit()).filter(k => k.trim())
      const wordCount = LENGTH_INFO[form.length].actual
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, keywords: activeKeywords, wordCount }),
      })
      const data = await response.json()
      if (data.content) {
        // data.content is an object: { content, metaTitle, metaDescription, titles }
        setResult(data.content)
        await incrementPostCount()
        await saveToHistory(data.content)
      } else {
        alert('Generation failed. Please try again.')
      }
    } catch (error) {
      console.error('Generate error:', error)
      alert('Generation failed. Please try again.')
    }
    setGenerating(false)
  }

  function updateKeyword(index, value) {
    const newKeywords = [...form.keywords]
    newKeywords[index] = value
    setForm({ ...form, keywords: newKeywords })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-[#1B5FA8] text-xl font-semibold">Loading RANKIVO...</div>
    </div>
  )

  const config = PLATFORM_CONFIG[form.platform]
  const platforms = ['Instagram', 'TikTok', 'LinkedIn', 'Blog', 'Email', 'Ads']
  const tones = ['Professional', 'Casual', 'Persuasive', 'Informative']
  const ctas = ['None', 'Buy Now', 'Contact Us', 'Sign Up', 'Learn More', 'Visit Us', 'Book Now']
  const languages = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Urdu']
  const isAdmin = user?.email === ADMIN_EMAIL

  return (
   <div className="flex min-h-screen bg-gray-50 text-gray-800" style={{ backgroundColor: '#f9fafb' }}>

      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <p className="text-gray-600 text-sm">RANKIVO uses cookies to provide your free content generation. Cookies must be enabled to use our service.</p>
          <div className="flex gap-3">
            <button onClick={acceptCookies} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">Accept and Continue</button>
            <button onClick={() => router.push('/')} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm whitespace-nowrap">Decline</button>
          </div>
        </div>
      )}

      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        profile={profile}
        isAdmin={isAdmin}
      />

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="max-w-3xl">
            {/* Welcome */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h2>
            <p className="text-gray-500 mb-6">Here's your RANKIVO overview.</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

              {/* Posts Used with progress bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Posts Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.posts_count || 0}
                  <span className="text-gray-400 text-lg font-normal"> / 3</span>
                </p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(((profile?.posts_count || 0) / 3) * 100, 100)}%`,
                      backgroundColor: (profile?.posts_count || 0) >= 3 ? '#C9943A' : '#0D9488'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {3 - (profile?.posts_count || 0)} remaining this month
                </p>
              </div>

              {/* Plan */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-[#0D9488]">{(profile?.plan || 'free').toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-3">
                  {profile?.plan === 'free' ? 'Free tier — 3 posts/month' : 'Full access'}
                </p>
              </div>

              {/* Status */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-2xl font-bold text-[#C9943A]">
                  {profile?.plan === 'free' ? 'Limited' : 'Unlimited'}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  {profile?.plan === 'free' ? 'Upgrade for unlimited posts' : 'No restrictions'}
                </p>
              </div>
            </div>

            {/* Quick Generate */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-1">Quick Generate</h3>
              <p className="text-sm text-gray-400 mb-4">Jump straight into creating content.</p>
              <button
                onClick={() => setActiveTab('generate')}
                className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Generate New Content
              </button>
            </div>

            {/* Recent Posts */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Recent Posts</h3>
                <button onClick={() => setActiveTab('history')} className="text-xs text-[#0D9488] hover:underline">
                  View all
                </button>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">Your recent posts will appear here.</p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="mt-3 text-sm text-[#0D9488] hover:underline"
                >
                  Generate your first post →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GENERATE TAB */}
        {activeTab === 'generate' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Generate Content</h2>
            <p className="text-gray-500 mb-6">Fill in the details below and let AI create your perfect content.</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Posts Used</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.posts_count || 0} <span className="text-gray-400 text-lg font-normal">/ 3</span></p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Plan</p>
                <p className="text-2xl font-bold text-[#0D9488]">{(profile?.plan || 'free').toUpperCase()}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-2xl font-bold text-[#C9943A]">{profile?.plan === 'free' ? 'Limited' : 'Unlimited'}</p>
              </div>
            </div>

            <div className="space-y-6">

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button key={p} onClick={() => selectPlatform(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.platform === p ? 'bg-[#1B5FA8] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1B5FA8] hover:text-[#1B5FA8]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Best coffee shop in New York"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]" />
              </div>

              {/* Content Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Content Length</label>
                <div className="flex gap-3">
                  {['Short', 'Medium', 'Long'].map(l => {
                    const available = config.lengths.includes(l)
                    const info = LENGTH_INFO[l]
                    return (
                      <button key={l} onClick={() => available && setForm({ ...form, length: l })}
                        disabled={!available}
                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors border ${form.length === l ? 'bg-[#0D9488] text-white border-[#0D9488]' : available ? 'bg-white border-gray-200 text-gray-600 hover:border-[#0D9488]' : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                        <span className="block font-semibold">{info.label}</span>
                        <span className="block text-xs mt-1 opacity-80">{info.words}</span>
                        {!available && <span className="block text-xs mt-1 opacity-60">Not for {form.platform}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords <span className="text-gray-400 text-xs ml-1">({getKeywordLimit()} available for {form.length} posts)</span>
                </label>
                <div className="flex gap-3">
                  {[0, 1, 2].map(i => (
                    <input key={i} type="text" value={form.keywords[i]}
                      onChange={e => updateKeyword(i, e.target.value)}
                      disabled={i >= getKeywordLimit()}
                      placeholder={i >= getKeywordLimit() ? 'Upgrade length' : `Keyword ${i + 1}`}
                      className={`flex-1 bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488] ${i >= getKeywordLimit() ? 'border-gray-100 opacity-40 cursor-not-allowed bg-gray-50' : 'border-gray-200'}`} />
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tone of Voice</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map(t => (
                    <button key={t} onClick={() => setForm({ ...form, tone: t })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${form.tone === t ? 'bg-[#C9943A] text-white border-[#C9943A]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#C9943A] hover:text-[#C9943A]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <input type="text" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                  placeholder="e.g. small business owners, fitness enthusiasts, students"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]" />
              </div>

              {/* CTA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Call to Action</label>
                <div className="flex flex-wrap gap-2">
                  {ctas.map(c => (
                    <button key={c} onClick={() => setForm({ ...form, cta: c })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${form.cta === c ? 'bg-[#C9943A] text-white border-[#C9943A]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#C9943A] hover:text-[#C9943A]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => (
                    <button key={l} onClick={() => setForm({ ...form, language: l })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${form.language === l ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1B5FA8] hover:text-[#1B5FA8]'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Generate Button */}
            <button onClick={generateContent} disabled={generating}
              className="w-full mt-6 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
              {generating ? 'Generating your content...' : 'Generate Content'}
            </button>

            {/* Result */}
            {result && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-[#0D9488]">Generated Content</h3>

                {config.meta && result.metaTitle && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-[#C9943A] mb-1 font-medium uppercase tracking-wide">Meta Title</p>
                    <p className="text-gray-800">{result.metaTitle}</p>
                  </div>
                )}

                {config.meta && result.metaDescription && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-[#C9943A] mb-1 font-medium uppercase tracking-wide">Meta Description</p>
                    <p className="text-gray-800">{result.metaDescription}</p>
                  </div>
                )}

                {config.meta && result.titles && result.titles.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-[#C9943A] mb-2 font-medium uppercase tracking-wide">H1 Title Options</p>
                    <div className="space-y-2">
                      {result.titles.map((title, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[#0D9488] text-xs font-bold">#{i + 1}</span>
                          <p className="text-gray-800">{title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-[#C9943A] mb-2 font-medium uppercase tracking-wide">Your Content</p>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{result.content}</p>
                </div>

                <button onClick={() => navigator.clipboard.writeText(result.content)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-[#0D9488] py-3 rounded-lg font-medium border border-gray-200 transition-colors">
                  Copy Content
                </button>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Content History</h2>
            <p className="text-gray-500">Your previously generated content will appear here.</p>
            <div className="mt-8 bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
              <p className="text-gray-400">No content generated yet.</p>
              <button onClick={() => setActiveTab('generate')} className="mt-4 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-2 rounded-lg text-sm font-semibold">Generate Your First Post</button>
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">SEO Tools</h2>
            <p className="text-gray-500">Powerful SEO tools coming very soon.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Keyword Research', 'SEO Score Checker', 'Meta Tag Generator', 'Link Analyzer'].map(tool => (
                <div key={tool} className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm opacity-70">
                  <p className="text-gray-700 font-medium">{tool}</p>
                  <span className="text-xs bg-[#C9943A]/10 text-[#C9943A] px-2 py-1 rounded mt-2 inline-block border border-[#C9943A]/20">Coming Soon</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HIRE TAB */}
        {activeTab === 'hire' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Hire a Writer</h2>
            <p className="text-gray-500">Connect with professional human writers.</p>
            <div className="mt-8 bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
              <p className="text-gray-400">Human writer marketplace coming soon.</p>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Settings</h2>
            <p className="text-gray-500">Manage your account settings.</p>
            <div className="mt-8 bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
              <p className="text-gray-400">Account settings coming soon.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
