'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

// ── Tiny Rich Text Toolbar ────────────────────────────────────────────────────
function RichEditor({ value, onChange }) {
  const editorRef = useRef(null)

  function exec(cmd, val = null) {
    editorRef.current.focus()
    document.execCommand(cmd, false, val)
    onChange(editorRef.current.innerHTML)
  }

  function handleInput() {
    onChange(editorRef.current.innerHTML)
  }

  function insertLink() {
    const url = prompt('Enter URL:')
    if (url) exec('createLink', url)
  }

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [])

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {[
          { label: 'B', cmd: 'bold', title: 'Bold', style: 'font-bold' },
          { label: 'I', cmd: 'italic', title: 'Italic', style: 'italic' },
          { label: 'U', cmd: 'underline', title: 'Underline', style: 'underline' },
        ].map(({ label, cmd, title, style }) => (
          <button key={cmd} type="button" title={title} onMouseDown={e => { e.preventDefault(); exec(cmd) }}
            className={`w-8 h-8 rounded-lg text-sm ${style} text-gray-700 hover:bg-[#1B5FA8]/10 hover:text-[#1B5FA8] transition-colors`}>
            {label}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {[
          { label: 'H1', cmd: 'formatBlock', val: 'h1' },
          { label: 'H2', cmd: 'formatBlock', val: 'h2' },
          { label: 'H3', cmd: 'formatBlock', val: 'h3' },
        ].map(({ label, cmd, val }) => (
          <button key={label} type="button" onMouseDown={e => { e.preventDefault(); exec(cmd, val) }}
            className="px-2 h-8 rounded-lg text-xs font-bold text-gray-700 hover:bg-[#1B5FA8]/10 hover:text-[#1B5FA8] transition-colors">
            {label}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" title="Bullet List" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }}
          className="w-8 h-8 rounded-lg text-sm text-gray-700 hover:bg-[#1B5FA8]/10 hover:text-[#1B5FA8] transition-colors">≡</button>
        <button type="button" title="Numbered List" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }}
          className="w-8 h-8 rounded-lg text-sm text-gray-700 hover:bg-[#1B5FA8]/10 hover:text-[#1B5FA8] transition-colors">#</button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" title="Link" onMouseDown={e => { e.preventDefault(); insertLink() }}
          className="px-2 h-8 rounded-lg text-xs text-gray-700 hover:bg-[#1B5FA8]/10 hover:text-[#1B5FA8] transition-colors">🔗 Link</button>
        <button type="button" title="Remove Link" onMouseDown={e => { e.preventDefault(); exec('unlink') }}
          className="px-2 h-8 rounded-lg text-xs text-gray-700 hover:bg-gray-200 transition-colors">Unlink</button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" title="Clear formatting" onMouseDown={e => { e.preventDefault(); exec('removeFormat') }}
          className="px-2 h-8 rounded-lg text-xs text-gray-500 hover:bg-gray-200 transition-colors">Clear</button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[320px] p-4 text-gray-700 text-sm leading-relaxed focus:outline-none prose prose-sm max-w-none"
        style={{ lineHeight: '1.8' }}
        suppressContentEditableWarning
      />
    </div>
  )
}

// ── Slug generator ────────────────────────────────────────────────────────────
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Main Admin Blog Page ──────────────────────────────────────────────────────
export default function AdminBlogPage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts]     = useState([])
  const [view, setView]       = useState('list') // 'list' | 'new' | 'edit'
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [form, setForm] = useState({
    id: null, title: '', slug: '', excerpt: '', content: '',
    meta_title: '', meta_description: '', published: false,
  })

  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setUser(session.user)
        fetchPosts()
      } else {
        router.push('/')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, published, created_at, excerpt')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  function newPost() {
    setForm({ id: null, title: '', slug: '', excerpt: '', content: '', meta_title: '', meta_description: '', published: false })
    setMsg(null)
    setView('new')
  }

  function editPost(post) {
    setForm({
      id: post.id,
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      published: post.published || false,
    })
    setMsg(null)
    setView('edit')
  }

  function handleTitleChange(e) {
    const title = e.target.value
    setForm(f => ({ ...f, title, slug: f.id ? f.slug : toSlug(title) }))
  }

  async function savePost() {
    if (!form.title.trim()) return setMsg({ type: 'error', text: 'Title is required.' })
    if (!form.slug.trim())  return setMsg({ type: 'error', text: 'Slug is required.' })
    setSaving(true)
    setMsg(null)

    const payload = {
      title:            form.title.trim(),
      slug:             form.slug.trim(),
      excerpt:          form.excerpt.trim(),
      content:          form.content,
      meta_title:       form.meta_title.trim(),
      meta_description: form.meta_description.trim(),
      published:        form.published,
      author_id:        user.id,
      updated_at:       new Date().toISOString(),
    }

    let error
    if (form.id) {
      const res = await supabase.from('blog_posts').update(payload).eq('id', form.id)
      error = res.error
    } else {
      const res = await supabase.from('blog_posts').insert({ ...payload, created_at: new Date().toISOString() })
      error = res.error
    }

    setSaving(false)
    if (error) {
      setMsg({ type: 'error', text: error.message })
    } else {
      setMsg({ type: 'success', text: form.id ? 'Post updated!' : 'Post created!' })
      fetchPosts()
      setTimeout(() => setView('list'), 1000)
    }
  }

  async function deletePost(id) {
    await supabase.from('blog_posts').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchPosts()
  }

  async function togglePublish(post) {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
    fetchPosts()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-[#1B5FA8] font-semibold">Loading...</div>
    </div>
  )

  // ── Post List ───────────────────────────────────────────────────────────────
  if (view === 'list') return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Admin</h1>
            <p className="text-gray-500 text-sm mt-1">{posts.length} posts total</p>
          </div>
          <button onClick={newPost}
            className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2">
            + New Post
          </button>
        </div>

        {/* Posts table */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">✍️</div>
            <p className="font-semibold text-gray-900 mb-1">No posts yet</p>
            <p className="text-gray-500 text-sm mb-5">Create your first blog post to get started.</p>
            <button onClick={newPost} className="bg-[#1B5FA8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              Write First Post
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">/{post.slug}</p>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => togglePublish(post)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          post.published
                            ? 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}>
                        {post.published ? '● Published' : '○ Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => editPost(post)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B5FA8] hover:bg-[#1B5FA8]/10 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(post.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete this post?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:border-gray-300 transition-colors">
                Cancel
              </button>
              <button onClick={() => deletePost(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── Post Editor ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')}
              className="text-gray-400 hover:text-gray-700 transition-colors text-sm flex items-center gap-1">
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {view === 'new' ? 'New Post' : 'Edit Post'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.published ? 'bg-[#0D9488]' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{form.published ? 'Published' : 'Draft'}</span>
            </label>
            <button onClick={savePost} disabled={saving}
              className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
            msg.type === 'success' ? 'bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {msg.text}
          </div>
        )}

        <div className="space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={handleTitleChange}
              placeholder="Your post title..."
              className="w-full text-xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none"
            />
          </div>

          {/* Slug + Excerpt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Slug *</label>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-sm">/blog/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="post-url-slug"
                  className="flex-1 text-sm text-gray-700 focus:outline-none"
                />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Short description shown on blog listing..."
                rows={2}
                className="w-full text-sm text-gray-700 focus:outline-none resize-none placeholder-gray-300"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Content</label>
            <RichEditor value={form.content} onChange={val => setForm(f => ({ ...f, content: val }))} />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">SEO Settings</label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Meta Title <span className="text-gray-300">(max 60 chars)</span></label>
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                  placeholder="SEO title for Google..."
                  maxLength={60}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1B5FA8] transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">{form.meta_title.length}/60</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Meta Description <span className="text-gray-300">(max 160 chars)</span></label>
                <textarea
                  value={form.meta_description}
                  onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                  placeholder="SEO description for Google..."
                  maxLength={160}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1B5FA8] transition-colors resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.meta_description.length}/160</p>
              </div>
            </div>
          </div>

          {/* Bottom save */}
          <div className="flex justify-end gap-3 pb-6">
            <button onClick={() => setView('list')}
              className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-gray-300 transition-colors">
              Cancel
            </button>
            <button onClick={savePost} disabled={saving}
              className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
