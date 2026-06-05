'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  { href: '/services/seo-blog-writing',     icon: '✍️',  label: 'SEO Blog Writing',      desc: 'Long-form articles built to rank. Keyword-led, expert-crafted, Copyscape verified.',          tag: 'Most Popular' },
  { href: '/services/website-copywriting',  icon: '🖥️',  label: 'Website Copywriting',   desc: 'Home, about, service and landing pages that convert visitors into buyers.',                    tag: null           },
  { href: '/services/social-media-content', icon: '📱',  label: 'Social Media Content',  desc: 'Scroll-stopping posts for Instagram, TikTok, X and LinkedIn — written by humans.',            tag: null           },
  { href: '/services/email-sequences',       icon: '📧',  label: 'Email Sequences',       desc: 'Welcome flows, nurture series and sales sequences that turn subscribers into customers.',      tag: null           },
  { href: '/services/product-descriptions', icon: '🛍️',  label: 'Product Descriptions',  desc: 'Persuasive, SEO-rich descriptions for e-commerce products that sell and rank.',               tag: null           },
  { href: '/services/content-strategy',     icon: '🗺️',  label: 'Content Strategy',      desc: 'Keyword clusters, content calendars and a full roadmap built around your business goals.',    tag: null           },
  { href: '/services/video-scripts',        icon: '🎬',  label: 'Video Scripts',         desc: 'YouTube, TikTok and ad scripts with strong hooks, clear structure and compelling CTAs.',       tag: null           },
  { href: '/services/seo-blog-writing',     icon: '📣',  label: 'Ad Copywriting',        desc: 'Google, Meta and LinkedIn ad copy — A/B variants ready, conversion-optimised.',               tag: null           },
]

const PACKAGES = [
  {
    name: 'Starter',
    price: 'from $9',
    period: 'one-off',
    volume: '1 article',
    desc: 'Perfect for testing our quality before committing.',
    features: ['Full on-page SEO', 'Copyscape report', 'Meta title + description', 'Human-crafted & reviewed'],
    cta: 'Get Started',
    style: 'border-gray-200',
    highlight: false,
  },
  {
    name: 'Silver',
    price: 'from $39',
    period: '/month',
    volume: '5 articles/month',
    desc: 'For bloggers and small businesses building consistent content.',
    features: ['Full on-page SEO', 'Copyscape report', 'Meta title + description', 'Human-crafted & reviewed', 'Priority turnaround'],
    cta: 'Get Started',
    style: 'border-[#1B5FA8]',
    highlight: true,
  },
  {
    name: 'Gold',
    price: 'from $99',
    period: '/month',
    volume: '15 articles/month',
    desc: 'For brands and startups scaling their content engine.',
    features: ['Full on-page SEO', 'Copyscape report', 'Meta title + description', 'Human-crafted & reviewed', 'Priority turnaround', 'Content calendar'],
    cta: 'Get Started',
    style: 'border-[#0D9488]/50',
    highlight: false,
  },
  {
    name: 'Agency',
    price: 'from $199',
    period: '/month',
    volume: '35 articles/month',
    desc: 'White label available. Bulk orders. NDA on request.',
    features: ['Full on-page SEO', 'Copyscape report', 'Meta title + description', 'Human-crafted & reviewed', 'White label delivery', 'NDA available', 'Dedicated account manager'],
    cta: 'Get Started',
    style: 'border-[#C9943A]/50',
    highlight: false,
    gold: true,
  },
]

