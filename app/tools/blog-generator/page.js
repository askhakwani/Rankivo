'use client' 
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

const TONES = ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Conversational', 'Humorous']
const LENGTHS = [
  { label: 'Short',  desc: '~150 words', value: 'Short'  },
  { label: 'Medium', desc: '~400 words', value: 'Medium' },
  { label: 'Long',   desc: '~800 words', value: 'Long'   },
]
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Arabic', 'Urdu']
const CTA_OPTIONS = ['None', 'Learn More', 'Get Started', 'Sign Up Free', 'Contact Us', 'Buy Now', 'Book a Call']

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const tags = value || []

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim()) && tags.length < 3) {
        onChange([...tags, input.trim()])
      }
      setInput('')
    }
  }

  function removeTag(tag) {
    onChange(tags.filter(t => t !== tag))
  }

  return (
    <div className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
      {tags.map(tag => (
        <span key={tag} className="bg-[#0D9488]/10 text-[#0D9488] text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          {tag}
          <button onClick={() => removeTag(tag)} className="hover:text-red-400 font-bold">×</button>
        </span>
      ))}
      {tags.length < 3 && (
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={addTag}
          placeholder={tags.length === 0 ? placeholder : 'Add more…'}
          className="flex-1 min-w-[120px] text-sm outline-none text-gray-800 bg-transparent"
        />
      )}
    </div>
  )
}

function FormattedContent({ content }) {
  if (!content) return null
  const lines = content.split('\n')
  return (
    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-gray-800 mt-4 mb-1">{line.replace('### ', '')}</h3>
        if (line.startsWith('## '))  return <h2 key={i} className="text-lg font-bold text-[#1B5FA8] mt-5 mb-2">{line.replace('## ', '')}</h2>
        if (line.startsWith('# '))   return <h1 key={i} className="text-xl font-bold text-[#1B5FA8] mt-4 mb-2">{line.replace('# ', '')}</h1>
        if (line.startsWith('- '))   return <li key={i} className="ml-4 text-sm text-gray-700">{line.replace('- ', '')}</li>
        if (line.trim() === '')       return <br key={i} />
        return <p key={i} className="text-sm text-gray-700 mb-2">{line}</p>
      })}
    </div>
  )
}

