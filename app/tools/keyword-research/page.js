'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

const INTENT_COLORS = {
  Informational: 'bg-blue-100 text-blue-700',
  Commercial:    'bg-purple-100 text-purple-700',
  Transactional: 'bg-green-100 text-green-700',
  Navigational:  'bg-orange-100 text-orange-700',
}

const COMPETITION_COLORS = {
  Low:    'text-green-600',
  Medium: 'text-yellow-600',
  High:   'text-red-600',
}

function MiniTrend({ trend }) {
  if (!trend || trend.length === 0) return null
  const max = Math.max(...trend.map(t => t.volume))
  const min = Math.min(...trend.map(t => t.volume))
  const range = max - min || 1
  const points = trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * 60
    const y = 16 - ((t.volume - min) / range) * 16
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width="60" height="20" className="inline-block">
      <polyline points={points} fill="none" stroke="#0D9488" strokeWidth="1.5" />
    </svg>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-t border-gray-100 animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

const TABS = [
  { key: 'all',       label: '🔍 All Keywords'    },
  { key: 'questions', label: '❓ Questions'        },
  { key: 'buying',    label: '💰 Buying Intent'    },
  { key: 'longtail',  label: '📏 Long-tail'        },
  { key: 'low',       label: '🟢 Low Competition'  },
]

export default function KeywordResearchPage() {
  const [seeds, setSeeds]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [results, setResults]       = useState([])
  const [grouped, setGrouped]       = useState(null)
  const [clusters, setClusters]     = useState({})
  const [activeTab, setActiveTab]   = useState('all')
  const [error, setError]           = useState('')
  const [limitMsg, setLimitMsg]     = useState('')
  const [sort, setSort]             = useState({ key: 'volume', dir: 'desc' })
  const [selected, setSelected]     = useState([])
  const [copied, setCopied]         = useState(false)

  // ── Call the existing /api/keywords endpoint — no logic duplication ──
  async function handleGenerate() {
    if (!seeds.trim()) return
    setLoading(true)
    setError('')
    setLimitMsg('')
    setResults([])
    setGrouped(null)
    setSelected([])

    try {
      const seedList = seeds.split(',').map(s => s.trim()).filter(Boolean)
      const res  = await fetch('/api/keywords', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ seeds: seedList }),
      })
      const data = await res.json()

      if (res.status === 403 || data.error === 'LIMIT_REACHED') {
        setLimitMsg(data.message || 'Daily limit reached. Sign up for more searches.')
        return
      }
      if (data.error) { setError(data.error); return }

      setResults(data.results  || [])
      setGrouped(data.grouped  || null)
      setClusters(data.clusters || {})
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getActiveData() {
    if (!grouped) return results
    const map = {
      all:       results,
      questions: grouped.questions,
      buying:    grouped.buying,
      longtail:  grouped.longtail,
      low:       grouped.lowCompetition,
    }
    return map[activeTab] || results
  }

  function applySort(data) {
    return [...data].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key]
      if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sort.dir === 'asc' ? av - bv : bv - av
    })
  }

  function toggleSort(key) {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  }

  function toggleSelect(kw) {
    setSelected(s => s.includes(kw) ? s.filter(k => k !== kw) : [...s, kw])
  }

  function exportCSV() {
    const data   = selected.length > 0 ? filtered.filter(k => selected.includes(k.keyword)) : filtered
    const header = 'Keyword,Volume,CPC,Difficulty,Competition,Intent'
    const rows   = data.map(k => `"${k.keyword}",${k.volume},${k.cpc},${k.difficulty},${k.competition},${k.intent}`)
    const csv    = [header, ...rows].join('\n')
    const blob   = new Blob([csv], { type: 'text/csv' })
    const a      = document.createElement('a')
    a.href       = URL.createObjectURL(blob)
    a.download   = 'rankivo-keywords.csv'
    a.click()
  }

  function copySelected() {
    const data = selected.length > 0 ? filtered.filter(k => selected.includes(k.keyword)) : filtered
    navigator.clipboard.writeText(data.map(k => k.keyword).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-gray-400">
      {sort.key === col ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  const filtered = applySort(getActiveData())

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">

          {/* ── Hero ── */}
          <div className="text-center mb-10">
            <span className="inline-block bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              Free SEO Tool
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B5FA8] mb-3">
              Keyword Research Tool
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              Discover high-value keywords with search volume, CPC, competition data and search intent — powered by AI.
            </p>
          </div>

          {/* ── Input ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={seeds}
                onChange={e => setSeeds(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="Enter seed keywords, comma separated (e.g. content marketing, SEO tools)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !seeds.trim()}
                className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? 'Researching…' : '🔍 Research Keywords'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Tip: Enter up to 3 seed keywords for best results. Press Enter to search.
            </p>
          </div>

          {/* ── Limit message ── */}
          {limitMsg && (
            <div className="bg-[#C9943A]/10 border border-[#C9943A]/30 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#C9943A]">Daily limit reached</p>
                <p className="text-xs text-[#C9943A]/80 mt-0.5">{limitMsg}</p>
              </div>
              <Link
                href="/auth?mode=signup"
                className="shrink-0 bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Sign Up Free →
              </Link>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-4 text-sm">{error}</div>
          )}

          {/* ── Results ── */}
          {(loading || results.length > 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Tabs + actions */}
              <div className="flex border-b border-gray-100 px-4 pt-4 gap-1 flex-wrap">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                      activeTab === t.key
                        ? 'bg-[#0D9488] text-white'
                        : 'text-gray-500 hover:text-[#0D9488]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
                <div className="ml-auto flex gap-2 pb-2">
                  <button
                    onClick={copySelected}
                    className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                  <button
                    onClick={exportCSV}
                    className="text-sm bg-[#1B5FA8] text-white px-3 py-1.5 rounded-lg hover:bg-[#0D9488] transition-colors"
                  >
                    ⬇️ Export CSV
                  </button>
                </div>
              </div>

              {/* Stats bar */}
              {!loading && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-6 text-sm text-gray-500 flex-wrap">
                  <span><b className="text-gray-800">{filtered.length}</b> keywords</span>
                  <span>Avg Volume: <b className="text-gray-800">{filtered.length ? Math.round(filtered.reduce((a, k) => a + k.volume, 0) / filtered.length).toLocaleString() : 0}</b></span>
                  <span>Avg CPC: <b className="text-gray-800">${filtered.length ? (filtered.reduce((a, k) => a + k.cpc, 0) / filtered.length).toFixed(2) : '0.00'}</b></span>
                  <span>Avg Difficulty: <b className="text-gray-800">{filtered.length ? Math.round(filtered.reduce((a, k) => a + k.difficulty, 0) / filtered.length) : 0}</b></span>
                  {selected.length > 0 && <span className="text-[#0D9488]"><b>{selected.length}</b> selected</span>}
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          onChange={e => setSelected(e.target.checked ? filtered.map(k => k.keyword) : [])}
                        />
                      </th>
                      {[
                        { label: 'Keyword',     key: 'keyword'     },
                        { label: 'Volume',      key: 'volume'      },
                        { label: 'CPC',         key: 'cpc'         },
                        { label: 'Difficulty',  key: 'difficulty'  },
                        { label: 'Competition', key: 'competition' },
                        { label: 'Intent',      key: 'intent'      },
                        { label: 'Trend',       key: null          },
                      ].map(col => (
                        <th
                          key={col.label}
                          onClick={() => col.key && toggleSort(col.key)}
                          className={`px-4 py-3 ${col.key ? 'cursor-pointer hover:text-gray-600' : ''}`}
                        >
                          {col.label}{col.key && <SortIcon col={col.key} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-400">
                          No keywords found for this tab.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((kw, i) => (
                        <tr
                          key={i}
                          className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${
                            selected.includes(kw.keyword) ? 'bg-teal-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.includes(kw.keyword)}
                              onChange={() => toggleSelect(kw.keyword)}
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">{kw.keyword}</td>
                          <td className="px-4 py-3 text-gray-700">{kw.volume.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-700">${kw.cpc}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full bg-[#0D9488]"
                                  style={{ width: `${kw.difficulty}%` }}
                                />
                              </div>
                              <span className="text-gray-700">{kw.difficulty}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 font-semibold ${COMPETITION_COLORS[kw.competition]}`}>
                            {kw.competition}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INTENT_COLORS[kw.intent]}`}>
                              {kw.intent}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <MiniTrend trend={kw.trend} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Clusters */}
              {!loading && Object.keys(clusters).length > 0 && (
                <div className="p-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">🧠 Keyword Clusters</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(clusters).slice(0, 12).map(([cluster, kws]) => (
                      <div key={cluster} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                        <div className="text-xs font-semibold text-[#1B5FA8] mb-1">{cluster}</div>
                        <div className="text-xs text-gray-500">{kws.length} keyword{kws.length > 1 ? 's' : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && results.length === 0 && !error && !limitMsg && (
            <div className="text-center py-24 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium text-gray-500">Enter a keyword to get started</p>
              <p className="text-sm mt-1">Discover search volume, CPC, competition data and more — free.</p>
            </div>
          )}

          {/* ── Human Writing Cross-link ── */}
          {results.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-[#1B5FA8]/5 to-[#0D9488]/5 border border-[#0D9488]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-800 mb-0.5">✍️ Want this done for you by an expert?</p>
                <p className="text-sm text-gray-500">Our human writers deliver SEO-optimised, expert-crafted content — with a Copyscape report included.</p>
              </div>
              <Link href="/services/seo-blog-writing"
                className="shrink-0 bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
                View Human Writing Service →
              </Link>
            </div>
          )}

          {/* ── CTA Banner ── */}
          {results.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-[#1B5FA8] to-[#0D9488] rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="text-white font-bold text-lg">Turn these keywords into SEO content</p>
                <p className="text-white/80 text-sm mt-1">Generate full AI-written blog posts optimized for your best keywords.</p>
              </div>
              <Link
                href="/tools/blog-generator"
                className="shrink-0 bg-white text-[#1B5FA8] hover:bg-gray-50 px-6 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                Generate SEO Article →
              </Link>
            </div>
          )}

          {/* ── Tips ── */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#1B5FA8] mb-4">💡 Tips for Better Keyword Research</h2>
            <ul className="space-y-3">
              {[
                'Start with 2–3 broad seed keywords and let the tool expand them into long-tail variations.',
                'Target keywords with Low competition and decent volume — these are your quickest wins.',
                'Use the Questions tab to find keywords that map directly to blog post titles.',
                'Check the Buying Intent tab for keywords that signal purchase readiness — ideal for product or service pages.',
                'Group keywords into clusters and create one pillar page per cluster for maximum topical authority.',
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="text-[#0D9488] font-bold shrink-0">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* ── FAQs ── */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#1B5FA8] mb-4">❓ Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this keyword research tool free?', a: 'Yes — you can run keyword searches free as a guest. Sign up for a free account to unlock more searches per day.' },
                { q: 'How accurate is the search volume data?', a: 'Volume, CPC and difficulty are AI-estimated based on real search patterns. Use them as directional signals rather than exact figures.' },
                { q: 'What is keyword difficulty?', a: 'Keyword difficulty (0–100) estimates how hard it is to rank on the first page. Aim for under 40 if your site is new.' },
                { q: 'What does search intent mean?', a: 'Search intent tells you why someone searches a keyword — Informational (research), Commercial (comparing), Transactional (ready to buy), or Navigational (looking for a specific site).' },
                { q: 'Can I export my keywords?', a: 'Yes — click Export CSV to download all keywords, or select specific ones and export only those.' },
                { q: 'How many seed keywords can I enter?', a: 'You can enter multiple seeds separated by commas. The tool generates related keywords for each one.' },
              ].map((faq, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{faq.q}</p>
                  <p className="text-sm text-gray-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
