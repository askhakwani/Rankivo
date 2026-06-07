'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 'stage',
    question: 'Where are you right now?',
    options: [
      { id: 'new',      icon: '🌱', label: 'Brand new',               desc: 'No website content yet — starting from scratch' },
      { id: 'existing', icon: '📝', label: 'Have content, not ranking', desc: 'Publishing but getting little to no organic traffic' },
      { id: 'scaling',  icon: '🚀', label: 'Ranking, want to scale',   desc: 'Getting some traffic but want to grow faster' },
    ],
  },
  {
    id: 'goal',
    question: 'What is your main goal?',
    options: [
      { id: 'traffic',   icon: '📈', label: 'Get more traffic',    desc: 'Bring more people to my website from Google' },
      { id: 'leads',     icon: '💰', label: 'Generate more leads', desc: 'Turn visitors into enquiries and paying customers' },
      { id: 'authority', icon: '🏆', label: 'Build authority',     desc: 'Become the go-to expert in my niche' },
    ],
  },
  {
    id: 'timeline',
    question: 'What is your timeline?',
    options: [
      { id: '1month',  icon: '⚡', label: '1 month',   desc: 'I want results as fast as possible' },
      { id: '3months', icon: '📅', label: '3 months',  desc: 'I am building steadily for the medium term' },
      { id: '6months', icon: '🎯', label: '6+ months', desc: 'I am committed to long-term organic growth' },
    ],
  },
]

function getRecommendation(answers) {
  const { stage, goal, timeline } = answers

  // Full Strategy for scaling/authority/long-term
  if (
    stage === 'scaling' ||
    goal === 'authority' ||
    timeline === '6months' ||
    (goal === 'leads' && stage === 'existing')
  ) {
    return {
      package: 'Full Strategy',
      price: '$59',
      reason: 'Based on your answers, you need a comprehensive strategy — keyword clusters, a 30-day content calendar, internal linking plan and a manual competitor review. This gives you a complete system, not just a list of topics.',
      includes: [
        '🎯 Exact keywords to target with volume + difficulty scores',
        '📅 30-day content calendar — every article, in order, mapped to a keyword',
        '🔗 Internal linking plan — which pages link to which, and why',
        '🏷️ Meta title + description recommendations for existing pages',
        '🕵️ Manual competitor blog review (up to 3 competitors)',
        '📋 Topic gap list based on competitor review',
      ],
      urgency: timeline === '1month'
        ? '⚡ Given your 1-month timeline, we recommend starting immediately — email sales@rankivo.co today.'
        : null,
    }
  }

  // Basic Strategy for everyone else
  return {
    package: 'Basic Strategy',
    price: '$29',
    reason: 'Based on your answers, the Basic Strategy gives you exactly what you need right now — the right keywords, a clear content plan and meta recommendations to start ranking faster.',
    includes: [
      '🎯 Exact keywords to target with volume + difficulty scores',
      '📅 10-topic content plan — every article mapped to a keyword',
      '🔗 Internal linking plan — which pages link to which, and why',
      '🏷️ Meta title + description recommendations for existing pages',
    ],
    urgency: timeline === '1month'
      ? '⚡ Given your 1-month timeline, we recommend starting immediately — email sales@rankivo.co today.'
      : null,
  }
}

// ─── Strategy Scope Builder ───────────────────────────────────────────────────

