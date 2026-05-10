import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B5FA8]">RANKIVO</h1>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors">Features</a>
            <a href="#pricing" className="text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors">Pricing</a>
            <Link href="/auth" className="text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors">Login</Link>
            <Link href="/auth?mode=signup" className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-[#0D9488]/10 border border-[#0D9488]/30 text-[#0D9488] text-sm px-4 py-2 rounded-full mb-6 font-medium">
            AI-Powered Content and SEO Platform
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6 text-gray-900">
            Create Perfect Content<br />
            <span className="text-[#1B5FA8]">10x Faster</span> with AI
          </h2>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Generate SEO-optimized content for Instagram, TikTok, LinkedIn, blogs and more.
            Powered by AI. Perfected by humans.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1B5FA8]/20">
              Start Free — No Credit Card
            </Link>
            <Link href="/auth" className="border border-gray-300 hover:border-[#1B5FA8] text-gray-600 hover:text-[#1B5FA8] px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              Login
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-4">3 free posts per month. No credit card required.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-[#1B5FA8]">6+</p>
            <p className="text-gray-500 text-sm mt-1">Languages Supported</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#0D9488]">6</p>
            <p className="text-gray-500 text-sm mt-1">Content Platforms</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#C9943A]">10x</p>
            <p className="text-gray-500 text-sm mt-1">Faster Than Manual</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4 text-gray-900">Everything You Need to Rank</h3>
          <p className="text-gray-500 text-center mb-12">One platform for all your content and SEO needs</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'AI Content Generation', desc: 'Generate Instagram captions, blog posts, LinkedIn content, TikTok scripts, emails and ads in seconds.', icon: 'AI', color: 'blue' },
              { title: 'SEO Optimized', desc: 'Every piece of content is built around your keywords with meta titles, descriptions and H1 options.', icon: 'SEO', color: 'teal' },
              { title: '6 Languages', desc: 'Create content in English, Spanish, French, German, Arabic and Urdu for global audiences.', icon: 'LNG', color: 'gold' },
              { title: 'Human Editing', desc: 'Get AI drafts polished by professional human editors for premium quality content.', icon: 'PRO', color: 'blue' },
              { title: 'Smart Targeting', desc: 'Specify your tone, target audience and call to action for perfectly tailored content.', icon: 'TGT', color: 'teal' },
              { title: 'Content History', desc: 'All your generated content saved in one place. Access, edit and reuse anytime.', icon: 'HST', color: 'gold' },
            ].map(f => {
              const styles = {
                blue: { badge: 'bg-[#1B5FA8]/10 text-[#1B5FA8]', border: 'hover:border-[#1B5FA8]/40' },
                teal: { badge: 'bg-[#0D9488]/10 text-[#0D9488]', border: 'hover:border-[#0D9488]/40' },
                gold: { badge: 'bg-[#C9943A]/10 text-[#C9943A]', border: 'hover:border-[#C9943A]/40' },
              }
              const s = styles[f.color]
              return (
                <div key={f.title} className={`bg-white border border-gray-200 rounded-xl p-6 ${s.border} transition-colors shadow-sm`}>
                  <div className={`${s.badge} text-xs font-bold px-3 py-1 rounded-full inline-block mb-4`}>{f.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{f.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h3>
          <p className="text-gray-500 mb-12">Three simple steps to perfect content</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose Platform', desc: 'Select Instagram, TikTok, LinkedIn, Blog, Email or Ads.', color: '#1B5FA8' },
              { step: '2', title: 'Enter Your Topic', desc: 'Add your topic, keywords, tone and target audience.', color: '#0D9488' },
              { step: '3', title: 'Generate & Copy', desc: 'Get SEO-optimized content in seconds. Copy and publish.', color: '#C9943A' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg" style={{ backgroundColor: s.color }}>
                  {s.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4 text-gray-900">Simple, Transparent Pricing</h3>
          <p className="text-gray-500 text-center mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free', price: '$0', period: 'forever',
                features: ['3 AI posts per month', 'All platforms', '6 languages', 'Content history'],
                cta: 'Get Started Free', highlight: false, color: 'gray',
              },
              {
                name: 'Starter', price: '$9', period: 'per month',
                features: ['50 AI posts per month', 'All platforms', '6 languages', 'Full SEO tools', 'Content history', 'Email support'],
                cta: 'Start Starter Plan', highlight: true, color: 'blue',
              },
              {
                name: 'Pro', price: '$29', period: 'per month',
                features: ['300 AI posts per month', 'All platforms', '6 languages', 'Full SEO tools', 'Priority generation', 'Priority support'],
                cta: 'Start Pro Plan', highlight: false, color: 'teal',
              },
            ].map(p => (
              <div key={p.name} className={`rounded-xl p-6 border-2 relative shadow-sm ${
                p.highlight
                  ? 'border-[#1B5FA8] bg-[#1B5FA8]/5'
                  : p.color === 'teal'
                  ? 'border-[#0D9488]/40 bg-white'
                  : 'border-gray-200 bg-white'
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1B5FA8] text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}
                <h4 className="text-xl font-bold mb-1 text-gray-900">{p.name}</h4>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-gray-400 text-sm ml-1">{p.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="text-gray-600 text-sm flex items-center gap-2">
                      <span className="text-[#0D9488] font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth?mode=signup" className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                  p.highlight
                    ? 'bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white'
                    : p.color === 'teal'
                    ? 'bg-[#0D9488] hover:bg-[#0D9488]/90 text-white'
                    : 'border-2 border-gray-300 hover:border-[#1B5FA8] hover:text-[#1B5FA8] text-gray-600'
                }`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            Need unlimited posts? <Link href="/upgrade" className="text-[#C9943A] hover:underline font-medium">View Agency plan →</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">Ready to Create Better Content?</h3>
          <p className="text-gray-500 mb-8">Join marketers and business owners using RANKIVO to grow faster.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#0D9488]/20">
              Start Free Today
            </Link>
            <Link href="/upgrade" className="border-2 border-[#C9943A] hover:bg-[#C9943A]/10 text-[#C9943A] px-8 py-4 rounded-xl font-bold text-lg transition-colors">
              View All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#1B5FA8] font-bold text-lg">RANKIVO</p>
          <p className="text-gray-400 text-sm">AI Content and SEO Platform</p>
          <p className="text-gray-400 text-sm">© 2026 RANKIVO. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
