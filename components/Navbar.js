'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import { createClient } from '../lib/supabase'

// ─── Data ────────────────────────────────────────────────────────────────────

const SEO_TOOLS = [
  {
    href: '/tools/keyword-research',
    label: 'Keyword Research',
    icon: '🔍',
    desc: 'Find high-traffic keywords instantly',
    tag: 'Popular',
  },
  {
    href: '/tools/meta-tags-generator',
    label: 'Meta Tags Generator',
    icon: '🏷️',
    desc: 'Craft perfect title & description tags',
    tag: null,
  },
  {
    href: '/tools/seo-score-checker',
    label: 'SEO Score Checker',
    icon: '📊',
    desc: 'Audit and improve your page rankings',
    tag: null,
  },
]

const CONTENT_GROUPS = [
  {
    label: 'Social',
    accentColor: '#1B5FA8',
    tools: [
      { href: '/tools/instagram-caption-generator', label: 'Instagram Captions', icon: '📸', desc: '4 scroll-stopping caption variations', tag: null },
      { href: '/tools/tiktok-caption-generator',   label: 'TikTok Captions',    icon: '🎵', desc: 'Viral hooks for short-form video',    tag: 'New'  },
      { href: '/tools/x-post-generator',            label: 'X Posts',            icon: '✖️', desc: 'Punchy tweets under 280 characters',  tag: null  },
    ],
  },
  {
    label: 'Professional',
    accentColor: '#0D9488',
    tools: [
      { href: '/tools/linkedin-post-generator', label: 'LinkedIn Posts',  icon: '💼', desc: 'Thought-leadership content that converts', tag: null },
      { href: '/tools/email-generator',         label: 'Email Generator', icon: '📧', desc: 'High-converting email copy fast',          tag: null },
    ],
  },
  {
    label: 'Long-form',
    accentColor: '#7C3AED',
    tools: [
      { href: '/tools/blog-generator',           label: 'Blog Generator',   icon: '✍️', desc: 'Full SEO-optimised articles in seconds', tag: 'Popular' },
      { href: '/tools/youtube-script-generator', label: 'YouTube Script',   icon: '🎬', desc: 'Full video scripts with hooks & CTAs',   tag: 'New'     },
      { href: '/tools/ad-copy-generator',        label: 'Ad Copy Generator',icon: '📣', desc: 'A/B-ready ad variations that sell',      tag: null      },
    ],
  },
]

const ALL_CONTENT_TOOLS = CONTENT_GROUPS.flatMap(g => g.tools)

const TAG_STYLES = {
  Popular: 'bg-[#C9943A]/15 text-[#C9943A] border border-[#C9943A]/30',
  New:     'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30',
}

const STATIC_LINKS = [
  { href: '/#pricing', label: 'Pricing' },
  { href: '/blog',     label: 'Blog'    },
  { href: '/about',    label: 'About'   },
  { href: '/faq',      label: 'FAQ'     },
  { href: '/contact',  label: 'Contact' },
]

// ─── Shared styles ────────────────────────────────────────────────────────────

const ANIMATION_CSS = `
  @keyframes dropFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .drop-animate { animation: dropFadeIn 200ms ease forwards; }
  .tool-card    { transition: background 150ms ease, box-shadow 150ms ease, transform 150ms ease; }
  .tool-card:hover { transform: scale(1.02) translateY(-1px); }
`

// ─── ToolCard ─────────────────────────────────────────────────────────────────

