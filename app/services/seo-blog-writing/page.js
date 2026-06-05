'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPARISON = [
  { feature: 'Sounds genuinely human',      ai: 'sometimes', human: true,  rankivo: true  },
  { feature: 'Ranks on Google',             ai: 'sometimes', human: true,  rankivo: true  },
  { feature: 'Full on-page SEO',            ai: false,       human: 'extra cost', rankivo: true },
  { feature: 'Copyscape report included',   ai: false,       human: 'extra cost', rankivo: true },
  { feature: 'Meta title + description',    ai: false,       human: 'extra cost', rankivo: true },
  { feature: 'Keyword-led structure',       ai: 'sometimes', human: true,  rankivo: true  },
  { feature: 'Fast turnaround',             ai: true,        human: false, rankivo: true  },
  { feature: 'Affordable pricing',          ai: true,        human: false, rankivo: true  },
]

const PACKAGES = [
  {
    name: 'Starter',
    price: '$5',
    period: 'one-off',
    volume: '1 article · up to 1,000 words',
    desc: 'Test our quality with zero commitment. One great article, delivered to your inbox.',
    features: [
      'Up to 1,000 words',
      'Full on-page SEO optimisation',
      'Primary + secondary keyword placement',
      'Meta title + meta description',
      'Copyscape plagiarism report',
      'H1 / H2 / H3 structure',
      'Human-crafted & expert-reviewed',
    ],
    cta: 'Get Started',
    style: 'border-gray-200',
    highlight: false,
    ctaStyle: 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600',
  },
  {
    name: 'Growth',
    price: '$19',
    period: '/month',
    volume: '5 articles/month',
    desc: 'Build consistent content momentum. Fresh articles every month, fully SEO-ready.',
    features: [
      '5 articles/month (up to 1,500 words each)',
      'Full on-page SEO optimisation',
      'Keyword research per article',
      'Meta title + meta description',
      'Copyscape plagiarism report',
      'Internal linking suggestions',
      'H1 / H2 / H3 structure',
      'Human-crafted & expert-reviewed',
      'Priority turnaround',
    ],
    cta: 'Get Started',
    style: 'border-[#1B5FA8]',
    highlight: true,
    ctaStyle: 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white',
  },
  {
    name: 'Authority',
    price: '$49',
    period: '/month',
    volume: '15 articles/month',
    desc: 'Dominate your niche. High-volume content production with full strategy included.',
    features: [
      '15 articles/month (up to 2,000 words each)',
      'Full on-page SEO optimisation',
      'Keyword cluster research',
      'Meta title + meta description',
      'Copyscape plagiarism report',
      'Internal linking suggestions',
      'Content calendar included',
      'H1 / H2 / H3 structure',
      'Human-crafted & expert-reviewed',
      'Priority turnaround',
    ],
    cta: 'Get Started',
    style: 'border-[#0D9488]/40',
    highlight: false,
    ctaStyle: 'bg-[#0D9488] hover:bg-[#0D9488]/90 text-white',
  },
  {
    name: 'Agency',
    price: '$99',
    period: '/month',
    volume: '35 articles/month',
    desc: 'White label delivery. No Rankivo branding. NDA available. Built for resellers.',
    features: [
      '35 articles/month (up to 2,000 words each)',
      'Full on-page SEO optimisation',
      'Keyword cluster research',
      'Meta title + meta description',
      'Copyscape plagiarism report',
      'Internal linking suggestions',
      'Content calendar included',
      'White label delivery',
      'NDA available on request',
      'Dedicated account manager',
      'Priority turnaround',
    ],
    cta: 'Get Started',
    style: 'border-[#C9943A]/40',
    highlight: false,
    ctaStyle: 'bg-[#C9943A] hover:bg-[#C9943A]/90 text-white',
    gold: true,
  },
]

const DELIVERABLES = [
  { icon: '🎯', label: 'On-Page SEO',        desc: 'Keywords placed in title, H1, H2s, body and URL slug' },
  { icon: '✅', label: 'Copyscape Report',    desc: 'Plagiarism certificate attached on every delivery' },
  { icon: '🏷️', label: 'Meta Tags',           desc: 'Click-optimised title and description ready to paste' },
  { icon: '🔗', label: 'Internal Links',      desc: 'Linking suggestions to boost your site architecture' },
  { icon: '📐', label: 'Proper Structure',    desc: 'H1 / H2 / H3 hierarchy built for readers and crawlers' },
  { icon: '👤', label: 'Expert Review',       desc: 'Every article reviewed by an SEO editor before delivery' },
]

// ─── Inquiry Form ─────────────────────────────────────────────────────────────

function InquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', package: '', wordCount: '', niche: '', deadline: '', details: '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.package) return
    setStatus('sending')
    console.log('SEO Blog Writing inquiry:', form)
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
          <option>Starter — $5 (1 article)</option>
          <option>Growth — $19/mo (5 articles)</option>
          <option>Authority — $49/mo (15 articles)</option>
          <option>Agency — $99/mo (35 articles)</option>
          <option>Pay Per Word — custom</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Niche / Industry</label>
        <input name="niche" value={form.niche} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. SaaS, Health, E-commerce" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Word Count / Volume</label>
        <input name="wordCount" value={form.wordCount} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. 1,500 words or 10 articles" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
        <input name="deadline" value={form.deadline} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. within 1 week" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Details</label>
        <textarea name="details" value={form.details} onChange={handleChange} rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] resize-none"
          placeholder="Topics, target keywords, tone of voice, audience, any special requirements…" />
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

// ─── Comparison Cell ──────────────────────────────────────────────────────────

function Cell({ value }) {
  if (value === true)  return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-bold">✓</span>
  if (value === false) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-400 text-sm font-bold">✗</span>
  if (value === 'sometimes') return <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Sometimes</span>
  if (value === 'extra cost') return <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Extra cost</span>
  return null
}

// ─── Word Count Calculator ────────────────────────────────────────────────────

