'use client'
// app/tools/broken-link-checker/page.js  (NEW FILE)
import { useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

// ── Status labels and colours ────────────────────────────────────────────────
const STATUS = {
  broken:       { label: 'Broken',       badge: 'bg-red-50 text-red-600',               order: 0 },
  failed:       { label: 'Error',        badge: 'bg-orange-50 text-orange-600',         order: 1 },
  server_error: { label: 'Server error', badge: 'bg-orange-50 text-orange-600',         order: 2 },
  unverified:   { label: 'Unverified',   badge: 'bg-yellow-50 text-yellow-700',         order: 3 },
  redirect:     { label: 'Redirect',     badge: 'bg-[#C9943A]/10 text-[#C9943A]',       order: 4 },
  ok:           { label: 'Working',      badge: 'bg-[#0D9488]/10 text-[#0D9488]',       order: 5 },
  pending:      { label: 'Not checked',  badge: 'bg-gray-100 text-gray-500',            order: 6 },
}

const TABS = [
  { id: 'all',        label: 'All',        match: () => true },
  { id: 'broken',     label: 'Broken',     match: r => r.status === 'broken' },
  { id: 'redirect',   label: 'Redirects',  match: r => r.status === 'redirect' },
  { id: 'unverified', label: 'Unverified', match: r => r.status === 'unverified' },
  { id: 'errors',     label: 'Errors',     match: r => r.status === 'failed' || r.status === 'server_error' },
  { id: 'ok',         label: 'Working',    match: r => r.status === 'ok' },
]

const SCOPES = [
  { id: 'all',      label: 'All links' },
  { id: 'internal', label: 'Internal' },
  { id: 'external', label: 'External' },
]

const BATCH_SIZE = 10      // links per request to /check
const PARALLEL_BATCHES = 3 // requests running at the same time
const MAX_PAGES_UI = 25    // hard cap in the box; each plan has its own (lower) limit on the server

const FAQS = [
  {
    q: 'What is a broken link?',
    a: 'A broken link points to a page that no longer exists, usually returning a 404 (not found) or 410 (gone) error. Broken links frustrate visitors and waste the authority that links are meant to pass.',
  },
  {
    q: 'Why are some links marked "Unverified" instead of broken?',
    a: 'Some websites, including many large platforms, refuse automated requests and return errors like 403 or 429 even though the page works fine in a browser. Calling those links broken would be misleading, so we mark them Unverified. Open them yourself to confirm.',
  },
  {
    q: 'Should I fix redirected links?',
    a: 'A redirected link still works, but it adds an extra step. For links on your own site, update them to point straight to the final URL. This keeps your site clean and avoids long redirect chains.',
  },
  {
    q: 'Does this tool scan my whole website?',
    a: 'No. It checks the pages you enter, not your whole site. Free users scan one page at a time, and paid plans can scan several pages in one go. Start with your most visited pages.',
  },
  {
    q: 'Does it check images, scripts and CSS files?',
    a: 'No. It checks the clickable links (anchor links) on the page, which are the ones that matter for visitors and for link building.',
  },
  {
    q: 'Is the Broken Link Checker free?',
    a: 'Yes. Each scan checks a limited number of links depending on your plan, and logged-in users get a higher limit.',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function csvCell(value) {
  let s = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s // stops spreadsheet formula injection
  return '"' + s.replace(/"/g, '""') + '"'
}

function hostOf(u) {
  try { return new URL(u).hostname.replace(/^www\./, '') } catch { return 'page' }
}

function parseUrls(text) {
  const seen = new Set()
  const out = []
  String(text).split(/\r?\n/).forEach(line => {
    const s = line.trim()
    if (s && !seen.has(s)) { seen.add(s); out.push(s) }
  })
  return out
}

function pageLabel(p) {
  if (p.error) return `${p.input} (failed)`
  let path = p.pageUrl
  try {
    const u = new URL(p.pageUrl)
    path = u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '')
  } catch {}
  return `${path.length > 60 ? path.slice(0, 57) + '…' : path} (${p.links.length} links)`
}

function redirectLabel(r) {
  if (r.status !== 'redirect' && !(r.hops > 0)) return ''
  const kind = r.redirectType === 'permanent' ? 'Permanent' : 'Temporary'
  const hops = r.hops > 1 ? `, ${r.hops} redirects` : ''
  return `${r.firstRedirectCode} ${kind.toLowerCase()} redirect${hops}`
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BrokenLinkCheckerPage() {
  const [url, setUrl]         = useState('')     // one URL, or one per line in bulk mode
  const [bulkMode, setBulkMode] = useState(false)
  const [phase, setPhase]     = useState('idle') // idle | scanning | checking | done
  const [error, setError]     = useState('')
  const [pages, setPages]     = useState([])     // scanned pages: { key, input, pageUrl, title, found, limit, truncated, tier, links, error? }
  const [activeKey, setActiveKey] = useState('p0') // 'all' or a page key
  const [bulk, setBulk]       = useState({ index: 0, total: 0 })
  const [results, setResults] = useState({})     // url -> check result (shared across pages)
  const [tab, setTab]         = useState('all')
  const [scope, setScope]     = useState('all')
  const [mode, setMode]       = useState('own')  // own | other (whose page is being checked)
  const [copied, setCopied]   = useState(false)
  const cancelRef = useRef(false)

  const busy = phase === 'scanning' || phase === 'checking'

  // Links shown right now: one page, or every page combined
  const activePage = pages.find(p => p.key === activeKey) || null
  const meta = activePage
  const links = useMemo(() => {
    const source = activeKey === 'all' ? pages : (activePage ? [activePage] : [])
    return source.flatMap(p => p.links.map(l => ({ ...l, sourceUrl: p.pageUrl })))
  }, [pages, activeKey, activePage])

  // Merge link info with check results, worst problems first
  const rows = useMemo(() => {
    return links
      .map((l, i) => ({ ...l, index: i, status: 'pending', ...(results[l.url] || {}) }))
      .sort((a, b) => (STATUS[a.status].order - STATUS[b.status].order) || (a.index - b.index))
  }, [links, results])

  const counts = useMemo(() => {
    const c = { total: rows.length, broken: 0, redirect: 0, unverified: 0, errors: 0, ok: 0, pending: 0 }
    rows.forEach(r => {
      if (r.status === 'failed' || r.status === 'server_error') c.errors++
      else if (c[r.status] !== undefined) c[r.status]++
    })
    return c
  }, [rows])

  const checkedCount = rows.filter(r => r.status !== 'pending').length

  const visibleRows = rows.filter(r => {
    const tabOk = TABS.find(t => t.id === tab).match(r)
    const scopeOk = scope === 'all' || (scope === 'internal' ? r.internal : !r.internal)
    return tabOk && scopeOk
  })

  // ── Run a scan ──────────────────────────────────────────────────────────────
  async function runChecks(list) {
    const batches = chunk(list, BATCH_SIZE)
    let next = 0

    async function worker() {
      while (next < batches.length && !cancelRef.current) {
        const batch = batches[next++]
        try {
          const res = await fetch('/api/tools/broken-links/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: batch.map(l => l.url) }),
          })
          const data = await res.json()
          if (res.status === 429) {
            setError(data.error || 'You have reached the hourly limit. Try again later.')
            cancelRef.current = true
            return
          }
          if (!res.ok || !data.results) throw new Error(data.error || 'Check failed')
          setResults(prev => {
            const merged = { ...prev }
            data.results.forEach(r => { merged[r.url] = r })
            return merged
          })
        } catch {
          setResults(prev => {
            const merged = { ...prev }
            batch.forEach(l => {
              merged[l.url] = { url: l.url, status: 'failed', code: null, note: 'The check did not complete. Run the scan again.' }
            })
            return merged
          })
        }
      }
    }

    await Promise.all(Array.from({ length: PARALLEL_BATCHES }, worker))
  }

  async function handleScan() {
    const urls = parseUrls(url)
    if (!urls.length || busy) return
    if (urls.length > MAX_PAGES_UI) {
      setError(`Enter up to ${MAX_PAGES_UI} URLs at a time.`)
      return
    }

    cancelRef.current = false
    setError('')
    setPages([])
    setResults({})
    setTab('all')
    setScope('all')
    setActiveKey(urls.length > 1 ? 'all' : 'p0')
    setBulk({ index: 0, total: urls.length })
    setPhase('scanning')

    const queued = new Set() // each unique link is checked once per batch

    try {
      for (let i = 0; i < urls.length; i++) {
        if (cancelRef.current) break
        setBulk({ index: i + 1, total: urls.length })
        setPhase('scanning')
        const key = 'p' + i

        let res, data
        try {
          res = await fetch('/api/tools/broken-links/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urls[i], batchSize: urls.length }),
          })
          data = await res.json()
        } catch {
          if (urls.length === 1) {
            setError('Something went wrong. Check your connection and try again.')
            setPhase('idle')
            return
          }
          setPages(prev => [...prev, { key, input: urls[i], pageUrl: urls[i], title: '', links: [], error: 'Could not scan that page.' }])
          continue
        }

        if (!res.ok || data.error) {
          const msg = data.error || 'Could not scan that page.'
          // Plan or rate limits stop the whole batch; other errors only skip this page
          if (urls.length === 1 || res.status === 429 || res.status === 403) {
            setError(msg)
            setPhase(i === 0 ? 'idle' : 'done')
            return
          }
          setPages(prev => [...prev, { key, input: urls[i], pageUrl: urls[i], title: '', links: [], error: msg }])
          continue
        }

        setPages(prev => [...prev, { ...data, key, input: urls[i] }])
        const fresh = data.links.filter(l => !queued.has(l.url))
        fresh.forEach(l => queued.add(l.url))
        if (fresh.length > 0) {
          setPhase('checking')
          await runChecks(fresh)
        }
      }
      setPhase('done')
    } catch {
      setError('Something went wrong. Check your connection and try again.')
      setPhase('idle')
    }
  }

  function handleStop() {
    cancelRef.current = true
  }

  // ── Export helpers ──────────────────────────────────────────────────────────
  async function copyBroken() {
    const text = [...new Set(rows.filter(r => r.status === 'broken').map(r => r.url))].join('\n')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to the clipboard. Select the links manually instead.')
    }
  }

  function exportCsv() {
    const header = ['Source page', 'URL', 'Anchor text', 'Status', 'Status code', 'Type', 'Redirect type', 'Redirects to', 'Rel', 'Times on page', 'Note']
    const lines = rows.map(r => [
      r.sourceUrl,
      r.url,
      r.anchor,
      STATUS[r.status].label,
      r.code ?? '',
      r.internal ? 'Internal' : 'External',
      r.redirectType || '',
      r.finalUrl || '',
      r.rel || '',
      r.count,
      r.note || '',
    ].map(csvCell).join(','))
    const csv = [header.map(csvCell).join(','), ...lines].join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = activeKey === 'all' && pages.length > 1
      ? `broken-links-${pages.length}-pages.csv`
      : `broken-links-${hostOf(meta?.pageUrl || url)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(href)
  }

  const showResults = pages.length > 0 && phase !== 'idle'
  const truncPages = activeKey === 'all' ? pages.filter(p => p.truncated) : (meta?.truncated ? [meta] : [])
  const planTier = pages.find(p => p.tier)?.tier
  const progress = links.length ? Math.round((checkedCount / links.length) * 100) : 0
  const hasIssues = counts.broken + counts.redirect + counts.unverified + counts.errors > 0

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">

          {/* ── Hero ── */}
          <div className="text-center mb-10">
            <span className="inline-block bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              Free SEO Tool
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B5FA8] mb-3">
              Broken Link Checker
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              Find broken, redirected and unverifiable links on any webpage. See the anchor text, status code and rel attribute for every link, then export the results.
            </p>
          </div>

          {/* ── Input ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="blc-url" className="block text-sm font-medium text-gray-700">
                {bulkMode ? 'Page URLs (one per line)' : 'Page URL'}
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (bulkMode) setUrl(u => u.split(/\r?\n/)[0] || '')
                  setBulkMode(b => !b)
                }}
                className="text-xs font-semibold text-[#1B5FA8] hover:underline disabled:opacity-50"
              >
                {bulkMode ? 'Scan a single page' : 'Scan several pages'}
              </button>
            </div>
            <div className="flex gap-2 items-start">
              {bulkMode ? (
                <textarea
                  id="blc-url"
                  rows={5}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder={'https://yoursite.com/resources\nhttps://yoursite.com/links'}
                  autoComplete="off"
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                />
              ) : (
                <input
                  id="blc-url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleScan() }}
                  placeholder="https://yoursite.com/your-page"
                  inputMode="url"
                  autoComplete="off"
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-800"
                />
              )}
              {busy ? (
                <button
                  onClick={handleStop}
                  className="shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleScan}
                  disabled={!url.trim()}
                  className="shrink-0 bg-[#1B5FA8] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Check links
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {bulkMode ? (
                <>
                  Bulk scan: up to 3 pages on Starter, 10 on Pro and 25 on Agency. A link that appears on several pages is checked once.{' '}
                  <Link href="/upgrade" className="text-[#1B5FA8] font-semibold hover:underline">See plans</Link>
                </>
              ) : (
                'Checks every link on one page. Enter a page address, not a file.'
              )}
            </p>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3" role="alert">
                {error}
              </div>
            )}

            {phase === 'scanning' && (
              <p className="mt-4 text-sm text-gray-500">
                {bulk.total > 1 ? `Scanning page ${bulk.index} of ${bulk.total} for links…` : 'Scanning the page for links…'}
              </p>
            )}
          </div>

          {/* ── Results ── */}
          {showResults && (
            <div className="space-y-6">

              {/* Page info + progress */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {pages.length > 1 && (
                  <div className="mb-4">
                    <label htmlFor="blc-page" className="block text-xs font-medium text-gray-500 mb-1">Showing results for</label>
                    <select
                      id="blc-page"
                      value={activeKey}
                      onChange={e => setActiveKey(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                    >
                      <option value="all">All pages combined ({pages.filter(p => !p.error).length} scanned)</option>
                      {pages.map(p => (
                        <option key={p.key} value={p.key}>{pageLabel(p)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {meta ? (
                  <>
                    {meta.title && <p className="text-sm font-semibold text-gray-800 mb-0.5 break-words">{meta.title}</p>}
                    <p className="text-xs text-gray-400 break-all mb-4">{meta.pageUrl}</p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mb-4">
                    {pages.filter(p => !p.error).length} of {bulk.total} pages scanned
                  </p>
                )}

                {pages.filter(p => p.error).map(p => (
                  <p key={p.key} className="text-xs text-red-600 mb-2 break-words">{p.input}: {p.error}</p>
                ))}

                {links.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium">
                        Checked {checkedCount} of {links.length} links
                      </span>
                      <span className="text-gray-400">{progress}%</span>
                    </div>
                    <div
                      className="h-2 bg-gray-100 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="h-full bg-[#0D9488] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </>
                )}

                {truncPages.length > 0 && (
                  <div className="mt-4 bg-[#C9943A]/10 border border-[#C9943A]/20 text-sm text-gray-700 rounded-xl px-4 py-3">
                    {truncPages.length === 1
                      ? `This page has ${truncPages[0].found} unique links. Your plan checks the first ${truncPages[0].limit} per scan.`
                      : `${truncPages.length} pages have more links than your plan checks per scan (${truncPages[0].limit}).`}{' '}
                    {planTier !== 'agency' && (
                      <Link href="/upgrade" className="text-[#1B5FA8] font-semibold hover:underline">
                        Upgrade for a higher limit
                      </Link>
                    )}
                  </div>
                )}

                {links.length === 0 && (
                  <p className="text-sm text-gray-500">
                    {meta?.error
                      ? meta.error
                      : <>No links were found on this page. If the page builds its links with JavaScript, they will not appear here because the tool reads the page&apos;s HTML.</>}
                  </p>
                )}
              </div>

              {links.length > 0 && (
                <>
                  {/* Summary strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { label: 'Total',      value: counts.total,      color: 'text-gray-800' },
                      { label: 'Working',    value: counts.ok,         color: 'text-[#0D9488]' },
                      { label: 'Redirects',  value: counts.redirect,   color: 'text-[#C9943A]' },
                      { label: 'Broken',     value: counts.broken,     color: 'text-red-600' },
                      { label: 'Unverified', value: counts.unverified, color: 'text-yellow-700' },
                      { label: 'Errors',     value: counts.errors,     color: 'text-orange-600' },
                    ].map(card => (
                      <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
                        <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        <p className="text-xs text-gray-500">{card.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* SEO guidance */}
                  {phase === 'done' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <h2 className="text-base font-bold text-[#1B5FA8]">What to do next</h2>
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 text-xs font-medium">
                          <button
                            onClick={() => setMode('own')}
                            aria-pressed={mode === 'own'}
                            className={`px-3 py-1.5 rounded-md transition-colors ${mode === 'own' ? 'bg-white text-[#1B5FA8] shadow-sm' : 'text-gray-500'}`}
                          >
                            This is my page
                          </button>
                          <button
                            onClick={() => setMode('other')}
                            aria-pressed={mode === 'other'}
                            className={`px-3 py-1.5 rounded-md transition-colors ${mode === 'other' ? 'bg-white text-[#1B5FA8] shadow-sm' : 'text-gray-500'}`}
                          >
                            Someone else&apos;s page
                          </button>
                        </div>
                      </div>

                      {!hasIssues && (
                        <p className="text-sm text-gray-600">
                          No problems found. Every link on this page that we could check is working.
                        </p>
                      )}

                      {hasIssues && mode === 'own' && (
                        <ul className="space-y-2 text-sm text-gray-600">
                          {counts.broken > 0 && (
                            <li>
                              <strong className="text-red-600">{counts.broken} broken</strong>: fix or replace these first. Point internal links to the correct working page, and remove or swap external links that no longer exist.
                            </li>
                          )}
                          {counts.redirect > 0 && (
                            <li>
                              <strong className="text-[#C9943A]">{counts.redirect} redirected</strong>: these still work, but update them to the final URL so visitors and search engines skip the extra step.
                            </li>
                          )}
                          {counts.unverified > 0 && (
                            <li>
                              <strong className="text-yellow-700">{counts.unverified} unverified</strong>: the site refused our automated check. Open each one in your browser to confirm it works.
                            </li>
                          )}
                          {counts.errors > 0 && (
                            <li>
                              <strong className="text-orange-600">{counts.errors} with errors</strong>: timeouts and server errors are often temporary. Run the scan again later before changing anything.
                            </li>
                          )}
                        </ul>
                      )}

                      {hasIssues && mode === 'other' && (
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>
                            {counts.broken > 0
                              ? `${counts.broken} broken link${counts.broken === 1 ? '' : 's'} found. On someone else's page, each one is a possible broken link building opportunity.`
                              : 'No confirmed broken links here. Try another resource page in your niche.'}
                          </p>
                          {counts.broken > 0 && (
                            <p>
                              Check the anchor text to see what each link was meant to point to. If you have a relevant page, contact the site owner, point out the dead link and suggest your page as a replacement.{' '}
                              <Link href="/blog/broken-link-building-how-to-find-and-fix-opportunities" className="text-[#1B5FA8] font-semibold hover:underline">
                                Read the broken link building guide
                              </Link>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Filters + actions */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
                        {TABS.map(t => {
                          const count = rows.filter(r => t.match(r) && (scope === 'all' || (scope === 'internal' ? r.internal : !r.internal))).length
                          const active = tab === t.id
                          return (
                            <button
                              key={t.id}
                              onClick={() => setTab(t.id)}
                              aria-pressed={active}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                active ? 'bg-[#1B5FA8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {t.label} ({count})
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyBroken}
                          disabled={counts.broken === 0}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          {copied ? 'Copied' : 'Copy broken links'}
                        </button>
                        <button
                          onClick={exportCsv}
                          disabled={checkedCount === 0}
                          className="px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-semibold transition-colors disabled:opacity-40"
                        >
                          Export CSV
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 text-xs font-medium w-fit mb-4" role="group" aria-label="Filter by link type">
                      {SCOPES.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setScope(s.id)}
                          aria-pressed={scope === s.id}
                          className={`px-3 py-1.5 rounded-md transition-colors ${scope === s.id ? 'bg-white text-[#1B5FA8] shadow-sm' : 'text-gray-500'}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Link list */}
                    {visibleRows.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center">No links match this filter.</p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {visibleRows.map(r => {
                          const s = STATUS[r.status]
                          const redirectText = redirectLabel(r)
                          return (
                            <li key={`${r.sourceUrl}|${r.url}`} className="py-3">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                                  {s.label}{r.code ? ` ${r.code}` : ''}
                                </span>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                  {r.internal ? 'Internal' : 'External'}
                                </span>
                                {r.rel && (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1B5FA8]/10 text-[#1B5FA8]">
                                    {r.rel}
                                  </span>
                                )}
                                {r.count > 1 && (
                                  <span className="text-xs text-gray-400">appears {r.count} times</span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-800 break-words">{r.anchor}</p>
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#1B5FA8] hover:underline break-all"
                              >
                                {r.url}
                              </a>
                              {activeKey === 'all' && (
                                <p className="text-xs text-gray-400 mt-1 break-all">Found on: {r.sourceUrl}</p>
                              )}
                              {(r.status === 'redirect' || r.finalUrl) && (
                                <p className="text-xs text-gray-500 mt-1 break-all">
                                  {redirectText}
                                  {r.finalUrl ? <> to <span className="text-gray-700">{r.finalUrl}</span></> : null}
                                </p>
                              )}
                              {r.note && <p className="text-xs text-gray-500 mt-1">{r.note}</p>}
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    <p className="text-xs text-gray-400 mt-4">
                      A link with no rel label is a normal followed link. Labels show nofollow, sponsored or ugc when the page sets them.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Cross-link CTA ── */}
          <div className="mt-8 bg-gradient-to-r from-[#1B5FA8] to-[#0D9488] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold">Is your page ready to rank?</p>
              <p className="text-white/80 text-sm mt-0.5">Fixing links is one step. Check your page&apos;s on-page SEO score too.</p>
            </div>
            <Link
              href="/tools/seo-score-checker"
              className="shrink-0 bg-white text-[#1B5FA8] hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              Check My SEO Score →
            </Link>
          </div>

          {/* ── How it works ── */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#1B5FA8] mb-6">How the Broken Link Checker Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '1', icon: '🔗', title: 'Enter a page URL', desc: 'Paste the address of any public webpage. The tool reads the page and collects every link on it.' },
                { step: '2', icon: '🔍', title: 'We check each link', desc: 'Every unique link is tested for working, redirected, broken or blocked status, with live progress as it runs.' },
                { step: '3', icon: '✅', title: 'Fix or export', desc: 'Filter the results, copy the broken links or export everything to CSV, then fix or replace what needs attention.' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="flex flex-col items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B5FA8] text-white text-sm font-bold flex items-center justify-center shrink-0">{step}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-1">{icon} {title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#1B5FA8] mb-4">Frequently Asked Questions</h2>
            <div className="divide-y divide-gray-100">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-800 list-none flex items-center justify-between gap-4">
                    {q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                  </summary>
                  <p className="text-sm text-gray-500 mt-2">{a}</p>
                </details>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
