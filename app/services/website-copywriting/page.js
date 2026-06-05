'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPARISON = [
  { feature: 'Sounds like your brand',         diy: 'sometimes', generic: false,       rankivo: true  },
  { feature: 'Converts visitors to buyers',    diy: 'sometimes', generic: false,       rankivo: true  },
  { feature: 'Full on-page SEO',               diy: false,       generic: false,       rankivo: 'optional' },
  { feature: 'Copyscape verified',             diy: false,       generic: false,       rankivo: true  },
  { feature: 'Proper H1/H2 structure',         diy: 'sometimes', generic: 'sometimes', rankivo: true  },
  { feature: 'Keyword placement',              diy: false,       generic: false,       rankivo: 'optional' },
  { feature: 'Written by a human expert',      diy: false,       generic: false,       rankivo: true  },
  { feature: 'Fast turnaround',                diy: false,       generic: true,        rankivo: true  },
]

const PAGES = [
  { icon: '🏠', label: 'Homepage',        desc: 'Your most visited page. First impressions that hold attention and drive action.' },
  { icon: '👤', label: 'About Page',      desc: 'Your story, told with purpose. Builds trust and makes visitors feel at home.' },
  { icon: '🛠️', label: 'Services Page',   desc: 'Clear, benefit-led copy that turns browsers into buyers.' },
  { icon: '📞', label: 'Contact Page',    desc: 'Reduce friction. Make it easy and compelling to reach out.' },
  { icon: '💰', label: 'Pricing Page',    desc: 'Copy that handles objections before they arise and closes the deal.' },
  { icon: '🚀', label: 'Landing Page',    desc: 'Conversion-focused copy built around one goal — one action.' },
]

const PACKAGES = [
  {
    name: 'Copy Only',
    price: '$15',
    period: '/page',
    volume: 'Per page · any page type',
    desc: 'You know your keywords. You just need a professional writer to bring your page to life.',
    features: [
      'Professional copywriting',
      'Brand voice matched to your brief',
      'Persuasion-led structure',
      'Headline + subheadline variants',
      'Human-crafted & expert-reviewed',
      'Delivered within 3–5 business days',
    ],
    cta: 'Get Started',
    style: 'border-gray-200',
    ctaStyle: 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600',
    highlight: false,
  },
  {
    name: 'Copy + On-Page SEO',
    price: '$25',
    period: '/page',
    volume: 'Per page · fully optimised',
    desc: 'Provide your target keyword — we write the page and optimise every element around it.',
    features: [
      'Professional copywriting',
      'Brand voice matched to your brief',
      'Keyword placement throughout',
      'H1 / H2 / H3 structure optimised',
      'Meta title + meta description',
      'Copyscape plagiarism report',
      'Human-crafted & expert-reviewed',
      'Delivered within 3–5 business days',
    ],
    cta: 'Get Started',
    style: 'border-[#1B5FA8]',
    ctaStyle: 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white',
    highlight: true,
  },
  {
    name: 'Full Website Pack',
    price: '$99',
    period: '/project',
    volume: '5 pages · complete website',
    desc: 'Launch or relaunch your entire site with consistent, conversion-focused copy on every page.',
    features: [
      '5 pages of professional copy',
      'Full on-page SEO on every page',
      'Keyword placement throughout',
      'H1 / H2 / H3 structure optimised',
      'Meta title + description per page',
      'Copyscape report per page',
      'Consistent brand voice across all pages',
      'Human-crafted & expert-reviewed',
      'Priority turnaround',
    ],
    cta: 'Get Started',
    style: 'border-[#0D9488]/40',
    ctaStyle: 'bg-[#0D9488] hover:bg-[#0D9488]/90 text-white',
    highlight: false,
  },
]