function ToolCard({ href, icon, label, desc, tag, onClose }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="tool-card flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 hover:shadow-md group"
    >
      <span className="text-xl mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-gray-800 group-hover:text-[#1B5FA8] transition-colors">
            {label}
          </span>
          {tag && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[tag]}`}>
              {tag === 'Popular' ? '🔥' : '✨'} {tag}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </Link>
  )
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ label, color }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
      <span className="w-3 h-px inline-block" style={{ backgroundColor: color }} />
      {label}
    </p>
  )
}

// ─── NavDropdownTrigger ───────────────────────────────────────────────────────

function NavDropdownTrigger({ label, isOpen, onMouseEnter, onMouseLeave, children, dropdownRef }) {
  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 ${
          isOpen ? 'text-[#1B5FA8]' : 'text-gray-600 hover:text-[#1B5FA8]'
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && children}
    </div>
  )
}

// ─── SEO Dropdown ─────────────────────────────────────────────────────────────

function SeoDropdown({ onClose, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className="drop-animate absolute top-full left-0 mt-3 z-50"
      style={{ width: '320px', maxWidth: 'calc(100vw - 3rem)' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Arrow */}
      <div className="absolute -top-1.5 left-[12%] w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" style={{ zIndex: 1 }} />

      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden" style={{ zIndex: 2 }}>
        <div className="p-5">
          <SectionLabel label="SEO & Research" color="#1B5FA8" />
          <div className="space-y-1 mt-3">
            {SEO_TOOLS.map(tool => (
              <ToolCard key={tool.href} {...tool} onClose={onClose} />
            ))}
          </div>
        </div>

        {/* CTA bar */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">✅ Free to try</p>
          <Link href="/auth?mode=signup" onClick={onClose} className="text-xs font-semibold text-[#1B5FA8] hover:text-[#0D9488] transition-colors">
            Get started free →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Content Dropdown ─────────────────────────────────────────────────────────

function ContentDropdown({ onClose, onMouseEnter, onMouseLeave }) {
  const [query, setQuery] = useState('')

  const isFiltering = query.trim().length > 0
  const filteredTools = isFiltering
    ? ALL_CONTENT_TOOLS.filter(t =>
        t.label.toLowerCase().includes(query.toLowerCase()) ||
        t.desc.toLowerCase().includes(query.toLowerCase())
      )
    : null

  return (
    <div
      className="drop-animate absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
      style={{ width: '520px', maxWidth: 'calc(100vw - 3rem)' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Arrow */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" style={{ zIndex: 1 }} />

      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden" style={{ zIndex: 2 }}>

        {/* Search bar */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#1B5FA8] focus-within:ring-2 focus-within:ring-[#1B5FA8]/10 transition-all">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tool list */}
        <div className="p-5">
          {isFiltering ? (
            filteredTools.length > 0 ? (
              <div className="space-y-1">
                {filteredTools.map(tool => (
                  <ToolCard key={tool.href} {...tool} onClose={onClose} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No tools found for "{query}"</p>
            )
          ) : (
            /* Grouped view */
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {CONTENT_GROUPS.map(group => (
                <div key={group.label}>
                  <SectionLabel label={group.label} color={group.accentColor} />
                  <div className="space-y-1">
                    {group.tools.map(tool => (
                      <ToolCard key={tool.href} {...tool} onClose={onClose} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA bar */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">✅ All tools free to try · No credit card required</p>
          <Link href="/auth?mode=signup" onClick={onClose} className="text-xs font-semibold text-[#1B5FA8] hover:text-[#0D9488] transition-colors">
            Get started free →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── useHoverDropdown hook ────────────────────────────────────────────────────

function useHoverDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const ref     = useRef(null)
  const timeout = useRef(null)

  function open()  { clearTimeout(timeout.current); setIsOpen(true)  }
  function close() { timeout.current = setTimeout(() => setIsOpen(false), 120) }

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return { isOpen, open, close, ref }
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null) // 'seo' | 'content' | null
  const [user, setUser] = useState(null)

  const seo     = useHoverDropdown()
  const content = useHoverDropdown()

  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'

  function closeAll() {
    seo.close()
    content.close()
    setMobileOpen(false)
  }

  return (
    <>
      <style>{ANIMATION_CSS}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Logo size="md" /></Link>

          {/* ── Desktop ── */}
          <div className="hidden md:flex items-center gap-6">

            {/* SEO Tools */}
            <NavDropdownTrigger
              label="SEO Tools"
              isOpen={seo.isOpen}
              onMouseEnter={seo.open}
              onMouseLeave={seo.close}
              dropdownRef={seo.ref}
            >
              <SeoDropdown
                onClose={closeAll}
                onMouseEnter={seo.open}
                onMouseLeave={seo.close}
              />
            </NavDropdownTrigger>

            {/* Content Generators */}
            <NavDropdownTrigger
              label="Content Generators"
              isOpen={content.isOpen}
              onMouseEnter={content.open}
              onMouseLeave={content.close}
              dropdownRef={content.ref}
            >
              <ContentDropdown
                onClose={closeAll}
                onMouseEnter={content.open}
                onMouseLeave={content.close}
              />
            </NavDropdownTrigger>

            {/* Static links */}
            {STATIC_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-gray-500 hover:text-[#1B5FA8] text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}

            {/* Auth */}
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-500 hover:text-[#1B5FA8] text-sm font-medium transition-colors">
                  👤 {displayName}
                </Link>
                <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-gray-500 hover:text-[#1B5FA8] text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button onClick={() => setMobileOpen(o => !o)} className="md:hidden flex flex-col gap-1.5 p-2">
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-4">

            {/* SEO Tools section */}
            <div>
              <button
                onClick={() => setMobileSection(s => s === 'seo' ? null : 'seo')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 py-1"
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-px bg-[#1B5FA8] inline-block" />
                  SEO Tools
                </span>
                <svg className={`w-3 h-3 transition-transform ${mobileSection === 'seo' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {(mobileSection === 'seo' || mobileSection === null) && (
                <div className="space-y-0.5">
                  {SEO_TOOLS.map(t => (
                    <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                      {t.tag && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${TAG_STYLES[t.tag]}`}>{t.tag}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Content Generators section */}
            <div>
              <button
                onClick={() => setMobileSection(s => s === 'content' ? null : 'content')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 py-1"
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-px bg-[#0D9488] inline-block" />
                  Content Generators
                </span>
                <svg className={`w-3 h-3 transition-transform ${mobileSection === 'content' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {(mobileSection === 'content' || mobileSection === null) && (
                <div className="space-y-0.5">
                  {CONTENT_GROUPS.map(group => (
                    <div key={group.label} className="mb-3">
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-2 mb-1">{group.label}</p>
                      {group.tools.map(t => (
                        <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                          {t.tag && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${TAG_STYLES[t.tag]}`}>{t.tag}</span>}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Static links */}
            <div className="border-t border-gray-100 pt-4 space-y-0.5">
              {STATIC_LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Auth */}
            <div className="border-t border-gray-100 pt-4">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50">
                    👤 {displayName}
                  </Link>
                  <button onClick={() => { handleSignOut(); setMobileOpen(false) }}
                    className="block text-red-400 hover:text-red-600 text-sm py-2 px-2 w-full text-left rounded-lg hover:bg-red-50 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setMobileOpen(false)}
                    className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50">
                    Login
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setMobileOpen(false)}
                    className="block bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-sm font-semibold text-center mt-3 shadow-sm">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