const FAQS = [
  {
    q: 'Is the content actually written by humans?',
    a: 'Yes. Every piece is led and written by an SEO content expert. We may use AI tools for research assistance, but all writing, editing and quality checks are done by our human team before delivery.',
  },
  {
    q: 'What does "full on-page SEO" include?',
    a: 'Every article includes keyword placement in title, H1, H2s and body copy, proper internal linking suggestions, meta title, meta description, and structure optimised for featured snippets where applicable.',
  },
  {
    q: 'How do I receive my content?',
    a: 'After payment, email your content brief to sales@rankivo.co. We\'ll confirm receipt and deliver your content to that same email address within the agreed turnaround time.',
  },
  {
    q: 'What is the turnaround time?',
    a: 'Standard turnaround is 3–5 business days per article. Silver and above get priority handling. Urgent requests can be discussed via email before ordering.',
  },
  {
    q: 'Do you offer white label for agencies?',
    a: 'Yes. Agency plan clients can receive content with no Rankivo branding, and we can sign an NDA. Contact sales@rankivo.co to discuss your agency requirements before purchasing.',
  },
  {
    q: 'What if I\'m not happy with the content?',
    a: 'We offer one free revision round on every article. If the delivered content doesn\'t match your brief, email us and we\'ll revise it. Our goal is zero-compromise quality.',
  },
]

// ─── Inquiry Form ─────────────────────────────────────────────────────────────

function InquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', service: '', wordCount: '', niche: '',
    deadline: '', budget: '', details: '',
  })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.service) return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'sales@rankivo.co',
          subject: `New Project Inquiry — ${form.service}`,
          body: `
Name: ${form.name}
Email: ${form.email}
Service: ${form.service}
Word Count / Volume: ${form.wordCount}
Niche / Industry: ${form.niche}
Deadline: ${form.deadline}
Budget Range: ${form.budget}
Details:
${form.details}
          `.trim(),
        }),
      })
      if (res.ok) setStatus('sent')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#0D9488]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed *</label>
        <select name="service" value={form.service} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] bg-white">
          <option value="">Select a service…</option>
          <option>SEO Blog Writing</option>
          <option>Website Copywriting</option>
          <option>Social Media Content</option>
          <option>Email Sequences</option>
          <option>Product Descriptions</option>
          <option>Content Strategy</option>
          <option>Video Scripts</option>
          <option>Ad Copywriting</option>
          <option>Other / Custom</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Word Count / Volume</label>
        <input name="wordCount" value={form.wordCount} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. 1,500 words or 10 articles" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Niche / Industry</label>
        <input name="niche" value={form.niche} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. SaaS, Health, E-commerce" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
        <input name="deadline" value={form.deadline} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. within 1 week" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
        <select name="budget" value={form.budget} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] bg-white">
          <option value="">Select a range…</option>
          <option>Under $50</option>
          <option>$50 – $150</option>
          <option>$150 – $500</option>
          <option>$500 – $1,000</option>
          <option>$1,000+</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Details</label>
        <textarea name="details" value={form.details} onChange={handleChange} rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] resize-none"
          placeholder="Tell us about your project, goals, target audience, tone of voice, any specific requirements…" />
      </div>
      <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={status === 'sending' || !form.name || !form.email || !form.service}
          className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          {status === 'sending' ? 'Sending…' : 'Send Inquiry'}
        </button>
        <p className="text-xs text-gray-400">We reply within 24 hours · Email only — no calls</p>
        {status === 'error' && (
          <p className="text-xs text-red-500">Something went wrong. Please email sales@rankivo.co directly.</p>
        )}
      </div>
    </div>
  )
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HumanWritingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9943A]/10 border border-[#C9943A]/30 text-[#C9943A] text-sm px-4 py-2 rounded-full mb-6 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#C9943A] animate-pulse" />
            Human-Crafted · Expert-Reviewed · SEO-Verified
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900">
            Content That Ranks.<br />
            <span className="text-[#1B5FA8]">Written by Humans Who Know SEO.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-4 max-w-2xl mx-auto leading-relaxed">
            AI for speed. Humans for quality. Every article is <strong className="text-gray-700 font-semibold">expert-crafted</strong>,
            fully SEO-optimised and delivered with a Copyscape plagiarism report — so you publish with confidence.
          </p>
          <p className="text-base text-gray-400 mb-10 max-w-xl mx-auto">
            For bloggers, brands and agencies who need content that actually converts — not just content that exists.
          </p>
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

      {/* ── Trust Bar ─────────────────────────────────────────────────────── */}
      <section className="py-5 px-6 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { icon: '✍️', text: 'Human-Crafted Content' },
            { icon: '🎯', text: 'Full On-Page SEO' },
            { icon: '✅', text: 'Copyscape Verified' },
            { icon: '⚡', text: '3–5 Day Turnaround' },
            { icon: '📧', text: 'Email-Based Communication' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who This Is For ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Who This Is For</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Whether you need one great article or an ongoing content operation — we have a plan for you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '✍️',
                title: 'Bloggers & Small Businesses',
                color: 'blue',
                points: [
                  'Consistent, rankable blog content',
                  'One-off articles or monthly retainer',
                  'Expert writing without hiring full-time',
                  'Starting from $9 per article',
                ],
              },
              {
                icon: '🚀',
                title: 'Brands & Startups',
                color: 'teal',
                points: [
                  'Content that drives leads and conversions',
                  'Scalable monthly content plans',
                  'Website copy, blogs, email flows',
                  'Full SEO optimisation included',
                ],
              },
              {
                icon: '🏢',
                title: 'Agencies & Resellers',
                color: 'gold',
                points: [
                  'White label delivery — your brand',
                  'Bulk orders for multiple clients',
                  'NDA available on request',
                  'Dedicated account manager',
                ],
              },
            ].map((card) => {
              const colors = {
                blue: { border: 'border-[#1B5FA8]/20 hover:border-[#1B5FA8]/40', icon: 'bg-[#1B5FA8]/10 text-[#1B5FA8]', tick: 'text-[#1B5FA8]' },
                teal: { border: 'border-[#0D9488]/20 hover:border-[#0D9488]/40', icon: 'bg-[#0D9488]/10 text-[#0D9488]', tick: 'text-[#0D9488]' },
                gold: { border: 'border-[#C9943A]/20 hover:border-[#C9943A]/40', icon: 'bg-[#C9943A]/10 text-[#C9943A]', tick: 'text-[#C9943A]' },
              }[card.color]
              return (
                <div key={card.title} className={`bg-white border-2 rounded-xl p-6 transition-colors shadow-sm ${colors.border}`}>
                  <div className={`${colors.icon} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}>{card.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-4">{card.title}</h3>
                  <ul className="space-y-2">
                    {card.points.map(p => (
                      <li key={p} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className={`${colors.tick} font-bold shrink-0 mt-0.5`}>✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── What We Deliver ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">What We Deliver</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Eight content services — each expert-crafted, SEO-led and built to perform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="group border border-gray-200 hover:border-[#1B5FA8]/40 rounded-xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  {s.tag && (
                    <span className="text-[10px] font-bold bg-[#C9943A]/15 text-[#C9943A] border border-[#C9943A]/30 px-2 py-0.5 rounded-full">
                      🔥 {s.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-[#1B5FA8] transition-colors">{s.label}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ───────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Every Order Includes — Without Exception</h2>
          <p className="text-white/70 mb-10 text-sm">No upsells. No hidden add-ons. This is what you get with every single delivery.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🎯', label: 'Full On-Page SEO Optimisation' },
              { icon: '✅', label: 'Copyscape Plagiarism Report' },
              { icon: '🏷️', label: 'Meta Title + Description' },
              { icon: '👤', label: 'Human-Crafted & Expert-Reviewed' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-2xl">{icon}</div>
                <p className="text-white/90 text-sm font-medium leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Shown as starting prices — final quote based on word count, niche and complexity.
            <a href="#inquiry" className="text-[#1B5FA8] hover:underline ml-1">Discuss before buying →</a>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-xl p-6 border-2 shadow-sm bg-white flex flex-col ${pkg.style}`}
              >
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
                  <span className="text-2xl font-bold text-gray-900">{pkg.price}</span>
                  <span className="text-gray-400 text-sm ml-1">{pkg.period}</span>
                </div>
                <p className="text-sm text-[#0D9488] font-medium mb-2">{pkg.volume}</p>
                <p className="text-xs text-gray-400 mb-5 leading-relaxed">{pkg.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <a href="#inquiry"
                    className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                      pkg.highlight
                        ? 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white'
                        : pkg.gold
                        ? 'bg-[#C9943A] hover:bg-[#C9943A]/90 text-white'
                        : 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600'
                    }`}>
                    {pkg.cta}
                  </a>
                  <a href="#inquiry"
                    className="block text-center py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-[#1B5FA8] hover:border-[#1B5FA8]/40 text-xs font-medium transition-colors">
                    Discuss First
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Custom services row */}
          <div className="mt-12 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-1">Custom & One-Off Services</h3>
            <p className="text-sm text-gray-500 mb-6">Need something specific? These services are quoted individually.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Website Copywriting', price: 'from $29' },
                { label: 'Email Sequence (5 emails)', price: 'from $39' },
                { label: 'Product Descriptions (10)', price: 'from $19' },
                { label: 'Social Media Pack (15 posts)', price: 'from $29' },
                { label: 'Content Strategy', price: 'from $99' },
                { label: 'Video Scripts', price: 'from $29' },
              ].map(({ label, price }) => (
                <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 leading-snug">{label}</p>
                  <p className="font-bold text-[#1B5FA8] text-sm">{price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── White Label ───────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-[#C9943A]/30 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start gap-8">
            <div className="w-16 h-16 bg-[#C9943A]/10 rounded-2xl flex items-center justify-center text-3xl shrink-0">🏢</div>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#C9943A]/10 text-[#C9943A] text-xs font-bold px-3 py-1 rounded-full mb-3">
                FOR AGENCIES & RESELLERS
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">White Label Content — Your Brand, Our Expertise</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Running an agency? We deliver content with zero Rankivo branding — ready for you to deliver under your own name.
                Bulk orders, flexible volume, NDA available. Your clients see your brand. You keep the margin.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: '🏷️', label: 'No Rankivo branding on any delivery' },
                  { icon: '📦', label: 'Bulk orders for multiple clients' },
                  { icon: '🔒', label: 'NDA available on request' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-lg shrink-0">{icon}</span> {label}
                  </div>
                ))}
              </div>
              <a href="#inquiry"
                className="inline-block bg-[#C9943A] hover:bg-[#C9943A]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                Discuss Agency Partnership
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">How It Works</h2>
          <p className="text-gray-500 mb-12 max-w-lg mx-auto">
            A simple, professional three-step process — no calls, no complexity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '1', color: '#1B5FA8',
                title: 'Brief Us',
                desc: 'Choose a package and email your brief to sales@rankivo.co — topic, target keyword, audience and any requirements.',
              },
              {
                step: '2', color: '#0D9488',
                title: 'We Write',
                desc: 'Our SEO experts research, write and review your content. You get a human-crafted piece with full on-page optimisation.',
              },
              {
                step: '3', color: '#C9943A',
                title: 'You Publish',
                desc: 'Receive your article, meta data and Copyscape report by email. Copy, paste, publish. Done.',
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg"
                  style={{ backgroundColor: s.color }}>
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-10">
            All communication via email only. We'll confirm receipt within a few hours and keep you updated throughout.
          </p>
        </div>
      </section>

      {/* ── Also Try: AI Tools ────────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Need content instantly?</p>
            <h3 className="font-bold text-gray-900 text-lg">Try our AI content generators — free</h3>
            <p className="text-sm text-gray-500 mt-1">Generate SEO-optimised drafts in seconds. Perfect for rapid iteration before expert polish.</p>
          </div>
          <Link href="/auth?mode=signup"
            className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
            Try AI Tools Free →
          </Link>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-center mb-10">Have another question? Email sales@rankivo.co — we'll get back within 24 hours.</p>
          <div className="space-y-3">
            {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── Inquiry Form CTA ──────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 px-6 bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Discuss Your Project</h2>
            <p className="text-gray-500">
              Not sure which package fits? Tell us about your project and we'll recommend the right solution and send you a quote.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <InquiryForm />
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            All communication via email · We reply within 24 hours · No calls, no pressure
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