const DELIVERABLES = [
  { icon: '✍️', label: 'Persuasion-Led Copy',    desc: 'Every word earns its place. Written to move visitors toward one clear action.' },
  { icon: '🎯', label: 'On-Page SEO',             desc: 'Keyword placement, heading structure and page optimisation (Copy + SEO option).' },
  { icon: '✅', label: 'Copyscape Report',         desc: 'Plagiarism certificate attached. 100% original, every time.' },
  { icon: '💬', label: 'Headline Variants',        desc: 'Multiple headline options so you can test what resonates with your audience.' },
  { icon: '📐', label: 'H1/H2/H3 Structure',      desc: 'Proper heading hierarchy — readable for visitors, crawlable for search engines.' },
  { icon: '👤', label: 'Brand Voice Matched',      desc: 'We write in your tone — whether that\'s bold, professional, warm or witty.' },
]

// ─── Page Builder Interactive ─────────────────────────────────────────────────

const PAGE_OPTIONS = [
  { id: 'homepage',  label: 'Homepage',       icon: '🏠', base: 'copy', seo: true  },
  { id: 'about',     label: 'About',          icon: '👤', base: 'copy', seo: false },
  { id: 'services',  label: 'Services',       icon: '🛠️', base: 'copy', seo: true  },
  { id: 'pricing',   label: 'Pricing',        icon: '💰', base: 'copy', seo: false },
  { id: 'contact',   label: 'Contact',        icon: '📞', base: 'copy', seo: false },
  { id: 'landing',   label: 'Landing Page',   icon: '🚀', base: 'copy', seo: true  },
]

