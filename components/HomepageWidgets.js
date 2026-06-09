'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ── 1. Stats Counter ──────────────────────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const isFloat = target % 1 !== 0
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [start, target, duration])
  return count
}

export function StatsCounter() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const stats = [
    { end: 8,   suffix: '+',  label: 'Platforms Supported',  color: 'text-[#1B5FA8]' },
    { end: 6,   suffix: '',   label: 'Languages',             color: 'text-[#0D9488]' },
    { end: 10,  suffix: 'x',  label: 'Faster Than Hiring',   color: 'text-[#C9943A]' },
    { end: 100, suffix: '%',  label: 'SEO-Optimized Output', color: 'text-[#1B5FA8]' },
  ]

  return (
    <section ref={ref} className="py-12 border-b border-gray-200 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => {
          const n = useCountUp(s.end, 1800, visible)
          return (
            <div key={s.label} className="flex flex-col items-center">
              <p className={`text-4xl font-bold tabular-nums ${s.color}`}>
                {n}{s.suffix}
              </p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ── 2. Platform Logo Scroll Strip ────────────────────────────────────────── */
const PLATFORMS = [
  { name: 'Blog',       emoji: '✍️' },
  { name: 'Instagram',  emoji: '📸' },
  { name: 'LinkedIn',   emoji: '💼' },
  { name: 'TikTok',     emoji: '🎵' },
  { name: 'YouTube',    emoji: '▶️' },
  { name: 'X / Twitter',emoji: '𝕏'  },
  { name: 'Email',      emoji: '📧' },
  { name: 'Ad Copy',    emoji: '🎯' },
]

export function PlatformScrollStrip() {
  const doubled = [...PLATFORMS, ...PLATFORMS]
  return (
    <section className="py-5 px-0 bg-white border-b border-gray-100 overflow-hidden">
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scroll-track { display:flex; animation: scrollLeft 22s linear infinite; width: max-content; }
        .scroll-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="scroll-track">
        {doubled.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mx-8 text-gray-500 text-sm font-medium whitespace-nowrap select-none">
            <span className="text-xl">{p.emoji}</span>
            <span>{p.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── 3. Testimonial Carousel ──────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Sarah M.',  role: 'Social Media Manager',    text: 'RANKIVO cut my content creation time from 3 hours to 15 minutes. The SEO optimization is genuinely impressive.',       stars: 5 },
  { name: 'Ahmed K.',  role: 'E-commerce Owner',         text: 'I was spending $500/month on content writers. Now I generate 10x more content for a fraction of the cost.',           stars: 5 },
  { name: 'Priya R.',  role: 'Digital Marketing Agency', text: "The multi-language support is a game changer for our international clients. Best AI content tool we've tried.",      stars: 5 },
  { name: 'James T.',  role: 'Blogger',                  text: 'My blog traffic doubled in 2 months after switching to RANKIVO for SEO content. The meta descriptions are spot-on.',  stars: 5 },
  { name: 'Fatima A.', role: 'Startup Founder',          text: 'As a non-native English speaker, RANKIVO helps me create professional content that sounds native. Life-changing.',    stars: 5 },
  { name: 'Carlos D.', role: 'YouTube Creator',          text: 'The YouTube script generator is incredible. My video watch time increased 40% after using RANKIVO scripts.',          stars: 5 },
]

export function TestimonialCarousel() {
  const [active, setActive] = useState(0)
  const total = TESTIMONIALS.length
  const prev = () => setActive((a) => (a - 1 + total) % total)
  const next = () => setActive((a) => (a + 1) % total)

  // Auto-advance
  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [])

  // Show 3 cards on desktop, 1 on mobile
  const indices = [active, (active + 1) % total, (active + 2) % total]

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Real People. Real Results.</h2>
        <p className="text-gray-500 text-center mb-12">
          Marketers, founders, bloggers and agencies — all growing faster with Rankivo.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {indices.map((idx, pos) => {
            const t = TESTIMONIALS[idx]
            return (
              <div
                key={idx}
                className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-500 ${
                  pos === 1 ? 'border-[#1B5FA8]/40 shadow-md scale-[1.02]' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, i) => <span key={i} className="text-[#C9943A]">★</span>)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={prev} className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-[#1B5FA8] text-gray-400 hover:text-[#1B5FA8] transition-colors flex items-center justify-center font-bold text-lg">‹</button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === active ? 'bg-[#1B5FA8] w-5' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <button onClick={next} className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-[#1B5FA8] text-gray-400 hover:text-[#1B5FA8] transition-colors flex items-center justify-center font-bold text-lg">›</button>
        </div>
      </div>
    </section>
  )
}
