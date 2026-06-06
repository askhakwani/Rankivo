'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ─── Data ─────────────────────────────────────────────────────────────────────

const SEQUENCES = [
  {
    id: 'welcome',
    icon: '👋',
    label: 'Welcome Sequence',
    price: '$12',
    emails: 3,
    color: '#1B5FA8',
    goal: 'Turn new subscribers into engaged fans from day one',
    desc: 'The most important sequence you\'ll ever send. First impressions stick — and these three emails set the tone for everything that follows.',
    flow: [
      { day: 'Day 0',  subject: 'Welcome + deliver the promise',     purpose: 'Warm welcome, deliver lead magnet or value, set expectations' },
      { day: 'Day 2',  subject: 'Your biggest value email',          purpose: 'Share your best insight, tip or story — build instant trust' },
      { day: 'Day 4',  subject: 'Soft introduction to your offer',   purpose: 'Introduce what you do naturally, no hard sell' },
    ],
  },
  {
    id: 'nurture',
    icon: '🌱',
    label: 'Nurture Sequence',
    price: '$19',
    emails: 5,
    color: '#0D9488',
    goal: 'Build trust over time so buying feels like the obvious next step',
    desc: 'Most people don\'t buy the first time they hear about you. This sequence keeps showing up with value until they\'re ready — and when they are, you\'re the only name they think of.',
    flow: [
      { day: 'Email 1', subject: 'The problem you solve',            purpose: 'Identify their pain point — make them feel understood' },
      { day: 'Email 2', subject: 'A story that resonates',           purpose: 'Case study or relatable story — builds credibility' },
      { day: 'Email 3', subject: 'Your unique approach',             purpose: 'Explain why you\'re different — without bragging' },
      { day: 'Email 4', subject: 'Handle the main objection',        purpose: 'Address the #1 reason they haven\'t bought yet' },
      { day: 'Email 5', subject: 'The gentle nudge',                 purpose: 'Soft CTA — invite them to take the next step' },
    ],
  },
  {
    id: 'sales',
    icon: '💰',
    label: 'Sales Sequence',
    price: '$22',
    emails: 5,
    color: '#C9943A',
    goal: 'Convert warm leads into paying customers with urgency and conviction',
    desc: 'When it\'s time to sell, hesitation costs you money. This sequence builds desire, handles objections and closes — without feeling pushy or desperate.',
    flow: [
      { day: 'Email 1', subject: 'The big announcement',             purpose: 'Launch or promote your offer with excitement and clarity' },
      { day: 'Email 2', subject: 'Why this matters to them',         purpose: 'Connect your offer to their specific goals and pain points' },
      { day: 'Email 3', subject: 'Proof it works',                   purpose: 'Social proof, results, testimonials — let others sell for you' },
      { day: 'Email 4', subject: 'Handle the objections',            purpose: 'Answer the "but what about..." questions before they ask' },
      { day: 'Email 5', subject: 'Last chance — closing email',      purpose: 'Create urgency, reinforce value, make the final ask' },
    ],
  },
  {
    id: 'fullfunnel',
    icon: '🚀',
    label: 'Full Funnel Pack',
    price: '$39',
    emails: 10,
    color: '#1B5FA8',
    goal: 'A complete email system — from first hello to paying customer',
    desc: 'Everything in one. A Welcome sequence that onboards, a Nurture sequence that builds trust and a Sales sequence that converts. Your entire email funnel, done.',
    flow: [
      { day: 'Emails 1–3',  subject: 'Welcome Sequence',   purpose: 'Onboard new subscribers, deliver value, set expectations' },
      { day: 'Emails 4–6',  subject: 'Nurture Sequence',   purpose: 'Build trust, share stories, handle objections' },
      { day: 'Emails 7–10', subject: 'Sales Sequence',     purpose: 'Drive conversions with desire, proof and urgency' },
    ],
  },
]

