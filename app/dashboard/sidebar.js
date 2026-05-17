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

  const navItem = (id, label, icon = '') => (
    <li key={id} onClick={() => setActiveTab(id)}
      className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors flex items-center gap-2 ${
        activeTab === id
          ? 'bg-[#0D9488]/10 text-[#0D9488] font-semibold border border-[#0D9488]/20'
          : 'text-gray-600 hover:bg-gray-100'
      }`}>
      {icon && <span className="text-base">{icon}</span>}
      {label}
    </li>
  )

  const toolPageItem = (href, label, icon = '') => (
    <li key={href} onClick={() => router.push(href)}
      className="px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors flex items-center gap-2 text-gray-600 hover:bg-gray-100">
      {icon && <span className="text-base">{icon}</span>}
      {label}
    </li>
  )

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">

      <div className="px-6 py-5 border-b border-gray-100 shrink-0">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold text-[#1B5FA8] tracking-tight group-hover:text-[#0D9488] transition-colors">RANKIVO</span>
        </a>
        <p className="text-xs text-gray-400 mt-0.5">AI Content & SEO Platform</p>
      </div>

      <nav className="px-4 pt-4 space-y-5 flex-1 overflow-y-auto">

        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 px-1 uppercase tracking-wider">Main</p>
          <ul className="space-y-1">
            {navItem('dashboard', 'Dashboard', '🏠')}
          </ul>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 px-1 uppercase tracking-wider">Dashboard Tools</p>
          <ul className="space-y-1">
            {navItem('generate', 'Content Generator', '✨')}
            {navItem('history', 'Content History', '📋')}
            {navItem('seo', 'Keywords', '🔍')}
          </ul>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 px-1 uppercase tracking-wider">SEO Tools</p>
          <ul className="space-y-1">
            {toolPageItem('/tools/meta-tags-generator',         'Meta Tags Generator', '🏷️')}
            {toolPageItem('/tools/seo-score-checker',           'SEO Score Checker',   '📊')}
          </ul>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 px-1 uppercase tracking-wider">Content Generators</p>
          <ul className="space-y-1">
            {toolPageItem('/tools/blog-generator',              'Blog Generator',      '✍️')}
            {toolPageItem('/tools/instagram-caption-generator', 'Instagram Captions',  '📸')}
            {toolPageItem('/tools/tiktok-caption-generator',    'TikTok Captions',     '🎵')}
            {toolPageItem('/tools/linkedin-post-generator',     'LinkedIn Posts',      '💼')}
            {toolPageItem('/tools/x-post-generator',            'X Posts',             '✖️')}
            {toolPageItem('/tools/email-generator',             'Email Generator',     '📧')}
            {toolPageItem('/tools/youtube-script-generator',    'YouTube Script',      '🎬')}
            {toolPageItem('/tools/ad-copy-generator',           'Ad Copy Generator',   '📣')}
          </ul>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 px-1 uppercase tracking-wider">Human Services</p>
          <ul className="space-y-1">
            {navItem('hire', 'Hire a Writer', '✍️')}
          </ul>
        </div>

        {isAdmin && (
          <div>
            <p className="text-xs text-[#C9943A] font-medium mb-2 px-1 uppercase tracking-wider">Admin</p>
            <ul className="space-y-1">
              <li onClick={() => router.push('/admin')}
                className="px-3 py-2 rounded-lg cursor-pointer text-sm text-[#C9943A] hover:bg-[#C9943A]/10 border border-[#C9943A]/20 flex items-center gap-2 font-medium">
                <span>🛡️</span> Admin Panel
              </li>
              <li onClick={() => router.push('/admin?tab=blog')}
                className="px-3 py-2 rounded-lg cursor-pointer text-sm text-[#C9943A] hover:bg-[#C9943A]/10 flex items-center gap-2">
                <span>✍️</span> Manage Blog
              </li>
              <li onClick={() => router.push('/admin?tab=pages')}
                className="px-3 py-2 rounded-lg cursor-pointer text-sm text-[#C9943A] hover:bg-[#C9943A]/10 flex items-center gap-2">
                <span>📄</span> Manage Pages
              </li>
            </ul>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 px-1 uppercase tracking-wider">Account</p>
          <ul className="space-y-1">
            {navItem('settings', 'Settings', '⚙️')}
          </ul>
        </div>

      </nav>

      <div className="shrink-0 border-t border-gray-100 p-4">
        {user ? (
          <div>
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-400">Logged in as</p>
              <p className="text-sm text-gray-700 font-medium truncate">{user.email}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                  profile?.plan === 'premium' ? 'bg-[#C9943A]/10 text-[#C9943A] border-[#C9943A]/30' :
                  profile?.plan === 'pro' ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20' :
                  'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {(profile?.plan || 'free').toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  {!profile?.plan || profile?.plan === 'free' ? `${profile?.posts_count || 0}/3 posts` :
                   profile?.plan === 'pro' ? `${profile?.posts_count || 0}/50 posts` : 'Unlimited'}
                </span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
              Logout
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-[#1B5FA8]/5 border border-[#1B5FA8]/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-500 mb-0.5">Guest User</p>
              <p className="text-xs text-gray-400">Sign up to save your work</p>
            </div>
            <button onClick={() => router.push('/auth')}
              className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-2 rounded-lg text-sm font-semibold mb-2 transition-colors">
              Sign Up Free
            </button>
            <button onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
              Logout
            </button>
          </div>
        )}
        <p className="text-xs text-gray-300 mt-3 text-center">© 2025 Rankivo</p>
      </div>

    </div>
  )
}
