'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function Sidebar({ activeTab, setActiveTab, user, profile, isAdmin }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const navItem = (id, label, section) => (
    <li
      key={id}
      onClick={() => setActiveTab(id)}
      className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
        activeTab === id
          ? 'bg-[#0D9488]/10 text-[#0D9488] font-semibold border border-[#0D9488]/20'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </li>
  )

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between fixed left-0 top-0">

      {/* Logo */}
      <div>
        <div className="px-6 py-5 border-b border-gray-100">
          <a href="/" className="text-xl font-bold text-[#1B5FA8]">RANKIVO</a>
          <p className="text-xs text-gray-400 mt-0.5">AI Content & SEO Platform</p>
        </div>

        <nav className="px-4 pt-4 space-y-5">

          {/* Main */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 px-1">MAIN</p>
            <ul className="space-y-1">
              {navItem('dashboard', 'Dashboard', 'main')}
            </ul>
          </div>

          {/* SEO Tools */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 px-1">SEO TOOLS</p>
            <ul className="space-y-1">
              {navItem('generate', 'Content Generator', 'seo')}
              {navItem('history', 'Content History', 'seo')}
              {navItem('seo', 'Keywords', 'seo')}
            </ul>
          </div>

          {/* Human Services */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 px-1">HUMAN SERVICES</p>
            <ul className="space-y-1">
              {navItem('hire', 'Hire a Writer', 'human')}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 px-1">ACCOUNT</p>
            <ul className="space-y-1">
              {navItem('settings', 'Settings', 'account')}
              {isAdmin && (
                <li
                  onClick={() => router.push('/admin')}
                  className="px-3 py-2 rounded-lg cursor-pointer text-sm text-[#C9943A] hover:bg-yellow-50 border border-yellow-200/50"
                >
                  Admin Panel
                </li>
              )}
            </ul>
          </div>

        </nav>
      </div>

      {/* Bottom user block */}
      <div className="p-4 border-t border-gray-100">
        {user ? (
          <div>
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-400">Logged in as</p>
              <p className="text-sm text-gray-700 font-medium truncate">{user.email}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs bg-[#0D9488]/10 text-[#0D9488] px-2 py-0.5 rounded border border-[#0D9488]/20 font-medium">
                  {(profile?.plan || 'free').toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  {!profile?.plan || profile?.plan === 'free'
                    ? `${profile?.posts_count || 0}/3 posts`
                    : 'Unlimited'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 mb-2">Guest User</p>
            <button
              onClick={() => router.push('/auth')}
              className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-2 rounded-lg text-sm font-semibold mb-2"
            >
              Sign Up Free
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
        <p className="text-xs text-gray-300 mt-3 text-center">© Rankivo</p>
      </div>

    </div>
  )
}