function Calculator() {
  const [words, setWords] = useState(1000)
  const price = ((words / 100) * 0.5).toFixed(2)

  return (
    <div className="bg-white border-2 border-[#1B5FA8]/20 rounded-2xl p-6 md:p-8">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Pay Per Word Calculator</h3>
          <p className="text-sm text-gray-500">$0.50 per 100 words · No hidden fees</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-[#1B5FA8]">${price}</p>
          <p className="text-sm text-gray-400 mt-0.5">for {words.toLocaleString()} words</p>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="500"
          max="5000"
          step="100"
          value={words}
          onChange={e => setWords(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1B5FA8 0%, #1B5FA8 ${((words - 500) / 4500) * 100}%, #e5e7eb ${((words - 500) / 4500) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>500 words</span>
          <span>5,000 words</span>
        </div>
      </div>

      {/* Quick picks */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[500, 1000, 1500, 2000, 3000].map(w => (
          <button key={w} onClick={() => setWords(w)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              words === w ? 'bg-[#1B5FA8] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {w.toLocaleString()} words
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Everything included: SEO · Copyscape · Meta tags · Expert review</p>
        <a href="#inquiry" className="shrink-0 ml-4 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          Order Now →
        </a>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SeoBlogWritingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-blue-50/40 to-teal-50/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#1B5FA8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#0D9488]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#1B5FA8]/10 border border-[#1B5FA8]/30 text-[#1B5FA8] text-sm px-4 py-2 rounded-full mb-6 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#1B5FA8] animate-pulse" />
            SEO Blog Writing · Human-Crafted · Expert-Reviewed
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
            AI Writes Fast.<br />
            <span className="text-[#1B5FA8]">Humans Write Content<br className="hidden md:block" /> That Actually Ranks.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            For $5 an article, why settle for one when you can have both? Every piece arrives with
            full on-page SEO, a Copyscape plagiarism report and a meta description ready to paste.
            <strong className="text-gray-700"> Not a draft. A deliverable.</strong>
          </p>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {[
              { icon: '✅', text: 'Copyscape verified' },
              { icon: '🎯', text: 'Full on-page SEO' },
              { icon: '⚡', text: '3–5 day turnaround' },
              { icon: '💲', text: 'From $5 per article' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 font-medium shadow-sm">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricing"
              className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1B5FA8]/20 text-center">
              View Packages
            </a>
            <a href="#inquiry"
              className="w-full sm:w-auto border-2 border-gray-300 hover:border-[#1B5FA8] text-gray-600 hover:text-[#1B5FA8] px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center">
              Discuss Your Project
            </a>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Why Not Just Use AI?
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            AI content has its place. But when you need content that <em>actually ranks</em> — here's what the difference looks like.
          </p>

          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
              <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Feature</div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">🤖</div>
                <p className="text-xs font-bold text-gray-500">AI Only</p>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">✍️</div>
                <p className="text-xs font-bold text-gray-500">Human Only</p>
              </div>
              <div className="p-4 text-center bg-[#1B5FA8]/5 border-l-2 border-[#1B5FA8]/20">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-xs font-bold text-[#1B5FA8]">Rankivo Human</p>
              </div>
            </div>

            {/* Rows */}
            {COMPARISON.map((row, i) => (
              <div key={row.feature}
                className={`grid grid-cols-4 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="p-4 text-sm text-gray-700 font-medium flex items-center">{row.feature}</div>
                <div className="p-4 flex items-center justify-center"><Cell value={row.ai} /></div>
                <div className="p-4 flex items-center justify-center"><Cell value={row.human} /></div>
                <div className="p-4 flex items-center justify-center bg-[#1B5FA8]/3 border-l-2 border-[#1B5FA8]/20">
                  <Cell value={row.rankivo} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">
            Rankivo gives you the best of both — AI speed, human quality, SEO built in.
          </p>
        </div>
      </section>

      {/* ── What's Inside Every Article ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            What Lands in Your Inbox
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Not a rough draft. A fully finished, publish-ready article — with everything attached.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DELIVERABLES.map((d) => (
              <div key={d.label}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#1B5FA8]/40 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-[#1B5FA8]/8 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {d.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{d.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>

          {/* Article anatomy visual */}
          <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">What a delivered article looks like</p>
            <div className="space-y-3">
              {[
                { label: 'Meta Title',        preview: 'Your target keyword | Brand Name — click-optimised, under 60 chars',  color: '#1B5FA8', tag: 'SEO' },
                { label: 'Meta Description',  preview: 'Compelling 155-character summary with primary keyword placed naturally.', color: '#0D9488', tag: 'SEO' },
                { label: 'H1 Headline',       preview: 'Your Primary Keyword: Written to Rank and Convert',                    color: '#1B5FA8', tag: 'Structure' },
                { label: 'Introduction',      preview: 'Hook → context → keyword → promise. Every intro earns the scroll.',    color: '#6B7280', tag: 'Copy' },
                { label: 'H2 Sections',       preview: 'Keyword-led subheadings with supporting LSI terms throughout body…',   color: '#1B5FA8', tag: 'Structure' },
                { label: 'Copyscape Report',  preview: '100% original content certificate attached as PDF on delivery.',        color: '#0D9488', tag: 'Verified' },
              ].map(({ label, preview, color, tag }) => (
                <div key={label} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: color }}>{tag}</span>
                    <span className="text-sm font-semibold text-gray-700 w-36 shrink-0">{label}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{preview}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pay Per Word Calculator ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Pay Only for What You Need
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            No subscription required. Order one article, or a thousand words — priced simply at $0.50 per 100 words. Everything included.
          </p>
          <Calculator />
        </div>
      </section>

      {/* ── Packages ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Or Choose a Monthly Package — and Save
          </h2>
          <p className="text-gray-500 text-center mb-4 max-w-xl mx-auto">
            Monthly packages include keyword research, content calendar and priority turnaround — at a lower per-article cost than pay-per-word.
          </p>
          <p className="text-center text-sm text-[#1B5FA8] font-semibold mb-12">
            💡 Growth plan works out to $3.80/article. Authority plan: $3.27/article.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PACKAGES.map((pkg) => (
              <div key={pkg.name}
                className={`relative rounded-xl p-6 border-2 shadow-sm bg-white flex flex-col ${pkg.style}`}>
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}
                {pkg.gold && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#C9943A] text-white text-xs font-bold px-3 py-1 rounded-full">WHITE LABEL</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                  <span className="text-gray-400 text-sm ml-1">{pkg.period}</span>
                </div>
                <p className="text-sm text-[#0D9488] font-semibold mb-2">{pkg.volume}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-5">{pkg.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <a href="#inquiry"
                    className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${pkg.ctaStyle}`}>
                    {pkg.cta}
                  </a>
                  <a href="#inquiry"
                    className="block text-center py-2 text-xs font-medium text-gray-400 hover:text-[#1B5FA8] transition-colors">
                    Discuss first →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-white">Simple from Start to Publish</h2>
          <p className="text-white/70 mb-12 max-w-lg mx-auto text-sm">
            No calls. No back-and-forth. Just brief us, and we deliver.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Brief Us',     desc: 'Choose a package and email your brief to sales@rankivo.co — topic, keyword, audience, tone.' },
              { step: '2', title: 'We Write',     desc: 'Our SEO writer researches, writes and edits. An SEO editor reviews before anything leaves our desk.' },
              { step: '3', title: 'You Publish',  desc: 'Receive your article, meta tags and Copyscape report by email. Copy. Paste. Publish. Done.' },
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

      {/* ── Also Try AI ───────────────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Need content instantly?</p>
            <h3 className="font-bold text-gray-900 text-lg">Try our AI Blog Generator — free</h3>
            <p className="text-sm text-gray-500 mt-1">Generate a full SEO blog post in seconds. Perfect for rapid drafts before expert polish.</p>
          </div>
          <Link href="/tools/blog-generator"
            className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
            Try AI Blog Generator Free →
          </Link>
        </div>
      </section>

      {/* ── Inquiry Form ──────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
            <p className="text-gray-500">
              Tell us about your project and we'll get back to you within 24 hours with a confirmation and next steps.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <InquiryForm />
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Or email us directly at <strong>sales@rankivo.co</strong> · We reply within 24 hours · No calls, no pressure
          </p>
        </div>
      </section>

      {/* ── Back to all services ──────────────────────────────────────────── */}
      <div className="py-6 px-6 bg-gray-50 text-center border-t border-gray-100">
        <Link href="/services/human-writing" className="text-sm text-gray-400 hover:text-[#1B5FA8] transition-colors">
          ← View all human writing services
        </Link>
      </div>

      <Footer />
    </div>
  )
}
