'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: 'amazon',
    icon: '📦',
    label: 'Amazon',
    color: '#FF9900',
    bgLight: 'bg-orange-50',
    borderActive: 'border-orange-400',
    format: 'Bullet points + keyword-rich title + backend keyword suggestions',
    why: 'Amazon\'s A9 algorithm rewards keyword placement and structured bullet points. Generic descriptions get buried. Platform-specific copy gets found.',
    before: {
      title: 'Wireless Bluetooth Headphones',
      body: `This is a great pair of headphones. They are wireless and use Bluetooth technology. The battery lasts a long time and the sound quality is good. They are comfortable to wear and come in black. Good for music and calls.`,
    },
    after: {
      title: 'Wireless Bluetooth Headphones – 40Hr Battery, Active Noise Cancelling, Premium Sound, Foldable Over-Ear Design',
      bullets: [
        '🎵 PREMIUM SOUND QUALITY — 40mm drivers deliver rich bass and crystal-clear highs, engineered for audiophiles and casual listeners alike',
        '🔋 40-HOUR BATTERY LIFE — Industry-leading battery means all-day listening without the anxiety of running out of charge mid-playlist',
        '🔇 ACTIVE NOISE CANCELLING — Block out the world and focus on what matters with ANC technology that eliminates up to 95% of ambient noise',
        '😌 ALL-DAY COMFORT — Memory foam ear cushions and adjustable headband designed for extended wear — no fatigue, no pressure points',
        '📱 UNIVERSAL COMPATIBILITY — Seamlessly connects to iPhone, Android, Mac and PC via Bluetooth 5.0 or included 3.5mm cable',
      ],
    },
  },
  {
    id: 'ebay',
    icon: '🛒',
    label: 'eBay',
    color: '#E53238',
    bgLight: 'bg-red-50',
    borderActive: 'border-red-400',
    format: 'Keyword-heavy title (80 chars) + trust-focused description',
    why: 'eBay buyers are deal-hunters who need reassurance. A keyword-rich title gets you found. A trust-focused description closes the sale.',
    before: {
      title: 'Used iPhone for sale',
      body: `iPhone for sale. It works fine. Has some scratches. Battery is okay. Comes with charger. No returns. Message me if interested.`,
    },
    after: {
      title: 'Apple iPhone 13 128GB Midnight Unlocked Excellent Condition + Charger Fast Shipping',
      body: `What you're getting is a thoroughly tested, fully functional iPhone 13 in Excellent condition — not "good enough", genuinely excellent.\n\n✅ Unlocked for all networks worldwide\n✅ Battery health: 89% (tested and confirmed)\n✅ Screen: No cracks, no dead pixels\n✅ Body: Minor wear consistent with careful use — nothing that affects function\n✅ Includes: Original Apple charger + USB-C cable\n\nEvery device is tested before listing. What you see is exactly what arrives. Fast dispatch within 24 hours. Questions? Message us — we respond within the hour.`,
    },
  },
  {
    id: 'shopify',
    icon: '🛍️',
    label: 'Shopify',
    color: '#96BF48',
    bgLight: 'bg-green-50',
    borderActive: 'border-green-400',
    format: 'Story-led description + SEO meta description',
    why: 'Shopify stores live or die on brand experience. Story-driven copy builds emotional connection — and the right SEO meta description brings in organic traffic.',
    before: {
      title: 'Soy Wax Candle',
      body: `This candle is made from soy wax. It smells nice and burns for a long time. Available in different scents. Makes a good gift.`,
    },
    after: {
      title: 'Midnight Amber Soy Candle',
      body: `Some evenings just need to slow down.\n\nLight the Midnight Amber and let the warm blend of sandalwood, vanilla and a touch of bergamot fill the room. This isn't just a candle — it's the permission slip you've been waiting for to actually unwind.\n\nHand-poured in small batches using 100% natural soy wax, each candle burns cleanly for up to 55 hours. No paraffin, no synthetic fillers — just pure, intentional fragrance that lingers without overwhelming.\n\nPerfect as a gift, or a quiet indulgence for yourself. Because you deserve both.`,
      meta: 'Meta: "Hand-poured Midnight Amber soy candle with sandalwood & vanilla. Burns 55hrs. Natural, clean & beautifully scented. Shop now."',
    },
  },
  {
    id: 'etsy',
    icon: '🎨',
    label: 'Etsy',
    color: '#F1641E',
    bgLight: 'bg-orange-50',
    borderActive: 'border-orange-500',
    format: 'Personal, story-driven tone + tag suggestions',
    why: 'Etsy buyers want to know who made their purchase and why. Personal, warm copy that tells your story converts browsers into loyal customers.',
    before: {
      title: 'Handmade Ceramic Mug',
      body: `Handmade ceramic mug. Good quality. Each one is slightly different. Dishwasher safe. Available in different colours. Makes a nice gift.`,
    },
    after: {
      title: 'Handmade Ceramic Mug — Wheel-Thrown Stoneware, Speckled Glaze, Holds 12oz',
      body: `Every morning deserves a mug that feels like it was made just for you — because this one was.\n\nThis wheel-thrown stoneware mug is shaped by hand in my small studio, one at a time. No two are identical. The speckled glaze catches the light differently depending on the angle, and the slightly asymmetric rim is intentional — a reminder that the best things in life aren't perfectly uniform.\n\nThrown from high-fire stoneware clay and finished with a food-safe, lead-free glaze. Microwave and dishwasher safe, though hand washing keeps the glaze looking its best for longer.\n\n🏷️ Suggested tags: handmade mug, ceramic coffee mug, wheel thrown pottery, stoneware mug, speckled glaze, studio pottery, gift for coffee lover, artisan mug`,
    },
  },
  {
    id: 'generic',
    icon: '🌐',
    label: 'Generic',
    color: '#1B5FA8',
    bgLight: 'bg-blue-50',
    borderActive: 'border-[#1B5FA8]',
    format: 'Flexible benefit-led description for any website',
    why: 'Running your own website? We write benefit-led, SEO-optimised product copy that works on any platform — WooCommerce, BigCommerce, custom sites or anywhere else.',
    before: {
      title: 'Leather Wallet',
      body: `This is a leather wallet. It has multiple card slots and a compartment for cash. It is made from genuine leather and comes in brown or black. Good quality product.`,
    },
    after: {
      title: 'Full-Grain Leather Bifold Wallet',
      body: `Your wallet goes everywhere you do. It gets pulled out dozens of times a day — so it should feel like something worth pulling out.\n\nThis bifold is crafted from full-grain leather: the highest quality cut, with natural grain intact. It won't crack, peel or lose its shape. Instead, it develops a rich patina over time — getting better looking the more you use it.\n\n8 card slots. 2 cash compartments. Slim enough to sit flat in your front pocket. Everything you need, nothing you don't.\n\nAvailable in Cognac Brown and Midnight Black. Presented in a gift-ready box — because the details matter.`,
    },
  },
]

