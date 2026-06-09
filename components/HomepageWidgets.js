'use client'
import { useEffect, useRef, useState } from 'react'

/* ── 1. Stats Counter ──────────────────────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
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
              <p className={`text-4xl font-bold tabular-nums ${s.color}`}>{n}{s.suffix}</p>
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
  {
    name: 'Instagram',
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  },
  {
    name: 'LinkedIn',
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  },
  {
    name: 'YouTube',
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
  },
  {
    name: 'TikTok',
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
  },
  {
    name: 'X / Twitter',
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  },
  {
    name: 'Blog',
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1B5FA8"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
  },
  {
    name: 'Email',
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#C9943A"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
  },
  {
    name: 'Ad Copy',
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0D9488"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
  },
]

export function PlatformScrollStrip() {
  const doubled = [...PLATFORMS, ...PLATFORMS]
  return (
    <section className="py-4 bg-white border-b border-gray-100 overflow-hidden">
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scroll-track {
          display: flex;
          animation: scrollLeft 28s linear infinite;
          width: max-content;
        }
        .scroll-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="scroll-track">
        {doubled.map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 mx-10 text-gray-600 text-sm font-medium whitespace-nowrap select-none group cursor-default">
            <span className="opacity-80 group-hover:opacity-100 transition-opacity">{p.svg}</span>
            <span className="group-hover:text-gray-900 transition-colors">{p.name}</span>
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

  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [])

  const indices = [active, (active + 1) % total, (active + 2) % total]

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Real People. Real Results.</h2>
        <p className="text-gray-500 text-center mb-12">
          Marketers, founders, bloggers and agencies — all growing faster with Rankivo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {indices.map((idx, pos) => {
            const t = TESTIMONIALS[idx]
            return (
              <div key={idx} className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-500 ${pos === 1 ? 'border-[#1B5FA8]/40 shadow-md scale-[1.02]' : 'border-gray-200'}`}>
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
        <div className="flex items-center justify-center gap-4">
          <button onClick={prev} className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-[#1B5FA8] text-gray-400 hover:text-[#1B5FA8] transition-colors flex items-center justify-center font-bold text-lg">‹</button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-[#1B5FA8] w-5' : 'bg-gray-300 w-2'}`}
              />
            ))}
          </div>
          <button onClick={next} className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-[#1B5FA8] text-gray-400 hover:text-[#1B5FA8] transition-colors flex items-center justify-center font-bold text-lg">›</button>
        </div>
      </div>
    </section>
  )
}
