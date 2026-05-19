'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const LOADING_STEPS = [
  'Analyzing keyword…',
  'Processing SEO modules…',
  'Structuring output…',
]

function Skeleton({ width = '100%', height = 10 }) {
  return (
    <div
      style={{ width, height, borderRadius: 5 }}
      className="bg-gray-200 animate-pulse rounded"
    />
  )
}

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      {LOADING_STEPS.map((label, i) => (
        <span key={i} className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full inline-block transition-all duration-300 ${
              i < step ? 'bg-[#0D9488]' : i === step ? 'bg-[#1B5FA8] animate-pulse' : 'bg-gray-300'
            }`}
          />
          <span className={`text-xs ${i <= step ? 'text-gray-600' : 'text-gray-300'}`}>{label}</span>
          {i < LOADING_STEPS.length - 1 && <span className="text-gray-200 text-xs">—</span>}
        </span>
      ))}
    </div>
  )
}

function LoadingPanel({ step }) {
  return (
    <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-300 animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <span className="text-xs text-gray-400 font-mono">{LOADING_STEPS[step] || 'Processing…'}</span>
      </div>
      <div className="p-5">
        <StepIndicator step={step} />
        <div className="space-y-2 mb-5">
          <Skeleton width="55%" height={9} />
          <Skeleton width="80%" height={9} />
          <Skeleton width="40%" height={9} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Search Volume', 'Difficulty', 'Intent'].map(l => (
            <div key={l} className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="text-[10px] text-gray-400 mb-2">{l}</div>
              <Skeleton width="60%" height={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultPanel({ keyword }) {
  return (
    <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden animate-[fadeUp_0.4s_ease_forwards]">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#e1f5ee] text-[#0D9488] font-medium px-2.5 py-0.5 rounded-full">✓ Analysis ready</span>
          <span className="text-[11px] text-gray-400">"{keyword}"</span>
        </div>
      </div>

      <div className="p-5">
        {/* Metric placeholders */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Search Volume', note: 'API needed' },
            { label: 'Difficulty',    note: 'API needed' },
            { label: 'Intent',        note: 'API needed' },
          ].map(({ label, note }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="text-[10px] text-gray-400 mb-2">{label}</div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-2 bg-gray-100 rounded" />
                <span className="text-[10px] text-gray-300">{note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Keyword clusters */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Keyword Clusters</p>
          <div className="grid grid-cols-3 gap-2">
            {['Primary', 'Long-tail', 'LSI'].map((label, ci) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="text-[10px] text-gray-400 mb-2">{label}</div>
                {[70, 55, 65].map((w, i) => (
                  <div key={i} className="h-1.5 bg-gray-100 rounded mb-1.5" style={{ width: `${w - ci * 5}%` }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content outline skeleton */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Content Outline</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <Skeleton width="50%" height={9} />
            <div className="pl-4 space-y-1.5">
              <Skeleton width="70%" height={7} />
              <Skeleton width="60%" height={7} />
              <Skeleton width="65%" height={7} />
            </div>
            <Skeleton width="45%" height={9} />
            <div className="pl-4 space-y-1.5">
              <Skeleton width="68%" height={7} />
              <Skeleton width="55%" height={7} />
            </div>
          </div>
        </div>

        {/* Locked CTA */}
        <div className="border border-dashed border-[#c7d8ef] bg-white rounded-xl p-5 text-center">
          <div className="text-lg mb-2">🔒</div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Connect backend to view live results</p>
          <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto leading-relaxed">
            Wire up your{' '}
            <code className="bg-gray-100 rounded px-1 text-[11px]">/api/keywords</code>{' '}
            endpoint to populate real keyword data, intent signals, and content strategy.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-block bg-[#1B5FA8] hover:bg-[#154d8c] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Get API Access →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function InteractiveDemo() {
  const [keyword, setKeyword] = useState('')
  const [phase, setPhase]     = useState('idle')    // idle | loading | result
  const [step, setStep]       = useState(0)

  function handleGenerate() {
    if (!keyword.trim() || phase === 'loading') return
    setPhase('loading')
    setStep(0)
    const t1 = setTimeout(() => setStep(1), 900)
    const t2 = setTimeout(() => setStep(2), 1800)
    const t3 = setTimeout(() => setPhase('result'), 2700)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-blue-50/40 to-white border-b border-gray-200">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Section label */}
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold text-[#1B5FA8] bg-[#e6eef8] border border-[#c7d8ef] px-3 py-1.5 rounded-full mb-4">
            ⚡ Try it now — no signup needed
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            See Rankivo in Action
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
            Enter any keyword and watch the AI SEO strategy system run in real time.
          </p>
        </div>

        {/* Input */}
        <div className="flex items-center border-2 border-[#1B5FA8] rounded-2xl overflow-hidden bg-white shadow-[0_0_0_4px_rgba(27,95,168,0.07)] focus-within:shadow-[0_0_0_6px_rgba(27,95,168,0.12)] transition-shadow">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            disabled={phase === 'loading'}
            placeholder="e.g. fitness blog, SaaS pricing, keyword research…"
            className="flex-1 px-5 py-4 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent font-[var(--font-geist-sans)]"
          />
          <button
            onClick={handleGenerate}
            disabled={!keyword.trim() || phase === 'loading'}
            className="bg-[#1B5FA8] hover:bg-[#154d8c] disabled:bg-[#93aece] disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-3 m-1.5 rounded-xl transition-colors whitespace-nowrap"
          >
            {phase === 'loading' ? 'Analyzing…' : 'Generate Strategy'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2.5">
          Real system UI · No fake results · Connect your API for live data
        </p>

        {/* Output */}
        {phase === 'loading' && <LoadingPanel step={step} />}
        {phase === 'result'  && <ResultPanel keyword={keyword} />}
      </div>
    </section>
  )
}