const PACKAGES = [
  {
    name: 'Single Item',
    price: '$3',
    period: '/description',
    volume: '1 product',
    desc: 'Test our quality on one product before committing to a batch.',
    features: ['Any platform format', 'Benefit-led copy', 'SEO keyword placement', 'Copyscape verified', 'Human-crafted & reviewed'],
    ctaStyle: 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600',
    style: 'border-gray-200',
  },
  {
    name: 'Starter Batch',
    price: '$19',
    period: '/batch',
    volume: '10 products',
    desc: 'Perfect for new stores launching their first collection.',
    features: ['Any platform format', 'Benefit-led copy', 'SEO keyword placement', 'Copyscape verified', 'Human-crafted & reviewed', 'Consistent brand voice'],
    ctaStyle: 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600',
    style: 'border-gray-200',
  },
  {
    name: 'Growth Batch',
    price: '$39',
    period: '/batch',
    volume: '25 products',
    desc: 'Scale your store with consistent, conversion-optimised copy across your range.',
    features: ['Any platform format', 'Benefit-led copy', 'SEO keyword placement', 'Copyscape verified', 'Human-crafted & reviewed', 'Consistent brand voice', 'Priority turnaround'],
    ctaStyle: 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white',
    style: 'border-[#1B5FA8]',
    highlight: true,
  },
  {
    name: 'Bulk Batch',
    price: '$69',
    period: '/batch',
    volume: '50 products',
    desc: 'For established stores and agencies handling large product catalogues.',
    features: ['Any platform format', 'Benefit-led copy', 'SEO keyword placement', 'Copyscape verified', 'Human-crafted & reviewed', 'Consistent brand voice', 'Priority turnaround', 'White label available'],
    ctaStyle: 'bg-[#C9943A] hover:bg-[#C9943A]/90 text-white',
    style: 'border-[#C9943A]/40',
    gold: true,
  },
]