const COMPARISON = [
  { feature: 'Sounds like a real person wrote it', ai: 'sometimes', diy: true,        rankivo: true },
  { feature: 'A/B subject line variants',          ai: false,       diy: false,       rankivo: true },
  { feature: 'Preview text optimised',             ai: false,       diy: 'sometimes', rankivo: true },
  { feature: 'Copyscape verified',                 ai: false,       diy: false,       rankivo: true },
  { feature: 'One clear CTA per email',            ai: 'sometimes', diy: 'sometimes', rankivo: true },
  { feature: 'Objection handling built in',        ai: false,       diy: 'sometimes', rankivo: true },
  { feature: 'Saves you hours of writing',         ai: true,        diy: false,       rankivo: true },
  { feature: 'Conversion-focused structure',       ai: 'sometimes', diy: 'sometimes', rankivo: true },
]

// ─── Sequence Visualiser ──────────────────────────────────────────────────────

function SequenceVisualiser() {
  const [active, setActive] = useState('welcome')
  const seq = SEQUENCES.find(s => s.id === active)

  return (
    <div className="bg-white border-2 border-[#1B5FA8]/20 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-100 bg-gray-50">
        {SEQUENCES.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
              active === s.id
                ? 'border-[#1B5FA8] text-[#1B5FA8] bg-white'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              active === s.id ? 'bg-[#1B5FA8]/10 text-[#1B5FA8]' : 'bg-gray-100 text-gray-400'
            }`}>{s.price}</span>
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {/* Sequence header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: seq.color + '15' }}>
            {seq.icon}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-gray-900">{seq.label}</h3>
              <span className="text-sm font-bold" style={{ color: seq.color }}>{seq.price} · {seq.emails} emails</span>
            </div>
            <p className="text-sm text-gray-500 italic mb-1">"{seq.goal}"</p>
            <p className="text-sm text-gray-400 leading-relaxed">{seq.desc}</p>
          </div>
        </div>

        {/* Email flow */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Email flow</p>
          {seq.flow.map((email, i) => (
            <div key={i} className="flex items-start gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: seq.color }}>
                  {i + 1}
                </div>
                {i < seq.flow.length - 1 && (
                  <div className="w-0.5 h-6 mt-1" style={{ backgroundColor: seq.color + '30' }} />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold text-gray-400">{email.day}</span>
                  <span className="text-sm font-semibold text-gray-800">{email.subject}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{email.purpose}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What's included */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Every email includes</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              '2 subject line A/B variants',
              'Preview text optimised',
              'Human-crafted body copy',
              'Copyscape verified',
            ].map(f => (
              <div key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                <span className="text-[#0D9488] font-bold shrink-0">✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        <a href="#inquiry"
          className="mt-4 block text-center py-3 rounded-xl font-semibold text-sm text-white transition-colors"
          style={{ backgroundColor: seq.color }}>
          Get This Sequence — {seq.price} →
        </a>
      </div>
    </div>
  )
}

// ─── Comparison Cell ──────────────────────────────────────────────────────────

function Cell({ value }) {
  if (value === true)        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-bold">✓</span>
  if (value === false)       return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-400 text-sm font-bold">✗</span>
  if (value === 'sometimes') return <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Sometimes</span>
  return null
}

// ─── Inquiry Form ─────────────────────────────────────────────────────────────

function InquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', sequence: '', niche: '', deadline: '', details: '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.sequence) return
    setStatus('sending')
    console.log('Email Sequences inquiry:', form)
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Sequence Needed *</label>
        <select name="sequence" value={form.sequence} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] bg-white">
          <option value="">Select a sequence…</option>
          <option>Single Email — $5</option>
          <option>Welcome Sequence (3 emails) — $12</option>
          <option>Nurture Sequence (5 emails) — $19</option>
          <option>Sales Sequence (5 emails) — $22</option>
          <option>Full Funnel Pack (10 emails) — $39</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Niche</label>
        <input name="niche" value={form.niche} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. SaaS, E-commerce, Coaching" />
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
          placeholder="Tell us about your product, audience, tone of voice and what you want the sequence to achieve…" />
      </div>
      <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
        <button onClick={handleSubmit}
          disabled={status === 'sending' || !form.name || !form.email || !form.sequence}
          className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors">
          {status === 'sending' ? 'Sending…' : 'Send Inquiry →'}
        </button>
        <p className="text-xs text-gray-400">Reply within 24 hours · Email only · No calls</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailSequencesPage() {
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
            Email Sequences · Human-Crafted · Conversion-Focused
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
            Your Email List Is<br />
            <span className="text-[#1B5FA8]">Your Most Valuable Asset.<br className="hidden md:block" /> Are You Using It?</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            Most businesses collect emails and do nothing with them. The ones that win
            <strong className="text-gray-700"> send the right message at the right moment</strong> — and turn subscribers into buyers on autopilot.
            We write those emails for you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {[
              { icon: '✉️', text: 'Welcome sequences' },
              { icon: '🌱', text: 'Nurture sequences' },
              { icon: '💰', text: 'Sales sequences' },
              { icon: '🚀', text: 'Full funnel packs' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 font-medium shadow-sm">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#visualiser" className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1B5FA8]/20 text-center">
              See What You Get
            </a>
            <a href="#inquiry" className="w-full sm:w-auto border-2 border-gray-300 hover:border-[#1B5FA8] text-gray-600 hover:text-[#1B5FA8] px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center">
              Discuss Your Project
            </a>
          </div>
        </div>
      </section>

      {/* ── Why Email ─────────────────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { stat: '$36',   label: 'returned for every $1 spent on email marketing' },
              { stat: '4x',    label: 'higher conversion rate than social media' },
              { stat: '99%',   label: 'of email users check their inbox every day' },
            ].map(({ stat, label }) => (
              <div key={stat}>
                <p className="text-4xl font-bold text-white mb-2">{stat}</p>
                <p className="text-white/70 text-sm leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sequence Visualiser ───────────────────────────────────────────── */}
      <section id="visualiser" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Pick Your Sequence — See Exactly What You Get</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Click a sequence type to see the full email flow, what each email does and what's included in every delivery.
          </p>
          <SequenceVisualiser />
        </div>
      </section>

      {/* ── Single Email Option ───────────────────────────────────────────── */}
      <section className="py-8 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1B5FA8]/8 rounded-xl flex items-center justify-center text-2xl shrink-0">📧</div>
              <div>
                <h3 className="font-bold text-gray-900">Just need one email?</h3>
                <p className="text-sm text-gray-500">Single standalone email — newsletter, announcement, promotion or re-engagement. Full copywriting + subject line A/B + Copyscape. <strong className="text-[#1B5FA8]">$5 per email.</strong></p>
              </div>
            </div>
            <a href="#inquiry" className="shrink-0 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap">
              Order Single Email →
            </a>
          </div>
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Why Not Write Them Yourself?</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            You know your business — but conversion copywriting is a craft. Here's what separates great email sequences from ones that get ignored.
          </p>
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
              <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Feature</div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">🤖</div>
                <p className="text-xs font-bold text-gray-500">AI Written</p>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">🖊️</div>
                <p className="text-xs font-bold text-gray-500">DIY</p>
              </div>
              <div className="p-4 text-center bg-[#1B5FA8]/5 border-l-2 border-[#1B5FA8]/20">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-xs font-bold text-[#1B5FA8]">Rankivo Human</p>
              </div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature}
                className={`grid grid-cols-4 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="p-4 text-sm text-gray-700 font-medium flex items-center">{row.feature}</div>
                <div className="p-4 flex items-center justify-center"><Cell value={row.ai} /></div>
                <div className="p-4 flex items-center justify-center"><Cell value={row.diy} /></div>
                <div className="p-4 flex items-center justify-center bg-[#1B5FA8]/3 border-l-2 border-[#1B5FA8]/20">
                  <Cell value={row.rankivo} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ───────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">What Every Email Includes</h2>
          <p className="text-gray-500 text-center mb-10">No extras to buy. Everything is included in every single email we write.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔀', label: '2 Subject Line A/B Variants',  desc: 'Test which subject line gets more opens — two options per email, every time.' },
              { icon: '👁️', label: 'Preview Text Optimised',       desc: 'The line readers see before opening — written to complement the subject line and drive the click.' },
              { icon: '✍️', label: 'Human-Crafted Body Copy',      desc: 'Conversion-focused writing that sounds like you and moves the reader toward one clear action.' },
              { icon: '🎯', label: 'One Clear CTA Per Email',      desc: 'No confusion. Every email has one goal and one action — making it easy to click.' },
              { icon: '✅', label: 'Copyscape Verified',            desc: '100% original content. Plagiarism certificate attached on every delivery.' },
              { icon: '👤', label: 'Expert-Reviewed',              desc: 'Every email reviewed by a conversion copywriter before it leaves our desk.' },
            ].map((d) => (
              <div key={d.label} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#1B5FA8]/40 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-[#1B5FA8]/8 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {d.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{d.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Summary ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Simple, Honest Pricing</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Every sequence is a one-off order — no subscriptions. Pay once, get your emails, start converting.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📧', name: 'Single Email',         price: '$5',  detail: '1 email',    color: 'border-gray-200',        per: '$5/email'   },
              { icon: '👋', name: 'Welcome Sequence',     price: '$12', detail: '3 emails',   color: 'border-gray-200',        per: '$4/email'   },
              { icon: '🌱', name: 'Nurture Sequence',     price: '$19', detail: '5 emails',   color: 'border-[#0D9488]/30',    per: '$3.80/email' },
              { icon: '💰', name: 'Sales Sequence',       price: '$22', detail: '5 emails',   color: 'border-[#C9943A]/30',    per: '$4.40/email' },
              { icon: '🚀', name: 'Full Funnel Pack',     price: '$39', detail: '10 emails',  color: 'border-[#1B5FA8]',       per: '$3.90/email', popular: true },
            ].map((p) => (
              <div key={p.name} className={`relative bg-white border-2 rounded-xl p-5 ${p.color} ${p.popular ? 'shadow-md' : ''}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.detail}</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">{p.price}</p>
                  <p className="text-xs text-[#0D9488] font-semibold">{p.per}</p>
                </div>
                <a href="#inquiry" className="mt-3 block text-center py-2 rounded-lg border-2 border-gray-200 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-500 text-xs font-semibold transition-colors">
                  Get Started →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-white">From Brief to Inbox-Ready</h2>
          <p className="text-white/70 mb-12 max-w-lg mx-auto text-sm">No calls. No back-and-forth. Brief us once and we deliver.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Brief Us',        desc: 'Tell us your product, audience, tone and sequence goal. Email sales@rankivo.co to get started.' },
              { step: '2', title: 'We Write',         desc: 'Our copywriter builds your sequence — every email reviewed for flow, conversion and brand fit.' },
              { step: '3', title: 'You Send',         desc: 'Receive your emails with subject line variants, preview text and Copyscape report. Paste in. Go live.' },
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Need a quick draft first?</p>
            <h3 className="font-bold text-gray-900 text-lg">Try our AI Email Generator — free</h3>
            <p className="text-sm text-gray-500 mt-1">Generate an email draft in seconds. Use it as a brief for our human writers.</p>
          </div>
          <Link href="/tools/email-generator"
            className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
            Try AI Email Generator Free →
          </Link>
        </div>
      </section>

      {/* ── Inquiry Form ──────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
            <p className="text-gray-500">Tell us which sequence you need and we'll reply within 24 hours.</p>
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
