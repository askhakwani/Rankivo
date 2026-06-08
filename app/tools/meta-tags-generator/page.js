'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

function LengthBar({ value, min, max }) {
  const pct    = Math.min(100, Math.round((value / max) * 100))
  const inRange = value >= min && value <= max
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>0</span>
        <span className={`font-semibold ${inRange ? 'text-green-600' : 'text-red-500'}`}>
          {value} chars {inRange ? '✓ Good' : value < min ? '↑ Too short' : '↓ Too long'}
        </span>
        <span>{max}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full">
        <div
          className={`h-1.5 rounded-full transition-all ${inRange ? 'bg-green-500' : 'bg-red-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">Ideal: {min}–{max} characters</p>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
    >
      {copied ? '✅ Copied' : '📋 Copy'}
    </button>
  )
}

export default function MetaTagsGeneratorPage() {
  const [form, setForm]     = useState({ keyword: '', title: '', description: '' })
  const [result, setResult] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleGenerate() {
    if (!form.keyword.trim() || !form.title.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res  = await fetch('/api/tools/meta-tags', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data.result)
      setIsPaid(data.isPaid)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6">

          {/* ── Hero ── */}
          <div className="text-center mb-10">
            <span className="inline-block bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              Free SEO Tool
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B5FA8] mb-3">
              Meta Tags Generator
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              Generate perfectly optimized SEO title and meta description tags in seconds — powered by AI.
            </p>
          </div>

          {/* ── Input form ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target Keyword <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.keyword}
                  onChange={e => updateForm('keyword', e.target.value)}
                  placeholder="e.g. best CRM software for small business"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Page / Article Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => updateForm('title', e.target.value)}
                  placeholder="e.g. Top 10 CRM Software for Small Businesses in 2025"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description Hint <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="Brief notes about the page content or key benefits to highlight…"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800 resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !form.keyword.trim() || !form.title.trim()}
                className="w-full bg-[#1B5FA8] hover:bg-[#0D9488] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating…' : '🏷️ Generate Meta Tags'}
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6 text-sm">{error}</div>
          )}

          {/* ── Results ── */}
          {result && (
            <div className="space-y-4">

              {/* SEO Title */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">SEO Title</h2>
                  <CopyButton text={result.seoTitle} />
                </div>
                <p className="text-gray-900 font-medium text-base leading-snug">{result.seoTitle}</p>
                <LengthBar value={result.seoTitleLength} min={50} max={60} />
              </div>

              {/* Meta Description */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">Meta Description</h2>
                  <CopyButton text={result.metaDescription} />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{result.metaDescription}</p>
                <LengthBar value={result.metaDescriptionLength} min={140} max={160} />
              </div>

              {/* SERP Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-3">SERP Preview</h2>
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <p className="text-xs text-green-700 mb-1">https://yourwebsite.com/page-url</p>
                  <p className="text-blue-700 text-base font-medium hover:underline cursor-pointer leading-snug mb-1">
                    {result.seoTitle}
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed">{result.metaDescription}</p>
                </div>
              </div>

              {/* Paid: A/B Variations */}
              {isPaid && result.titleVariations?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h2 className="font-semibold text-gray-800 mb-3">A/B Title Variations</h2>
                  <div className="space-y-3">
                    {result.titleVariations.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-sm text-gray-800 font-medium">{v}</p>
                        <CopyButton text={v} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paid: OG + Twitter tags */}
              {isPaid && result.ogTitle && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Social Media Tags</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'OG Title',            value: result.ogTitle },
                      { label: 'OG Description',      value: result.ogDescription },
                      { label: 'Twitter Title',       value: result.twitterTitle },
                      { label: 'Twitter Description', value: result.twitterDescription },
                    ].map(tag => (
                      <div key={tag.label}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{tag.label}</p>
                          <CopyButton text={tag.value} />
                        </div>
                        <p className="text-sm text-gray-800">{tag.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Free: upgrade nudge for more features */}
              {!isPaid && (
                <div className="bg-[#1B5FA8]/5 border border-[#1B5FA8]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1B5FA8]">Want A/B title variations + social OG tags?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Upgrade to Pro to unlock full meta tag output including Open Graph and Twitter cards.</p>
                  </div>
                  <Link
                    href="/auth?mode=signup"
                    className="shrink-0 bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Upgrade to Pro →
                  </Link>
                </div>
              )}

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

              {/* CTA */}
              <div className="bg-gradient-to-r from-[#1B5FA8] to-[#0D9488] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold">Want a full SEO optimized article?</p>
                  <p className="text-white/80 text-sm mt-0.5">Generate a complete AI-written blog post using these meta tags.</p>
                </div>
                <Link
                  href="/tools/blog-generator"
                  className="shrink-0 bg-white text-[#1B5FA8] hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  Generate Article →
                </Link>
              </div>

            </div>
          )}

          {/* ── How It Works ── */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#1B5FA8] mb-6">How the Meta Tags Generator Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '1', icon: '🎯', title: 'Enter Your Keyword', desc: 'Type your target keyword and page title. Add an optional description hint for more accurate output.' },
                { step: '2', icon: '⚡', title: 'AI Generates Your Tags', desc: 'Our AI crafts an SEO-optimised title and meta description sized to Google\'s recommended character limits.' },
                { step: '3', icon: '📋', title: 'Copy and Publish', desc: 'Copy your tags directly and paste them into your CMS, WordPress, or HTML head tag — ready to go.' },
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
            <h2 className="text-base font-bold text-[#1B5FA8] mb-4">💡 Tips for Better Meta Tags</h2>
            <ul className="space-y-3">
              {[
                'Include your primary keyword as close to the start of the SEO title as possible — Google weighs the first words more heavily.',
                'Keep your meta title between 50–60 characters. Anything longer gets cut off in search results.',
                'Your meta description should be 140–160 characters and include a clear benefit or call to action.',
                'Avoid duplicate meta tags across pages — each page needs a unique title and description.',
                'Use numbers, power words and questions in your title to increase click-through rate (e.g. "7 Ways to…", "How to…", "Best…").',
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
                { q: 'What are meta tags and why do they matter?', a: 'Meta tags are HTML elements that tell search engines and social platforms what your page is about. A well-written meta title and description directly influence your click-through rate from Google search results.' },
                { q: 'Is this meta tags generator free?', a: 'Yes — the core meta title and description generator is completely free. Pro users also get A/B title variations and Open Graph / Twitter card tags.' },
                { q: 'What is the ideal meta title length?', a: 'Google displays roughly 50–60 characters for page titles. Titles longer than 60 characters get truncated with "…" in search results, so staying within this range is important.' },
                { q: 'What is the ideal meta description length?', a: 'Meta descriptions should be 140–160 characters. Shorter descriptions miss an opportunity to sell the click; longer ones get cut off by Google.' },
                { q: 'Do meta descriptions affect SEO rankings?', a: 'Meta descriptions are not a direct ranking factor, but they significantly impact click-through rate — which does affect your rankings indirectly. A compelling description gets more clicks.' },
                { q: 'What are Open Graph tags?', a: 'Open Graph (OG) tags control how your page appears when shared on social media platforms like Facebook and LinkedIn. They let you set a custom title, description and image for social sharing.' },
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
