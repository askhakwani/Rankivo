import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-teal-400">RANKIVO</h1>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a>
            <a href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a>
            <Link href="/auth" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>
            <Link href="/auth?mode=signup" className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm px-4 py-2 rounded-full mb-6">
            AI-Powered Content and SEO Platform
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Create Perfect Content<br />
            <span className="text-teal-400">10x Faster</span> with AI
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Generate SEO-optimized content for Instagram, TikTok, LinkedIn, blogs and more. 
            Powered by AI. Perfected by humans.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-teal-500/25">
              Start Free — No Credit Card
            </Link>
            <Link href="/auth" className="border border-gray-700 hover:border-gray-500 text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              Login
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">3 free posts per month. No credit card required.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-teal-400">6+</p>
            <p className="text-gray-400 text-sm mt-1">Languages Supported</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-teal-400">6</p>
            <p className="text-gray-400 text-sm mt-1">Content Platforms</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-teal-400">10x</p>
            <p className="text-gray-400 text-sm mt-1">Faster Than Manual</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4">Everything You Need to Rank</h3>
          <p className="text-gray-400 text-center mb-12">One platform for all your content and SEO needs</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'AI Content Generation', desc: 'Generate Instagram captions, blog posts, LinkedIn content, TikTok scripts, emails and ads in seconds.', icon: 'AI' },
              { title: 'SEO Optimized', desc: 'Every piece of content is built around your keywords with meta titles, descriptions and H1 options.', icon: 'SEO' },
              { title: '6 Languages', desc: 'Create content in English, Spanish, French, German, Arabic and Urdu for global audiences.', icon: 'LNG' },
              { title: 'Human Editing', desc: 'Get AI drafts polished by professional human editors for premium quality content.', icon: 'PRO' },
              { title: 'Smart Targeting', desc: 'Specify your tone, target audience and call to action for perfectly tailored content.', icon: 'TGT' },
              { title: 'Content History', desc: 'All your generated content saved in one place. Access, edit and reuse anytime.', icon: 'HST' },
            ].map(f => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-teal-800 transition-colors">
                <div className="bg-teal-500/10 text-teal-400 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">{f.icon}</div>
                <h4 className="font-semibold text-white mb-2">{f.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h3>
          <p className="text-gray-400 text-center mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['3 AI posts per month', 'All platforms', '6 languages', 'Basic SEO tools'], cta: 'Get Started Free', highlight: false },
              { name: 'Starter', price: '$19', period: 'per month', features: ['Unlimited AI posts', '10 long blog posts/month', 'All platforms', 'Full SEO tools', 'Content history'], cta: 'Start Starter Plan', highlight: true },
              { name: 'Pro', price: '$49', period: 'per month', features: ['Everything in Starter', '30 long blog posts/month', '4 human edited posts', 'Priority support'], cta: 'Start Pro Plan', highlight: false },
            ].map(p => (
              <div key={p.name} className={`rounded-xl p-6 border ${p.highlight ? 'bg-teal-500/10 border-teal-500' : 'bg-gray-900 border-gray-800'}`}>
                {p.highlight && <div className="text-xs font-bold text-teal-400 mb-3">MOST POPULAR</div>}
                <h4 className="text-xl font-bold mb-1">{p.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-gray-400 text-sm ml-1">{p.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="text-teal-400">+</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth?mode=signup" className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors ${p.highlight ? 'bg-teal-500 hover:bg-teal-400 text-white' : 'border border-gray-700 hover:border-gray-500 text-gray-300'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Create Better Content?</h3>
        <p className="text-gray-400 mb-8">Join thousands of marketers and business owners using RANKIVO.</p>
        <Link href="/auth?mode=signup" className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-teal-500/25">
          Start Free Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-teal-400 font-bold">RANKIVO</p>
          <p className="text-gray-500 text-sm">AI Content and SEO Platform</p>
          <p className="text-gray-500 text-sm">2026 RANKIVO. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
