'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Processing Steps ─────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Analyzing keyword…',       icon: '🔍' },
  { label: 'Detecting search intent…', icon: '🧠' },
  { label: 'Clustering keywords…',     icon: '🗂️' },
  { label: 'Preparing SEO structure…', icon: '⚙️' },
]
const STEP_DELAYS = [700, 950, 900, 800]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Keyword-aware Data Generator ────────────────────────────────────────────
// Maps keyword categories → realistic SEO sample data.
// No fake metrics — just plausible keyword/content structures.

const DATA_SETS = [
  {
    match: ['fitness', 'workout', 'gym', 'exercise', 'weight', 'muscle', 'diet', 'health'],
    intent: 'Informational',
    intentColor: '#1B5FA8',
    volume: '14,800',
    difficulty: '42 / 100',
    primary:   ['fitness blog for beginners', 'home workout routine', 'fitness tips for women'],
    longtail:  ['best home workout routine without equipment', 'how to start a fitness blog and make money', 'beginner gym workout plan for weight loss', 'full body workout 3 days a week'],
    lsi:       ['exercise motivation', 'healthy lifestyle tips', 'calorie deficit explained', 'HIIT training benefits'],
    content:   ['10 Best Home Workouts for Beginners (No Equipment)', 'How to Start a Fitness Blog: Complete 2025 Guide', 'The Ultimate 12-Week Weight Loss Workout Plan', '7 Science-Backed Tips to Build Muscle Faster', 'Cardio vs Strength Training: Which Burns More Fat?', 'How to Stay Consistent With Your Fitness Goals'],
  },
  {
    match: ['saas', 'software', 'pricing', 'startup', 'product', 'app', 'tool', 'platform'],
    intent: 'Commercial',
    intentColor: '#C9943A',
    volume: '8,200',
    difficulty: '58 / 100',
    primary:   ['saas pricing strategy', 'saas pricing models', 'saas pricing page best practices'],
    longtail:  ['how to price a saas product for the first time', 'saas pricing tiers freemium vs premium', 'best saas pricing models for b2b startups', 'value-based pricing for saas companies'],
    lsi:       ['monthly recurring revenue', 'churn rate optimization', 'customer lifetime value', 'freemium conversion rate'],
    content:   ['SaaS Pricing Strategy: 7 Models That Actually Work', 'How to Build a High-Converting SaaS Pricing Page', 'Freemium vs Free Trial: Which Gets More Signups?', 'Value-Based Pricing for SaaS: A Step-by-Step Guide', 'How Top SaaS Companies Structure Their Pricing Tiers', 'Reducing Churn With the Right Pricing Psychology'],
  },
  {
    match: ['seo', 'keyword', 'ranking', 'google', 'search', 'backlink', 'traffic', 'organic'],
    intent: 'Informational',
    intentColor: '#1B5FA8',
    volume: '22,100',
    difficulty: '67 / 100',
    primary:   ['keyword research for beginners', 'seo keyword strategy', 'how to rank on google'],
    longtail:  ['how to do keyword research for a new website', 'best free keyword research tools 2025', 'long tail keywords vs short tail keywords seo', 'how to find low competition keywords quickly'],
    lsi:       ['search intent optimization', 'on-page seo checklist', 'domain authority building', 'content gap analysis'],
    content:   ['Keyword Research in 2025: The Complete Beginner Guide', 'How to Find Low-Competition Keywords That Actually Rank', '10 Best Free SEO Tools for Small Businesses', 'On-Page SEO Checklist: 15 Things to Fix This Week', 'How to Build Backlinks Without Paying for Them', 'Topical Authority: Why It Beats Single Keywords'],
  },
  {
    match: ['ecommerce', 'shopify', 'store', 'product', 'sell', 'dropship', 'amazon', 'shop'],
    intent: 'Commercial',
    intentColor: '#C9943A',
    volume: '18,500',
    difficulty: '61 / 100',
    primary:   ['ecommerce seo strategy', 'shopify seo tips', 'product page optimization'],
    longtail:  ['how to rank ecommerce product pages on google', 'shopify seo checklist for new stores 2025', 'best categories structure for ecommerce seo', 'how to write product descriptions for seo'],
    lsi:       ['structured data for products', 'category page SEO', 'ecommerce site speed', 'user-generated content SEO'],
    content:   ['Shopify SEO: The 2025 Step-by-Step Checklist', 'How to Write Product Descriptions That Rank and Convert', 'Ecommerce Category Pages: SEO Structure That Works', 'How to Use Schema Markup to Boost Product Visibility', 'Site Speed and Ecommerce SEO: What You Need to Know', '7 Ways to Get Backlinks for Your Online Store'],
  },
  {
    match: ['blog', 'content', 'writing', 'article', 'post', 'copywriting', 'marketing'],
    intent: 'Informational',
    intentColor: '#1B5FA8',
    volume: '11,400',
    difficulty: '38 / 100',
    primary:   ['content marketing strategy', 'how to write a blog post', 'content writing for seo'],
    longtail:  ['how to write a blog post that ranks on google', 'content marketing strategy for small business 2025', 'how often should you post on your blog for seo', 'ai content writing tools compared'],
    lsi:       ['editorial content calendar', 'content repurposing strategy', 'E-E-A-T signals', 'pillar page and cluster model'],
    content:   ['How to Write a Blog Post That Ranks in 2025', 'Content Marketing Strategy: Build an Audience From Zero', 'The Pillar-Cluster Content Model Explained Simply', 'How to Use AI Tools Without Hurting Your SEO', 'Blog Posting Frequency: What Google Actually Wants', 'Repurposing Content: Turn One Post Into 10 Assets'],
  },
  {
    match: ['social', 'instagram', 'tiktok', 'linkedin', 'twitter', 'youtube', 'video', 'reel'],
    intent: 'Informational',
    intentColor: '#1B5FA8',
    volume: '9,700',
    difficulty: '44 / 100',
    primary:   ['social media content strategy', 'instagram seo tips', 'linkedin content ideas'],
    longtail:  ['how to grow instagram account with seo in 2025', 'best time to post on linkedin for b2b reach', 'tiktok seo hashtag strategy for small creators', 'youtube seo how to rank videos fast'],
    lsi:       ['social signals and seo', 'video transcript indexing', 'cross-platform content repurposing', 'creator economy monetization'],
    content:   ['Instagram SEO in 2025: Get Found Without Paid Ads', 'LinkedIn Content Strategy That Grows Your B2B Leads', 'How to Optimize Your YouTube Videos for Search', 'TikTok SEO: Use Keywords Not Just Hashtags', 'Social Media Content Calendar: 30-Day Template', 'How to Repurpose One Blog Post Across 5 Platforms'],
  },
]

