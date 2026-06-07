'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: 'youtube-short',
    icon: '▶️',
    platform: 'YouTube',
    type: 'Short Video',
    duration: 'Under 60 seconds',
    words: '100–150 words',
    price: '$5',
    priceNum: 5,
    includes: ['Hook (3–5 sec)', 'Core message', 'CTA', 'On-screen text suggestions', 'Copyscape verified'],
    tip: 'YouTube Shorts need an instant hook and one punchy message. No fluff — viewers swipe fast.',
  },
  {
    id: 'youtube-medium',
    icon: '▶️',
    platform: 'YouTube',
    type: 'Standard Video',
    duration: '1–3 minutes',
    words: '200–450 words',
    price: '$10',
    priceNum: 10,
    includes: ['Hook (3–5 sec)', 'Intro + body + CTA', 'Chapter suggestions', 'On-screen text suggestions', 'Copyscape verified'],
    tip: 'The sweet spot for tutorials, product reviews and how-tos. Long enough to deliver value — short enough to hold attention.',
  },
  {
    id: 'youtube-long',
    icon: '▶️',
    platform: 'YouTube',
    type: 'Long-Form Video',
    duration: '5–10 minutes',
    words: '750–1,500 words',
    price: '$18',
    priceNum: 18,
    includes: ['Hook (3–5 sec)', 'Full structured script', 'Chapter suggestions', 'On-screen text suggestions', 'Thumbnail text suggestions', 'Copyscape verified'],
    tip: 'Long-form videos build authority and watch time. Structure is everything — our scripts keep viewers watching all the way to the CTA.',
    bonus: 'Thumbnail text included',
  },
  {
    id: 'youtube-deepdive',
    icon: '▶️',
    platform: 'YouTube',
    type: 'Deep-Dive Video',
    duration: '10–20 minutes',
    words: '1,500–3,000 words',
    price: '$29',
    priceNum: 29,
    includes: ['Hook (3–5 sec)', 'Full research-backed script', 'Chapter suggestions', 'On-screen text suggestions', 'Thumbnail text suggestions', 'B-roll suggestions', 'Copyscape verified'],
    tip: 'In-depth tutorials, documentary-style videos and ultimate guides. These build loyal subscribers — if the script is good enough to hold them.',
    bonus: 'Thumbnail text + B-roll suggestions',
  },
  {
    id: 'tiktok',
    icon: '🎵',
    platform: 'TikTok',
    type: 'TikTok Script',
    duration: 'Under 60 seconds',
    words: '80–150 words',
    price: '$5',
    priceNum: 5,
    includes: ['Scroll-stopping hook', 'Trend-aware structure', 'On-screen text suggestions', 'Copyscape verified'],
    tip: 'TikTok is brutal — you have 1 second. Our hooks are written specifically for the TikTok feed, not repurposed from other formats.',
  },
  {
    id: 'reels',
    icon: '📸',
    platform: 'Instagram Reels',
    type: 'Reels Script',
    duration: 'Under 60 seconds',
    words: '80–150 words',
    price: '$5',
    priceNum: 5,
    includes: ['Visual hook', 'Brand-voice copy', 'On-screen text suggestions', 'Copyscape verified'],
    tip: 'Reels reward aesthetic + story. We write scripts that work visually — every line designed to pair with what\'s on screen.',
  },
  {
    id: 'ad',
    icon: '📣',
    platform: 'Video Ad',
    type: 'Facebook / YouTube Ad',
    duration: '15–60 seconds',
    words: '80–150 words',
    price: '$8',
    priceNum: 8,
    includes: ['Pattern-interrupt hook', 'Problem → Solution → CTA structure', 'Multiple CTA variants', 'On-screen text suggestions', 'Copyscape verified'],
    tip: 'Ad scripts live or die on the first 3 seconds. We write hooks that stop the skip, then close with a CTA that actually converts.',
  },
  {
    id: 'explainer',
    icon: '💡',
    platform: 'Explainer Video',
    type: 'Explainer / Whiteboard',
    duration: '1–2 minutes',
    words: '150–300 words',
    price: '$10',
    priceNum: 10,
    includes: ['Problem → Solution structure', 'Clear, jargon-free language', 'Visual cue suggestions', 'On-screen text suggestions', 'Copyscape verified'],
    tip: 'Explainer videos need simplicity above everything. We strip out the jargon and explain your product in the clearest possible way.',
  },
]

const COMPARISON = [
  { feature: 'Scroll-stopping hook',           ai: 'sometimes', human: true,  rankivo: true },
  { feature: 'Keeps viewers watching',         ai: 'sometimes', human: true,  rankivo: true },
  { feature: 'Sounds natural when spoken',     ai: 'sometimes', human: true,  rankivo: true },
  { feature: 'Platform-native structure',      ai: false,       human: true,  rankivo: true },
  { feature: 'On-screen text suggestions',     ai: false,       human: false, rankivo: true },
  { feature: 'Thumbnail text (YouTube)',       ai: false,       human: false, rankivo: true },
  { feature: 'Copyscape verified',             ai: false,       human: false, rankivo: true },
  { feature: 'CTA that actually converts',     ai: 'sometimes', human: true,  rankivo: true },
]

