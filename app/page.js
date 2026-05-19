import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import InteractiveDemo from '../components/InteractiveDemo'

export const metadata = {
  title: 'RANKIVO — Write Less. Rank More. Grow Faster.',
  description: 'Rankivo is the AI platform that writes SEO-optimized content for your blog, social media, ads and more — then helps you rank for it. One tool. Total content + SEO.',
}

export default function Home() {
  const features = [
    {
      title: 'AI That Writes & Ranks',
      desc: 'Not just content — SEO-ready content. Every output comes with meta titles, H1 options and keyword structure baked in.',
      icon: '✦', color: 'blue',
    },
    {
      title: 'Every Platform, One Place',
      desc: 'Instagram captions, blog posts, LinkedIn articles, TikTok scripts, YouTube videos, email copy, ads — all from one dashboard.',
      icon: '◈', color: 'teal',
    },
    {
      title: '6 Languages, Global Reach',
      desc: 'Publish in English, Spanish, French, German, Arabic and Urdu. Your content, your audience, no limits.',
      icon: '◉', color: 'gold',
    },
    {
      title: 'Human-Polished Output',
      desc: 'Want that extra edge? Our professional editors take your AI draft from good to undeniably great.',
      icon: '◐', color: 'blue',
    },
    {
      title: 'Built Around Your Audience',
      desc: 'Set your tone, niche and target reader once. Every piece Rankivo writes is tailored — not templated.',
      icon: '◎', color: 'teal',
    },
    {
      title: 'Your Content. Always There.',
      desc: 'Full history of everything you\'ve generated. Access, copy, remix and reuse any time.',
      icon: '◆', color: 'gold',
    },
  ]

  const testimonials = [
    { name: 'Sarah M.',  role: 'Social Media Manager',    text: 'RANKIVO cut my content creation time from 3 hours to 15 minutes. The SEO optimization is genuinely impressive.',       stars: 5 },
    { name: 'Ahmed K.',  role: 'E-commerce Owner',         text: 'I was spending $500/month on content writers. Now I generate 10x more content for a fraction of the cost.',           stars: 5 },
    { name: 'Priya R.',  role: 'Digital Marketing Agency', text: 'The multi-language support is a game changer for our international clients. Best AI content tool we\'ve tried.',      stars: 5 },
    { name: 'James T.',  role: 'Blogger',                  text: 'My blog traffic doubled in 2 months after switching to RANKIVO for SEO content. The meta descriptions are spot-on.',  stars: 5 },
    { name: 'Fatima A.', role: 'Startup Founder',          text: 'As a non-native English speaker, RANKIVO helps me create professional content that sounds native. Life-changing.',    stars: 5 },
    { name: 'Carlos D.', role: 'YouTube Creator',          text: 'The YouTube script generator is incredible. My video watch time increased 40% after using RANKIVO scripts.',          stars: 5 },
  ]

  const colorMap = {
    blue: { icon: 'text-[#1B5FA8] bg-[#1B5FA8]/10', border: 'hover:border-[#1B5FA8]/40' },
    teal: { icon: 'text-[#0D9488] bg-[#0D9488]/10', border: 'hover:border-[#0D9488]/40' },
    gold: { icon: 'text-[#C9943A] bg-[#C9943A]/10', border: 'hover:border-[#C9943A]/40' },
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#0D9488]/10 border border-[#0D9488]/30 text-[#0D9488] text-sm px-4 py-2 rounded-full mb-6 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            AI Content + SEO — Together, Finally
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900">
            Write Less. Rank More.<br />
            <span className="text-[#1B5FA8]">Grow Without Limits.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-4 max-w-2xl mx-auto leading-relaxed">
            Rankivo is the AI platform that creates <strong className="text-gray-700 font-semibold">SEO-optimized content</strong> for
            your blog, social media, ads and more — then gives you the keyword strategy to rank for it.
          </p>
          <p className="text-base text-gray-400 mb-10 max-w-xl mx-auto">
            One tool for freelancers, founders, marketers and agencies who are done wasting time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth?mode=signup"
              className="w-full sm:w-auto bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1B5FA8]/20 text-center"
            >
              Start Free — No Credit Card
            </Link>
            <Link
              href="/auth"
              className="w-full sm:w-auto border-2 border-gray-300 hover:border-[#1B5FA8] text-gray-600 hover:text-[#1B5FA8] px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center"
            >
              Login to Dashboard
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-4">3 free posts per month. No credit card. No catch.</p>
        </div>
      </section>

      {/* ── Interactive Demo ─────────────────────────────────────────────────── */}
      <InteractiveDemo />

      {/* ── Trust Bar ────────────────────────────────────────────────────────── */}
      <section className="py-5 px-6 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {[
            { icon: '⚡', text: 'Content live in seconds' },
            { icon: '🎯', text: 'SEO-ready from the first word' },
            { icon: '🌍', text: '6 languages supported' },
            { icon: '🔒', text: 'No credit card to start' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="py-12 border-b border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '8+',   label: 'Platforms Supported', color: 'text-[#1B5FA8]' },
            { value: '6',    label: 'Languages',            color: 'text-[#0D9488]' },
            { value: '10x',  label: 'Faster Than Manual',  color: 'text-[#C9943A]' },
            { value: '100%', label: 'SEO-Optimized Output', color: 'text-[#1B5FA8]' },
          ].map((s) => (
            <div key={s.label}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Everything to Create, Rank and Scale
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Rankivo combines an AI content engine with an SEO strategy layer — so every post you publish has a real shot at ranking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => {
              const s = colorMap[f.color]
              return (
                <div key={f.title} className={`bg-white border border-gray-200 rounded-xl p-6 ${s.border} transition-colors shadow-sm`}>
                  <div className={`${s.icon} text-lg w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>{f.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">From Keyword to Published — in Minutes</h2>
          <p className="text-gray-500 mb-12 max-w-lg mx-auto">
            No complex setup. No learning curve. Just tell Rankivo what you need and ship it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1', color: '#1B5FA8',
                title: 'Pick Your Platform',
                desc: 'Instagram, TikTok, LinkedIn, Blog, YouTube, Email, Ads — choose where you\'re publishing.',
              },
              {
                step: '2', color: '#0D9488',
                title: 'Tell Us What You Need',
                desc: 'Drop in your topic, target keyword, tone and audience. Rankivo handles the rest.',
              },
              {
                step: '3', color: '#C9943A',
                title: 'Publish & Rank',
                desc: 'Get fully SEO-optimized content in seconds. Copy, paste, publish. Done.',
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg"
                  style={{ backgroundColor: s.color }}
                >
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/auth?mode=signup" className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-8 py-3 rounded-xl font-semibold transition-colors inline-block">
              Try It Free — Takes 30 Seconds
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Pricing That Scales With You
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Start free. No credit card. Upgrade the moment you need more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free', price: '$0', period: 'forever', posts: '3 posts/month',
                features: ['All platforms', '6 languages', 'SEO optimization', 'Content history'],
                cta: 'Get Started Free', href: '/auth?mode=signup', style: 'border-gray-200',
              },
              {
                name: 'Pro', price: '$9', period: 'per month', posts: '50 posts/month', popular: true,
                features: ['All platforms', '6 languages', 'Full SEO tools', 'Priority generation', 'Email support'],
                cta: 'Start Pro Plan', href: '/upgrade', style: 'border-[#1B5FA8]',
              },
              {
                name: 'Premium', price: '$29', period: 'per month', posts: '300 posts/month',
                features: ['All platforms', '6 languages', 'Full SEO tools', 'Priority generation', 'Priority support', 'API access'],
                cta: 'Start Premium', href: '/upgrade', style: 'border-[#0D9488]/50',
              },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl p-6 border-2 relative shadow-sm bg-white ${p.style}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1 text-gray-900">{p.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-gray-400 text-sm ml-1">{p.period}</span>
                </div>
                <p className="text-sm text-[#0D9488] font-medium mb-4">{p.posts}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="text-gray-600 text-sm flex items-center gap-2">
                      <span className="text-[#0D9488] font-bold shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                    p.popular
                      ? 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white'
                      : 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            Running an agency?{' '}
            <Link href="/upgrade" className="text-[#C9943A] hover:underline font-medium">
              See the unlimited Agency plan →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Real People. Real Results.
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Marketers, founders, bloggers and agencies — all growing faster with Rankivo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, i) => (
                    <span key={i} className="text-[#C9943A]">★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Your Competitors Are Already Using AI.<br />Are You?
          </h2>
          <p className="text-gray-500 mb-8 text-lg max-w-lg mx-auto">
            Stop writing from scratch. Stop guessing what ranks.
            Rankivo does both — so you can focus on growing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth?mode=signup"
              className="w-full sm:w-auto bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#0D9488]/20 text-center"
            >
              Start Free Today
            </Link>
            <Link
              href="/upgrade"
              className="w-full sm:w-auto border-2 border-[#C9943A] hover:bg-[#C9943A]/10 text-[#C9943A] px-8 py-4 rounded-xl font-bold text-lg transition-colors text-center"
            >
              View All Plans
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-4">Free forever plan available. No credit card needed.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
