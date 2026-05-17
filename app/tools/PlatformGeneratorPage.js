'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const TONES = ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Conversational', 'Humorous']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Arabic', 'Urdu']
const CTA_STYLES = ['None', 'Learn More', 'Buy Now', 'Visit Site', 'Sign Up Free', 'Book a Call', 'Contact Us']

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

// Renders a single variation card
function VariationCard({ index, text, isBlurred, isGuest, onCopy, copied, onUnlock }) {
  return (
    <div className={`relative border rounded-2xl overflow-hidden transition-all ${isBlurred ? 'border-gray-100' : 'border-gray-200'}`}>
      {/* Variation number badge */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Variation {index + 1}
        </span>
        {!isBlurred && !isGuest && (
          <button onClick={() => onCopy(text, index)}
            className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
            {copied === index ? '✅ Copied' : '📋 Copy'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`px-4 py-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed ${isBlurred ? 'select-none' : ''}`}
        style={isBlurred ? { filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
        {text}
      </div>

      {/* Blur overlay with CTA */}
      {isBlurred && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm px-6">
          <p className="text-sm font-bold text-gray-800 mb-1 text-center">Unlock All Variations</p>
          <p className="text-xs text-gray-500 mb-3 text-center">Sign up free to copy & use all {4} variations</p>
          <button onClick={onUnlock}
            className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-md">
            Unlock All (Free) →
          </button>
        </div>
      )}
    </div>
  )
}

export default function PlatformGeneratorPage({ config }) {
  const router = useRouter()
  const {
    platform, slug, title, subtitle, badge, icon, placeholder,
    showLength = false, faqs = [], tips = []
  } = config

  const isLongForm = platform === 'Email' || platform === 'YouTube'

  const [form, setForm] = useState({
    topic: '', keywords: [], tone: 'Professional',
    audience: '', cta: 'None', language: 'English', link: '',
  })
  const [variations,  setVariations]  = useState([])
  const [singleResult, setSingleResult] = useState('')
  const [isPreview,   setIsPreview]   = useState(false)
  const [isGuest,     setIsGuest]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [copied,      setCopied]      = useState(null)
  const [copiedSingle, setCopiedSingle] = useState(false)

  function updateForm(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  async function handleGenerate() {
    if (!form.topic.trim()) return
    setLoading(true); setError(''); setVariations([]); setSingleResult(''); setIsPreview(false)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, ...form }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }

      setIsGuest(data.isGuest || false)
      setIsPreview(data.isPreview || false)

      if (data.variations?.length) {
        setVariations(data.variations)
      } else {
        setSingleResult(data.content?.content || '')
      }
    } catch { setError('Something went wrong. Please try again.') }
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

  // Save result to sessionStorage before redirecting to auth
  function handleUnlock() {
    const restoreData = {
      variations,
      singleResult,
      form,
      platform,
    }
    sessionStorage.setItem('rankivo_restore_' + (slug || platform), JSON.stringify(restoreData))
    router.push('/auth?mode=signup&redirect=tools/' + (slug || platform.toLowerCase()))
  }

  // Restore result after login redirect
  useEffect(() => {
    const key = 'rankivo_restore_' + (slug || platform)
    const saved = sessionStorage.getItem(key)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.variations?.length) setVariations(data.variations)
        if (data.singleResult) setSingleResult(data.singleResult)
        if (data.form) setForm(data.form)
        setIsGuest(false)
        setIsPreview(false)
        sessionStorage.removeItem(key)
      } catch (e) { /* ignore */ }
    }
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

            {/* Form */}
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

                {/* Link field */}
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

            {/* Output */}
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
                  <p className="text-xs text-center text-gray-400">Generating 4 variations…</p>
                </div>
              )}

              {/* Multi-variation output */}
              {!loading && variations.length > 0 && (
                <>
                  {isGuest && (
                    <div className="bg-[#1B5FA8]/5 border border-[#1B5FA8]/20 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">👁️</span>
                      <div>
                        <p className="text-sm font-semibold text-[#1B5FA8]">Showing Variation 1 of {variations.length}</p>
                        <p className="text-xs text-gray-500">Sign up free to unlock all variations and copy them</p>
                      </div>
                    </div>
                  )}

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
                    />
                  ))}

                  {isGuest && (
                    <div className="bg-white border border-[#1B5FA8]/20 rounded-2xl p-6 text-center">
                      <p className="text-base font-bold text-gray-800 mb-1">Unlock All {variations.length} Variations</p>
                      <p className="text-sm text-gray-500 mb-4">Create a free account to copy, save and use all variations.</p>
                      <button onClick={handleUnlock}
                        className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-md mb-3">
                        Unlock All (Free) →
                      </button>
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                        <span>✅ Full access to all variations</span>
                        <span>✅ Save &amp; edit later</span>
                        <span>✅ 3 free generations/month</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Single output (Email, YouTube) */}
              {!loading && singleResult && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">Generated {platform} Content</span>
                    <button onClick={isGuest ? handleUnlock : copySingle}
                      className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
                      {isGuest ? '🔒 Sign up to Copy' : copiedSingle ? '✅ Copied' : '📋 Copy'}
                    </button>
                  </div>
                  <div className="p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {singleResult}
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

              {/* Tips section for SEO content depth */}
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

              {/* FAQ section for SEO */}
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