function PriceBuilder() {
  const [selected, setSelected] = useState([])
  const [withSeo, setWithSeo] = useState(false)

  function toggle(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const count = selected.length
  const pricePerPage = withSeo ? 25 : 15
  const total = count >= 5 ? 99 : count * pricePerPage
  const savings = count >= 5 ? (count * pricePerPage) - 99 : 0

  return (
    <div className="bg-white border-2 border-[#1B5FA8]/20 rounded-2xl p-6 md:p-8">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Build Your Quote</h3>
          <p className="text-sm text-gray-500">Select the pages you need — price updates instantly</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-[#1B5FA8]">${total}</p>
          {savings > 0 && (
            <p className="text-xs font-bold text-[#0D9488] mt-0.5">You save ${savings} with the 5-page pack!</p>
          )}
          {count === 0 && <p className="text-sm text-gray-400 mt-0.5">Select pages below</p>}
          {count > 0 && savings === 0 && <p className="text-sm text-gray-400 mt-0.5">for {count} page{count > 1 ? 's' : ''}</p>}
        </div>
      </div>

      {/* Page selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        {PAGE_OPTIONS.map(p => (
          <button key={p.id} onClick={() => toggle(p.id)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              selected.includes(p.id)
                ? 'border-[#1B5FA8] bg-[#1B5FA8]/8 text-[#1B5FA8]'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
            {selected.includes(p.id) && <span className="ml-auto text-[#1B5FA8]">✓</span>}
          </button>
        ))}
      </div>

      {/* SEO toggle */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-6">
        <div>
          <p className="text-sm font-semibold text-gray-700">Add on-page SEO optimisation</p>
          <p className="text-xs text-gray-400">+$10/page · keyword placement, H1/H2, meta tags, Copyscape</p>
        </div>
        <button onClick={() => setWithSeo(s => !s)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${withSeo ? 'bg-[#1B5FA8]' : 'bg-gray-300'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${withSeo ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      {count >= 5 && (
        <div className="bg-[#0D9488]/8 border border-[#0D9488]/20 rounded-xl px-4 py-3 mb-4 text-sm text-[#0D9488] font-semibold">
          🎉 5-page pack price applied — you're getting the best rate!
        </div>
      )}

      <a href="#inquiry"
        className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
          count > 0
            ? 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}>
        {count > 0 ? `Get Started — $${total} →` : 'Select pages to get a price'}
      </a>
    </div>
  )
}

// ─── Comparison Cell ──────────────────────────────────────────────────────────

function Cell({ value }) {
  if (value === true)       return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-bold">✓</span>
  if (value === false)      return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-400 text-sm font-bold">✗</span>
  if (value === 'sometimes') return <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Sometimes</span>
  if (value === 'optional')  return <span className="text-xs font-semibold text-[#1B5FA8] bg-[#1B5FA8]/8 px-2 py-1 rounded-full">Optional</span>
  return null
}

// ─── Inquiry Form ─────────────────────────────────────────────────────────────

function InquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', package: '', pages: '', niche: '', deadline: '', details: '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.package) return
    setStatus('sending')
    console.log('Website Copywriting inquiry:', form)
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
          <option>Copy Only — $15/page</option>
          <option>Copy + On-Page SEO — $25/page</option>
          <option>Full Website Pack (5 pages) — $99</option>
          <option>Custom / Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pages Needed</label>
        <input name="pages" value={form.pages} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. Homepage, About, Services" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Niche</label>
        <input name="niche" value={form.niche} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. SaaS, Health, E-commerce" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
        <input name="deadline" value={form.deadline} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. within 2 weeks" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Details</label>
        <textarea name="details" value={form.details} onChange={handleChange} rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] resize-none"
          placeholder="Tell us about your brand, target audience, tone of voice, existing website URL if any…" />
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

export default function WebsiteCopywritingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-teal-50/30 to-blue-50/20 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#0D9488]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#1B5FA8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#0D9488]/10 border border-[#0D9488]/30 text-[#0D9488] text-sm px-4 py-2 rounded-full mb-6 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            Website Copywriting · Human-Crafted · Conversion-Focused
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
            Your Website Has<br />
            <span className="text-[#0D9488]">Seconds to Make<br className="hidden md:block" /> Someone Stay.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            Generic copy loses visitors. <strong className="text-gray-700">Expert-crafted copy converts them.</strong> Every page we write is built around your brand voice, your audience and one goal — turning visitors into buyers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {[
              { icon: '🎯', text: 'Conversion-focused' },
              { icon: '✅', text: 'Copyscape verified' },
              { icon: '🔍', text: 'SEO option available' },
              { icon: '💲', text: 'From $15 per page' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 font-medium shadow-sm">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricing" className="w-full sm:w-auto bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#0D9488]/20 text-center">
              View Packages
            </a>
            <a href="#inquiry" className="w-full sm:w-auto border-2 border-gray-300 hover:border-[#0D9488] text-gray-600 hover:text-[#0D9488] px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center">
              Discuss Your Project
            </a>
          </div>
        </div>
      </section>

      {/* ── Pages We Write ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Every Page, Done Right</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            From your homepage to your pricing page — we write copy that works for every part of your site.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAGES.map((p) => (
              <div key={p.label} className="bg-gray-50 border border-gray-200 hover:border-[#0D9488]/40 rounded-xl p-5 transition-all hover:shadow-md group">
                <span className="text-3xl mb-3 block">{p.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#0D9488] transition-colors">{p.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Why Not Just Write It Yourself?
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            You know your business better than anyone. But professional copywriters know what makes people click, stay and buy.
          </p>

          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
              <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Feature</div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">🖊️</div>
                <p className="text-xs font-bold text-gray-500">DIY Copy</p>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">🤖</div>
                <p className="text-xs font-bold text-gray-500">AI Copy</p>
              </div>
              <div className="p-4 text-center bg-[#0D9488]/5 border-l-2 border-[#0D9488]/20">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-xs font-bold text-[#0D9488]">Rankivo Human</p>
              </div>
            </div>

            {COMPARISON.map((row, i) => (
              <div key={row.feature}
                className={`grid grid-cols-4 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="p-4 text-sm text-gray-700 font-medium flex items-center">{row.feature}</div>
                <div className="p-4 flex items-center justify-center"><Cell value={row.diy} /></div>
                <div className="p-4 flex items-center justify-center"><Cell value={row.generic} /></div>
                <div className="p-4 flex items-center justify-center bg-[#0D9488]/3 border-l-2 border-[#0D9488]/20">
                  <Cell value={row.rankivo} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">What Every Page Includes</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Not a rough draft you need to fix. A finished, polished page ready to go live.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DELIVERABLES.map((d) => (
              <div key={d.label} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-[#0D9488]/40 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-[#0D9488]/8 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {d.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{d.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>

          {/* Page anatomy visual */}
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Anatomy of a delivered page</p>
            <div className="space-y-3">
              {[
                { label: 'H1 Headline',      preview: 'Bold, benefit-led. Keyword-placed. Written to stop the scroll instantly.',         color: '#0D9488', tag: 'Hook'      },
                { label: 'Subheadline',      preview: 'Expands the promise. Addresses the visitor\'s core problem or desire.',            color: '#1B5FA8', tag: 'Context'   },
                { label: 'Body Copy',        preview: 'Benefit-led paragraphs. Short sentences. No fluff. Every line earns its place.',   color: '#6B7280', tag: 'Copy'      },
                { label: 'H2 Sections',      preview: 'Structured subheadings — readable for humans, optimised for crawlers.',           color: '#0D9488', tag: 'Structure' },
                { label: 'CTA',              preview: 'One clear action. Benefit-framed. Impossible to miss.',                           color: '#C9943A', tag: 'Convert'   },
                { label: 'Meta Tags',        preview: 'SEO-optimised title + description — click-ready for search results.',             color: '#0D9488', tag: 'SEO'       },
              ].map(({ label, preview, color, tag }) => (
                <div key={label} className="flex items-start gap-4 p-3 bg-white rounded-xl border border-gray-100">
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: color }}>{tag}</span>
                    <span className="text-sm font-semibold text-gray-700 w-32 shrink-0">{label}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{preview}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Price Builder ──────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Build Your Quote Instantly</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Select the pages you need and toggle SEO on or off — your price updates live. No hidden fees, ever.
          </p>
          <PriceBuilder />
        </div>
      </section>

      {/* ── Packages ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Pay per page or save with the full website pack. No subscriptions, no surprises.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} className={`relative rounded-xl p-6 border-2 shadow-sm bg-white flex flex-col ${pkg.style}`}>
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#0D9488] text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
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
                  <a href="#inquiry" className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${pkg.ctaStyle}`}>
                    {pkg.cta}
                  </a>
                  <a href="#inquiry" className="block text-center py-2 text-xs font-medium text-gray-400 hover:text-[#0D9488] transition-colors">
                    Discuss first →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#0D9488]/5 border border-[#0D9488]/20 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">Don't know your target keywords yet?</strong>{' '}
              Our{' '}
              <Link href="/services/content-strategy" className="text-[#0D9488] hover:underline font-semibold">
                Content Strategy service
              </Link>{' '}
              handles keyword research before we write — so every page targets the right terms from day one.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0D9488]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-white">From Brief to Live Page</h2>
          <p className="text-white/70 mb-12 max-w-lg mx-auto text-sm">Three steps. No calls. No complexity.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Brief Us',       desc: 'Tell us your brand, audience, tone and target keyword (if SEO option selected). Email your brief to sales@rankivo.co.' },
              { step: '2', title: 'We Write',        desc: 'Our copywriter crafts your page. An editor reviews for quality, brand fit and persuasion before anything is sent.' },
              { step: '3', title: 'You Go Live',     desc: 'Receive your finished copy, meta tags and Copyscape report by email. Paste it in. Publish. Done.' },
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
            <h3 className="font-bold text-gray-900 text-lg">Try our AI LinkedIn Post Generator — free</h3>
            <p className="text-sm text-gray-500 mt-1">Generate professional copy in seconds. Use it as a starting brief for our human writers.</p>
          </div>
          <Link href="/tools/linkedin-post-generator"
            className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
            Try AI Generator Free →
          </Link>
        </div>
      </section>

      {/* ── Inquiry Form ──────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
            <p className="text-gray-500">Tell us about your project and we'll reply within 24 hours with confirmation and next steps.</p>
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
        <Link href="/services/human-writing" className="text-sm text-gray-400 hover:text-[#0D9488] transition-colors">
          ← View all human writing services
        </Link>
      </div>

      <Footer />
    </div>
  )
}
