'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

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
  const [activeTab, setActiveTab] = useState('generate')

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
    const cookie = localStorage.getItem('rankivo_cookie_accepted')
    if (!cookie) setShowCookieBanner(true)
    else setCookieAccepted(true)
    getUser()
  }, [])

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
    if (user && profile) {
      if (profile.plan && profile.plan !== 'free') return true
      const now = new Date()
      if (new Date(profile.reset_date) < now) {
        await supabase.from('profiles').update({
          posts_count: 0,
          long_posts_count: 0,
          reset_date: new Date(now.setMonth(now.getMonth() + 1))
        }).eq('id', user.id)
        return true
      }
      if (profile.posts_count >= 3) return false
      return true
    } else {
      const guestPosts = parseInt(localStorage.getItem('rankivo_guest_posts') || '0')
      return guestPosts < 1
    }
  }

  async function incrementPostCount() {
    if (user && profile) {
      await supabase.from('profiles').update({ posts_count: (profile.posts_count || 0) + 1 }).eq('id', user.id)
      setProfile({ ...profile, posts_count: (profile.posts_count || 0) + 1 })
    } else {
      localStorage.setItem('rankivo_guest_posts', '1')
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
      if (data.content) { setResult(data.content); await incrementPostCount() }
      else alert('Generation failed. Please try again.')
    } catch (error) {
      alert('Generation failed. Please try again.')
    }
    setGenerating(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  function updateKeyword(index, value) {
    const newKeywords = [...form.keywords]
    newKeywords[index] = value
    setForm({ ...form, keywords: newKeywords })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-blue-950">
      <div className="text-yellow-400 text-xl">Loading RANKIVO...</div>
    </div>
  )

  const config = PLATFORM_CONFIG[form.platform]
  const platforms = ['Instagram', 'TikTok', 'LinkedIn', 'Blog', 'Email', 'Ads']
  const tones = ['Professional', 'Casual', 'Persuasive', 'Informative']
  const ctas = ['None', 'Buy Now', 'Contact Us', 'Sign Up', 'Learn More', 'Visit Us', 'Book Now']
  const languages = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Urdu']
  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <div className="flex min-h-screen bg-blue-950 text-white">

      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-900 border-t border-teal-600 p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-blue-100 text-sm">RANKIVO uses cookies to provide your free content generation. Cookies must be enabled to use our service.</p>
          <div className="flex gap-3">
            <button onClick={acceptCookies} className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">Accept and Continue</button>
            <button onClick={() => router.push('/')} className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">Decline</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-blue-900 border-r border-blue-800 flex flex-col min-h-screen fixed left-0 top-0">
        <div className="p-6 border-b border-blue-800">
          <a href="/" className="text-2xl font-bold text-yellow-400">RANKIVO</a>
          <p className="text-blue-300 text-xs mt-1">AI Content and SEO Platform</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'generate', label: 'Generate Content' },
            { id: 'history', label: 'Content History' },
            { id: 'seo', label: 'SEO Tools' },
            { id: 'settings', label: 'Settings' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-blue-300 hover:bg-blue-800'}`}>
              {item.label}
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => router.push('/admin')}
              className="w-full text-left px-4 py-3 rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition-colors border border-yellow-500/20">
              Admin Panel
            </button>
          )}
        </nav>
        <div className="p-4 border-t border-blue-800">
          {user ? (
            <div>
              <div className="bg-blue-800 rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-300">Logged in as</p>
                <p className="text-sm text-white truncate">{user.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded border border-teal-500/30">{(profile?.plan || 'free').toUpperCase()}</span>
                  <span className="text-xs text-blue-300">{!profile?.plan || profile?.plan === 'free' ? `${profile?.posts_count || 0}/3 posts` : 'Unlimited'}</span>
                </div>
              </div>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-blue-300 hover:text-red-400 text-sm transition-colors">Logout</button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-blue-300 mb-2">Guest User</p>
              <button onClick={() => router.push('/auth')} className="w-full bg-teal-500 hover:bg-teal-400 text-white py-2 rounded-lg text-sm font-semibold">Sign Up Free</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {activeTab === 'generate' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-1">Generate Content</h2>
            <p className="text-blue-300 mb-8">Fill in the details below and let AI create your perfect content.</p>
            <div className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button key={p} onClick={() => selectPlatform(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.platform === p ? 'bg-teal-500 text-white' : 'bg-blue-800 text-blue-300 hover:bg-blue-700'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Topic</label>
                <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Best coffee shop in New York"
                  className="w-full bg-blue-800 border border-blue-700 rounded-lg px-4 py-3 text-white placeholder-blue-400 focus:outline-none focus:border-teal-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">Content Length</label>
                <div className="flex gap-3">
                  {['Short', 'Medium', 'Long'].map(l => {
                    const available = config.lengths.includes(l)
                    const info = LENGTH_INFO[l]
                    return (
                      <button key={l} onClick={() => available && setForm({ ...form, length: l })}
                        disabled={!available}
                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${form.length === l ? 'bg-teal-500 text-white' : available ? 'bg-blue-800 text-blue-300 hover:bg-blue-700' : 'bg-blue-900/40 text-blue-600 cursor-not-allowed'}`}>
                        <span className="block font-semibold">{info.label}</span>
                        <span className="block text-xs mt-1 opacity-80">{info.words}</span>
                        {!available && <span className="block text-xs mt-1 opacity-60">Not for {form.platform}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  SEO Keywords <span className="text-blue-400 text-xs ml-1">({getKeywordLimit()} available for {form.length} posts)</span>
                </label>
                <div className="flex gap-3">
                  {[0, 1, 2].map(i => (
                    <input key={i} type="text" value={form.keywords[i]}
                      onChange={e => updateKeyword(i, e.target.value)}
                      disabled={i >= getKeywordLimit()}
                      placeholder={i >= getKeywordLimit() ? 'Upgrade length' : `Keyword ${i + 1}`}
                      className={`flex-1 bg-blue-800 border rounded-lg px-3 py-2 text-sm text-white placeholder-blue-400 focus:outline-none focus:border-teal-500 ${i >= getKeywordLimit() ? 'border-blue-800 opacity-40 cursor-not-allowed' : 'border-blue-700'}`} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">Tone of Voice</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map(t => (
                    <button key={t} onClick={() => setForm({ ...form, tone: t })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.tone === t ? 'bg-yellow-500 text-blue-950' : 'bg-blue-800 text-blue-300 hover:bg-blue-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Target Audience</label>
                <input type="text" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                  placeholder="e.g. small business owners, fitness enthusiasts, students"
                  className="w-full bg-blue-800 border border-blue-700 rounded-lg px-4 py-3 text-white placeholder-blue-400 focus:outline-none focus:border-teal-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">Call to Action</label>
                <div className="flex flex-wrap gap-2">
                  {ctas.map(c => (
                    <button key={c} onClick={() => setForm({ ...form, cta: c })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.cta === c ? 'bg-yellow-500 text-blue-950' : 'bg-blue-800 text-blue-300 hover:bg-blue-700'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">Language</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => (
                    <button key={l} onClick={() => setForm({ ...form, language: l })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.language === l ? 'bg-teal-500 text-white' : 'bg-blue-800 text-blue-300 hover:bg-blue-700'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generateContent} disabled={generating}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20">
                {generating ? 'Generating your content...' : 'Generate Content'}
              </button>

            </div>

            {result && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-teal-400">Generated Content</h3>

                {config.meta && result.metaTitle && (
                  <div className="bg-blue-900 border border-blue-700 rounded-xl p-4">
                    <p className="text-xs text-yellow-400 mb-1 font-medium uppercase tracking-wide">Meta Title</p>
                    <p className="text-white">{result.metaTitle}</p>
                  </div>
                )}

                {config.meta && result.metaDescription && (
                  <div className="bg-blue-900 border border-blue-700 rounded-xl p-4">
                    <p className="text-xs text-yellow-400 mb-1 font-medium uppercase tracking-wide">Meta Description</p>
                    <p className="text-white">{result.metaDescription}</p>
                  </div>
                )}

                {config.meta && result.titles && result.titles.length > 0 && (
                  <div className="bg-blue-900 border border-blue-700 rounded-xl p-4">
                    <p className="text-xs text-yellow-400 mb-2 font-medium uppercase tracking-wide">H1 Title Options</p>
                    <div className="space-y-2">
                      {result.titles.map((title, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-teal-400 text-xs font-bold">#{i + 1}</span>
                          <p className="text-white">{title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-900 border border-blue-700 rounded-xl p-4">
                  <p className="text-xs text-yellow-400 mb-2 font-medium uppercase tracking-wide">Your Content</p>
                  <p className="text-white whitespace-pre-wrap leading-relaxed">{result.content}</p>
                </div>

                <button onClick={() => navigator.clipboard.writeText(result.content)}
                  className="w-full bg-blue-800 hover:bg-blue-700 text-teal-400 py-3 rounded-lg font-medium border border-blue-700 transition-colors">
                  Copy Content
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Content History</h2>
            <p className="text-blue-300">Your previously generated content will appear here.</p>
            <div className="mt-8 bg-blue-900 rounded-xl p-8 text-center border border-blue-800">
              <p className="text-blue-300">No content generated yet.</p>
              <button onClick={() => setActiveTab('generate')} className="mt-4 bg-teal-500 hover:bg-teal-400 text-white px-6 py-2 rounded-lg text-sm font-semibold">Generate Your First Post</button>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">SEO Tools</h2>
            <p className="text-blue-300">Powerful SEO tools coming very soon.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Keyword Research', 'SEO Score Checker', 'Meta Tag Generator', 'Link Analyzer'].map(tool => (
                <div key={tool} className="bg-blue-900 border border-blue-800 rounded-xl p-6 text-center opacity-70">
                  <p className="text-blue-200 font-medium">{tool}</p>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded mt-2 inline-block">Coming Soon</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
            <p className="text-blue-300">Manage your account settings.</p>
            <div className="mt-8 bg-blue-900 rounded-xl p-8 text-center border border-blue-800">
              <p className="text-blue-300">Account settings coming soon.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
