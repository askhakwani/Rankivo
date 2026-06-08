'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { createClient } from '../../../lib/supabase'

// ── Score ring SVG ────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius      = 54
  const stroke      = 10
  const circumference = 2 * Math.PI * radius
  const progress    = (score / 100) * circumference
  const color       = score >= 80 ? '#0D9488' : score >= 60 ? '#C9943A' : '#ef4444'
  const label       = score >= 80 ? 'Strong' : score >= 60 ? 'Fair' : 'Needs Work'

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        {/* Progress */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>{score}</text>
        <text x="70" y="83" textAnchor="middle" fontSize="11" fill="#9ca3af">/100</text>
      </svg>
      <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
    </div>
  )
}

// ── Factor row ────────────────────────────────────────────────────────────────
const FACTOR_LABELS = {
  keywordInTitle:          'Keyword in Title',
  keywordInFirstParagraph: 'Keyword in First Paragraph',
  keywordInHeadings:       'Keyword in Headings',
  keywordDensity:          'Keyword Density',
  wordCount:               'Content Length',
  metaTitleLength:         'Meta Title Length',
  metaDescLength:          'Meta Description Length',
  readability:             'Readability',
  internalLink:            'Internal Link',
  structure:               'Content Structure (H1/H2/H3)',
}

const FACTOR_ICONS = {
  keywordInTitle:          '🎯',
  keywordInFirstParagraph: '📝',
  keywordInHeadings:       '🏷️',
  keywordDensity:          '📊',
  wordCount:               '📏',
  metaTitleLength:         '🔤',
  metaDescLength:          '💬',
  readability:             '👁️',
  internalLink:            '🔗',
  structure:               '🏗️',
}