// ─── Platform Picker + Before/After ──────────────────────────────────────────

function PlatformDemo() {
  const [activePlatform, setActivePlatform] = useState('amazon')
  const [showAfter, setShowAfter] = useState(false)
  const platform = PLATFORMS.find(p => p.id === activePlatform)

  // Reset toggle when platform changes
  function selectPlatform(id) {
    setActivePlatform(id)
    setShowAfter(false)
  }

  return (
    <div className="bg-white border-2 border-[#1B5FA8]/20 rounded-2xl overflow-hidden">
      {/* Platform tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50">
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => selectPlatform(p.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
              activePlatform === p.id
                ? `border-[#1B5FA8] text-[#1B5FA8] bg-white`
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {/* Platform info */}
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl" style={{ backgroundColor: platform.color + '10' }}>
          <span className="text-2xl shrink-0">{platform.icon}</span>
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1">{platform.label} Format: <span className="font-normal text-gray-600">{platform.format}</span></p>
            <p className="text-xs text-gray-500 leading-relaxed">{platform.why}</p>
          </div>
        </div>

        {/* Before / After toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {showAfter ? '✅ After — Rankivo Human-Written' : '❌ Before — Generic Description'}
          </p>
          <button onClick={() => setShowAfter(s => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              showAfter
                ? 'bg-[#0D9488] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {showAfter ? '← See Before' : 'See After →'}
          </button>
        </div>

        {/* Content display */}
        <div className={`rounded-xl border-2 p-5 transition-all duration-300 ${
          showAfter ? 'border-[#0D9488]/30 bg-[#0D9488]/3' : 'border-red-200 bg-red-50/30'
        }`}>
          {!showAfter ? (
            // BEFORE
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">{platform.before.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{platform.before.body}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-bold text-red-400 bg-red-100 px-2 py-1 rounded-full">❌ No keywords</span>
                <span className="text-xs font-bold text-red-400 bg-red-100 px-2 py-1 rounded-full">❌ No benefits</span>
                <span className="text-xs font-bold text-red-400 bg-red-100 px-2 py-1 rounded-full">❌ Generic</span>
              </div>
            </div>
          ) : (
            // AFTER
            <div>
              <p className="text-sm font-bold text-gray-800 mb-3">{platform.after.title}</p>
              {platform.after.bullets ? (
                <ul className="space-y-2">
                  {platform.after.bullets.map((b, i) => (
                    <li key={i} className="text-sm text-gray-700 leading-relaxed">{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{platform.after.body}</p>
              )}
              {platform.after.meta && (
                <p className="text-xs text-[#0D9488] font-medium mt-3 italic">{platform.after.meta}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-1 rounded-full">✓ Keywords placed</span>
                <span className="text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-1 rounded-full">✓ Benefits first</span>
                <span className="text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-1 rounded-full">✓ Platform-native</span>
                <span className="text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-1 rounded-full">✓ Copyscape verified</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">Sample only — your descriptions are written around your actual products</p>
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
    name: '', email: '', package: '', platform: '', niche: '', deadline: '', details: '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.package) return
    setStatus('sending')
    console.log('Product Descriptions inquiry:', form)
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
          <option>Single Item — $3</option>
          <option>Starter Batch — 10 items ($19)</option>
          <option>Growth Batch — 25 items ($39)</option>
          <option>Bulk Batch — 50 items ($69)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
        <select name="platform" value={form.platform} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8] bg-white">
          <option value="">Select your platform…</option>
          <option>Amazon</option>
          <option>eBay</option>
          <option>Shopify</option>
          <option>Etsy</option>
          <option>Other / Generic</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Niche</label>
        <input name="niche" value={form.niche} onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
          placeholder="e.g. Electronics, Fashion, Handmade" />
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
          placeholder="Tell us about your products, brand voice, target audience and any specific keywords to target…" />
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

export default function ProductDescriptionsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-orange-50/20 to-blue-50/20 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#1B5FA8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-500 text-sm px-4 py-2 rounded-full mb-6 font-semibold">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Product Descriptions · Platform-Specific · Human-Crafted
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
            Your Products Are Great.<br />
            <span className="text-[#1B5FA8]">Your Descriptions Should<br className="hidden md:block" /> Be Too.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-4 max-w-2xl mx-auto leading-relaxed">
            Generic copy loses sales. <strong className="text-gray-700">Platform-specific copy wins them.</strong> We're the only service that writes descriptions formatted specifically for Amazon, eBay, Shopify, Etsy or your own website — same price, right format, ready to paste.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {PLATFORMS.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 font-medium shadow-sm">
                <span>{p.icon}</span><span>{p.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#demo" className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1B5FA8]/20 text-center">
              See Before & After
            </a>
            <a href="#pricing" className="w-full sm:w-auto border-2 border-gray-300 hover:border-[#1B5FA8] text-gray-600 hover:text-[#1B5FA8] px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── USP Strip ─────────────────────────────────────────────────────── */}
      <section className="py-5 px-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { icon: '🎯', text: 'Platform-specific format' },
            { icon: '💡', text: 'Benefits over features' },
            { icon: '🔍', text: 'SEO keyword placement' },
            { icon: '✅', text: 'Copyscape verified' },
            { icon: '⚡', text: 'From $3 per description' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform Demo ─────────────────────────────────────────────────── */}
      <section id="demo" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Pick Your Platform — See the Difference</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Select your selling platform, then toggle between a generic description and what our human writers deliver. The difference is immediate.
          </p>
          <PlatformDemo />
        </div>
      </section>

      {/* ── Why Platform-Specific ──────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Why Platform-Specific Matters</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Every platform has its own algorithm, buyer psychology and format rules. One-size-fits-all copy leaves money on the table.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📦', label: 'Amazon',  color: '#FF9900', detail: 'Bullet points, keyword-rich titles and backend search terms — formatted exactly as Amazon\'s A9 algorithm rewards.' },
              { icon: '🛒', label: 'eBay',    color: '#E53238', detail: 'Trust-focused copy with keyword-heavy titles under 80 characters — written for deal-hunters who need reassurance.' },
              { icon: '🛍️', label: 'Shopify', color: '#96BF48', detail: 'Story-driven descriptions with SEO meta copy — built to rank on Google and convert visitors into buyers.' },
              { icon: '🎨', label: 'Etsy',    color: '#F1641E', detail: 'Warm, personal storytelling with tag suggestions — because Etsy buyers buy from makers, not from stores.' },
              { icon: '🌐', label: 'Generic', color: '#1B5FA8', detail: 'Flexible benefit-led copy for WooCommerce, BigCommerce or any custom site — optimised for your specific audience.' },
            ].map((p) => (
              <div key={p.label} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="font-bold text-gray-900">{p.label}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Simple Batch Pricing</h2>
          <p className="text-gray-500 text-center mb-4 max-w-xl mx-auto">
            The more products you order, the lower the per-description cost. All platforms, same price.
          </p>
          <p className="text-center text-sm text-[#1B5FA8] font-semibold mb-12">
            💡 Bulk batch works out to $1.38/description — less than a cup of tea.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} className={`relative rounded-xl p-6 border-2 shadow-sm bg-white flex flex-col ${pkg.style}`}>
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}
                {pkg.gold && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#C9943A] text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
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
                <a href="#inquiry" className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${pkg.ctaStyle}`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#1B5FA8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-white">From Product List to Published Descriptions</h2>
          <p className="text-white/70 mb-12 max-w-lg mx-auto text-sm">Three steps. No complexity. Just send us your products and we handle the rest.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Send Your Products',  desc: 'Share your product names, key features, target keywords and platform. Email your list to sales@rankivo.co.' },
              { step: '2', title: 'We Write',             desc: 'Our writers craft platform-specific descriptions for every item — formatted correctly and reviewed before delivery.' },
              { step: '3', title: 'You Publish',          desc: 'Receive your descriptions formatted and ready to paste. Copy, upload, go live. Done.' },
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
            <h3 className="font-bold text-gray-900 text-lg">Try our AI Ad Copy Generator — free</h3>
            <p className="text-sm text-gray-500 mt-1">Generate product copy drafts in seconds. Use them as a brief for our human writers.</p>
          </div>
          <Link href="/tools/ad-copy-generator"
            className="shrink-0 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
            Try AI Ad Copy Generator Free →
          </Link>
        </div>
      </section>

      {/* ── Inquiry Form ──────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
            <p className="text-gray-500">Tell us your platform, products and volume — we'll reply within 24 hours.</p>
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