const DEFAULT_DATA = {
  intent: 'Informational',
  intentColor: '#1B5FA8',
  volume: '6,300',
  difficulty: '35 / 100',
  primary:   ['best tools for beginners', 'how to get started with', 'complete guide to'],
  longtail:  ['step by step guide for beginners 2025', 'best free resources to learn online', 'how to improve results quickly without experience', 'top rated strategies that actually work'],
  lsi:       ['beginner tips and tricks', 'expert recommended approach', 'industry best practices', 'common mistakes to avoid'],
  content:   ['The Complete Beginner\'s Guide (Updated 2025)', 'Top 10 Strategies That Actually Deliver Results', 'How to Get Started: A Step-by-Step Walkthrough', 'Common Mistakes Beginners Make (And How to Avoid Them)', 'Best Free Tools and Resources to Get Started Fast', 'How the Experts Do It: Proven Frameworks That Work'],
}

function getDataForKeyword(kw) {
  const lower = kw.toLowerCase()
  const match = DATA_SETS.find((d) => d.match.some((m) => lower.includes(m)))
  if (match) return match

  // Inject the keyword into generic default copy so it feels personalised
  const title = kw.charAt(0).toUpperCase() + kw.slice(1)
  return {
    ...DEFAULT_DATA,
    primary:  [`${kw} for beginners`, `best ${kw} strategy`, `${kw} tips and tricks`],
    longtail: [`how to improve ${kw} results in 2025`, `best free tools for ${kw} beginners`, `${kw} step by step guide for small businesses`, `top ${kw} mistakes and how to fix them`],
    lsi:      [`${kw} best practices`, `${kw} industry trends`, `${kw} expert tips`, `${kw} common mistakes`],
    content:  [
      `The Complete ${title} Guide for 2025`,
      `Top 10 ${title} Strategies That Actually Work`,
      `How to Master ${title}: Step-by-Step Walkthrough`,
      `${title} Mistakes Beginners Make (And How to Avoid Them)`,
      `Best Free Tools to Improve Your ${title} Results`,
      `How Experts Approach ${title}: Frameworks That Deliver`,
    ],
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INTENT_COLORS = {
  Informational: { bg: 'bg-[#e6eef8]', text: 'text-[#1B5FA8]', dot: 'bg-[#1B5FA8]' },
  Commercial:    { bg: 'bg-[#fef3e2]', text: 'text-[#C9943A]', dot: 'bg-[#C9943A]' },
  Navigational:  { bg: 'bg-[#e1f5ee]', text: 'text-[#0D9488]', dot: 'bg-[#0D9488]' },
  Transactional: { bg: 'bg-purple-50',  text: 'text-purple-600', dot: 'bg-purple-500' },
}

// ─── StepList ─────────────────────────────────────────────────────────────────

function StepList({ currentStep }) {
  return (
    <div className="space-y-2.5 mb-6">
      {STEPS.map((s, i) => {
        const done    = i < currentStep
        const active  = i === currentStep
        const pending = i > currentStep
        return (
          <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${pending ? 'opacity-30' : 'opacity-100'}`}>
            <span className="relative flex items-center justify-center w-5 h-5 shrink-0">
              {done && (
                <span className="w-4 h-4 rounded-full bg-[#0D9488] flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              {active && (
                <>
                  <span className="absolute w-4 h-4 rounded-full bg-[#1B5FA8] opacity-30 animate-ping" />
                  <span className="w-3 h-3 rounded-full bg-[#1B5FA8]" />
                </>
              )}
              {pending && <span className="w-3 h-3 rounded-full bg-gray-300" />}
            </span>
            <span className={`font-medium transition-colors duration-200 ${done ? 'text-[#0D9488]' : active ? 'text-[#1B5FA8]' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── LoadingPanel ─────────────────────────────────────────────────────────────

function LoadingPanel({ currentStep }) {
  return (
    <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden animate-[fadeUp_0.35s_ease_forwards]">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-300 animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          {STEPS[currentStep]?.icon} {STEPS[currentStep]?.label}
        </span>
      </div>
      <div className="p-5">
        <StepList currentStep={currentStep} />
        <div className="grid grid-cols-3 gap-3">
          {['Search Volume', 'Difficulty', 'Intent'].map((label) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-2">{label}</p>
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── KeywordRow ───────────────────────────────────────────────────────────────

function KeywordRow({ text, locked = false, accent = '#1B5FA8' }) {
  return (
    <div className={`flex items-center gap-2 py-1.5 ${locked ? 'select-none' : ''}`}>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: locked ? '#d1d5db' : accent }}
      />
      <span
        className={`text-sm leading-snug ${locked ? 'blur-[4px] text-gray-400 pointer-events-none' : 'text-gray-700'}`}
      >
        {text}
      </span>
      {locked && (
        <span className="ml-auto text-[10px] text-gray-300 shrink-0">🔒</span>
      )}
    </div>
  )
}

// ─── ContentIdeaRow ───────────────────────────────────────────────────────────

function ContentIdeaRow({ text, index, locked = false }) {
  return (
    <div className={`flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 ${locked ? 'select-none' : ''}`}>
      <span className={`text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${locked ? 'bg-gray-100 text-gray-300' : 'bg-[#e6eef8] text-[#1B5FA8]'}`}>
        {index + 1}
      </span>
      <span className={`text-sm leading-snug ${locked ? 'blur-[4px] text-gray-400 pointer-events-none' : 'text-gray-700'}`}>
        {text}
      </span>
      {locked && <span className="ml-auto text-[10px] text-gray-300 shrink-0 mt-0.5">🔒</span>}
    </div>
  )
}

// ─── ResultPanel ──────────────────────────────────────────────────────────────

function ResultPanel({ keyword }) {
  const data = getDataForKeyword(keyword)
  const ic   = INTENT_COLORS[data.intent] || INTENT_COLORS.Informational

  // Visible / locked split
  const primaryVisible   = data.primary.slice(0, 2)
  const primaryLocked    = data.primary.slice(2)
  const longtailVisible  = data.longtail.slice(0, 2)
  const longtailLocked   = data.longtail.slice(2)
  const lsiVisible       = data.lsi.slice(0, 2)
  const lsiLocked        = data.lsi.slice(2)
  const contentVisible   = data.content.slice(0, 3)
  const contentLocked    = data.content.slice(3)

  return (
    <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden animate-[fadeUp_0.4s_ease_forwards]">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#e1f5ee] text-[#0D9488] font-semibold px-2.5 py-0.5 rounded-full">
            ✓ Analysis ready
          </span>
          <span className="text-[11px] text-gray-400 font-mono truncate max-w-[120px]">"{keyword}"</span>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* ── Completed steps ── */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#0D9488] font-medium">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0D9488] flex items-center justify-center shrink-0">
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {s.label.replace('…', '')}
            </div>
          ))}
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Search Volume */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-1.5">Search Volume</p>
            <p className="text-lg font-bold text-gray-800 leading-none">{data.volume}</p>
            <p className="text-[10px] text-gray-400 mt-1">/ month · sample</p>
          </div>
          {/* Difficulty */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-1.5">Difficulty</p>
            <p className="text-lg font-bold text-gray-800 leading-none">{data.difficulty}</p>
            <p className="text-[10px] text-gray-400 mt-1">KD score · sample</p>
          </div>
          {/* Intent */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-1.5">Intent</p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${ic.bg} ${ic.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${ic.dot}`} />
              {data.intent}
            </span>
          </div>
        </div>

        {/* ── Keyword Clusters ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keyword Clusters</p>
            <span className="text-[10px] text-gray-300">Sample preview</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Primary */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-[#1B5FA8] mb-2 uppercase tracking-wide">Primary</p>
              {primaryVisible.map((kw, i) => <KeywordRow key={i} text={kw} accent="#1B5FA8" />)}
              {primaryLocked.map((kw, i)  => <KeywordRow key={`l${i}`} text={kw} locked />)}
            </div>
            {/* Long-tail */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-[#0D9488] mb-2 uppercase tracking-wide">Long-tail</p>
              {longtailVisible.map((kw, i) => <KeywordRow key={i} text={kw} accent="#0D9488" />)}
              {longtailLocked.map((kw, i)  => <KeywordRow key={`l${i}`} text={kw} locked />)}
            </div>
            {/* LSI */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-[#C9943A] mb-2 uppercase tracking-wide">LSI / Related</p>
              {lsiVisible.map((kw, i) => <KeywordRow key={i} text={kw} accent="#C9943A" />)}
              {lsiLocked.map((kw, i)  => <KeywordRow key={`l${i}`} text={kw} locked />)}
            </div>
          </div>
        </div>

        {/* ── Content Ideas ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content Ideas</p>
            <span className="text-[10px] text-gray-300">Sample preview</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2">
            {contentVisible.map((title, i) => (
              <ContentIdeaRow key={i} text={title} index={i} />
            ))}
            {contentLocked.map((title, i) => (
              <ContentIdeaRow key={`l${i}`} text={title} index={contentVisible.length + i} locked />
            ))}
          </div>
        </div>

        {/* ── Upgrade CTA ── */}
        <div className="border border-dashed border-[#c7d8ef] bg-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Unlock full results + live data</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Connect your API to replace sample data with real-time keyword intelligence.
            </p>
          </div>
          <Link
            href="/auth?mode=signup"
            className="shrink-0 bg-[#1B5FA8] hover:bg-[#154d8c] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Get Full Access →
          </Link>
        </div>

      </div>
    </div>
  )
}

// ─── Auto-demo keywords ───────────────────────────────────────────────────────
const AUTO_KEYWORDS = ['fitness blog', 'saas pricing', 'ecommerce SEO', 'content marketing']

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function InteractiveDemo() {
  const [keyword, setKeyword]  = useState('')
  const [phase, setPhase]      = useState('idle')   // idle | typing | loading | result
  const [currentStep, setStep] = useState(0)
  const [autoRan, setAutoRan]  = useState(false)

  // Auto-run once on mount: typewriter → generate
  useEffect(() => {
    if (autoRan) return
    setAutoRan(true)
    const demo = AUTO_KEYWORDS[0]
    let i = 0
    setPhase('typing')
    const typer = setInterval(() => {
      i++
      setKeyword(demo.slice(0, i))
      if (i >= demo.length) {
        clearInterval(typer)
        setTimeout(() => runGenerate(demo), 600)
      }
    }, 60)
    return () => clearInterval(typer)
  }, [])

  async function runGenerate(kw) {
    setPhase('loading')
    setStep(0)
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await sleep(STEP_DELAYS[i])
    }
    setPhase('result')
  }

  async function handleGenerate() {
    if (!keyword.trim() || phase === 'loading') return
    await runGenerate(keyword)
  }

  function handleReset() {
    setPhase('idle')
    setStep(0)
    setKeyword('')
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-blue-50/40 to-white border-b border-gray-200">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold text-[#1B5FA8] bg-[#e6eef8] border border-[#c7d8ef] px-3 py-1.5 rounded-full mb-4">
            ⚡ Try it now — no signup needed
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            See Rankivo in Action
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
            Enter any keyword and watch the AI SEO strategy engine run step by step.
          </p>
        </div>

        {/* Input */}
        <div className="flex items-center border-2 border-[#1B5FA8] rounded-2xl overflow-hidden bg-white shadow-[0_0_0_4px_rgba(27,95,168,0.07)] focus-within:shadow-[0_0_0_6px_rgba(27,95,168,0.12)] transition-shadow">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={phase === 'loading'}
            placeholder="e.g. fitness blog, SaaS pricing, ecommerce SEO…"
            className="flex-1 px-5 py-4 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          {phase === 'result' ? (
            <button
              onClick={handleReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-5 py-3 m-1.5 rounded-xl transition-colors whitespace-nowrap"
            >
              ↩ Reset
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!keyword.trim() || phase === 'loading'}
              className="bg-[#1B5FA8] hover:bg-[#154d8c] disabled:bg-[#93aece] disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-3 m-1.5 rounded-xl transition-colors whitespace-nowrap"
            >
              {phase === 'loading' ? 'Analyzing…' : 'Generate Strategy'}
            </button>
          )}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          Sample preview · Structured SEO output · Connect API for live data
        </p>

        {/* Panels */}
        {phase === 'loading' && <LoadingPanel currentStep={currentStep} />}
        {phase === 'result'  && <ResultPanel  keyword={keyword} />}

      </div>
    </section>
  )
}
