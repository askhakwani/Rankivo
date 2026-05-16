'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import { createClient } from '../lib/supabase'

const SEO_TOOLS = [
  { href: '/tools/keyword-research',   label: 'Keyword Research',    icon: '🔍' },
  { href: '/tools/meta-tags-generator', label: 'Meta Tags Generator', icon: '🏷️' },
  { href: '/tools/seo-score-checker',  label: 'SEO Score Checker',   icon: '📊' },
  { href: '/tools/blog-generator',     label: 'Blog Generator',      icon: '✍️' },
]

export default function Navbar() {
  const [open, setOpen]           = useState(false)   // mobile menu
  const [toolsOpen, setToolsOpen] = useState(false)   // desktop dropdown
  const [user, setUser]           = useState(null)
  const dropdownRef               = useRef(null)
  const supabase                  = createClient()

  // Auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'

  const staticLinks = [
    { href: '/#pricing', label: 'Pricing' },
    { href: '/blog',     label: 'Blog'    },
    { href: '/about',    label: 'About'   },
    { href: '/faq',      label: 'FAQ'     },
    { href: '/contact',  label: 'Contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/"><Logo size="md" /></Link>

        {/* ── Desktop ── */}
        <div className="hidden md:flex items-center gap-6">

          {/* SEO Tools dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsOpen(o => !o)}
              className="flex items-center gap-1 text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors"
            >
              SEO Tools
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {toolsOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                {SEO_TOOLS.map(t => (
                  <Link
                    key={t.href}
                    href={t.href}
                    onClick={() => setToolsOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1B5FA8] transition-colors"
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Static links */}
          {staticLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {/* Auth */}
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors">
                👤 {displayName}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-500 text-sm transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors">
                Login
              </Link>
              <Link
                href="/auth?mode=signup"
                className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`w-6 h-0.5 bg-gray-600 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-gray-600 transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-gray-600 transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3">

          {/* SEO Tools — flat list with label */}
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">SEO Tools</p>
            {SEO_TOOLS.map(t => (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-[#1B5FA8] text-sm py-1.5"
              >
                <span>{t.icon}</span>
                {t.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            {staticLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-1"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-1">
                  👤 {displayName}
                </Link>
                <button
                  onClick={() => { handleSignOut(); setOpen(false) }}
                  className="block text-red-400 hover:text-red-600 text-sm py-1 w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" onClick={() => setOpen(false)} className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-1">
                  Login
                </Link>
                <Link
                  href="/auth?mode=signup"
                  onClick={() => setOpen(false)}
                  className="block bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold text-center mt-2"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
