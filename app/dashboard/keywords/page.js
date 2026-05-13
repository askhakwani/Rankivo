'use client'
import { useState } from 'react'
import Sidebar from '../sidebar'

const INTENT_COLORS = {
  Informational: 'bg-blue-100 text-blue-700',
  Commercial: 'bg-purple-100 text-purple-700',
  Transactional: 'bg-green-100 text-green-700',
  Navigational: 'bg-orange-100 text-orange-700',
}

const COMPETITION_COLORS = {
  Low: 'text-green-600',
  Medium: 'text-yellow-600',
  High: 'text-red-600',
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
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

export default function KeywordsPage() {
  const [seeds, setSeeds] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [grouped, setGrouped] = useState(null)
  const [clusters, setClusters] = useState({})
  const [activeTab, setActiveTab] = useState('all')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState([])
  const [sort, setSort] = useState({ key: 'volume', dir: 'desc' })
  const [filters, setFilters] = useState({
    minVolume: '', maxVolume: '', competition: '', minCpc: '', maxCpc: '', minDiff: '', maxDiff: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!seeds.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setGrouped(null)
    setSelected([])
    try {
      const seedList = seeds.split(',').map(s => s.trim()).filter(Boolean)
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seeds: seedList, url }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResults(data.results || [])
      setGrouped(data.grouped || null)
      setClusters(data.clusters || {})
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getActiveData() {
    if (!grouped) return results
    const map = { all: results, questions: grouped.questions, buying: grouped.buying, longtail: grouped.longtail, low: grouped.lowCompetition }
    return map[activeTab] || results
  }

  function applyFilters(data) {
    return data.filter(k => {
      if (filters.minVolume && k.volume < Number(filters.minVolume)) return false
      if (filters.maxVolume && k.volume > Number(filters.maxVolume)) return false
      if (filters.competition && k.competition !== filters.competition) return false
      if (filters.minCpc && k.cpc < Number(filters.minCpc)) return false
      if (filters.maxCpc && k.cpc > Number(filters.maxCpc)) return false
      if (filters.minDiff && k.difficulty < Number(filters.minDiff)) return false
      if (filters.maxDiff && k.difficulty > Number(filters.maxDiff)) return false
      return true
    })
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
    const data = selected.length > 0 ? filtered.filter(k => selected.includes(k.keyword)) : filtered
    const header = 'Keyword,Volume,CPC,Difficulty,Competition,Intent'
    const rows = data.map(k => `"${k.keyword}",${k.volume},${k.cpc},${k.difficulty},${k.competition},${k.intent}`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'rankivo-keywords.csv'
    a.click()
  }

  function copySelected() {
    const data = selected.length > 0 ? filtered.filter(k => selected.includes(k.keyword)) : filtered
    navigator.clipboard.writeText(data.map(k => k.keyword).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = applySort(applyFilters(getActiveData()))

  const tabs = [
    { key: 'all', label: '🔍 All Keywords' },
    { key: 'questions', label: '❓ Questions' },
    { key: 'buying', label: '💰 Buying Intent' },
    { key: 'longtail', label: '📏 Long-tail' },
    { key: 'low', label: '🟢 Low Competition' },
  ]

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-gray-400">
      {sort.key === col ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Keywords" />
      <main className="flex-1 p-6 ml-64">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1B5FA8]" style={{ fontFamily: 'Syne, sans-serif' }}>Keyword Research</h1>
            <p className="text-gray-500 text-sm mt-1">Discover high-value keywords with search volume, CPC, and competition data.</p>
          </div>

          {/* Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input
                  value={seeds}
                  onChange={e => setSeeds(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="Enter seed keywords (comma separated): seo tools, content marketing..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="Website URL (optional)"
                  className="w-64 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !seeds.trim()}
                  className="bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? 'Generating...' : '🔍 Generate Keywords'}
                </button>
              </div>
              <button
                onClick={() => setShowFilters(f => !f)}
                className="text-sm text-[#0D9488] hover:underline self-start"
              >
                {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
              </button>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-4 gap-3 mt-2 p-4 bg-gray-50 rounded-xl">
                  {[
                    { label: 'Min Volume', key: 'minVolume', placeholder: '100' },
                    { label: 'Max Volume', key: 'maxVolume', placeholder: '50000' },
                    { label: 'Min CPC ($)', key: 'minCpc', placeholder: '0.5' },
                    { label: 'Max CPC ($)', key: 'maxCpc', placeholder: '10' },
                    { label: 'Min Difficulty', key: 'minDiff', placeholder: '0' },
                    { label: 'Max Difficulty', key: 'maxDiff', placeholder: '100' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                      <input
                        type="number"
                        value={filters[f.key]}
                        onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Competition</label>
                    <select
                      value={filters.competition}
                      onChange={e => setFilters(prev => ({ ...prev, competition: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                    >
                      <option value="">All</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ minVolume: '', maxVolume: '', competition: '', minCpc: '', maxCpc: '', minDiff: '', maxDiff: '' })}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-4 text-sm">{error}</div>}

          {/* Results */}
          {(loading || results.length > 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-4 pt-4 gap-1 flex-wrap">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-[#0D9488] text-white' : 'text-gray-500 hover:text-[#0D9488]'}`}
                  >
                    {t.label}
                  </button>
                ))}
                <div className="ml-auto flex gap-2 pb-2">
                  <button onClick={copySelected} className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600">
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                  <button onClick={exportCSV} className="text-sm bg-[#1B5FA8] text-white px-3 py-1.5 rounded-lg hover:bg-[#0D9488]">
                    ⬇️ Export CSV
                  </button>
                </div>
              </div>

              {/* Stats bar */}
              {!loading && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-6 text-sm text-gray-500">
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
                        <input type="checkbox" onChange={e => setSelected(e.target.checked ? filtered.map(k => k.keyword) : [])} />
                      </th>
                      {[
                        { label: 'Keyword', key: 'keyword' },
                        { label: 'Volume', key: 'volume' },
                        { label: 'CPC', key: 'cpc' },
                        { label: 'Difficulty', key: 'difficulty' },
                        { label: 'Competition', key: 'competition' },
                        { label: 'Intent', key: 'intent' },
                        { label: 'Trend', key: null },
                      ].map(col => (
                        <th
                          key={col.label}
                          className={`px-4 py-3 ${col.key ? 'cursor-pointer hover:text-gray-600' : ''}`}
                          onClick={() => col.key && toggleSort(col.key)}
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
                      <tr><td colSpan={8} className="text-center py-12 text-gray-400">No keywords match your filters.</td></tr>
                    ) : (
                      filtered.map((kw, i) => (
                        <tr key={i} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${selected.includes(kw.keyword) ? 'bg-teal-50' : ''}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selected.includes(kw.keyword)} onChange={() => toggleSelect(kw.keyword)} />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">{kw.keyword}</td>
                          <td className="px-4 py-3 text-gray-700">{kw.volume.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-700">${kw.cpc}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-[#0D9488]" style={{ width: `${kw.difficulty}%` }} />
                              </div>
                              <span className="text-gray-700">{kw.difficulty}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 font-semibold ${COMPETITION_COLORS[kw.competition]}`}>{kw.competition}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INTENT_COLORS[kw.intent]}`}>{kw.intent}</span>
                          </td>
                          <td className="px-4 py-3"><MiniTrend trend={kw.trend} /></td>
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

          {/* Empty state */}
          {!loading && results.length === 0 && !error && (
            <div className="text-center py-24 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium text-gray-500">Enter a keyword to get started</p>
              <p className="text-sm mt-1">Discover search volume, CPC, competition, and more.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
