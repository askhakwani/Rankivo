'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
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
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  // Settings state
  const [settingsTab, setSettingsTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ full_name: '', country: '', city: '', state: '', zip: '', phone: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ text: '', ok: true })
  const [passwordForm, setPasswordForm] = useState({ newPass: '', confirm: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ text: '', ok: true })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

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
    }
  }, [])

  useEffect(() => {
    async function loadUser(currentUser) {
      setUser(currentUser)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single()
      setProfile(profileData)
      if (profileData) {
        setProfileForm({
          full_name: profileData.full_name || '',
          country: profileData.country || '',
          city: profileData.city || '',
          state: profileData.state || '',
          zip: profileData.zip || '',
          phone: profileData.phone || '',
        })
      }
      const { data: hist } = await supabase
        .from('content_history').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false })
      setHistory(hist || [])
      setHistoryLoading(false)
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
        setHistoryLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (activeTab === 'logout') {
      supabase.auth.signOut().then(() => { window.location.href = '/auth' })
    }
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

  function selectPlatform(p) {
    setForm({ ...form, platform: p, length: PLATFORM_CONFIG[p].lengths[0] })
    setResult(null)
  }

  function getKeywordLimit() {
    return form.length === 'Short' ? 1 : form.length === 'Medium' ? 2 : 3
  }

  async function checkPostLimit() {
    if (user) {
      const { data: fp } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (fp) setProfile(fp)
      if (fp?.plan && fp.plan !== 'free') return true
      const now = new Date()
      if (fp?.reset_date && new Date(fp.reset_date) < now) {
        await supabase.from('profiles').update({ posts_count: 0, reset_date: new Date(now.setMonth(now.getMonth() + 1)) }).eq('id', user.id)
        return true
      }
      return (fp?.posts_count || 0) < 3
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
    if (!form.topic.trim()) { alert('Please enter a topic!'); return }
    const allowed = await checkPostLimit()
    if (!allowed) {
      if (user) alert('You have used all 3 free posts this month. Please upgrade to continue!')
      else { alert('Create a free account for 3 posts/month!'); router.push('/auth') }
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
      } else alert('Generation failed. Please try again.')
    } catch { alert('Generation failed. Please try again.') }
    setGenerating(false)
  }

  // ── Settings handlers ──
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
    if (passwordForm.newPass.length < 6) { setPasswordMsg({ text: 'Password must be at least 6 characters.', ok: false }); return }
    if (passwordForm.newPass !== passwordForm.confirm) { setPasswordMsg({ text: 'Passwords do not match.', ok: false }); return }
    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass })
    if (error) setPasswordMsg({ text: 'Error: ' + error.message, ok: false })
    else { setPasswordMsg({ text: 'Password updated!', ok: true }); setPasswordForm({ newPass: '', confirm: '' }) }
    setPasswordSaving(false)
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'DELETE') { alert('Type DELETE to confirm.'); return }
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
  const platforms = ['Instagram', 'TikTok', 'LinkedIn', 'Blog', 'Email', 'Ads']
  const tones = ['Professional', 'Casual', 'Persuasive', 'Informative']
  const ctas = ['None', 'Buy Now', 'Contact Us', 'Sign Up', 'Learn More', 'Visit Us', 'Book Now']
  const languages = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Urdu']
  const countries = ['Pakistan','United States','United Kingdom','United Arab Emirates','Saudi Arabia','India','Canada','Australia','Germany','France','Other']

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">

      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <p className="text-gray-600 text-sm">RANKIVO uses cookies to provide your free content generation.</p>
          <div className="flex gap-3">
            <button onClick={acceptCookies} className="bg-[#0D9488] text-white px-6 py-2 rounded-lg text-sm font-semibold">Accept and Continue</button>
            <button onClick={() => router.push('/')} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">Decline</button>
          </div>
        </div>
      )}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} profile={profile} isAdmin={isAdmin} />

      <div className="ml-64 flex-1 p-8">

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h2>
            <p className="text-gray-500 mb-6">Here's your RANKIVO overview.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Posts Used</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.posts_count || 0}<span className="text-gray-400 text-lg font-normal"> / 3</span></p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(((profile?.posts_count || 0) / 3) * 100, 100)}%`, backgroundColor: (profile?.posts_count || 0) >= 3 ? '#C9943A' : '#0D9488' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{3 - (profile?.posts_count || 0)} remaining</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-[#0D9488]">{(profile?.plan || 'free').toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-3">{profile?.plan === 'free' ? 'Free tier — 3 posts/month' : 'Full access'}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-2xl font-bold text-[#C9943A]">{profile?.plan === 'free' ? 'Limited' : 'Unlimited'}</p>
                <p className="text-xs text-gray-400 mt-3">{profile?.plan === 'free' ? 'Upgrade for unlimited posts' : 'No restrictions'}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-1">Quick Generate</h3>
              <p className="text-sm text-gray-400 mb-4">Jump straight into creating content.</p>
              <button onClick={() => setActiveTab('generate')} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold">Generate New Content</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Recent Posts</h3>
                <button onClick={() => setActiveTab('history')} className="text-xs text-[#0D9488] hover:underline">View all</button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No content generated yet.</p>
                  <button onClick={() => setActiveTab('generate')} className="mt-3 text-[#0D9488] text-sm hover:underline">Generate your first post →</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#1B5FA8]/10 text-[#1B5FA8] px-2 py-0.5 rounded border border-[#1B5FA8]/20 font-medium">{item.platform}</span>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{item.content?.slice(0, 60)}...</p>
                      </div>
                      <span className="text-xs text-gray-400 ml-2 shrink-0">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GENERATE ── */}
        {activeTab === 'generate' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Generate Content</h2>
            <p className="text-gray-500 mb-6">Fill in the details below and let AI create your content.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button key={p} onClick={() => selectPlatform(p)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.platform === p ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1B5FA8]'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Best coffee shop in New York" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Content Length</label>
                <div className="flex gap-3">
                  {['Short', 'Medium', 'Long'].map(l => {
                    const available = config.lengths.includes(l)
                    const info = LENGTH_INFO[l]
                    return (
                      <button key={l} onClick={() => available && setForm({ ...form, length: l })} disabled={!available} className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${form.length === l ? 'bg-[#0D9488] text-white border-[#0D9488]' : available ? 'bg-white border-gray-200 text-gray-600 hover:border-[#0D9488]' : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                        <span className="block font-semibold">{info.label}</span>
                        <span className="block text-xs mt-1 opacity-80">{info.words}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Keywords <span className="text-gray-400 text-xs">({getKeywordLimit()} max)</span></label>
                <div className="flex gap-3">
                  {[0, 1, 2].map(i => (
                    <input key={i} type="text" value={form.keywords[i]} onChange={e => { const k = [...form.keywords]; k[i] = e.target.value; setForm({ ...form, keywords: k }) }} disabled={i >= getKeywordLimit()} placeholder={i >= getKeywordLimit() ? 'Upgrade length' : `Keyword ${i + 1}`} className={`flex-1 bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9488] ${i >= getKeywordLimit() ? 'border-gray-100 opacity-40 cursor-not-allowed bg-gray-50' : 'border-gray-200'}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map(t => <button key={t} onClick={() => setForm({ ...form, tone: t })} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.tone === t ? 'bg-[#C9943A] text-white border-[#C9943A]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#C9943A]'}`}>{t}</button>)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <input type="text" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} placeholder="e.g. small business owners" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">CTA</label>
                <div className="flex flex-wrap gap-2">
                  {ctas.map(c => <button key={c} onClick={() => setForm({ ...form, cta: c })} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.cta === c ? 'bg-[#C9943A] text-white border-[#C9943A]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#C9943A]'}`}>{c}</button>)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => <button key={l} onClick={() => setForm({ ...form, language: l })} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.language === l ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1B5FA8]'}`}>{l}</button>)}
                </div>
              </div>
            </div>
            <button onClick={generateContent} disabled={generating} className="w-full mt-6 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Content'}
            </button>
            {result && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-[#0D9488]">Generated Content</h3>
                {config.meta && result.metaTitle && <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-[#C9943A] mb-1 font-medium uppercase">Meta Title</p><p className="text-gray-800">{result.metaTitle}</p></div>}
                {config.meta && result.metaDescription && <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-[#C9943A] mb-1 font-medium uppercase">Meta Description</p><p className="text-gray-800">{result.metaDescription}</p></div>}
                {config.meta && result.titles?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-[#C9943A] mb-2 font-medium uppercase">H1 Options</p>
                    {result.titles.map((t, i) => <p key={i} className="text-gray-800"><span className="text-[#0D9488] font-bold text-xs mr-2">#{i+1}</span>{t}</p>)}
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

        {/* ── HISTORY ── */}
        {activeTab === 'history' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Content History</h2>
            <p className="text-gray-500 mb-6">All your previously generated content.</p>
            {historyLoading ? <div className="text-center py-16 text-[#1B5FA8]">Loading...</div> : history.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <p className="text-gray-400">No content yet.</p>
                <button onClick={() => setActiveTab('generate')} className="mt-4 bg-[#0D9488] text-white px-6 py-2 rounded-lg text-sm font-semibold">Generate Your First Post</button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div className="flex items-center gap-3">
                        <span className="bg-[#1B5FA8]/10 text-[#1B5FA8] text-xs font-semibold px-2.5 py-1 rounded border border-[#1B5FA8]/20">{item.platform}</span>
                        <span className="bg-[#0D9488]/10 text-[#0D9488] text-xs px-2.5 py-1 rounded border border-[#0D9488]/20">{item.content_length}</span>
                        {item.tone && <span className="text-xs text-gray-400">{item.tone}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-gray-400">{expandedId === item.id ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expandedId === item.id && (
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                        {item.meta_title && <div><p className="text-xs text-[#C9943A] font-medium uppercase mb-1">Meta Title</p><p className="text-sm text-gray-700">{item.meta_title}</p></div>}
                        {item.meta_description && <div><p className="text-xs text-[#C9943A] font-medium uppercase mb-1">Meta Description</p><p className="text-sm text-gray-700">{item.meta_description}</p></div>}
                        <div><p className="text-xs text-[#C9943A] font-medium uppercase mb-1">Content</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p></div>
                        {item.keywords?.length > 0 && <div><p className="text-xs text-gray-400 uppercase mb-1">Keywords</p><div className="flex flex-wrap gap-1">{item.keywords.map((k, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{k}</span>)}</div></div>}
                        {item.hashtags?.length > 0 && <div><p className="text-xs text-gray-400 uppercase mb-1">Hashtags</p><p className="text-xs text-[#0D9488]">{item.hashtags.join(' ')}</p></div>}
                        <button onClick={() => navigator.clipboard.writeText(item.content)} className="w-full mt-2 bg-gray-50 hover:bg-gray-100 text-[#0D9488] py-2.5 rounded-lg text-sm font-medium border border-gray-200">Copy</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SEO ── */}
        {activeTab === 'seo' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">SEO Tools</h2>
            <p className="text-gray-500 mb-8">Powerful SEO tools coming soon.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Keyword Research', 'SEO Score Checker', 'Meta Tag Generator', 'Link Analyzer'].map(tool => (
                <div key={tool} className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm opacity-70">
                  <p className="text-gray-700 font-medium">{tool}</p>
                  <span className="text-xs bg-[#C9943A]/10 text-[#C9943A] px-2 py-1 rounded mt-2 inline-block border border-[#C9943A]/20">Coming Soon</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HIRE ── */}
        {activeTab === 'hire' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Hire a Writer</h2>
            <p className="text-gray-500">Human writer marketplace coming soon.</p>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Account Settings</h2>
            <p className="text-gray-500 mb-6">Manage your profile, password, and account.</p>

            <div className="flex gap-2 mb-6">
              {[
                { id: 'profile', label: 'Edit Profile' },
                { id: 'password', label: 'Change Password' },
                { id: 'danger', label: 'Danger Zone' },
              ].map(t => (
                <button key={t.id} onClick={() => setSettingsTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${settingsTab === t.id ? (t.id === 'danger' ? 'bg-red-500 text-white border-red-500' : 'bg-[#1B5FA8] text-white border-[#1B5FA8]') : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Profile */}
            {settingsTab === 'profile' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select value={profileForm.country} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]">
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input type="text" value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input type="text" value={profileForm.zip} onChange={e => setProfileForm({ ...profileForm, zip: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                  </div>
                </div>
                {profileMsg.text && <p className={`text-sm font-medium ${profileMsg.ok ? 'text-[#0D9488]' : 'text-red-500'}`}>{profileMsg.text}</p>}
                <button onClick={saveProfile} disabled={profileSaving} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Password */}
            {settingsTab === 'password' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <p className="text-sm text-gray-500">You are already logged in so no current password is needed.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" value={passwordForm.newPass} onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                </div>
                {passwordMsg.text && <p className={`text-sm font-medium ${passwordMsg.ok ? 'text-[#0D9488]' : 'text-red-500'}`}>{passwordMsg.text}</p>}
                <button onClick={changePassword} disabled={passwordSaving} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}

            {/* Danger Zone */}
            {settingsTab === 'danger' && (
              <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <h3 className="text-red-500 font-semibold">Delete Account</h3>
                </div>
                <p className="text-sm text-gray-500">This will permanently delete your account, profile, and all content history. This cannot be undone.</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">What will be deleted:</p>
                  <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                    <li>Your profile and personal information</li>
                    <li>All generated content history</li>
                    <li>Your account and login credentials</li>
                  </ul>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="font-bold text-red-500">DELETE</span> to confirm</label>
                  <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" className="w-full border border-red-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-red-400" />
                </div>
                <button onClick={deleteAccount} disabled={deleting || deleteConfirm !== 'DELETE'} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors">
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
