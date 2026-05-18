'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import { createClient } from '../lib/supabase'

const SEO_TOOLS = [
  {
    href: '/tools/keyword-research',
    label: 'Keyword Research',
    icon: '🔍',
    desc: 'Find high-traffic keywords instantly',
    tag: 'Popular',
    section: 'seo',
  },
  {
    href: '/tools/meta-tags-generator',
    label: 'Meta Tags Generator',
    icon: '🏷️',
    desc: 'Craft perfect title & description tags',
    tag: null,
    section: 'seo',
  },
  {
    href: '/tools/seo-score-checker',
    label: 'SEO Score Checker',
    icon: '📊',
    desc: 'Audit and improve your page rankings',
    tag: null,
    section: 'seo',
  },
  {
    href: '/tools/blog-generator',
    label: 'Blog Generator',
    icon: '✍️',
    desc: 'Full SEO-optimised articles in seconds',
    tag: 'Popular',
    section: 'seo',
  },
  {
    href: '/tools/instagram-caption-generator',
    label: 'Instagram Captions',
    icon: '📸',
    desc: '4 scroll-stopping caption variations',
    tag: null,
    section: 'content',
  },
  {
    href: '/tools/tiktok-caption-generator',
    label: 'TikTok Captions',
    icon: '🎵',
    desc: 'Viral hooks for short-form video',
    tag: 'New',
    section: 'content',
  },
  {
    href: '/tools/linkedin-post-generator',
    label: 'LinkedIn Posts',
    icon: '💼',
    desc: 'Thought-leadership content that converts',
    tag: null,
    section: 'content',
  },
  {
    href: '/tools/x-post-generator',
    label: 'X Posts',
    icon: '✖️',
    desc: 'Punchy tweets under 280 characters',
    tag: null,
    section: 'content',
  },
  {
    href: '/tools/email-generator',
    label: 'Email Generator',
    icon: '📧',
    desc: 'High-converting email copy fast',
    tag: null,
    section: 'content',
  },
  {
    href: '/tools/youtube-script-generator',
    label: 'YouTube Script',
    icon: '🎬',
    desc: 'Full video scripts with hooks & CTAs',
    tag: 'New',
    section: 'content',
  },
  {
    href: '/tools/ad-copy-generator',
    label: 'Ad Copy Generator',
    icon: '📣',
    desc: 'A/B-ready ad variations that sell',
    tag: null,
    section: 'content',
  },
]

const TAG_STYLES = {
  Popular: 'bg-[#C9943A]/15 text-[#C9943A] border border-[#C9943A]/30',
  New:     'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30',
}

