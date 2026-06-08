'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { createClient } from '../../lib/supabase'

const TONES = ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Conversational', 'Humorous']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Arabic', 'Urdu']
const CTA_STYLES = ['None', 'Learn More', 'Buy Now', 'Visit Site', 'Sign Up Free', 'Book a Call', 'Contact Us']
const LENGTHS = [
  { label: 'Short',  desc: 'Concise',  value: 'Short'  },
  { label: 'Medium', desc: 'Standard', value: 'Medium' },
  { label: 'Long',   desc: 'Detailed', value: 'Long'   },
]

// Teaser labels shown on blurred variation cards
const VARIATION_TEASERS = [
  '🔥 Stronger hook + higher engagement angle',
  '💡 Different tone — built to convert',
  '⚡ Urgency-driven copy + punchy CTA',
]

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const tags = value || []
  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim()) && tags.length < 3) onChange([...tags, input.trim()])
      setInput('')
    }
  }
  return (
    <div className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
      {tags.map(tag => (
        <span key={tag} className="bg-[#0D9488]/10 text-[#0D9488] text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          {tag}
          <button onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:text-red-400 font-bold">×</button>
        </span>
      ))}
      {tags.length < 3 && (
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={addTag}
          placeholder={tags.length === 0 ? placeholder : 'Add more…'}
          className="flex-1 min-w-[120px] text-sm outline-none text-gray-800 bg-transparent" />
      )}
    </div>
  )
}

// Renders formatted content for single-output platforms (Email, YouTube)
function FormattedContent({ text }) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        // Strip markdown bold/italic
        const clean = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
        if (clean.trim() === '') return <div key={i} className="h-2" />
        // Section headers (INTRO, OUTRO, HOOK etc)
        if (/^[A-Z][A-Z\s]+:?$/.test(clean.trim())) {
          return <p key={i} className="text-xs font-bold text-[#0D9488] uppercase tracking-wider mt-3">{clean.trim().replace(/:$/, '')}</p>
        }
        return <p key={i} className="text-sm text-gray-700 leading-relaxed">{clean}</p>
      })}
    </div>
  )
}