export default function BlogGeneratorPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    topic:    '',
    keywords: [],
    tone:     'Professional',
    audience: '',
    cta:      'None',
    length:   'Long',
    language: 'English',
  })

  const [result,    setResult]    = useState(null)
  const [isPreview, setIsPreview] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [copied,    setCopied]    = useState(false)
  const [activeTab, setActiveTab] = useState('content')

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleGenerate() {
    if (!form.topic.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setIsPreview(false)

    try {
      const res  = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          platform:  'Blog',
          topic:     form.topic,
          keywords:  form.keywords,
          tone:      form.tone,
          audience:  form.audience,
          cta:       form.cta,
          length:    form.length,
          language:  form.language,
        }),
      })
      const data = await res.json()

      if (data.error) { setError(data.error); return }

      setResult(data.content)
      setIsPreview(data.isPreview || false)
      setActiveTab('content')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function copyContent() {
    if (!result || isPreview) return
    const full = [
      result.metaTitle       ? `META TITLE:\n${result.metaTitle}` : '',
      result.metaDescription ? `META DESCRIPTION:\n${result.metaDescription}` : '',
      result.titles?.[0]     ? `H1:\n${result.titles[0]}` : '',
      result.content         ? `\n${result.content}` : '',
    ].filter(Boolean).join('\n\n')
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = result?.content
    ? result.content.trim().split(/\s+/).filter(Boolean).length
    : 0

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6">

          {/* ── Hero ── */}
          <div className="text-center mb-10">
            <span className="inline-block bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              AI Blog Generator
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B5FA8] mb-3">
              AI Blog Post Generator
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              Generate fully structured, SEO-optimized blog posts in seconds. Includes meta title, meta description and H1 — ready to publish.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Left: Form ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 sticky top-24">

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Blog Topic <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.topic}
                    onChange={e => updateForm('topic', e.target.value)}
                    placeholder="e.g. How to improve website SEO in 2025"
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    SEO Keywords <span className="text-gray-400 font-normal">(up to 3)</span>
                  </label>
                  <TagInput
                    value={form.keywords}
                    onChange={v => updateForm('keywords', v)}
                    placeholder="Type keyword, press Enter…"
                  />
                </div>

                {/* Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Length</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LENGTHS.map(l => (
                      <button
                        key={l.value}
                        onClick={() => updateForm('length', l.value)}
                        className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                          form.length === l.value
                            ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]'
                            : 'border-gray-200 text-gray-500 hover:border-[#0D9488]'
                        }`}
                      >
                        <span className="block font-semibold">{l.label}</span>
                        <span className="opacity-70">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
                  <select
                    value={form.tone}
                    onChange={e => updateForm('tone', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    {TONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Target Audience <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    value={form.audience}
                    onChange={e => updateForm('audience', e.target.value)}
                    placeholder="e.g. Small business owners"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>

                {/* CTA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Call to Action</label>
                  <select
                    value={form.cta}
                    onChange={e => updateForm('cta', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    {CTA_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                  <select
                    value={form.language}
                    onChange={e => updateForm('language', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !form.topic.trim()}
                  className="w-full bg-[#1B5FA8] hover:bg-[#0D9488] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Generating…
                    </span>
                  ) : '✍️ Generate Blog Post'}
                </button>

              </div>
            </div>

            {/* ── Right: Output ── */}
            <div className="lg:col-span-3">

              {/* Error */}
              {error && (
                <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-4 text-sm">{error}</div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                  <p className="text-xs text-center text-gray-400 pt-2">Writing your blog post…</p>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <div className="space-y-4">

                  {/* Content card — with preview wall if guest */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100 px-4 pt-3 gap-1">
                      {[
                        { key: 'content', label: '📝 Content'   },
                        { key: 'meta',    label: '🏷️ Meta Tags' },
                      ].map(t => (
                        <button
                          key={t.key}
                          onClick={() => setActiveTab(t.key)}
                          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                            activeTab === t.key
                              ? 'bg-[#0D9488] text-white'
                              : 'text-gray-500 hover:text-[#0D9488]'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                      <div className="ml-auto pb-2 flex items-center gap-2">
                        <span className="text-xs text-gray-400">{wordCount} words</span>
                        {!isPreview && (
                          <button
                            onClick={copyContent}
                            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
                          >
                            {copied ? '✅ Copied' : '📋 Copy All'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content tab */}
                    {activeTab === 'content' && (
                      <div className="relative">
                        <div className={`p-6 ${isPreview ? 'max-h-96 overflow-hidden' : ''}`}>
                          {result.titles?.[0] && (
                            <h1 className="text-xl font-bold text-[#1B5FA8] mb-4 pb-3 border-b border-gray-100">
                              {result.titles[0]}
                            </h1>
                          )}
                          <FormattedContent content={result.content} />
                        </div>

                        {/* ── Guest preview wall ── */}
                   {isPreview && (
  <>
    <div className="absolute bottom-20 left-0 right-0 h-28"
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))' }}
    />
    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-6 px-6"
      style={{ background: 'linear-gradient(to bottom, transparent 0%, white 25%)' }}
    >
      <p className="text-sm font-bold text-gray-800 mb-0.5">Preview Generated – Unlock Full Article</p>
      <p className="text-xs text-gray-500 mb-4">Create a free account to read the complete blog post.</p>
      <button
        onClick={() => router.push('/auth?mode=signup')}
        className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md mb-3"
      >
        Unlock Full Article (Free) →
      </button>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>✅ Full article access</span>
        <span>✅ Save &amp; edit later</span>
        <span>✅ 3 free generations/month</span>
      </div>
    </div>
  </>
)}
                      </div>
                    )}

                    {/* Meta tab — hide for guests */}
                    {activeTab === 'meta' && (
                      <div className="p-6">
                        {isPreview ? (
                          <div className="text-center py-10">
                            <div className="text-3xl mb-3">🔒</div>
                            <p className="text-sm font-bold text-gray-800 mb-1">Preview Generated – Unlock Full Article</p>
                            <p className="text-xs text-gray-500 mb-4">Your SEO title, meta description and H1 are ready — sign up free to access them.</p>
                            <button
                              onClick={() => router.push('/auth?mode=signup')}
                              className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md mb-3"
                            >
                              Unlock Full Article (Free) →
                            </button>
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                              <span>✅ Full article access</span>
                              <span>✅ Save &amp; edit later</span>
                              <span>✅ 3 free generations/month</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {result.metaTitle && (
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">SEO Title</p>
                                <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl px-4 py-3">{result.metaTitle}</p>
                                <p className={`text-xs mt-1 ${result.metaTitle.length >= 50 && result.metaTitle.length <= 60 ? 'text-[#0D9488]' : 'text-[#C9943A]'}`}>
                                  {result.metaTitle.length} chars · Ideal: 50–60
                                </p>
                              </div>
                            )}
                            {result.metaDescription && (
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Meta Description</p>
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">{result.metaDescription}</p>
                                <p className={`text-xs mt-1 ${result.metaDescription.length >= 140 && result.metaDescription.length <= 160 ? 'text-[#0D9488]' : 'text-[#C9943A]'}`}>
                                  {result.metaDescription.length} chars · Ideal: 140–160
                                </p>
                              </div>
                            )}
                            {result.titles?.[0] && (
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">H1 Heading</p>
                                <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl px-4 py-3">{result.titles[0]}</p>
                              </div>
                            )}
                            {/* SERP preview */}
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">SERP Preview</p>
                              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                <p className="text-xs text-green-700 mb-1">https://yourwebsite.com/blog/post</p>
                                <p className="text-blue-700 text-sm font-medium hover:underline cursor-pointer leading-snug mb-1">{result.metaTitle}</p>
                                <p className="text-gray-600 text-xs leading-relaxed">{result.metaDescription}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTAs — only show for logged-in users */}
                  {!isPreview && (
                    <>
                      <div className="bg-[#0D9488]/5 border border-[#0D9488]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#0D9488]">Check how well this content is optimized</p>
                          <p className="text-xs text-gray-500 mt-0.5">Paste it into the SEO Score Checker for a full breakdown.</p>
                        </div>
                        <Link
                          href="/tools/seo-score-checker"
                          className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Check SEO Score →
                        </Link>
                      </div>

                      <div className="bg-gradient-to-r from-[#1B5FA8] to-[#0D9488] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="text-white font-bold">Save, manage and optimize all your content</p>
                          <p className="text-white/80 text-sm mt-0.5">Access your full content dashboard.</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="shrink-0 bg-white text-[#1B5FA8] hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                        >
                          Go to Dashboard →
                        </Link>
                      </div>
                    </>
                  )}

                </div>
              )}

              {/* Empty state */}
              {!loading && !result && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 text-center px-6">
                  <div className="text-5xl mb-4">✍️</div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Your blog post will appear here</p>
                  <p className="text-sm text-gray-400 max-w-xs">Fill in the topic and settings on the left, then click Generate.</p>
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