function FactorRow({ factorKey, score }) {
  const pct   = (score / 10) * 100
  const color = score === 10 ? 'bg-[#0D9488]' : score >= 5 ? 'bg-[#C9943A]' : 'bg-red-400'
  const label = score === 10 ? 'Optimized' : score >= 5 ? 'Partial' : 'Not Optimized'
  const textColor = score === 10 ? 'text-[#0D9488]' : score >= 5 ? 'text-[#C9943A]' : 'text-red-500'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-base w-6 shrink-0">{FACTOR_ICONS[factorKey]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 font-medium truncate">{FACTOR_LABELS[factorKey]}</span>
          <span className={`text-xs font-semibold ml-2 shrink-0 ${textColor}`}>{score}/10 · {label}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full">
          <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

// ── Suggestion card ───────────────────────────────────────────────────────────
function SuggestionCard({ suggestion, index }) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5">
          #{index + 1}
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">{suggestion.factor}</p>
          <p className="text-xs text-gray-500 mt-0.5">{suggestion.issue}</p>
          <p className="text-xs text-[#0D9488] font-medium mt-1.5">✅ Fix: {suggestion.fix}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SEOScoreCheckerPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    content:          '',
    keyword:          '',
    secondaryKeywords: '',
    metaTitle:        '',
    metaDescription:  '',
    url:              '',
  })

  const [result,       setResult]       = useState(null)
  const [isPaid,       setIsPaid]       = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [urlFetching,  setUrlFetching]  = useState(false)
  const [error,        setError]        = useState('')
  const [planChecked,  setPlanChecked]  = useState(false)

  // ── Detect user plan from Supabase ──────────────────────────────────────────
  useEffect(() => {
    async function checkPlan() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setPlanChecked(true); return }
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        const paidPlans = ['starter', 'pro', 'agency']
        if (profile?.plan && paidPlans.includes(profile.plan.toLowerCase())) {
          setIsPaid(true)
        }
      } catch { /* fail silently */ }
      setPlanChecked(true)
    }
    checkPlan()
  }, [])

  // ── Fetch content from URL ──────────────────────────────────────────────────
  async function handleFetchUrl() {
    if (!form.url.trim()) return
    setUrlFetching(true)
    setError('')
    try {
      const res = await fetch('/api/tools/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.url.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setForm(prev => ({
        ...prev,
        content: data.content || prev.content,
        metaTitle: data.metaTitle || prev.metaTitle,
        metaDescription: data.metaDescription || prev.metaDescription,
      }))
    } catch { setError('Could not fetch URL. Try pasting content manually.') }
    setUrlFetching(false)
  }

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length

  async function handleCheck() {
    if (!form.content.trim() || !form.keyword.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res  = await fetch('/api/tools/seo-score', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, isPaid }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
      // Don't override isPaid from API — we already detected it from Supabase
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Redirect to dashboard with content pre-filled via sessionStorage
  function handleOptimize() {
    sessionStorage.setItem('rankivo_optimize_content', form.content)
    sessionStorage.setItem('rankivo_optimize_keyword', form.keyword)
    router.push('/dashboard')
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">

          {/* ── Hero ── */}
          <div className="text-center mb-10">
            <span className="inline-block bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              Free SEO Tool
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B5FA8] mb-3">
              SEO Score Checker
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              Paste your content, enter your target keyword, and get an instant AI-powered SEO score with actionable suggestions.
            </p>
          </div>

          {/* ── Input form ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="space-y-4">

              {/* URL Fetcher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fetch from URL <span className="text-gray-400 font-normal">(optional — auto-fills content below)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.url}
                    onChange={e => updateForm('url', e.target.value)}
                    placeholder="https://yoursite.com/your-blog-post"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                  />
                  <button
                    onClick={handleFetchUrl}
                    disabled={urlFetching || !form.url.trim()}
                    className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {urlFetching ? 'Fetching…' : '🔗 Fetch'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Fetches live page content including internal links — fixes internal link detection</p>
              </div>

              <div className="border-t border-gray-100" />

              {/* Primary Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Primary Keyword <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.keyword}
                  onChange={e => updateForm('keyword', e.target.value)}
                  placeholder="e.g. keyword research for beginners"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                />
              </div>

              {/* Secondary Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Secondary Keywords <span className="text-gray-400 font-normal">(comma separated)</span>
                </label>
                <input
                  value={form.secondaryKeywords}
                  onChange={e => updateForm('secondaryKeywords', e.target.value)}
                  placeholder="e.g. long-tail keywords, search intent, keyword difficulty"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                />
                <p className="text-xs text-gray-400 mt-1">The tool will check if each secondary keyword appears in your content</p>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Blog Content <span className="text-red-400">*</span>
                  </label>
                  <span className={`text-xs font-medium ${
                    wordCount >= 1500 ? 'text-[#0D9488]' :
                    wordCount >= 800  ? 'text-[#C9943A]' :
                    wordCount > 0     ? 'text-red-400'   : 'text-gray-400'
                  }`}>
                    {wordCount} words
                    {wordCount >= 1500 && ' ✓ Great length'}
                    {wordCount >= 800 && wordCount < 1500 && ' · Good'}
                    {wordCount >= 300 && wordCount < 800 && ' · Too short for pillar'}
                    {wordCount > 0 && wordCount < 300 && ' · Too short'}
                  </span>
                </div>
                <textarea
                  value={form.content}
                  onChange={e => updateForm('content', e.target.value)}
                  placeholder="Paste your full blog post or article content here…"
                  rows={10}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800 resize-y font-mono"
                />
              </div>

              {/* Optional meta fields */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
                  Optional — for full 100pt score
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Meta Title
                      <span className="text-gray-400 font-normal ml-1">(50–60 chars)</span>
                    </label>
                    <input
                      value={form.metaTitle}
                      onChange={e => updateForm('metaTitle', e.target.value)}
                      placeholder="Your SEO meta title…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                    />
                    {form.metaTitle && (
                      <p className={`text-xs mt-1 ${
                        form.metaTitle.length >= 50 && form.metaTitle.length <= 60
                          ? 'text-[#0D9488]' : 'text-[#C9943A]'
                      }`}>
                        {form.metaTitle.length} chars
                        {form.metaTitle.length >= 50 && form.metaTitle.length <= 60 ? ' ✓' : ' · Ideal: 50–60'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Meta Description
                      <span className="text-gray-400 font-normal ml-1">(140–160 chars)</span>
                    </label>
                    <input
                      value={form.metaDescription}
                      onChange={e => updateForm('metaDescription', e.target.value)}
                      placeholder="Your meta description…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                    />
                    {form.metaDescription && (
                      <p className={`text-xs mt-1 ${
                        form.metaDescription.length >= 140 && form.metaDescription.length <= 160
                          ? 'text-[#0D9488]' : 'text-[#C9943A]'
                      }`}>
                        {form.metaDescription.length} chars
                        {form.metaDescription.length >= 140 && form.metaDescription.length <= 160 ? ' ✓' : ' · Ideal: 140–160'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheck}
                disabled={loading || !form.content.trim() || !form.keyword.trim()}
                className="w-full bg-[#1B5FA8] hover:bg-[#0D9488] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Analyzing…' : '📊 Check SEO Score'}
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6 text-sm">{error}</div>
          )}

          {/* ── Results ── */}
          {result && (
            <div className="space-y-5">

              {/* Score header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreRing score={result.totalScore} />
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {result.totalScore >= 80
                        ? 'Strong First Draft'
                        : result.totalScore >= 60
                        ? 'Fair — Improvements Needed'
                        : 'Needs SEO Work'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-3">{result.summary}</p>
                    <p className="text-xs text-[#C9943A] bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 inline-block">
                      💡 This is a strong first draft. Apply suggestions below to fully optimize.
                    </p>
                  </div>
                </div>
              </div>

              {/* Factor breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Score Breakdown</h2>
                <div>
                  {Object.entries(result.scores).map(([key, score]) => (
                    <FactorRow key={key} factorKey={key} score={score} />
                  ))}
                </div>

                {/* Secondary keywords breakdown */}
                {result.secondaryKeywords?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Secondary Keywords</h3>
                    <div className="space-y-2">
                      {result.secondaryKeywords.map((kw, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-600">"{kw.keyword}"</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            kw.found ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-red-50 text-red-500'
                          }`}>
                            {kw.found ? `✓ Found (${kw.count}x)` : '✗ Missing'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-800">
                      Suggestions
                      {!isPaid && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">(showing {result.suggestions.length} of all)</span>
                      )}
                    </h2>
                    {!isPaid && (
                      <span className="text-xs bg-[#C9943A]/10 text-[#C9943A] px-2 py-1 rounded-full font-medium">
                        Free: {result.suggestions.length} suggestions
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <SuggestionCard key={i} suggestion={s} index={i} />
                    ))}
                  </div>

                  {/* Only show upgrade gate for non-paid users */}
                  {!isPaid && (
                    <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          🔒 More suggestions available on Pro
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Upgrade to unlock full breakdown, all suggestions and AI optimization in your dashboard.
                        </p>
                        <Link
                          href="/upgrade"
                          className="inline-block bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Upgrade to Pro →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Improve SEO Score CTA */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-800 mb-1">Ready to optimize?</h2>
                    <p className="text-sm text-gray-500">
                      {isPaid
                        ? 'Use AI to automatically improve keyword placement, headings, readability and more — in your dashboard.'
                        : 'Upgrade to Pro and use AI to automatically improve your content SEO score.'}
                    </p>
                  </div>

                  {isPaid ? (
                    <button
                      onClick={handleOptimize}
                      className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                    >
                      🚀 Improve SEO Score →
                    </button>
                  ) : (
                    <Link
                      href="/upgrade"
                      className="shrink-0 border-2 border-dashed border-gray-300 text-gray-400 px-6 py-3 rounded-xl font-semibold text-sm cursor-not-allowed flex items-center gap-2"
                    >
                      🔒 Improve SEO Score <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Pro</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Human Writing Cross-link */}
              <div className="bg-gradient-to-r from-[#1B5FA8]/5 to-[#0D9488]/5 border border-[#0D9488]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-0.5">✍️ Want this done for you by an expert?</p>
                  <p className="text-sm text-gray-500">Our human writers deliver SEO-optimised, expert-crafted content — with a Copyscape report included.</p>
                </div>
                <Link href="/services/seo-blog-writing"
                  className="shrink-0 bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
                  View Human Writing Service →
                </Link>
              </div>

              {/* Bottom CTA */}
              <div className="bg-gradient-to-r from-[#1B5FA8] to-[#0D9488] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold">Generate a fully SEO-optimized article with AI</p>
                  <p className="text-white/80 text-sm mt-0.5">Let Rankivo write, structure and optimize your content from scratch.</p>
                </div>
                <Link
                  href="/tools/blog-generator"
                  className="shrink-0 bg-white text-[#1B5FA8] hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  Generate SEO Article →
                </Link>
              </div>

            </div>
          )}

          {/* ── How It Works ── */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#1B5FA8] mb-6">How the SEO Score Checker Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '1', icon: '📝', title: 'Paste Your Content', desc: 'Enter your article or page content, target keyword and optional meta tags. You can also fetch content directly from a URL.' },
                { step: '2', icon: '📊', title: 'Get Your SEO Score', desc: 'The tool analyses 10 on-page SEO factors — keyword placement, density, readability, content length, meta tags and more.' },
                { step: '3', icon: '✅', title: 'Apply the Fixes', desc: 'Review your score breakdown and actionable suggestions, then update your content to push your score higher.' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="flex flex-col items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B5FA8] text-white text-sm font-bold flex items-center justify-center shrink-0">{step}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-1">{icon} {title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tips ── */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#1B5FA8] mb-4">💡 Tips for a Higher SEO Score</h2>
            <ul className="space-y-3">
              {[
                'Place your primary keyword in the first 100 words of your article — this signals relevance to Google early.',
                'Aim for keyword density of 1–2%. Too low and your content may not rank; too high and you risk a keyword stuffing penalty.',
                'Use your target keyword in at least one H2 or H3 heading to reinforce topical relevance.',
                'Write at least 800 words for competitive keywords. Longer, well-structured content consistently outperforms thin pages.',
                'Always add at least one internal link to a related page on your site — it helps Google crawl and understand your site structure.',
                'Keep your meta title under 60 characters and meta description under 160 for clean SERP display.',
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="text-[#0D9488] font-bold shrink-0">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* ── FAQs ── */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#1B5FA8] mb-4">❓ Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'What is an SEO score?', a: 'An SEO score measures how well your content is optimised for search engines across key on-page factors like keyword usage, content length, meta tags and readability. A score of 80+ is considered strong.' },
                { q: 'Is this SEO score checker free?', a: 'Yes — the core score check is free for all users. Pro users unlock advanced suggestions, secondary keyword tracking and the AI content improvement feature.' },
                { q: 'What factors does the score check?', a: 'We analyse 10 factors: keyword in title, keyword in first paragraph, keyword in headings, keyword density, word count, meta title length, meta description length, readability, internal links and content structure.' },
                { q: 'What is a good SEO score?', a: '80 and above is strong and ready to publish. 60–79 is fair but has clear room for improvement. Below 60 means the content needs significant SEO work before it can compete.' },
                { q: 'Can I check a live URL instead of pasting content?', a: 'Yes — enter your page URL and click Fetch to automatically pull in the content, meta title and meta description from that page.' },
                { q: 'How is readability scored?', a: 'Readability is assessed based on sentence length, paragraph structure and use of subheadings. Content that is easy to scan and digest tends to perform better in search results.' },
              ].map((faq, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{faq.q}</p>
                  <p className="text-sm text-gray-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