function VariationCard({ index, text, isBlurred, isGuest, onCopy, copied, onUnlock, total }) {
  return (
    <div className={`relative border rounded-2xl overflow-hidden transition-all ${isBlurred ? 'border-gray-100 bg-gray-50/50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Variation {index + 1}
          {isBlurred && <span className="ml-2 text-[#C9943A]">🔒 Locked</span>}
        </span>
        {!isBlurred && !isGuest && (
          <button onClick={() => onCopy(text, index)}
            className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
            {copied === index ? '✅ Copied' : '📋 Copy'}
          </button>
        )}
      </div>

      {/* Content — blurred for locked variations */}
      <div className={`px-4 py-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed ${isBlurred ? 'select-none' : ''}`}
        style={isBlurred ? { filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
        {text}
      </div>

      {/* Blur overlay */}
      {isBlurred && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm px-6 text-center">
          <p className="text-sm font-bold text-gray-800 mb-0.5">
            {VARIATION_TEASERS[(index - 1) % VARIATION_TEASERS.length]}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            🔒 Unlock {total - 1} more high-performing variations
          </p>
          <button onClick={onUnlock}
            className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-md mb-2">
            Unlock All (Free) →
          </button>
          <p className="text-xs text-gray-400">✅ Used by 1,000+ creators · ⚡ Takes 10 seconds</p>
        </div>
      )}
    </div>
  )
}

export default function PlatformGeneratorPage({ config }) {
  const router = useRouter()
  const supabase = createClient()
  const {
    platform, slug, title, subtitle, badge, icon, placeholder,
    showLength = false, faqs = [], tips = []
  } = config

  // Platforms that support length selection
  const hasLengthSelector = showLength || ['LinkedIn', 'Email', 'YouTube'].includes(platform)
  const isLongForm = platform === 'Email' || platform === 'YouTube'

  const [form, setForm] = useState({
    topic: '', keywords: [], tone: 'Professional',
    audience: '', cta: 'None', language: 'English', link: '', length: 'Medium',
  })
  const [variations,   setVariations]   = useState([])
  const [singleResult, setSingleResult] = useState('')
  const [isPreview,    setIsPreview]    = useState(false)
  const [isGuest,      setIsGuest]      = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [copied,       setCopied]       = useState(null)
  const [copiedSingle, setCopiedSingle] = useState(false)
  const [user,         setUser]         = useState(null)

  // Load current user once on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))
  }, [])

  function updateForm(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  // Save generated content to content_history for logged-in users
  async function saveToHistory(data) {
    if (!user) return
    try {
      const contentText = data.variations?.length
        ? data.variations.join('\n\n---\n\n')
        : (data.content?.content || '')
      await supabase.from('content_history').insert({
        user_id:        user.id,
        platform:       platform,
        content:        contentText,
        keywords:       form.keywords.filter(k => k.trim()),
        hashtags:       contentText?.match(/#\w+/g) || [],
        meta_title:     data.content?.metaTitle     || null,
        meta_description: data.content?.metaDescription || null,
        h1:             data.content?.titles?.[0]   || null,
        word_count:     contentText.trim().split(/\s+/).filter(Boolean).length,
        content_length: form.length,
        language:       form.language,
        tone:           form.tone,
        audience:       form.audience,
        cta:            form.cta,
      })
    } catch (e) {
      console.error('History save failed:', e)
    }
  }

  async function handleGenerate() {
    console.log('1. handleGenerate fired | topic:', form.topic, '| platform:', platform)
    if (!form.topic.trim()) {
      console.log('❌ BLOCKED — topic is empty, returning early')
      return
    }
    setLoading(true); setError(''); setVariations([]); setSingleResult(''); setIsPreview(false)
    try {
      console.log('2. Calling fetch /api/generate with:', { platform, ...form })
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, ...form }),
      })
      console.log('3. Response received | status:', res.status, '| ok:', res.ok)
      const data = await res.json()
      console.log('4. Response data:', data)
      if (data.error) { setError(data.error); return }

      setIsGuest(data.isGuest || false)
      setIsPreview(data.isPreview || false)

      if (data.variations?.length) {
        setVariations(data.variations)
      } else {
        setSingleResult(data.content?.content || '')
      }

      // Save history for logged-in users only (API already tracks usage count)
      if (!data.isGuest) {
        await saveToHistory(data)
      }
    } catch (err) {
      console.error('❌ CATCH error:', err)
      setError('Something went wrong. Please try again.')
    }
    finally { setLoading(false) }
  }

  function copyVariation(text, index) {
    navigator.clipboard.writeText(text)
    setCopied(index); setTimeout(() => setCopied(null), 2000)
  }

  function copySingle() {
    navigator.clipboard.writeText(singleResult)
    setCopiedSingle(true); setTimeout(() => setCopiedSingle(false), 2000)
  }

  function handleUnlock() {
    const restoreData = { variations, singleResult, form, platform }
    sessionStorage.setItem('rankivo_restore_' + (slug || platform), JSON.stringify(restoreData))
    router.push('/auth?mode=signup&redirect=tools/' + (slug || platform.toLowerCase()))
  }

  // Restore content after guest → signup redirect
  useEffect(() => {
    const key = 'rankivo_restore_' + (slug || platform)
    const saved = sessionStorage.getItem(key)
    if (!saved) return
    try {
      const data = JSON.parse(saved)
      // Only restore if we can confirm user session — wait for supabase.auth.getUser()
      supabase.auth.getSession().then(({ data: { session } }) => {
        const authData = { user: session?.user || null }
        const loggedIn = !!session?.user
        if (data.variations?.length) setVariations(data.variations)
        if (data.singleResult) setSingleResult(data.singleResult)
        if (data.form) setForm(data.form)
        // If they just signed up, they're logged in — clear guest state
        setIsGuest(!loggedIn)
        setIsPreview(false)
        sessionStorage.removeItem(key)
        // Save restored content to history if logged in
        if (loggedIn && authData.user) {
          const restoredUser = authData.user
          const contentText = data.variations?.length
            ? data.variations.join('\n\n---\n\n')
            : (data.singleResult || '')
          supabase.from('content_history').insert({
            user_id:        restoredUser.id,
            platform:       platform,
            content:        contentText,
            keywords:       data.form?.keywords?.filter(k => k.trim()) || [],
            hashtags:       contentText?.match(/#\w+/g) || [],
            word_count:     contentText.trim().split(/\s+/).filter(Boolean).length,
            content_length: data.form?.length || 'Medium',
            language:       data.form?.language || 'English',
            tone:           data.form?.tone || 'Professional',
            audience:       data.form?.audience || '',
            cta:            data.form?.cta || 'None',
          }).then(() => {}).catch(console.error)

          // Increment posts_count for the restored post
          supabase.from('profiles').select('posts_count, reset_date').eq('id', restoredUser.id).single()
            .then(({ data: prof }) => {
              if (!prof) return
              const now = new Date()
              const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
              const newCount = prof.reset_date === currentMonth ? (prof.posts_count || 0) + 1 : 1
              supabase.from('profiles').update({ posts_count: newCount, reset_date: currentMonth }).eq('id', restoredUser.id).then(() => {}).catch(console.error)
            }).catch(console.error)
        }
      })
    } catch (e) { /* ignore parse errors */ }
  }, [])

  const hasResult = variations.length > 0 || singleResult

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6">

          {/* Hero */}
          <div className="text-center mb-10">
            <span className="inline-block bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              {badge}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B5FA8] mb-3">{icon} {title}</h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">{subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Form ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 sticky top-24">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic <span className="text-red-400">*</span></label>
                  <textarea value={form.topic} onChange={e => updateForm('topic', e.target.value)}
                    placeholder={placeholder} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#0D9488]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Keywords <span className="text-gray-400 font-normal">(up to 3, optional)</span></label>
                  <TagInput value={form.keywords} onChange={v => updateForm('keywords', v)} placeholder="Type keyword, press Enter…" />
                </div>

                {/* Length selector — shown for LinkedIn, Email, YouTube */}
                {hasLengthSelector && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Length</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LENGTHS.map(l => (
                        <button key={l.value} onClick={() => updateForm('length', l.value)}
                          className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                            form.length === l.value
                              ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]'
                              : 'border-gray-200 text-gray-500 hover:border-[#0D9488]'
                          }`}>
                          <span className="block font-semibold">{l.label}</span>
                          <span className="opacity-70">{l.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
                  <select value={form.tone} onChange={e => updateForm('tone', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]">
                    {TONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={form.audience} onChange={e => updateForm('audience', e.target.value)}
                    placeholder="e.g. Entrepreneurs, students, marketers"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Style</label>
                  <select value={form.cta} onChange={e => updateForm('cta', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]">
                    {CTA_STYLES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    🔗 Your Link <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input value={form.link} onChange={e => updateForm('link', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]" />
                  <p className="text-xs text-gray-400 mt-1">Included naturally in the generated content</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                  <select value={form.language} onChange={e => updateForm('language', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]">
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                <button onClick={handleGenerate} disabled={loading || !form.topic.trim()}
                  className="w-full bg-[#1B5FA8] hover:bg-[#0D9488] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Generating…
                    </span>
                  ) : `${icon} Generate`}
                </button>

              </div>
            </div>

            {/* ── Output ── */}
            <div className="lg:col-span-3 space-y-4">
              {error && <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

              {loading && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2 border border-gray-100 rounded-xl p-4">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                  ))}
                  <p className="text-xs text-center text-gray-400">Generating variations…</p>
                </div>
              )}

              {/* ── Multi-variation output ── */}
              {!loading && variations.length > 0 && (
                <>
                  {/* Header banner */}
                  <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
                    isGuest
                      ? 'bg-[#1B5FA8]/5 border border-[#1B5FA8]/20'
                      : 'bg-[#0D9488]/5 border border-[#0D9488]/20'
                  }`}>
                    <span className="text-xl">✨</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {variations.length} High-Performing Variations Generated
                      </p>
                      {isGuest
                        ? <p className="text-xs text-gray-500">You're viewing 1 of {variations.length} — sign up free to unlock all</p>
                        : <p className="text-xs text-gray-500">All {variations.length} variations ready — copy and use any of them</p>
                      }
                    </div>
                  </div>

                  {variations.map((v, i) => (
                    <VariationCard
                      key={i}
                      index={i}
                      text={v}
                      isBlurred={isGuest && i > 0}
                      isGuest={isGuest}
                      onCopy={copyVariation}
                      copied={copied}
                      onUnlock={handleUnlock}
                      total={variations.length}
                    />
                  ))}

                  {/* Bottom CTA for guests */}
                  {isGuest && (
                    <div className="bg-white border border-[#1B5FA8]/20 rounded-2xl p-6 text-center">
                      <p className="text-base font-bold text-gray-800 mb-1">
                        🔒 Unlock {variations.length - 1} More High-Performing Variations
                      </p>
                      <p className="text-sm text-gray-500 mb-1">✨ Designed to boost engagement & clicks</p>
                      <p className="text-xs text-gray-400 mb-4">Sign up free — takes 10 seconds</p>
                      <button onClick={handleUnlock}
                        className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-md mb-3">
                        Unlock All (Free) →
                      </button>
                      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                        <span>✅ Full access to all variations</span>
                        <span>✅ Copy, edit &amp; post instantly</span>
                        <span>✅ 3 free generations/month</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
                        <span>✅ Used by 1,000+ creators</span>
                        <span>⚡ Generate in seconds</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── Single output (Email, YouTube) ── */}
              {!loading && singleResult && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">Generated {platform} Content</span>
                    {!isGuest && (
                      <button onClick={copySingle}
                        className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
                        {copiedSingle ? '✅ Copied' : '📋 Copy'}
                      </button>
                    )}
                  </div>

                  {/* Preview for guests */}
                  <div className="relative">
                    <div className={`p-6 ${isPreview ? 'max-h-64 overflow-hidden' : ''}`}>
                      <FormattedContent text={singleResult} />
                    </div>

                    {isPreview && (
                      <>
                        <div className="absolute bottom-16 left-0 right-0 h-20"
                          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.7))' }} />
                        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-5 px-4"
                          style={{ background: 'linear-gradient(to bottom, transparent 0%, white 30%)' }}>
                          <p className="text-sm font-bold text-gray-800 mb-0.5">Preview Generated – Unlock Full Content</p>
                          <p className="text-xs text-gray-500 mb-3">Sign up free to read, copy and use the complete {platform} content</p>
                          <button onClick={handleUnlock}
                            className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md mb-2">
                            Unlock Full Content (Free) →
                          </button>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>✅ Used by 1,000+ creators</span>
                            <span>⚡ Takes 10 seconds</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!loading && !hasResult && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 text-center px-6">
                  <div className="text-5xl mb-4">{icon}</div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Your {platform} content will appear here</p>
                  <p className="text-sm text-gray-400 max-w-xs">Fill in your topic on the left and click Generate.</p>
                </div>
              )}

{/* Human Service Cross-link */}
              {config.humanServiceLink && (
                <div className="bg-gradient-to-r from-[#1B5FA8]/5 to-[#0D9488]/5 border border-[#0D9488]/20 rounded-2xl p-5 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-0.5">✍️ Want this done for you by an expert?</p>
                    <p className="text-sm text-gray-500">Our human writers deliver SEO-optimised, expert-crafted content — with a Copyscape report included.</p>
                  </div>
                  <a href={config.humanServiceLink}
                    className="shrink-0 bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
                    View Human Writing Service →
                  </a>
                </div>
              )}

              {/* Tips */}
              {tips.length > 0 && (
              {/* Tips */}
              {tips.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
                  <h2 className="text-base font-bold text-[#1B5FA8] mb-4">💡 Tips for Better {platform} Content</h2>
                  <ul className="space-y-3">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600">
                        <span className="text-[#0D9488] font-bold shrink-0">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* FAQs */}
              {faqs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
                  <h2 className="text-base font-bold text-[#1B5FA8] mb-4">❓ Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-gray-800 mb-1">{faq.q}</p>
                        <p className="text-sm text-gray-500">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
