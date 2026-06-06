'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: 'instagram',
    icon: '📸',
    label: 'Instagram',
    price: '$2',
    per: 'per post',
    color: '#E1306C',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    active: 'border-pink-400 bg-pink-50',
    format: 'Caption + hashtags',
    length: '150–300 words',
    hashtags: '5–10 hashtags',
    example: {
      handle: '@yourbrand',
      content: `Stop scrolling. 👇\n\nYour content strategy is costing you followers — and you don't even know it.\n\nHere's what's actually working right now:\n\n✅ Storytelling over selling\n✅ Hooks in the first 3 words\n✅ Consistency over perfection\n\nWhich one are you missing? Drop it below. 👇`,
      hashtags: '#ContentMarketing #InstagramGrowth #SocialMediaTips #DigitalMarketing #ContentStrategy',
    },
  },
  {
    id: 'tiktok',
    icon: '🎵',
    label: 'TikTok',
    price: '$1.50',
    per: 'per post',
    color: '#010101',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    active: 'border-gray-800 bg-gray-50',
    format: 'Hook + caption + hashtags',
    length: '50–150 words',
    hashtags: '5–8 hashtags',
    example: {
      handle: '@yourbrand',
      content: `POV: You finally stopped guessing what to post 👀\n\nWe write your captions so you can focus on filming.\n\nHuman-written. Platform-optimised. Delivered to your inbox.`,
      hashtags: '#TikTokMarketing #ContentCreator #SmallBusiness #TikTokGrowth #CreatorTips',
    },
  },
  {
    id: 'twitter',
    icon: '𝕏',
    label: 'X (Twitter)',
    price: '$1.50',
    per: 'per post',
    color: '#000000',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    active: 'border-black bg-gray-50',
    format: 'Tweet copy + hashtags',
    length: 'Under 280 characters',
    hashtags: '2–4 hashtags',
    example: {
      handle: '@yourbrand',
      content: `Most content fails not because of the idea — but because of the first line.\n\nYour hook is everything. Fix that, and everything else follows.\n\n#ContentMarketing #CopywritingTips`,
      hashtags: '',
    },
  },
  {
    id: 'facebook',
    icon: '👥',
    label: 'Facebook',
    price: '$2',
    per: 'per post',
    color: '#1877F2',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    active: 'border-blue-500 bg-blue-50',
    format: 'Post copy + hashtags',
    length: '100–250 words',
    hashtags: '3–5 hashtags',
    example: {
      handle: 'Your Brand Page',
      content: `We get it — creating content every day is exhausting.\n\nThat's exactly why we built a done-for-you social media writing service. You tell us your brand, your audience and your goals. We write the posts. You just show up and publish.\n\nHuman-written. Platform-native. Priced so it actually makes sense for small businesses.\n\nDrop a 🙋 if you'd like to know more.`,
      hashtags: '#SmallBusiness #SocialMediaMarketing #ContentCreation #FacebookMarketing',
    },
  },
  {
    id: 'linkedin',
    icon: '💼',
    label: 'LinkedIn',
    price: '$4',
    per: 'per post',
    color: '#0A66C2',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    active: 'border-[#0A66C2] bg-blue-50',
    format: 'Professional post + hashtags',
    length: '150–300 words',
    hashtags: '3–5 hashtags',
    example: {
      handle: 'Your Name · Your Title',
      content: `I spent 3 years posting on LinkedIn with zero results.\n\nThen I changed one thing — and everything shifted.\n\nI stopped writing about what I do. I started writing about what my audience struggles with.\n\nThe difference:\n→ Before: "We offer content writing services"\n→ After: "Here's why your content isn't converting — and how to fix it"\n\nOne is a pitch. The other is a conversation.\n\nYour audience doesn't want to be sold to. They want to feel understood.\n\nStart there.`,
      hashtags: '#LinkedInMarketing #ContentStrategy #B2BMarketing #ThoughtLeadership',
    },
  },
]

const PACKAGES = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    volume: '15 posts/month',
    desc: 'Perfect for businesses just getting consistent with social media. Any platform mix you choose.',
    features: [
      '15 posts across any platforms',
      'Platform-optimised format per post',
      'Human-crafted copy',
      '5–10 hashtags per post',
      'Copyscape verified',
      'Delivered in one batch',
    ],
    cta: 'Get Started',
    style: 'border-gray-200',
    ctaStyle: 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$55',
    period: '/month',
    volume: '30 posts/month',
    desc: 'For brands ready to show up consistently and build a real audience across multiple platforms.',
    features: [
      '30 posts across any platforms',
      'Platform-optimised format per post',
      'Human-crafted copy',
      '5–10 hashtags per post',
      'Copyscape verified',
      'Content calendar included',
      'Priority turnaround',
    ],
    cta: 'Get Started',
    style: 'border-[#1B5FA8]',
    ctaStyle: 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$120',
    period: '/month',
    volume: '100 posts/month',
    desc: 'White label delivery for agencies managing multiple client accounts. NDA available on request.',
    features: [
      '100 posts across any platforms',
      'Platform-optimised format per post',
      'Human-crafted copy',
      '5–10 hashtags per post',
      'Copyscape verified',
      'Content calendar included',
      'White label delivery',
      'NDA available on request',
      'Dedicated account manager',
      'Priority turnaround',
    ],
    cta: 'Get Started',
    style: 'border-[#C9943A]/40',
    ctaStyle: 'bg-[#C9943A] hover:bg-[#C9943A]/90 text-white',
    highlight: false,
    gold: true,
  },
]

