'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import { createClient } from '../lib/supabase'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
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

  const links = [
    { href: '/#features', label: 'Features' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/"><Logo size="md" /></Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors">{l.label}</Link>
          ))}

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
              <Link href="/auth" className="text-gray-500 hover:text-[#1B5FA8] text-sm transition-colors">Login</Link>
              <Link href="/auth?mode=signup" className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`w-6 h-0.5 bg-gray-600 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-gray-600 transition-all ${open ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-gray-600 transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-1">{l.label}</Link>
          ))}

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
              <Link href="/auth" onClick={() => setOpen(false)} className="block text-gray-600 hover:text-[#1B5FA8] text-sm py-1">Login</Link>
              <Link href="/auth?mode=signup" onClick={() => setOpen(false)} className="block bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold text-center mt-2">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