function ScopeBuilder() {
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const currentQ = QUESTIONS[step]
  const totalSteps = QUESTIONS.length
  const allAnswered = Object.keys(answers).length === totalSteps

  function selectOption(questionId, optionId) {
    const newAnswers = { ...answers, [questionId]: optionId }
    setAnswers(newAnswers)
    if (step < totalSteps - 1) {
      setTimeout(() => setStep(s => s + 1), 300)
    } else {
      setTimeout(() => setShowResult(true), 300)
    }
  }

  function reset() {
    setAnswers({})
    setStep(0)
    setShowResult(false)
  }

  const recommendation = allAnswered ? getRecommendation(answers) : null

  if (showResult && recommendation) {
    return (
      <div className="bg-white border-2 border-[#1B5FA8]/20 rounded-2xl overflow-hidden">
        <div className="bg-[#1B5FA8] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Your Recommended Package</p>
            <h3 className="text-white font-bold text-xl">{recommendation.package} — {recommendation.price}</h3>
          </div>
          <button onClick={reset} className="text-white/60 hover:text-white text-xs font-semibold underline transition-colors">
            Start over
          </button>
        </div>
        <div className="p-6 md:p-8">
          <p className="text-sm text-gray-600 leading-relaxed mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
            💡 {recommendation.reason}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What's included in your strategy</p>
          <ul className="space-y-3 mb-6">
            {recommendation.includes.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-[#0D9488] font-bold shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
          {recommendation.urgency && (
            <div className="bg-[#C9943A]/10 border border-[#C9943A]/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-[#C9943A] font-semibold">{recommendation.urgency}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#inquiry"
              className="flex-1 block text-center py-3 rounded-xl font-bold text-sm bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white transition-colors">
              Get This Strategy — {recommendation.price} →
            </a>
            <button onClick={reset}
              className="flex-1 block text-center py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 hover:border-[#1B5FA8] text-gray-500 hover:text-[#1B5FA8] transition-colors">
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-[#1B5FA8]/20 rounded-2xl overflow-hidden">
      {/* Progress bar */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question {step + 1} of {totalSteps}</p>
          <p className="text-xs text-gray-400">{Math.round(((step) / totalSteps) * 100)}% complete</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-[#1B5FA8] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((step) / totalSteps) * 100}%` }} />
        </div>
      </div>

      <div className="p-6 md:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{currentQ.question}</h3>
        <div className="space-y-3">
          {currentQ.options.map(opt => (
            <button key={opt.id} onClick={() => selectOption(currentQ.id, opt.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-[#1B5FA8] hover:shadow-md ${
                answers[currentQ.id] === opt.id
                  ? 'border-[#1B5FA8] bg-[#1B5FA8]/5'
                  : 'border-gray-200'
              }`}>
              <span className="text-2xl shrink-0">{opt.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.desc}</p>
              </div>
              {answers[currentQ.id] === opt.id && (
                <span className="ml-auto shrink-0 w-5 h-5 rounded-full bg-[#1B5FA8] flex items-center justify-center text-white text-xs font-bold">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Back button */}
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Comparison Cell ──────────────────────────────────────────────────────────

function Cell({ value }) {
  if (value === true)         return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-bold">✓</span>
  if (value === false)        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-400 text-sm font-bold">✗</span>
  if (value === 'Full only')  return <span className="text-xs font-semibold text-[#1B5FA8] bg-[#1B5FA8]/8 px-2 py-1 rounded-full">Full only</span>
  return null
}

// ─── Inquiry Form ─────────────────────────────────────────────────────────────

function InquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', package: '', website: '', niche: '', details: '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.package) return
    setStatus('sending')
    console.log('Content Strategy inquiry:', form)
    await new Promise(r => setTimeout(r, 800))
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#0D9488]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received</h3>
        <p className="text-gray-500">Our team will reply to <strong>{form.email}</strong> within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input name="name" value={form.name} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="Your name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Package *</label>
        <select name="package" value={form.package} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] bg-white">
          <option value="">Select a package…</option>
          <option>Basic Strategy — $29</option>
          <option>Full Strategy — $59</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Website URL</label>
        <input name="website" value={form.website} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="https://yourwebsite.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Niche</label>
        <input name="niche" value={form.niche} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. SaaS, Health, E-commerce" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Details</label>
        <textarea name="details" value={form.details} onChange={handleChange} rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] resize-none"
          placeholder="Tell us about your business, target audience, current content situation and main competitors (for Full Strategy)…" />
      </div>
      <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
        <button onClick={handleSubmit}
          disabled={status === 'sending' || !form.name || !form.email || !form.package}
          className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors">
          {status === 'sending' ? 'Sending…' : 'Send Inquiry →'}
        </button>
        <p className="text-xs text-gray-400">Reply within 24 hours · Email only · No calls</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentStrategyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#1B5FA8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#0D9488]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#1B5FA8]/10 border border-[#1B5FA8]/30 text-[#1B5FA8] text-sm px-4 py-2 rounded-full mb-6 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#1B5FA8] animate-pulse" />
            Content Strategy · Keyword-Led · Built to Rank
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
            Before You Write<br />
            <span className="text-[#1B5FA8]">a Single Word —<br className="hidden md:block" /> Know It Will Rank.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            Most businesses publish content and hope for the best. The ones that rank
            <strong className="text-gray-700"> publish with a plan.</strong> We build that plan for you — every keyword researched, every article mapped, every internal link planned before you write word one.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {[
              { icon: '🎯', text: 'Keyword research' },
              { icon: '📅', text: 'Content calendar' },
              { icon: '🔗', text: 'Internal linking plan' },
              { icon: '🏷️', text: 'Meta recommendations' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 font-medium shadow-sm">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#scope-builder" className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1B5FA8]/20 text-center">
              Find My Strategy →
            </a>
            <a href="#pricing" className="w-full sm:w-auto border-2 border-gray-300 hover:border-[#1B5FA8] text-gray-600 hover:text-[#1B5FA8] px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── What You Get ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Stop Guessing. Start Ranking.</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Every deliverable is designed to answer one question — exactly what do I publish next, and why will it rank?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: '🎯',
                label: 'The Exact Keywords to Target',
                color: '#1B5FA8',
                desc: 'No more guessing which keywords are worth your time. Every keyword comes with real search volume and difficulty scores — so you know exactly which ones you can rank for fast.',
              },
              {
                icon: '📅',
                label: 'Your Complete Content Plan',
                color: '#0D9488',
                desc: 'Every article you need to write, in the right order, mapped to a keyword. No more staring at a blank screen. No more publishing random posts that go nowhere.',
              },
              {
                icon: '🔗',
                label: 'Who Links to Who',
                color: '#1B5FA8',
                desc: 'Exactly which pages on your site should link to each other — and why. This is how Google understands your site structure and ranks your most important pages higher.',
              },
              {
                icon: '🏷️',
                label: 'Meta Fixes That Drive Clicks',
                color: '#0D9488',
                desc: 'Your title tags and meta descriptions rewritten to get more clicks from Google. Because ranking is only half the battle — getting the click is the other half.',
              },
              {
                icon: '🕵️',
                label: 'What Your Competitors Miss',
                color: '#C9943A',
                desc: 'We manually review up to 3 competitor blogs and find the topics they\'re not covering. Those gaps are your fastest path to rankings nobody else is competing for. (Full Strategy only)',
                tag: 'Full Strategy',
              },
              {
                icon: '📊',
                label: 'A 30-Day Publishing Roadmap',
                color: '#C9943A',
                desc: 'A day-by-day content calendar so you always know what to publish next. Consistency beats everything in SEO — this makes consistency effortless. (Full Strategy only)',
                tag: 'Full Strategy',
              },
            ].map((d) => (
              <div key={d.label} className={`bg-white border rounded-xl p-6 hover:shadow-md transition-all group ${d.tag ? 'border-[#C9943A]/30 hover:border-[#C9943A]/50' : 'border-gray-200 hover:border-[#1B5FA8]/40'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: d.color + '15' }}>
                    {d.icon}
                  </div>
                  {d.tag && (
                    <span className="text-[10px] font-bold bg-[#C9943A]/15 text-[#C9943A] border border-[#C9943A]/30 px-2 py-0.5 rounded-full">
                      {d.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{d.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scope Builder ─────────────────────────────────────────────────── */}
      <section id="scope-builder" className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Find Your Right Strategy</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Answer 3 quick questions and we'll recommend the right package for your exact situation — with a full breakdown of what's included.
          </p>
          <ScopeBuilder />
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Two Packages. One Goal.</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Both are one-off projects — no subscriptions. You get your strategy document, ready to execute.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'Basic Strategy',
                price: '$29',
                volume: 'One-off · delivered in 3–5 days',
                desc: 'For businesses that need a clear starting point — the right keywords, a content plan and meta fixes to start ranking faster.',
                features: [
                  '🎯 Keyword research with volume + difficulty scores',
                  '📅 10-topic content plan mapped to keywords',
                  '🔗 Internal linking plan (who links to who)',
                  '🏷️ Meta title + description recommendations',
                ],
                style: 'border-gray-200',
                ctaStyle: 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600',
              },
              {
                name: 'Full Strategy',
                price: '$59',
                volume: 'One-off · delivered in 5–7 days',
                desc: 'For businesses serious about long-term organic growth — a complete content system with competitor research and a 30-day roadmap.',
                features: [
                  '🎯 Keyword research with volume + difficulty scores',
                  '📅 30-day content calendar mapped to keywords',
                  '🔗 Internal linking plan (who links to who)',
                  '🏷️ Meta title + description recommendations',
                  '🕵️ Manual competitor blog review (up to 3)',
                  '📋 Topic gap list from competitor review',
                ],
                style: 'border-[#1B5FA8]',
                ctaStyle: 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white',
                highlight: true,
              },
            ].map((pkg) => (
              <div key={pkg.name} className={`relative rounded-xl p-6 border-2 shadow-sm bg-white flex flex-col ${pkg.style}`}>
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                </div>
                <p className="text-sm text-[#0D9488] font-semibold mb-2">{pkg.volume}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-5">{pkg.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="shrink-0">{f.split(' ')[0]}</span>
                      <span>{f.split(' ').slice(1).join(' ')}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <a href="#inquiry" className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${pkg.ctaStyle}`}>
                    Get Started
                  </a>
                  <a href="#scope-builder" className="block text-center py-2 text-xs font-medium text-gray-400 hover:text-[#1B5FA8] transition-colors">
                    Not sure which? Take the quiz →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Honest note */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              <strong className="text-gray-700">Honest note:</strong> The competitor review in the Full Strategy is a manual analysis of up to 3 competitor blogs. It works best for small to mid-size competitors — not for reviewing massive authority sites with thousands of articles.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-white">From Zero Plan to Full Roadmap</h2>
          <p className="text-white/70 mb-12 max-w-lg mx-auto text-sm">Three steps. Delivered to your inbox. Ready to execute.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Brief Us',          desc: 'Tell us your niche, website URL, target audience and main competitors (Full Strategy). Email sales@rankivo.co to start.' },
              { step: '2', title: 'We Research',        desc: 'We run keyword research, map your content plan, build your internal linking structure and review competitors where included.' },
              { step: '3', title: 'You Execute',        desc: 'Receive your complete strategy document by email. Every decision already made — you just need to publish.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold mb-4 border-2 border-white/30">
                  {s.step}
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Cross-link ─────────────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Start researching right now</p>
            <h3 className="font-bold text-gray-900 text-lg">Try our AI Keyword Research tool — free</h3>
            <p className="text-sm text-gray-500 mt-1">Find keywords instantly with volume, difficulty and intent data. Free to try — no credit card.</p>
          </div>
          <Link href="/tools/keyword-research"
            className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
            Try Keyword Research Free →
          </Link>
        </div>
      </section>

      {/* ── Inquiry Form ──────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Build Your Strategy?</h2>
            <p className="text-gray-500">Tell us about your business and we'll reply within 24 hours with next steps.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <InquiryForm />
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Or email directly at <strong>sales@rankivo.co</strong> · We reply within 24 hours · No calls, no pressure
          </p>
        </div>
      </section>

      <div className="py-6 px-6 bg-gray-50 text-center border-t border-gray-100">
        <Link href="/services/human-writing" className="text-sm text-gray-400 hover:text-[#1B5FA8] transition-colors">
          ← View all human writing services
        </Link>
      </div>

      <Footer />
    </div>
  )
}