const COMPARISON = [
  { feature: 'Sounds authentically human',    ai: 'sometimes', diy: 'sometimes', rankivo: true },
  { feature: 'Platform-native format',        ai: 'sometimes', diy: false,       rankivo: true },
  { feature: 'Hashtag research included',     ai: false,       diy: false,       rankivo: true },
  { feature: 'Consistent brand voice',        ai: false,       diy: true,        rankivo: true },
  { feature: 'Copyscape verified',            ai: false,       diy: false,       rankivo: true },
  { feature: 'Saves you hours every week',    ai: true,        diy: false,       rankivo: true },
  { feature: 'Engagement-optimised hooks',    ai: 'sometimes', diy: 'sometimes', rankivo: true },
  { feature: 'Content calendar',             ai: false,       diy: false,       rankivo: 'Growth+' },
]

// ─── Platform Preview ─────────────────────────────────────────────────────────

function PlatformPicker() {
  const [active, setActive] = useState('instagram')
  const platform = PLATFORMS.find(p => p.id === active)

  return (
    <div className="bg-white border-2 border-[#1B5FA8]/20 rounded-2xl overflow-hidden">
      {/* Platform tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50">
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setActive(p.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
              active === p.id
                ? 'border-[#1B5FA8] text-[#1B5FA8] bg-white'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              active === p.id ? 'bg-[#1B5FA8]/10 text-[#1B5FA8]' : 'bg-gray-100 text-gray-400'
            }`}>{p.price}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Platform details */}
        <div className="p-6 border-r border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{platform.icon}</span>
            <div>
              <h3 className="font-bold text-gray-900">{platform.label}</h3>
              <p className="text-sm text-gray-400">{platform.price} per post</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Format',    value: platform.format   },
              { label: 'Length',    value: platform.length   },
              { label: 'Hashtags',  value: platform.hashtags },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0 pt-0.5">{label}</span>
                <span className="text-sm text-gray-700 font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 bg-[#1B5FA8]/5 rounded-xl">
            <p className="text-xs text-[#1B5FA8] font-semibold">✓ Every post includes Copyscape verification + human expert review</p>
          </div>
        </div>

        {/* Post preview */}
        <div className="p-6 bg-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Example post</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-3">{platform.example.handle}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">
              {platform.example.content}
            </p>
            {platform.example.hashtags && (
              <p className="text-xs text-[#1B5FA8] font-medium leading-relaxed">
                {platform.example.hashtags}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Sample only — your posts are written around your brand</p>
        </div>
      </div>
    </div>
  )
}

// ─── Comparison Cell ──────────────────────────────────────────────────────────

function Cell({ value }) {
  if (value === true)        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-bold">✓</span>
  if (value === false)       return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-400 text-sm font-bold">✗</span>
  if (value === 'sometimes') return <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Sometimes</span>
  if (value === 'Growth+')   return <span className="text-xs font-semibold text-[#1B5FA8] bg-[#1B5FA8]/8 px-2 py-1 rounded-full">Growth+</span>
  return null
}

// ─── Inquiry Form ─────────────────────────────────────────────────────────────

function InquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', package: '', platforms: '', niche: '', deadline: '', details: '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.package) return
    setStatus('sending')
    console.log('Social Media Content inquiry:', form)
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
          <option>Per Post — Instagram $2</option>
          <option>Per Post — TikTok $1.50</option>
          <option>Per Post — X (Twitter) $1.50</option>
          <option>Per Post — Facebook $2</option>
          <option>Per Post — LinkedIn $4</option>
          <option>Starter Pack — 15 posts $29/mo</option>
          <option>Growth Pack — 30 posts $55/mo</option>
          <option>Agency Pack — 100 posts $120/mo</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Platforms Needed</label>
        <input name="platforms" value={form.platforms} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. Instagram + LinkedIn" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Niche</label>
        <input name="niche" value={form.niche} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. SaaS, Fashion, Fitness" />
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
          placeholder="Tell us about your brand, tone of voice, target audience, any topics or campaigns to cover…" />
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

export default function SocialMediaContentPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-pink-50/20 to-blue-50/20 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-pink-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#1B5FA8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 text-pink-500 text-sm px-4 py-2 rounded-full mb-6 font-semibold">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            Social Media Content · Human-Written · Platform-Native
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
            AI Posts Get Ignored.<br />
            <span className="text-[#1B5FA8]">Human-Written Content<br className="hidden md:block" /> Gets Shared.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            There's a difference — and your audience feels it instantly. Every post we write is
            <strong className="text-gray-700"> crafted for your platform, your brand and your audience.</strong> Not a template. Not a prompt output. A post people actually want to engage with.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {[
              { icon: '📸', text: 'Instagram' },
              { icon: '🎵', text: 'TikTok' },
              { icon: '𝕏', text: 'X (Twitter)' },
              { icon: '👥', text: 'Facebook' },
              { icon: '💼', text: 'LinkedIn' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 font-medium shadow-sm">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricing" className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1B5FA8]/20 text-center">
              View Packages
            </a>
            <a href="#inquiry" className="w-full sm:w-auto border-2 border-gray-300 hover:border-[#1B5FA8] text-gray-600 hover:text-[#1B5FA8] px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center">
              Discuss Your Project
            </a>
          </div>
        </div>
      </section>

      {/* ── Platform Picker ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Pick Your Platform — See What You Get</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Every platform has its own format, tone and audience. Click yours to see pricing, format details and a real example post.
          </p>
          <PlatformPicker />
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Why Not Just Use AI?</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            AI content is fast. But fast isn't the same as good — and your audience knows the difference.
          </p>

          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
              <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Feature</div>
              <div className="p-4 text-center">
                <div className="text-2xl mb-1">🤖</div>
                <p className="text-xs font-bold text-gray-500">AI Content</p>
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
      <section className="py-20 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Every Post. Every Platform. Everything Included.</h2>
          <p className="text-white/70 mb-10 text-sm max-w-lg mx-auto">No upsells. No add-ons. This is what lands in your inbox with every single post.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '✍️', label: 'Human-crafted copy that sounds like you' },
              { icon: '📐', label: 'Platform-native format and length' },
              { icon: '#️⃣', label: '5–10 researched hashtags per post' },
              { icon: '✅', label: 'Copyscape plagiarism verified' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-2xl">{icon}</div>
                <p className="text-white/90 text-sm font-medium leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Packages That Fit Every Budget</h2>
          <p className="text-gray-500 text-center mb-4 max-w-xl mx-auto">
            Order individual posts or save more with a monthly pack. Mix any platforms you need.
          </p>
          <p className="text-center text-sm text-[#1B5FA8] font-semibold mb-12">
            💡 Growth pack works out to $1.83/post. Agency pack: $1.20/post.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} className={`relative rounded-xl p-6 border-2 shadow-sm bg-white flex flex-col ${pkg.style}`}>
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
                  <a href="#inquiry" className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${pkg.ctaStyle}`}>
                    {pkg.cta}
                  </a>
                  <a href="#inquiry" className="block text-center py-2 text-xs font-medium text-gray-400 hover:text-[#1B5FA8] transition-colors">
                    Discuss first →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Per post pricing table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <p className="text-sm font-bold text-gray-600">Or order individual posts — pay per post</p>
            </div>
            <div className="divide-y divide-gray-100">
              {PLATFORMS.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.label}</p>
                      <p className="text-xs text-gray-400">{p.format}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1B5FA8]">{p.price}</p>
                    <p className="text-xs text-gray-400">{p.per}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">From Brief to Ready-to-Post</h2>
          <p className="text-gray-500 mb-12 max-w-lg mx-auto text-sm">No calls. No complexity. Just tell us your brand and we handle the rest.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', color: '#1B5FA8', title: 'Brief Us',       desc: 'Tell us your platforms, brand voice, niche and any topics. Email sales@rankivo.co to get started.' },
              { step: '2', color: '#0D9488', title: 'We Write',        desc: 'Our writers craft each post in your brand voice, optimised for your platform and reviewed before delivery.' },
              { step: '3', color: '#C9943A', title: 'You Post',        desc: 'Receive your posts, hashtags and content calendar by email. Copy, paste, schedule. Done.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg" style={{ backgroundColor: s.color }}>
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Cross-link ─────────────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Need content instantly?</p>
            <h3 className="font-bold text-gray-900 text-lg">Try our AI Social Media Generators — free</h3>
            <p className="text-sm text-gray-500 mt-1">Instagram, TikTok, LinkedIn and X — generate posts in seconds with our free AI tools.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/tools/instagram-caption-generator" className="bg-pink-50 hover:bg-pink-100 text-pink-500 border border-pink-200 px-4 py-2 rounded-xl font-semibold text-xs transition-colors">📸 Instagram</Link>
            <Link href="/tools/linkedin-post-generator" className="bg-blue-50 hover:bg-blue-100 text-[#0A66C2] border border-blue-200 px-4 py-2 rounded-xl font-semibold text-xs transition-colors">💼 LinkedIn</Link>
            <Link href="/tools/tiktok-caption-generator" className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-semibold text-xs transition-colors">🎵 TikTok</Link>
          </div>
        </div>
      </section>

      {/* ── Inquiry Form ──────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
            <p className="text-gray-500">Tell us your platforms, brand and goals — we'll reply within 24 hours.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <InquiryForm />
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Or email directly at <strong>sales@rankivo.co</strong> · We reply within 24 hours · No calls, no pressure
          </p>
        </div>
      </section>

      <div className="py-6 px-6 bg-white text-center border-t border-gray-100">
        <Link href="/services/human-writing" className="text-sm text-gray-400 hover:text-[#1B5FA8] transition-colors">
          ← View all human writing services
        </Link>
      </div>

      <Footer />
    </div>
  )
}
