import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import InteractiveDemo from '../components/InteractiveDemo'

export const metadata = {
  title: 'RANKIVO — AI Content & SEO Platform',
  description: 'Generate SEO-optimized content for Instagram, TikTok, LinkedIn, blogs and more. Powered by AI.',
}

export default function Home() {
  const features = [
    { title: 'AI Content Generation', desc: 'Generate Instagram captions, blog posts, LinkedIn content, TikTok scripts, YouTube videos, emails and ads in seconds.', icon: '✦', color: 'blue' },
    { title: 'SEO Optimized', desc: 'Every piece of content includes meta titles, descriptions and H1 options built around your keywords.', icon: '◈', color: 'teal' },
    { title: '6 Languages', desc: 'Create content in English, Spanish, French, German, Arabic and Urdu for global audiences.', icon: '◉', color: 'gold' },
    { title: 'Human Editing', desc: 'Get AI drafts polished by professional human editors for premium quality content.', icon: '◐', color: 'blue' },
    { title: 'Smart Targeting', desc: 'Specify your tone, target audience and call to action for perfectly tailored content every time.', icon: '◎', color: 'teal' },
    { title: 'Content History', desc: 'All your generated content saved in one place. Access, copy and reuse anytime.', icon: '◆', color: 'gold' },
  ]

  const testimonials = [
    { name: 'Sarah M.',   role: 'Social Media Manager',      text: 'RANKIVO cut my content creation time from 3 hours to 15 minutes. The SEO optimization is genuinely impressive.',        stars: 5 },
    { name: 'Ahmed K.',   role: 'E-commerce Owner',           text: 'I was spending $500/month on content writers. Now I generate 10x more content for a fraction of the cost.',            stars: 5 },
    { name: 'Priya R.',   role: 'Digital Marketing Agency',   text: 'The multi-language support is a game changer for our international clients. Best AI content tool we\'ve tried.',       stars: 5 },
    { name: 'James T.',   role: 'Blogger',                    text: 'My blog traffic doubled in 2 months after switching to RANKIVO for SEO content. The meta descriptions are spot-on.',   stars: 5 },
    { name: 'Fatima A.',  role: 'Startup Founder',            text: 'As a non-native English speaker, RANKIVO helps me create professional content that sounds native. Life-changing.',     stars: 5 },
    { name: 'Carlos D.',  role: 'YouTube Creator',            text: 'The YouTube script generator is incredible. My video watch time increased 40% after using RANKIVO scripts.',           stars: 5 },
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
          <div className="inline-block bg-[#0D9488]/10 border border-[#0D9488]/30 text-[#0D9488] text-sm px-4 py-2 rounded-full mb-6 font-medium">
            AI-Powered Content & SEO Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900">
            Stop Struggling With Content.<br />
            <span className="text-[#1B5FA8]">Let AI Write It</span> in Seconds.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            SEO-optimized content for Instagram, TikTok, LinkedIn, blogs, YouTube and more.
            Rank higher. Grow faster. Work smarter.
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
          <p className="text-gray-400 text-sm mt-4">3 free posts per month. No credit card required.</p>
        </div>
      </section>

      {/* ── Interactive Demo ─────────────────────────────────────────────────── */}
      <InteractiveDemo />

      {/* ── Trust Bar ────────────────────────────────────────────────────────── */}
      <section className="py-5 px-6 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {[
            { icon: '🖥️', text: 'Real system UI' },
            { icon: '🚫', text: 'No fake results' },
            { icon: '🔌', text: 'Connect your API for live data' },
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
            { value: '8+',   label: 'Content Platforms',    color: 'text-[#1B5FA8]' },
            { value: '6',    label: 'Languages',             color: 'text-[#0D9488]' },
            { value: '10x',  label: 'Faster Than Manual',   color: 'text-[#C9943A]' },
            { value: '100%', label: 'SEO Optimized',        color: 'text-[#1B5FA8]' },
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
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Everything You Need to Rank</h2>
          <p className="text-gray-500 text-center mb-12">One platform for all your content and SEO needs</p>
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
          <h2 className="text-3xl font-bold mb-3 text-gray-900">How It Works</h2>
          <p className="text-gray-500 mb-12">Create perfect content in 3 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose Your Platform',   desc: 'Select from Instagram, TikTok, LinkedIn, Blog, YouTube, Email, Ads and more.', color: '#1B5FA8' },
              { step: '2', title: 'Enter Your Details',     desc: 'Add your topic, target keywords, tone of voice and target audience.',          color: '#0D9488' },
              { step: '3', title: 'Generate & Publish',     desc: 'Get fully SEO-optimized content in seconds. Copy, paste and publish.',         color: '#C9943A' },
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
              Try It Free Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 text-center mb-12">Start free. Upgrade when you need more.</p>
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
            Need unlimited posts?{' '}
            <Link href="/upgrade" className="text-[#C9943A] hover:underline font-medium">
              View Agency plan →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Loved by Marketers Worldwide</h2>
          <p className="text-gray-500 text-center mb-12">Join thousands growing their content with RANKIVO</p>
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

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to 10x Your Content Output?</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Join marketers and business owners using RANKIVO to grow faster. Start free today.
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
        </div>
      </section>

      <Footer />
    </div>
  )
}
