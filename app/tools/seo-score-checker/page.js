'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

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
    content:         '',
    keyword:         '',
    metaTitle:       '',
    metaDescription: '',
  })

  const [result,  setResult]  = useState(null)
  const [isPaid,  setIsPaid]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

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
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
      setIsPaid(data.isPaid)
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

              {/* Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target Keyword <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.keyword}
                  onChange={e => updateForm('keyword', e.target.value)}
                  placeholder="e.g. best project management software"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Blog Content <span className="text-red-400">*</span>
                  </label>
                  <span className={`text-xs font-medium ${
                    wordCount >= 700 && wordCount <= 900 ? 'text-[#0D9488]' :
                    wordCount >= 500 ? 'text-[#C9943A]' :
                    wordCount > 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {wordCount} words
                    {wordCount >= 700 && wordCount <= 900 && ' ✓ Ideal range'}
                    {wordCount >= 500 && wordCount < 700 && ' · Good'}
                    {wordCount > 0 && wordCount < 500 && ' · Too short'}
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

                  {/* Free user — unlock full suggestions */}
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

        </div>
      </main>

      <Footer />
    </>
  )
}
