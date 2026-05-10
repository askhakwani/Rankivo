'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'users', label: '👥 Users' },
  { id: 'blog', label: '✍️ Blog Posts' },
  { id: 'pages', label: '📄 Pages / CMS' },
  { id: 'settings', label: '⚙️ Site Settings' },
]

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminPanel() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')
  const supabase = createClient()
  const router = useRouter()

  // Users
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, free: 0, pro: 0, premium: 0 })

  // Blog
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [blogForm, setBlogForm] = useState({ id: null, title: '', slug: '', excerpt: '', content: '', meta_title: '', meta_description: '', published: false })
  const [blogView, setBlogView] = useState('list') // list | form
  const [blogMsg, setBlogMsg] = useState('')
  const [blogSaving, setBlogSaving] = useState(false)

  // Pages CMS
  const [pages, setPages] = useState([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [pageForm, setPageForm] = useState({ id: null, title: '', slug: '', content: '', meta_title: '', meta_description: '', published: true })
  const [pageView, setPageView] = useState('list') // list | form
  const [pageMsg, setPageMsg] = useState('')
  const [pageSaving, setPageSaving] = useState(false)

  // Plan change
  const [planChanging, setPlanChanging] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return }
      setUser(user)
      setLoading(false)
      loadOverview()
    })
  }, [])

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
    if (activeTab === 'blog') loadPosts()
    if (activeTab === 'pages') loadPages()
  }, [activeTab])

  async function loadOverview() {
    const { data } = await supabase.from('profiles').select('plan')
    if (data) {
      setStats({
        total: data.length,
        free: data.filter(u => !u.plan || u.plan === 'free').length,
        pro: data.filter(u => u.plan === 'pro').length,
        premium: data.filter(u => u.plan === 'premium').length,
      })
    }
  }

  async function loadUsers() {
    setUsersLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setUsersLoading(false)
  }

  async function loadPosts() {
    setPostsLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setPostsLoading(false)
  }

  async function loadPages() {
    setPagesLoading(true)
    const { data } = await supabase.from('cms_pages').select('*').order('created_at', { ascending: false })
    setPages(data || [])
    setPagesLoading(false)
  }

  async function changePlan(userId, plan) {
    setPlanChanging(userId)
    await supabase.from('profiles').update({ plan }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u))
    setPlanChanging(null)
  }

  // Blog CRUD
  function newBlogPost() {
    setBlogForm({ id: null, title: '', slug: '', excerpt: '', content: '', meta_title: '', meta_description: '', published: false })
    setBlogMsg('')
    setBlogView('form')
  }

  function editBlogPost(post) {
    setBlogForm({ ...post })
    setBlogMsg('')
    setBlogView('form')
  }

  async function saveBlogPost() {
    if (!blogForm.title.trim()) { setBlogMsg('Title is required.'); return }
    setBlogSaving(true); setBlogMsg('')
    const slug = blogForm.slug.trim() || slugify(blogForm.title)
    const payload = { ...blogForm, slug, meta_title: blogForm.meta_title || blogForm.title, updated_at: new Date().toISOString() }
    let error
    if (blogForm.id) {
      const { error: e } = await supabase.from('blog_posts').update(payload).eq('id', blogForm.id)
      error = e
    } else {
      const { error: e } = await supabase.from('blog_posts').insert({ ...payload, created_at: new Date().toISOString() })
      error = e
    }
    if (error) { setBlogMsg('Error: ' + error.message); setBlogSaving(false); return }
    setBlogMsg(blogForm.id ? 'Post updated!' : 'Post created!')
    setBlogSaving(false)
    loadPosts()
    setTimeout(() => setBlogView('list'), 800)
  }

  async function deleteBlogPost(id) {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    loadPosts()
  }

  async function togglePublish(post) {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
    loadPosts()
  }

  // Pages CMS CRUD
  function newPage() {
    setPageForm({ id: null, title: '', slug: '', content: '', meta_title: '', meta_description: '', published: true })
    setPageMsg('')
    setPageView('form')
  }

  function editPage(page) {
    setPageForm({ ...page })
    setPageMsg('')
    setPageView('form')
  }

  async function savePage() {
    if (!pageForm.title.trim()) { setPageMsg('Title is required.'); return }
    setPageSaving(true); setPageMsg('')
    const slug = pageForm.slug.trim() || slugify(pageForm.title)
    const payload = { ...pageForm, slug, meta_title: pageForm.meta_title || pageForm.title, updated_at: new Date().toISOString() }
    let error
    if (pageForm.id) {
      const { error: e } = await supabase.from('cms_pages').update(payload).eq('id', pageForm.id)
      error = e
    } else {
      const { error: e } = await supabase.from('cms_pages').insert({ ...payload, created_at: new Date().toISOString() })
      error = e
    }
    if (error) { setPageMsg('Error: ' + error.message); setPageSaving(false); return }
    setPageMsg(pageForm.id ? 'Page updated!' : 'Page created!')
    setPageSaving(false)
    loadPages()
    setTimeout(() => setPageView('list'), 800)
  }

  async function deletePage(id) {
    if (!confirm('Delete this page?')) return
    await supabase.from('cms_pages').delete().eq('id', id)
    loadPages()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-[#1B5FA8] font-semibold">Loading Admin Panel...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-xl font-bold text-[#1B5FA8]">RANKIVO</a>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-[#C9943A] bg-[#C9943A]/10 px-3 py-1 rounded-full border border-[#C9943A]/30">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <a href="/dashboard" className="text-sm text-[#0D9488] hover:underline">← Dashboard</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeTab === t.id ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1B5FA8]/40'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.total, color: 'text-[#1B5FA8]', bg: 'bg-[#1B5FA8]/5 border-[#1B5FA8]/20' },
                { label: 'Free Plan', value: stats.free, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
                { label: 'Pro Plan', value: stats.pro, color: 'text-[#0D9488]', bg: 'bg-[#0D9488]/5 border-[#0D9488]/20' },
                { label: 'Premium Plan', value: stats.premium, color: 'text-[#C9943A]', bg: 'bg-[#C9943A]/5 border-[#C9943A]/20' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`}>
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Blog Posts', tab: 'blog', icon: '✍️', desc: 'Create and manage blog content' },
                { label: 'Pages / CMS', tab: 'pages', icon: '📄', desc: 'Edit About, FAQ and custom pages' },
                { label: 'Users', tab: 'users', icon: '👥', desc: 'Manage user plans and accounts' },
              ].map(c => (
                <button key={c.tab} onClick={() => setActiveTab(c.tab)} className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-[#1B5FA8]/40 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B5FA8]">{c.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">All Users</h2>
            {usersLoading ? (
              <div className="text-center py-10 text-gray-400">Loading users...</div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Plan</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Posts Used</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Change Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-800 font-medium">{u.email || <span className="text-gray-400 italic">No email</span>}</td>
                          <td className="px-4 py-3 text-gray-600">{u.full_name || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                              u.plan === 'premium' ? 'bg-[#C9943A]/10 text-[#C9943A] border-[#C9943A]/30' :
                              u.plan === 'pro' ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30' :
                              'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>{(u.plan || 'free').toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{u.posts_count || 0}</td>
                          <td className="px-4 py-3">
                            <select
                              value={u.plan || 'free'}
                              onChange={e => changePlan(u.id, e.target.value)}
                              disabled={planChanging === u.id}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-[#0D9488] disabled:opacity-50"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                              <option value="premium">Premium</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <div className="text-center py-10 text-gray-400">No users found.</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BLOG */}
        {activeTab === 'blog' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Blog Posts</h2>
              {blogView === 'list' && (
                <button onClick={newBlogPost} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  + New Post
                </button>
              )}
              {blogView === 'form' && (
                <button onClick={() => setBlogView('list')} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg">
                  ← Back to Posts
                </button>
              )}
            </div>

            {blogView === 'list' && (
              postsLoading ? <div className="text-center py-10 text-gray-400">Loading posts...</div> : (
                <div className="space-y-3">
                  {posts.length === 0 && (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
                      <p className="text-3xl mb-3">✍️</p>
                      <p className="font-semibold text-gray-700 mb-1">No blog posts yet</p>
                      <p className="text-sm text-gray-400 mb-4">Create your first post to start your blog.</p>
                      <button onClick={newBlogPost} className="bg-[#1B5FA8] text-white px-5 py-2 rounded-lg text-sm font-semibold">Create First Post</button>
                    </div>
                  )}
                  {posts.map(post => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#1B5FA8]/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${post.published ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">/blog/{post.slug} · {new Date(post.created_at).toLocaleDateString()}</p>
                        {post.excerpt && <p className="text-sm text-gray-500 mt-1 truncate">{post.excerpt}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => togglePublish(post)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${post.published ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-[#0D9488]/40 text-[#0D9488] hover:bg-[#0D9488]/5'}`}>
                          {post.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => editBlogPost(post)} className="text-xs px-3 py-1.5 rounded-lg border border-[#1B5FA8]/40 text-[#1B5FA8] hover:bg-[#1B5FA8]/5 transition-colors font-medium">Edit</button>
                        <button onClick={() => deleteBlogPost(post.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors font-medium">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {blogView === 'form' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-gray-900">{blogForm.id ? 'Edit Post' : 'New Blog Post'}</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text" value={blogForm.title} placeholder="Post title"
                      onChange={e => setBlogForm(prev => ({ ...prev, title: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                    <input
                      type="text" value={blogForm.slug} placeholder="post-url-slug"
                      onChange={e => setBlogForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (short description)</label>
                  <input
                    type="text" value={blogForm.excerpt} placeholder="Short description shown on blog listing..."
                    onChange={e => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={blogForm.content} rows={12} placeholder="Write your blog post content here. Each new line becomes a paragraph."
                    onChange={e => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm resize-y font-mono"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
                    <input
                      type="text" value={blogForm.meta_title} placeholder="SEO title (defaults to post title)"
                      onChange={e => setBlogForm(prev => ({ ...prev, meta_title: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
                    <input
                      type="text" value={blogForm.meta_description} placeholder="SEO description (150-160 chars)"
                      onChange={e => setBlogForm(prev => ({ ...prev, meta_description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" checked={blogForm.published}
                      onChange={e => setBlogForm(prev => ({ ...prev, published: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#0D9488]"
                    />
                    <span className="text-sm text-gray-700 font-medium">Publish immediately</span>
                  </label>
                </div>

                {blogMsg && <p className={`text-sm font-medium ${blogMsg.startsWith('Error') ? 'text-red-500' : 'text-[#0D9488]'}`}>{blogMsg}</p>}

                <div className="flex gap-3">
                  <button onClick={saveBlogPost} disabled={blogSaving} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                    {blogSaving ? 'Saving...' : (blogForm.id ? 'Update Post' : 'Create Post')}
                  </button>
                  <button onClick={() => setBlogView('list')} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGES CMS */}
        {activeTab === 'pages' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pages / CMS</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage About, FAQ, Contact and custom pages</p>
              </div>
              {pageView === 'list' && (
                <button onClick={newPage} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  + New Page
                </button>
              )}
              {pageView === 'form' && (
                <button onClick={() => setPageView('list')} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg">
                  ← Back to Pages
                </button>
              )}
            </div>

            {pageView === 'list' && (
              pagesLoading ? <div className="text-center py-10 text-gray-400">Loading pages...</div> : (
                <div className="space-y-3">
                  {pages.length === 0 && (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
                      <p className="text-3xl mb-3">📄</p>
                      <p className="font-semibold text-gray-700 mb-1">No custom pages yet</p>
                      <p className="text-sm text-gray-400 mb-4">Create custom pages like About, FAQ, Terms etc.</p>
                      <button onClick={newPage} className="bg-[#1B5FA8] text-white px-5 py-2 rounded-lg text-sm font-semibold">Create First Page</button>
                    </div>
                  )}
                  {pages.map(page => (
                    <div key={page.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#1B5FA8]/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{page.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${page.published ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {page.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">/{page.slug} · Updated {new Date(page.updated_at || page.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => editPage(page)} className="text-xs px-3 py-1.5 rounded-lg border border-[#1B5FA8]/40 text-[#1B5FA8] hover:bg-[#1B5FA8]/5 transition-colors font-medium">Edit</button>
                        <button onClick={() => deletePage(page.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors font-medium">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {pageView === 'form' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-gray-900">{pageForm.id ? 'Edit Page' : 'New Page'}</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Title *</label>
                    <input
                      type="text" value={pageForm.title} placeholder="e.g. About Us"
                      onChange={e => setPageForm(prev => ({ ...prev, title: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL path)</label>
                    <input
                      type="text" value={pageForm.slug} placeholder="about-us"
                      onChange={e => setPageForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={pageForm.content} rows={12} placeholder="Page content. Each new line becomes a paragraph."
                    onChange={e => setPageForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm resize-y"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
                    <input
                      type="text" value={pageForm.meta_title} placeholder="SEO title"
                      onChange={e => setPageForm(prev => ({ ...prev, meta_title: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
                    <input
                      type="text" value={pageForm.meta_description} placeholder="SEO description"
                      onChange={e => setPageForm(prev => ({ ...prev, meta_description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" checked={pageForm.published}
                      onChange={e => setPageForm(prev => ({ ...prev, published: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#0D9488]"
                    />
                    <span className="text-sm text-gray-700 font-medium">Published</span>
                  </label>
                </div>

                {pageMsg && <p className={`text-sm font-medium ${pageMsg.startsWith('Error') ? 'text-red-500' : 'text-[#0D9488]'}`}>{pageMsg}</p>}

                <div className="flex gap-3">
                  <button onClick={savePage} disabled={pageSaving} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                    {pageSaving ? 'Saving...' : (pageForm.id ? 'Update Page' : 'Create Page')}
                  </button>
                  <button onClick={() => setPageView('list')} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Site Settings</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
              <p className="text-sm text-gray-500">Site-wide settings will be available here. Currently managed via Supabase.</p>
              <div className="bg-[#1B5FA8]/5 border border-[#1B5FA8]/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#1B5FA8] mb-1">Admin Email</p>
                <p className="text-sm text-gray-600">{ADMIN_EMAIL}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