export default function Navbar() {
  const [open, setOpen]           = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [hovered, setHovered]     = useState(null)
  const [user, setUser]           = useState(null)
  const dropdownRef               = useRef(null)
  const hoverTimeout              = useRef(null)
  const supabase                  = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setToolsOpen(false)
        setHovered(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleMouseEnter() {
    clearTimeout(hoverTimeout.current)
    setToolsOpen(true)
  }

  function handleMouseLeave() {
    hoverTimeout.current = setTimeout(() => {
      setToolsOpen(false)
      setHovered(null)
    }, 120)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'

  const seoTools     = SEO_TOOLS.filter(t => t.section === 'seo')
  const contentTools = SEO_TOOLS.filter(t => t.section === 'content')

  const staticLinks = [
    { href: '/#pricing', label: 'Pricing' },
    { href: '/blog',     label: 'Blog'    },
    { href: '/about',    label: 'About'   },
    { href: '/faq',      label: 'FAQ'     },
    { href: '/contact',  label: 'Contact' },
  ]

  return (
    <>
      <style>{`
        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .mega-dropdown { animation: megaFadeIn 180ms ease forwards; }
        .tool-card { transition: background 150ms ease, box-shadow 150ms ease, transform 150ms ease; }
        .tool-card:hover { transform: translateY(-1px); }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Logo size="md" /></Link>

          {/* ── Desktop ── */}
          <div className="hidden md:flex items-center gap-6">

            {/* Mega dropdown trigger */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setToolsOpen(o => !o)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 ${toolsOpen ? 'text-[#1B5FA8]' : 'text-gray-600 hover:text-[#1B5FA8]'}`}
              >
                Tools
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {toolsOpen && (
                <div
                  className="mega-dropdown absolute top-full left-0 mt-3 z-50"
                  style={{ width: '680px', maxWidth: 'calc(100vw - 3rem)' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Arrow pointer */}
                  <div
                    className="absolute -top-1.5 left-[8%] w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"
                    style={{ zIndex: 1 }}
                  />

                  <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden" style={{ zIndex: 2 }}>
                    <div className="grid grid-cols-2 divide-x divide-gray-100">

                      {/* SEO Tools column */}
                      <div className="p-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-3 h-px bg-[#1B5FA8] inline-block" />
                          SEO & Research
                        </p>
                        <div className="space-y-1">
                          {seoTools.map(tool => (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              onClick={() => { setToolsOpen(false); setHovered(null) }}
                              onMouseEnter={() => setHovered(tool.href)}
                              onMouseLeave={() => setHovered(null)}
                              className={`tool-card flex items-start gap-3.5 p-3 rounded-xl ${hovered === tool.href ? 'bg-[#1B5FA8]/5 shadow-sm' : 'hover:bg-gray-50'}`}
                            >
                              <span className="text-xl mt-0.5 shrink-0">{tool.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-semibold text-gray-800">{tool.label}</span>
                                  {tool.tag && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[tool.tag]}`}>
                                      {tool.tag === 'Popular' ? '🔥' : '✨'} {tool.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">{tool.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Content Generators column */}
                      <div className="p-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-3 h-px bg-[#0D9488] inline-block" />
                          Content Generators
                        </p>
                        <div className="space-y-1">
                          {contentTools.map(tool => (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              onClick={() => { setToolsOpen(false); setHovered(null) }}
                              onMouseEnter={() => setHovered(tool.href)}
                              onMouseLeave={() => setHovered(null)}
                              className={`tool-card flex items-start gap-3.5 p-3 rounded-xl ${hovered === tool.href ? 'bg-[#0D9488]/5 shadow-sm' : 'hover:bg-gray-50'}`}
                            >
                              <span className="text-xl mt-0.5 shrink-0">{tool.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-semibold text-gray-800">{tool.label}</span>
                                  {tool.tag && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[tool.tag]}`}>
                                      {tool.tag === 'Popular' ? '🔥' : '✨'} {tool.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">{tool.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA bar */}
                    <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-3 flex items-center justify-between">
                      <p className="text-xs text-gray-400">✅ All tools free to try · No credit card required</p>
                      <Link
                        href="/auth?mode=signup"
                        onClick={() => setToolsOpen(false)}
                        className="text-xs font-semibold text-[#1B5FA8] hover:text-[#0D9488] transition-colors"
                      >
                        Get started free →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {staticLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-gray-500 hover:text-[#1B5FA8] text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}

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
          <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5 p-2">
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">SEO & Research</p>
              <div className="space-y-0.5">
                {seoTools.map(t => (
                  <Link key={t.href} href={t.href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                    {t.tag && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${TAG_STYLES[t.tag]}`}>
                        {t.tag}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4 mb-3">Content Generators</p>
              <div className="space-y-0.5">
                {contentTools.map(t => (
                  <Link key={t.href} href={t.href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                    {t.tag && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${TAG_STYLES[t.tag]}`}>
                        {t.tag}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-0.5">
              {staticLinks.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}
                    className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50">
                    👤 {displayName}
                  </Link>
                  <button onClick={() => { handleSignOut(); setOpen(false) }}
                    className="block text-red-400 hover:text-red-600 text-sm py-2 px-2 w-full text-left rounded-lg hover:bg-red-50 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setOpen(false)}
                    className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-2 px-2 rounded-lg hover:bg-gray-50">
                    Login
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setOpen(false)}
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
