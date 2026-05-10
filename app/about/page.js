import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'About Us — RANKIVO',
  description: 'Learn about RANKIVO, the AI-powered content and SEO platform built for modern marketers.',
}

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block bg-[#1B5FA8]/10 text-[#1B5FA8] text-sm px-4 py-2 rounded-full font-medium mb-4">Our Story</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Built for Marketers Who Want Results</h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">RANKIVO was created to give every business — big or small — access to professional, SEO-optimized content at a fraction of the traditional cost.</p>
          </div>

          {/* Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-500 leading-relaxed mb-4">Content is the backbone of every successful online business. But creating high-quality, SEO-optimized content consistently is hard, expensive, and time-consuming.</p>
              <p className="text-gray-500 leading-relaxed mb-4">RANKIVO changes that. We combine cutting-edge AI with deep SEO knowledge to help you create content that ranks, converts, and scales — in minutes, not days.</p>
              <p className="text-gray-500 leading-relaxed">Whether you're a solo founder, a digital agency, or a growing e-commerce brand, RANKIVO gives you the content superpowers you need.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '8+', label: 'Platforms Supported', color: '#1B5FA8' },
                { value: '6', label: 'Languages', color: '#0D9488' },
                { value: '10x', label: 'Faster Content', color: '#C9943A' },
                { value: '100%', label: 'SEO Optimized', color: '#1B5FA8' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-5 text-center border border-gray-200">
                  <p className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Accessibility', desc: 'Professional content tools should not be reserved for big budgets. We make world-class AI accessible to everyone.', icon: '◉', color: '#1B5FA8' },
                { title: 'Quality First', desc: 'We obsess over the quality of every piece of content. SEO is built-in, not an afterthought.', icon: '◈', color: '#0D9488' },
                { title: 'Global Reach', desc: 'With 6 language options, we help businesses reach audiences across the world without language barriers.', icon: '◆', color: '#C9943A' },
              ].map(v => (
                <div key={v.title} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
                  <div className="text-2xl mb-3" style={{ color: v.color }}>{v.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5 rounded-2xl p-10 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
            <p className="text-gray-500 mb-6">Join thousands of marketers using RANKIVO. Start free — no credit card required.</p>
            <Link href="/auth?mode=signup" className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-3 rounded-xl font-semibold transition-colors inline-block">
              Start Free Today
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}