// ─── Script Calculator ────────────────────────────────────────────────────────

function ScriptCalculator() {
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(1)

  const platform = selected ? PLATFORMS.find(p => p.id === selected) : null
  const total = platform ? platform.priceNum * qty : 0

  return (
    <div className="bg-white border-2 border-[#1B5FA8]/20 rounded-2xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
        <h3 className="font-bold text-gray-900 mb-1">Script Price Calculator</h3>
        <p className="text-sm text-gray-500">Select your platform and video type — price updates instantly</p>
      </div>

      <div className="p-6 md:p-8">
        {/* Platform grid */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select your video type</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                selected === p.id
                  ? 'border-[#1B5FA8] bg-[#1B5FA8]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
              <span className="text-xl shrink-0 mt-0.5">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800">{p.platform} · {p.type}</p>
                  <p className="text-sm font-bold text-[#1B5FA8] shrink-0">{p.price}</p>
                </div>
                <p className="text-xs text-gray-400">{p.duration} · {p.words}</p>
              </div>
              {selected === p.id && (
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#1B5FA8] flex items-center justify-center text-white text-xs font-bold">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Quantity */}
        {selected && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">How many scripts?</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#1B5FA8] hover:text-[#1B5FA8] font-bold transition-colors">
                    −
                  </button>
                  <span className="text-lg font-bold text-gray-900 w-8 text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(20, q + 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#1B5FA8] hover:text-[#1B5FA8] font-bold transition-colors">
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[#1B5FA8]">${total}</p>
                <p className="text-sm text-gray-400 mt-0.5">{qty} script{qty > 1 ? 's' : ''} · {platform.price} each</p>
              </div>
            </div>

            {/* What's included */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Every script includes</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {platform.includes.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#0D9488] font-bold shrink-0">✓</span> {f}
                  </div>
                ))}
              </div>
              {platform.bonus && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#C9943A]">
                  ⭐ Bonus: {platform.bonus}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3 italic">💡 {platform.tip}</p>
            </div>

            <a href="#inquiry"
              className="block text-center py-3 rounded-xl font-bold text-sm bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white transition-colors">
              Order {qty} Script{qty > 1 ? 's' : ''} — ${total} →
            </a>
          </>
        )}

        {!selected && (
          <div className="text-center py-6 text-gray-400 text-sm">
            Select a video type above to see pricing and what's included
          </div>
        )}
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
    name: '', email: '', scriptType: '', qty: '', niche: '', deadline: '', details: '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.scriptType) return
    setStatus('sending')
    console.log('Video Scripts inquiry:', form)
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Script Type *</label>
        <select name="scriptType" value={form.scriptType} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] bg-white">
          <option value="">Select script type…</option>
          <option>YouTube Short (under 60 sec) — $5</option>
          <option>YouTube Standard (1–3 min) — $10</option>
          <option>YouTube Long-Form (5–10 min) — $18</option>
          <option>YouTube Deep-Dive (10–20 min) — $29</option>
          <option>TikTok Script — $5</option>
          <option>Instagram Reels Script — $5</option>
          <option>Video Ad (Facebook/YouTube) — $8</option>
          <option>Explainer Video — $10</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Scripts</label>
        <input name="qty" value={form.qty} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. 3 scripts" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Niche / Industry</label>
        <input name="niche" value={form.niche} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. Finance, Fitness, SaaS" />
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
          placeholder="Tell us about your channel/brand, target audience, tone of voice, video topics and any specific talking points to include…" />
      </div>
      <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
        <button onClick={handleSubmit}
          disabled={status === 'sending' || !form.name || !form.email || !form.scriptType}
          className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors">
          {status === 'sending' ? 'Sending…' : 'Send Inquiry →'}
        </button>
        <p className="text-xs text-gray-400">Reply within 24 hours · Email only · No calls</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VideoScriptsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#1B5FA8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#1B5FA8]/10 border border-[#1B5FA8]/30 text-[#1B5FA8] text-sm px-4 py-2 rounded-full mb-6 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#1B5FA8] animate-pulse" />
            Video Scripts · Human-Written · Platform-Native
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
            The First 3 Seconds<br />
            <span className="text-[#1B5FA8]">Decide Everything.<br className="hidden md:block" /> Make Them Count.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            If your hook doesn't grab them — nothing else matters. Our human writers craft
            <strong className="text-gray-700"> scroll-stopping hooks, structured narratives and CTAs that convert</strong> — for every platform, every video length, every niche.
          </p>

          <p className="text-base text-gray-400 mb-8 max-w-xl mx-auto">
            Our AI YouTube Script Generator is free — and great for drafts. But when you need a script that keeps viewers watching all the way to the CTA, that's what our human writers deliver.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {[
              { icon: '▶️', text: 'YouTube' },
              { icon: '🎵', text: 'TikTok' },
              { icon: '📸', text: 'Reels' },
              { icon: '📣', text: 'Video Ads' },
              { icon: '💡', text: 'Explainers' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 font-medium shadow-sm">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#calculator" className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1B5FA8]/20 text-center">
              Calculate Your Price →
            </a>
            <a href="#inquiry" className="w-full sm:w-auto border-2 border-gray-300 hover:border-[#1B5FA8] text-gray-600 hover:text-[#1B5FA8] px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center">
              Discuss Your Project
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <section className="py-10 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { stat: '3 sec', label: 'Average time before a viewer decides to stay or leave' },
            { stat: '500hrs', label: 'Of video uploaded to YouTube every single minute' },
            { stat: '80%',   label: 'Of viewers remember a video they watched in the past month' },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <p className="text-3xl font-bold text-white mb-1">{stat}</p>
              <p className="text-white/70 text-sm leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What Makes a Great Script ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">What Every Script Includes</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Not just words on a page. A fully structured, platform-ready script — written to perform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎣', label: 'Scroll-Stopping Hook',        desc: 'The first 3–5 seconds written to stop the skip, grab attention and make the viewer want to stay.' },
              { icon: '📐', label: 'Clear Structure',             desc: 'Intro → body → CTA. Every section earns its place. Nothing that doesn\'t serve the viewer or the goal.' },
              { icon: '🗣️', label: 'Natural When Spoken',         desc: 'Scripts that sound like a person talking — not like an essay being read aloud. Easy to deliver on camera.' },
              { icon: '📱', label: 'On-Screen Text Suggestions',  desc: 'Key phrases and callouts marked for on-screen text overlays — so your editor knows what to highlight.' },
              { icon: '🎯', label: 'CTA That Converts',           desc: 'A closing call-to-action that feels natural, not forced — and tells the viewer exactly what to do next.' },
              { icon: '✅', label: 'Copyscape Verified',           desc: '100% original content. Plagiarism certificate on every delivery.' },
            ].map((d) => (
              <div key={d.label} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-[#1B5FA8]/40 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-[#1B5FA8]/8 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {d.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{d.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>

          {/* YouTube bonus */}
          <div className="mt-6 bg-[#C9943A]/8 border border-[#C9943A]/30 rounded-xl p-5 flex items-start gap-4">
            <span className="text-2xl shrink-0">⭐</span>
            <div>
              <p className="font-bold text-gray-900 mb-1">YouTube Long-Form & Deep-Dive Bonus</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Long-form YouTube scripts (5 mins+) also include <strong className="text-gray-700">thumbnail text suggestions</strong> and <strong className="text-gray-700">chapter markers</strong> — so your video is optimised for discovery before you even hit record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Script Calculator ─────────────────────────────────────────────── */}
      <section id="calculator" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Calculate Your Script Price</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Select your platform and video type — see exactly what's included and your total price instantly.
          </p>
          <ScriptCalculator />
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">AI Script vs Human Script</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            AI scripts are fast. Human scripts perform. Here's the honest difference.
          </p>
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
              <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Feature</div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">🤖</div>
                <p className="text-xs font-bold text-gray-500">AI Script</p>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">🖊️</div>
                <p className="text-xs font-bold text-gray-500">DIY Script</p>
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
                <div className="p-4 flex items-center justify-center"><Cell value={row.human} /></div>
                <div className="p-4 flex items-center justify-center bg-[#1B5FA8]/3 border-l-2 border-[#1B5FA8]/20">
                  <Cell value={row.rankivo} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-white">From Brief to Camera-Ready</h2>
          <p className="text-white/70 mb-12 max-w-lg mx-auto text-sm">No calls. No back-and-forth. Brief us once and we deliver.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Brief Us',       desc: 'Tell us your platform, video topic, audience and tone. Email your brief to sales@rankivo.co.' },
              { step: '2', title: 'We Write',        desc: 'Our writer crafts your script — hook, structure, CTA — reviewed before delivery.' },
              { step: '3', title: 'You Record',      desc: 'Receive your script, on-screen text suggestions and Copyscape report. Hit record. Go live.' },
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
            <h3 className="font-bold text-gray-900 text-lg">Try our AI YouTube Script Generator — free</h3>
            <p className="text-sm text-gray-500 mt-1">Generate a full video script in seconds. Use it as a starting brief for our human writers.</p>
          </div>
          <Link href="/tools/youtube-script-generator"
            className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
            Try AI Script Generator Free →
          </Link>
        </div>
      </section>

      {/* ── Inquiry Form ──────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
            <p className="text-gray-500">Tell us your platform, video type and topic — we'll reply within 24 hours.</p>
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
