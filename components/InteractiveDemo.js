'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Analyzing keyword…',        icon: '🔍' },
  { label: 'Detecting search intent…',  icon: '🧠' },
  { label: 'Clustering keywords…',      icon: '🗂️' },
  { label: 'Preparing SEO structure…',  icon: '⚙️' },
]

const STEP_DELAYS = [650, 950, 900, 850]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 10 }) {
  return (
    <div
      style={{ width, height, borderRadius: 5 }}
      className="bg-gray-200 animate-pulse"
    />
  )
}

// ─── StepList ─────────────────────────────────────────────────────────────────

function StepList({ currentStep }) {
  return (
    <div className="space-y-2.5 mb-6">
      {STEPS.map((s, i) => {
        const done    = i < currentStep
        const active  = i === currentStep
        const pending = i > currentStep
        return (
          <div
            key={i}
            className={`flex items-center gap-3 text-sm transition-all duration-300 ${pending ? 'opacity-30' : 'opacity-100'}`}
          >
            <span className="relative flex items-center justify-center w-5 h-5 shrink-0">
              {done && (
                <span className="w-4 h-4 rounded-full bg-[#0D9488] flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              {active && (
                <>
                  <span className="absolute w-4 h-4 rounded-full bg-[#1B5FA8] opacity-30 animate-ping" />
                  <span className="w-3 h-3 rounded-full bg-[#1B5FA8]" />
                </>
              )}
              {pending && <span className="w-3 h-3 rounded-full bg-gray-300" />}
            </span>
            <span className={`font-medium transition-colors duration-200 ${done ? 'text-[#0D9488]' : active ? 'text-[#1B5FA8]' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── LoadingPanel ─────────────────────────────────────────────────────────────

function LoadingPanel({ currentStep }) {
  return (
    <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden animate-[fadeUp_0.35s_ease_forwards]">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-300 animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          {STEPS[currentStep]?.icon} {STEPS[currentStep]?.label}
        </span>
      </div>
      <div className="p-5">
        <StepList currentStep={currentStep} />
        <div className="grid grid-cols-3 gap-3">
          {['Search Volume', 'Difficulty', 'Intent'].map((label) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-2">{label}</p>
              <Skeleton width="65%" height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── ResultPanel ──────────────────────────────────────────────────────────────

function ResultPanel({ keyword }) {
  return (
    <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden animate-[fadeUp_0.4s_ease_forwards]">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#e1f5ee] text-[#0D9488] font-semibold px-2.5 py-0.5 rounded-full">
            ✓ Analysis ready
          </span>
          <span className="text-[11px] text-gray-400 font-mono">"{keyword}"</span>
        </div>
      </div>

      <div className="p-5">
        {/* Completed steps row */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-5">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#0D9488] font-medium">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0D9488] flex items-center justify-center shrink-0">
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {s.label.replace('…', '')}
            </div>
          ))}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Search Volume' },
            { label: 'Difficulty'    },
            { label: 'Intent'        },
          ].map(({ label }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-2">{label}</p>
              <div className="flex items-center gap-1.5">
                <Skeleton width={36} height={20} />
                <span className="text-[9px] text-gray-300 leading-tight">API needed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Keyword clusters */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Keyword Clusters</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Primary',   bars: [72, 58, 65] },
              { label: 'Long-tail', bars: [65, 50, 70] },
              { label: 'LSI',       bars: [55, 68, 45] },
            ].map(({ label, bars }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-2">{label}</p>
                {bars.map((w, i) => (
                  <div key={i} className="h-1.5 bg-gray-100 rounded mb-1.5 last:mb-0" style={{ width: `${w}%` }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content ideas skeleton */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Content Ideas</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
            <Skeleton width="52%" height={9} />
            <div className="pl-4 space-y-1.5">
              <Skeleton width="72%" height={7} />
              <Skeleton width="62%" height={7} />
              <Skeleton width="67%" height={7} />
            </div>
            <Skeleton width="46%" height={9} />
            <div className="pl-4 space-y-1.5">
              <Skeleton width="70%" height={7} />
              <Skeleton width="57%" height={7} />
            </div>
          </div>
        </div>

        {/* Connect API CTA */}
        <div className="border border-dashed border-[#c7d8ef] bg-white rounded-xl p-5 text-center">
          <p className="text-xl mb-2">🔒</p>
          <p className="text-sm font-semibold text-gray-700 mb-1">Connect API to unlock real insights</p>
          <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto leading-relaxed">
            Wire up your{' '}
            <code className="bg-gray-100 rounded px-1 text-[11px]">/api/keywords</code>{' '}
            endpoint to populate live keyword data, intent signals, and content strategy.
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

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function InteractiveDemo() {
  const [keyword, setKeyword]  = useState('')
  const [phase, setPhase]      = useState('idle')   // idle | loading | result
  const [currentStep, setStep] = useState(0)

  async function handleGenerate() {
    if (!keyword.trim() || phase === 'loading') return
    setPhase('loading')
    setStep(0)

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await sleep(STEP_DELAYS[i])
    }

    setPhase('result')
  }

  function handleReset() {
    setPhase('idle')
    setStep(0)
    setKeyword('')
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-blue-50/40 to-white border-b border-gray-200">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold text-[#1B5FA8] bg-[#e6eef8] border border-[#c7d8ef] px-3 py-1.5 rounded-full mb-4">
            ⚡ Try it now — no signup needed
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            See Rankivo in Action
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
            Enter any keyword and watch the AI SEO strategy engine run step by step.
          </p>
        </div>

        {/* Input bar */}
        <div className="flex items-center border-2 border-[#1B5FA8] rounded-2xl overflow-hidden bg-white shadow-[0_0_0_4px_rgba(27,95,168,0.07)] focus-within:shadow-[0_0_0_6px_rgba(27,95,168,0.12)] transition-shadow">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={phase === 'loading'}
            placeholder="e.g. fitness blog, SaaS pricing, remote work tools…"
            className="flex-1 px-5 py-4 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          {phase === 'result' ? (
            <button
              onClick={handleReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-5 py-3 m-1.5 rounded-xl transition-colors whitespace-nowrap"
            >
              ↩ Reset
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!keyword.trim() || phase === 'loading'}
              className="bg-[#1B5FA8] hover:bg-[#154d8c] disabled:bg-[#93aece] disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-3 m-1.5 rounded-xl transition-colors whitespace-nowrap"
            >
              {phase === 'loading' ? 'Analyzing…' : 'Generate Strategy'}
            </button>
          )}
        </div>

        {/* Output panels */}
        {phase === 'loading' && <LoadingPanel currentStep={currentStep} />}
        {phase === 'result'  && <ResultPanel  keyword={keyword} />}
      </div>
    </section>
  )
}
