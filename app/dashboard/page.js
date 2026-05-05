'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

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

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const cookie = localStorage.getItem('rankivo_cookie_accepted')
    if (!cookie) {
      setShowCookieBanner(true)
    } else {
      setCookieAccepted(true)
    }
    getUser()
  }, [])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)
    }
    setLoading(false)
  }

  function acceptCookies() {
    localStorage.setItem('rankivo_cookie_accepted', 'true')
    setCookieAccepted(true)
    setShowCookieBanner(false)
  }

  function getKeywordLimit() {
    if (form.length === 'Short') return 1
    if (form.length === 'Medium') return 2
    return 3
  }

  function getWordCount() {
    if (form.length === 'Short') return 150
    if (form.length === 'Medium') return 500
    return 1500
  }

  async function checkPostLimit() {
    if (user && profile) {
      const now = new Date()
      if (new Date(profile.reset_date) < now) {
        await supabase.from('profiles').update({
          posts_count: 0,
          long_posts_count: 0,
          reset_date: new Date(now.setMonth(now.getMonth() + 1))
        }).eq('id', user.id)
        return true
      }
      if (profile.plan === 'free' && profile.posts_count >= 3) return false
      return true
    } else {
      const guestPosts = parseInt(localStorage.getItem('rankivo_guest_posts') || '0')
      if (guestPosts >= 1) return false
      return true
    }
  }

  async function incrementPostCount() {
    if (user && profile) {
      await supabase.from('profiles').update({
        posts_count: (profile.posts_count || 0) + 1
      }).eq('id', user.id)
      setProfile({ ...profile, posts_count: (profile.posts_count || 0) + 1 })
    } else {
      localStorage.setItem('rankivo_guest_posts', '1')
    }
  }

  async function generateContent() {
    if (!cookieAccepted) {
      setShowCookieBanner(true)
      return
    }
    if (!form.topic.trim()) {
      alert('Please enter a topic!')
      return
    }
    const allowed = await checkPostLimit()
    if (!allowed) {
      if (user) {
        alert('You have used all 3 free posts this month. Please upgrade to continue!')
      } else {
        alert('You have used your 1 free guest post. Create a free account for 3 posts/month!')
        router.push('/auth')
      }
      return
    }
    setGenerating(true)
    setResult(null)
    try {
      const activeKeywords = form.keywords.slice(0, getKeywordLimit()).filter(k => k.trim())
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          keywords: activeKeywords,
          wordCount: getWordCount(),
        }),
      })
      const data = await response.json()
      if (data.content) {
        setResult(data.content)
        await incrementPostCount()
      }
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
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-teal-400 text-xl animate-pulse">Loading RANKIVO...</div>
    </div>
  )

  const platforms = ['Instagram', 'TikTok', 'LinkedIn', 'Blog', 'Email', 'Ads']
  const tones = ['Professional', 'Casual', 'Persuasive', 'Informative']
  const ctas = ['None', 'Buy Now', 'Contact Us', 'Sign Up', 'Learn More', 'Visit Us', 'Book Now']
  const lengths = ['Short', 'Medium', 'Long']
  const languages = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Urdu']

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-teal-800 p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-300 text-sm">
            🍪 RANKIVO uses cookies to provide your free content generation. Cookies must be enabled to use our service.
          </p>
          <div className="flex gap-3">
            <button onClick={acceptCookies} className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              Accept & Continue
            </button>
            <button onClick={() => router.push('/')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen fixed left-0 top-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-teal-400">RANKIVO</h1>
          <p className="text-gray-500 text-xs mt-1">AI Content & SEO Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('generate')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'generate' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400 hover:bg-gray-800'}`}>
            ✨ Generate Content
          </button>
          <button onClick={() => setActiveTab('history')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'history' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400 hover:bg-gray-800'}`}>
            📝 Content History
          </button>
          <button onClick={() => setActiveTab('seo')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'seo' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400 hover:bg-gray-800'}`}>
            🔍 SEO Tools
          </button>
          <button onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400 hover:bg-gray-800'}`}>
            ⚙️ Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          {user ? (
            <div>
              <div className="bg-gray-800 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-sm text-white truncate">{user.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded">
                    {profile?.plan?.toUpperCase() || 'FREE'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {profile?.plan === 'free' ? `${profile?.posts_count || 0}/3 posts` : 'Unlimited'}
                  </span>
                </div>
              </div>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-gray-400 hover:text-red-400 text-sm transition-colors">
                🚪 Logout
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-400 mb-2">Guest User</p>
              <button onClick={() => router.push('/auth')} className="w-full bg-teal-500 hover:bg-teal-400 text-white py-2 rounded-lg text-sm font-semibold">
                Sign Up Free
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">

        {activeTab === 'generate' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-1">Generate Content</h2>
            <p className="text-gray-400 mb-8">Fill in the details below and let AI create your perfect content.</p>

            <div className="space-y-6">

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button key={p} onClick={() => setForm({ ...form, platform: p })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.platform === p ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Topic *</label>
                <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Best coffee shop in New York"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500" />
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Content Length</label>
                <div className="flex gap-3">
                  {lengths.map(l => (
                    <button key={l} onClick={() => setForm({ ...form, length: l })}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${form.length === l ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {l === 'Short' ? '📝 Short (~150w)' : l === 'Medium' ? '📄 Medium (~500w)' : '📰 Long (~1500w)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Keywords
                  <span className="text-gray-500 text-xs ml-2">({getKeywordLimit()} keyword{getKeywordLimit() > 1 ? 's' : ''} available for {form.length} posts)</span>
                </label>
                <div className="flex gap-3">
                  {[0, 1, 2].map(i => (
                    <input key={i} type="text" value={form.keywords[i]}
                      onChange={e => updateKeyword(i, e.target.value)}
                      disabled={i >= getKeywordLimit()}
                      placeholder={i >= getKeywordLimit() ? '🔒 Upgrade length' : `Keyword ${i + 1}`}
                      className={`flex-1 bg-gray-800 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 ${i >= getKeywordLimit() ? 'border-gray-700 opacity-40 cursor-not-allowed' : 'border-gray-700'}`} />
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Tone of Voice</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map(t => (
                    <button key={t} onClick={() => setForm({ ...form, tone: t })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.tone === t ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                <input type="text" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                  placeholder="e.g. small business owners, fitness enthusiasts, students"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500" />
              </div>

              {/* CTA */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Call to Action</label>
                <div className="flex flex-wrap gap-2">
                  {ctas.map(c => (
                    <button key={c} onClick={() => setForm({ ...form, cta: c })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.cta === c ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Language</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => (
                    <button key={l} onClick={() => setForm({ ...form, language: l })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.language === l ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button onClick={generateContent} disabled={generating}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25">
                {generating ? '⏳ Generating...' : '✨ Generate Content'}
              </button>

            </div>

            {/* Result */}
            {result && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-teal-400">✅ Generated Content</h3>

                {result.metaTitle && (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1 font-medium">🏷️ META TITLE</p>
                    <p className="text-white">{result.metaTitle}</p>
                  </div>
                )}

                {result.metaDescription && (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1 font-medium">📄 META DESCRIPTION</p>
                    <p className="text-white">{result.metaDescription}</p>
                  </div>
                )}

                {result.titles && (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-2 font-medium">📰 H1 TITLE OPTIONS</p>
                    <div className="space-y-2">
                      {result.titles.map((title, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-teal-400 text-xs">#{i + 1}</span>
                          <p className="text-white">{title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2 font-medium">✨ YOUR CONTENT</p>
                  <p className="text-white whitespace-pre-wrap leading-relaxed">{result.content}</p>
                </div>

                <button onClick={() => navigator.clipboard.writeText(result.content)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-teal-400 py-3 rounded-lg font-medium border border-gray-700 transition-colors">
                  📋 Copy Content
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Content History</h2>
            <p className="text-gray-400">Your previously generated content will appear here.</p>
            <div className="mt-8 bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-gray-400">No content generated yet.</p>
              <button onClick={() => setActiveTab('generate')} className="mt-4 bg-teal-500 hover:bg-teal-400 text-white px-6 py-2 rounded-lg text-sm font-semibold">
                Generate Your First Post
              </button>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">SEO Tools</h2>
            <p className="text-gray-400">Powerful SEO tools coming very soon.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {['🔑 Keyword Research', '📊 SEO Score Checker', '🏷️ Meta Tag Generator', '🔗 Link Analyzer'].map(tool => (
                <div key={tool} className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center opacity-60">
                  <p className="text-2xl mb-2">{tool.split(' ')[0]}</p>
                  <p className="text-gray-300 font-medium">{tool.split(' ').slice(1).join(' ')}</p>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded mt-2 inline-block">Coming Soon</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
            <p className="text-gray-400">Manage your account settings.</p>
            <div className="mt-8 bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
              <p className="text-4xl mb-3">⚙️</p>
              <p className="text-gray-400">Account settings coming soon.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}