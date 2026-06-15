'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders',   label: '📦 Orders' },
  { id: 'users',    label: 'Users' },
  { id: 'blog',     label: 'Blog Posts' },
  { id: 'authors',  label: 'Authors' },
  { id: 'pages',    label: 'Pages / CMS' },
  { id: 'settings', label: 'Site Settings' },
]

const TRENDING_THRESHOLD = 100

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function wordCount(html) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text ? text.split(' ').length : 0
}

function compressImageFile(file, maxSizeKB = 1800, maxWidth = 1600) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      let quality = 0.85
      const tryCompress = () => {
        canvas.toBlob(blob => {
          if (blob.size <= maxSizeKB * 1024 || quality <= 0.3) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          } else { quality -= 0.1; tryCompress() }
        }, 'image/jpeg', quality)
      }
      tryCompress()
    }
    img.src = url
  })
}

function RichTextEditor({ value, onChange, placeholder = 'Write your content here...', postTitle = '' }) {
  const [EditorComponent, setEditorComponent] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [imageAlt, setImageAlt] = useState('')
  const [showHtml, setShowHtml] = useState(false)
  const [htmlSource, setHtmlSource] = useState('')
  const [bulletDropdown, setBulletDropdown] = useState(false)
  const [numberedDropdown, setNumberedDropdown] = useState(false)
  const fileInputRef = useRef(null)
  const editorInstanceRef = useRef(null)
  const supabaseRef = useRef(null)

  useEffect(() => {
    async function loadEditor() {
      const { useEditor, EditorContent } = await import('@tiptap/react')
      const { default: StarterKit } = await import('@tiptap/starter-kit')
      const { default: Underline } = await import('@tiptap/extension-underline')
      const { default: Link } = await import('@tiptap/extension-link')
      const { default: Image } = await import('@tiptap/extension-image')
      const { default: TextAlign } = await import('@tiptap/extension-text-align')

      function TipTapEditor({ value, onChange, placeholder }) {
        const editor = useEditor({
          extensions: [
            StarterKit, Underline,
            Link.configure({ openOnClick: false, HTMLAttributes: { rel: null, target: null } }),
            Image.configure({ inline: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
          ],
          content: value || '',
          onUpdate: ({ editor }) => onChange(editor.getHTML()),
          editorProps: { attributes: { class: 'min-h-[280px] px-4 py-3 text-sm text-gray-800 focus:outline-none prose prose-sm max-w-none' } }
        })
        useEffect(() => { editorInstanceRef.current = editor; return () => { editorInstanceRef.current = null } }, [editor])
        useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '', false) }, [value])
        if (!editor) return null
        return <EditorContent editor={editor} />
      }
      setEditorComponent(() => TipTapEditor)
    }
    loadEditor()
  }, [])

  const execEditor = useCallback((fn) => { if (editorInstanceRef.current) fn(editorInstanceRef.current) }, [])

  const handleLink = useCallback(() => {
    execEditor(editor => {
      const prev = editor.getAttributes('link').href
      const url = prompt('Enter URL:', prev || 'https://')
      if (url === null) return
      if (url === '') { editor.chain().focus().unsetLink().run(); return }
      editor.chain().focus().setLink({ href: url }).run()
    })
  }, [execEditor])

  const insertImage = useCallback((src, alt = '') => {
    execEditor(editor => editor.chain().focus().setImage({ src, alt }).run())
    setShowImageModal(false); setImageUrl(''); setImageAlt('')
  }, [execEditor])

  const handleImageUpload = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return }
    if (file.size > 20 * 1024 * 1024) { alert('Image is too large. Max 20MB.'); return }
    setImageUploading(true)
    try {
      const compressed = await compressImageFile(file)
      if (!supabaseRef.current) { const { createClient } = await import('../../lib/supabase'); supabaseRef.current = createClient() }
      const path = `blog/${Date.now()}.jpg`
      const { error } = await supabaseRef.current.storage.from('blog-images').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
      if (error) throw error
      const { data: { publicUrl } } = supabaseRef.current.storage.from('blog-images').getPublicUrl(path)
      const autoAlt = imageAlt || postTitle || ''
      insertImage(publicUrl, autoAlt)
    } catch (err) { alert('Upload failed: ' + err.message) }
    setImageUploading(false)
  }, [insertImage, imageAlt])

  const toggleHtml = useCallback(() => {
    if (!showHtml) { setHtmlSource(editorInstanceRef.current?.getHTML() || ''); setShowHtml(true) }
    else { execEditor(editor => editor.commands.setContent(htmlSource, false)); onChange(htmlSource); setShowHtml(false) }
  }, [showHtml, htmlSource, execEditor, onChange])

  const isActive = (type, attrs) => editorInstanceRef.current?.isActive(type, attrs) ?? false
  const Btn = ({ title, active, children, onMouseDown }) => (
    <button type="button" title={title} onMouseDown={onMouseDown}
      className={`px-2 py-1 rounded text-sm font-medium border-0 transition-colors whitespace-nowrap ${active ? 'bg-[#1B5FA8]/15 text-[#1B5FA8]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
      {children}
    </button>
  )
  const Sep = () => <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />
  const wc = wordCount(value || '')

  const bulletStyles = [
    { label: '• Disc', marker: '•' }, { label: '◦ Circle', marker: '◦' }, { label: '▪ Square', marker: '▪' },
    { label: '▸ Arrow', marker: '▸' }, { label: '👉 Pointer', marker: '👉' }, { label: '✅ Check', marker: '✅' },
    { label: '★ Star', marker: '★' }, { label: '➤ Triangle', marker: '➤' }, { label: '❌ Cross', marker: '❌' }, { label: '– Dash', marker: '–' },
  ]
  const numberedStyles = [
    { label: '1. 2. 3.', style: 'decimal' }, { label: 'i. ii. iii.', style: 'lower-roman' },
    { label: 'I. II. III.', style: 'upper-roman' }, { label: 'a. b. c.', style: 'lower-alpha' }, { label: 'A. B. C.', style: 'upper-alpha' },
  ]
  const insertCustomList = useCallback((marker) => {
    execEditor(editor => editor.chain().focus().insertContent(`<ul style="list-style:none;padding-left:1.2em"><li>${marker} </li></ul>`).run())
    setBulletDropdown(false)
  }, [execEditor])
  const insertCustomNumbered = useCallback((style) => {
    execEditor(editor => {
      editor.chain().focus().toggleOrderedList().run()
      setTimeout(() => {
        const lists = document.querySelectorAll('.ProseMirror ol')
        if (lists.length) lists[lists.length - 1].style.listStyleType = style
        onChange(editorInstanceRef.current?.getHTML() || '')
      }, 50)
    })
    setNumberedDropdown(false)
  }, [execEditor, onChange])

  return (
    <div className="border border-gray-200 rounded-lg overflow-visible focus-within:border-[#0D9488] transition-colors">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 rounded-t-lg shadow-sm">
        <Btn title="Bold" active={isActive('bold')} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().toggleBold().run()) }}><strong>B</strong></Btn>
        <Btn title="Italic" active={isActive('italic')} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().toggleItalic().run()) }}><em>I</em></Btn>
        <Btn title="Underline" active={isActive('underline')} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().toggleUnderline().run()) }}><u>U</u></Btn>
        <Btn title="Strike" active={isActive('strike')} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().toggleStrike().run()) }}><s className="text-xs">S</s></Btn>
        <Sep />
        <Btn title="H2" active={isActive('heading', { level: 2 })} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().toggleHeading({ level: 2 }).run()) }}><span className="text-xs font-bold">H2</span></Btn>
        <Btn title="H3" active={isActive('heading', { level: 3 })} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().toggleHeading({ level: 3 }).run()) }}><span className="text-xs font-bold">H3</span></Btn>
        <Btn title="Paragraph" active={isActive('paragraph')} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().setParagraph().run()) }}><span className="text-xs">P</span></Btn>
        <Sep />
        <Btn title="Left" active={isActive({ textAlign: 'left' })} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().setTextAlign('left').run()) }}><span className="text-xs">≡L</span></Btn>
        <Btn title="Center" active={isActive({ textAlign: 'center' })} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().setTextAlign('center').run()) }}><span className="text-xs">≡C</span></Btn>
        <Btn title="Right" active={isActive({ textAlign: 'right' })} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().setTextAlign('right').run()) }}><span className="text-xs">≡R</span></Btn>
        <Btn title="Justify" active={isActive({ textAlign: 'justify' })} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().setTextAlign('justify').run()) }}><span className="text-xs">≡J</span></Btn>
        <Sep />
        <div className="relative">
          <Btn title="Bullet list" active={isActive('bulletList')} onMouseDown={e => { e.preventDefault(); setBulletDropdown(v => !v); setNumberedDropdown(false) }}><span className="text-xs">• List ▾</span></Btn>
          {bulletDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 min-w-[140px]">
              <button type="button" onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().toggleBulletList().run()); setBulletDropdown(false) }} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">• Default</button>
              {bulletStyles.map(s => <button key={s.marker} type="button" onMouseDown={e => { e.preventDefault(); insertCustomList(s.marker) }} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">{s.label}</button>)}
            </div>
          )}
        </div>
        <div className="relative">
          <Btn title="Numbered list" active={isActive('orderedList')} onMouseDown={e => { e.preventDefault(); setNumberedDropdown(v => !v); setBulletDropdown(false) }}><span className="text-xs">1. List ▾</span></Btn>
          {numberedDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 min-w-[140px]">
              {numberedStyles.map(s => <button key={s.style} type="button" onMouseDown={e => { e.preventDefault(); insertCustomNumbered(s.style) }} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">{s.label}</button>)}
            </div>
          )}
        </div>
        <Sep />
        <Btn title="Blockquote" active={isActive('blockquote')} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().toggleBlockquote().run()) }}><span className="text-xs">❝ Quote</span></Btn>
        <Btn title="Link" active={isActive('link')} onMouseDown={e => { e.preventDefault(); handleLink() }}><span className="text-xs text-[#1B5FA8]">🔗 Link</span></Btn>
        <Btn title="Unlink" active={false} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().unsetLink().run()) }}><span className="text-xs text-red-400">✂ Unlink</span></Btn>
        <Btn title="Image" active={false} onMouseDown={e => { e.preventDefault(); setShowImageModal(true) }}><span className="text-xs text-[#0D9488]">🖼 Image</span></Btn>
        <Sep />
        <Btn title="Undo" active={false} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().undo().run()) }}><span className="text-xs">↩</span></Btn>
        <Btn title="Redo" active={false} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().redo().run()) }}><span className="text-xs">↪</span></Btn>
        <Sep />
        <Btn title="Clear" active={false} onMouseDown={e => { e.preventDefault(); execEditor(ed => ed.chain().focus().clearNodes().unsetAllMarks().run()) }}><span className="text-xs text-gray-400">✕ Clear</span></Btn>
        <Btn title="HTML" active={showHtml} onMouseDown={e => { e.preventDefault(); toggleHtml() }}><span className="text-xs font-mono">{showHtml ? '← Editor' : '</>'}</span></Btn>
        <span className="ml-auto text-xs text-gray-400 px-2 select-none shrink-0">{wc} {wc === 1 ? 'word' : 'words'}</span>
      </div>
      {showHtml ? (
        <textarea value={htmlSource} onChange={e => setHtmlSource(e.target.value)} className="w-full min-h-[280px] px-4 py-3 text-xs text-gray-800 focus:outline-none font-mono resize-y bg-gray-50" placeholder="Edit raw HTML..." spellCheck={false} />
      ) : (
        <div className="tiptap-wrapper">
          {EditorComponent ? <EditorComponent value={value} onChange={onChange} placeholder={placeholder} /> : <div className="min-h-[280px] px-4 py-3 text-sm text-gray-400">Loading editor...</div>}
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
      {showImageModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowImageModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-4">Insert Image</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt text (optional)</label>
              <input type="text" value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder={postTitle ? `Auto: "${postTitle}" — or type to override` : "Describe the image..."} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center mb-4 hover:border-[#0D9488]/50 cursor-pointer transition-colors" onClick={() => fileInputRef.current?.click()}>
              {imageUploading ? <p className="text-sm text-[#0D9488]">Compressing & uploading...</p> : (
                <><p className="text-sm font-medium text-gray-700">Click to upload from your computer</p><p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP</p></>
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or paste a URL</span><div className="flex-1 h-px bg-gray-200" />
            </div>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D9488] mb-4"
              onKeyDown={e => { if (e.key === 'Enter' && imageUrl) insertImage(imageUrl, imageAlt) }} />
            <div className="flex gap-2">
              <button type="button" onClick={() => imageUrl && insertImage(imageUrl, imageAlt)} disabled={!imageUrl} className="flex-1 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors">Insert from URL</button>
              <button type="button" onClick={() => setShowImageModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .tiptap-wrapper .ProseMirror { min-height: 280px; padding: 12px 16px; font-size: 0.875rem; line-height: 1.7; outline: none; }
        .tiptap-wrapper .ProseMirror p { margin: 0.4em 0; }
        .tiptap-wrapper .ProseMirror h2 { font-size: 1.3em; font-weight: 700; margin: 1em 0 0.4em; }
        .tiptap-wrapper .ProseMirror h3 { font-size: 1.1em; font-weight: 600; margin: 0.8em 0 0.3em; }
        .tiptap-wrapper .ProseMirror ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap-wrapper .ProseMirror ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap-wrapper .ProseMirror blockquote { border-left: 3px solid #0D9488; margin: 0.5em 0; padding: 0.3em 1em; color: #4b5563; background: #f0fdf9; border-radius: 0 4px 4px 0; }
        .tiptap-wrapper .ProseMirror a { color: #1B5FA8; text-decoration: underline; }
        .tiptap-wrapper .ProseMirror img { max-width: 100%; height: auto; border-radius: 6px; margin: 8px 0; }
      `}</style>
    </div>
  )
}

function ScheduleModal({ onConfirm, onClose, initialValue }) {
  const toLocalInputValue = (d) => {
    const date = new Date(d)
    const offsetMs = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
  }
  const [scheduledAt, setScheduledAt] = useState(() => initialValue ? toLocalInputValue(initialValue) : '')
  const minDate = toLocalInputValue(Date.now() + 60000)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 mb-1">Schedule Publish</h3>
        <p className="text-sm text-gray-500 mb-4">Choose when this post should go live.</p>
        <input type="datetime-local" min={minDate} value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0D9488] mb-4" />
        <div className="flex gap-2">
          <button onClick={() => scheduledAt && onConfirm(scheduledAt)} disabled={!scheduledAt}
            className="flex-1 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors">Schedule Post</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function PublishButton({ onPublish, onDraft, onSchedule, saving, isEdit }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
  return (
    <div className="relative flex" ref={ref}>
      <button onClick={onPublish} disabled={saving}
        className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-5 py-2.5 rounded-l-lg text-sm font-semibold disabled:opacity-50 transition-colors border-r border-[#1B5FA8]/40">
        {saving ? 'Saving...' : isEdit ? 'Update & Publish' : 'Publish'}
      </button>
      <button onClick={() => setOpen(v => !v)} disabled={saving}
        className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-2.5 py-2.5 rounded-r-lg text-sm disabled:opacity-50 transition-colors">
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1.5 min-w-[180px]">
          <button onClick={() => { onPublish(); setOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1B5FA8]/5 flex items-center gap-2.5">
            <span className="text-base">🚀</span>
            <div><p className="font-medium text-gray-900">Publish Now</p><p className="text-xs text-gray-400">Make it live immediately</p></div>
          </button>
          <button onClick={() => { onDraft(); setOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
            <span className="text-base">📝</span>
            <div><p className="font-medium text-gray-900">Save as Draft</p><p className="text-xs text-gray-400">Save without publishing</p></div>
          </button>
          <div className="h-px bg-gray-100 mx-2 my-1" />
          <button onClick={() => { onSchedule(); setOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
            <span className="text-base">🕐</span>
            <div><p className="font-medium text-gray-900">Schedule Publish</p><p className="text-xs text-gray-400">Set a future date & time</p></div>
          </button>
        </div>
      )}
    </div>
  )
}

function AdminPanelInner() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')
  const supabase = createClient()
  const router = useRouter()

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, free: 0, pro: 0, premium: 0 })

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [blogForm, setBlogForm] = useState({ id: null, title: '', slug: '', excerpt: '', content: '', featured_image: '', meta_title: '', meta_description: '', published: false, author_id: '', scheduled_at: null, category: '' })
  const [blogView, setBlogView] = useState('list')
  const [blogMsg, setBlogMsg] = useState('')
  const [blogSaving, setBlogSaving] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState([])
  const [bulkCategory, setBulkCategory] = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)

  const [pages, setPages] = useState([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [pageForm, setPageForm] = useState({ id: null, title: '', slug: '', content: '', meta_title: '', meta_description: '', published: true })
  const [pageView, setPageView] = useState('list')
  const [pageMsg, setPageMsg] = useState('')
  const [pageSaving, setPageSaving] = useState(false)

  const [planChanging, setPlanChanging] = useState(null)

  const [authors, setAuthors] = useState([])
  const [authorsLoading, setAuthorsLoading] = useState(false)
  const [authorView, setAuthorView] = useState('list')
  const [authorForm, setAuthorForm] = useState({ id: null, slug: '', name: '', title: '', bio: '', avatar: '' })
  const [authorMsg, setAuthorMsg] = useState('')
  const [authorSaving, setAuthorSaving] = useState(false)

  // Orders
  const [orders, setOrders]               = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderBatches, setOrderBatches]   = useState([])
  const [orderMessages, setOrderMessages] = useState([])
  const [adminReply, setAdminReply]       = useState('')
  const [sendingReply, setSendingReply]   = useState(false)
  const [statusFilter, setStatusFilter]   = useState('all')
  const [orderView, setOrderView]         = useState('list')
  const [orderSearch, setOrderSearch]     = useState('')
  const [orderSort, setOrderSort]         = useState('newest')
  const [editingOrder, setEditingOrder]   = useState(null)
  const [editingBatch, setEditingBatch]   = useState(null)
  const [addingBatch, setAddingBatch]     = useState(false)
  const [newBatchForm, setNewBatchForm]   = useState({ description: '', amount: '' })
  const [orderStats, setOrderStats]       = useState({ total: 0, pending: 0, inProgress: 0, complete: 0, revenue: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return }
      setUser(user); setLoading(false); loadOverview()
    })
  }, [])

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
    if (activeTab === 'blog') { loadPosts(); loadAuthors() }
    if (activeTab === 'pages') loadPages()
    if (activeTab === 'authors') loadAuthors()
    if (activeTab === 'orders') loadOrders()
  }, [activeTab])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || activeTab !== 'blog') return
    supabase.from('blog_posts').select('*').eq('id', editId).single().then(({ data }) => { if (data) editBlogPost(data) })
  }, [activeTab, searchParams])

  async function loadOverview() {
    const { data } = await supabase.from('profiles').select('plan')
    if (data) setStats({ total: data.length, free: data.filter(u => !u.plan || u.plan === 'free').length, pro: data.filter(u => u.plan === 'pro').length, premium: data.filter(u => u.plan === 'premium').length })
  }

  async function loadUsers() {
    setUsersLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || []); setUsersLoading(false)
  }

  async function loadPosts() {
    setPostsLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || []); setPostsLoading(false)
  }

  async function loadPages() {
    setPagesLoading(true)
    const { data } = await supabase.from('cms_pages').select('*').order('created_at', { ascending: false })
    setPages(data || []); setPagesLoading(false)
  }

  async function loadAuthors() {
    setAuthorsLoading(true)
    const { data } = await supabase.from('authors').select('*').order('created_at', { ascending: true })
    setAuthors(data || [])
    if (data && data.length > 0) setBlogForm(prev => ({ ...prev, author_id: prev.author_id || data[0].slug }))
    setAuthorsLoading(false)
  }

  async function loadOrders() {
    setOrdersLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    const all = data || []
    setOrders(all)
    setOrderStats({
      total:      all.length,
      pending:    all.filter(o => ['awaiting_brief','brief_received'].includes(o.status)).length,
      inProgress: all.filter(o => ['in_progress','review'].includes(o.status)).length,
      complete:   all.filter(o => o.status === 'complete').length,
      revenue:    all.reduce((sum, o) => sum + Number(o.paid_amount || 0), 0),
    })
    setOrdersLoading(false)
  }

  async function openOrderDetail(order) {
    setSelectedOrder(order)
    setOrderView('detail')
    const [{ data: b }, { data: m }] = await Promise.all([
      supabase.from('order_batches').select('*').eq('order_id', order.id).order('batch_number'),
      supabase.from('order_messages').select('*').eq('order_id', order.id).order('created_at'),
    ])
    setOrderBatches(b || [])
    setOrderMessages(m || [])
  }

  async function updateOrderStatus(orderId, status) {
    await supabase.from('orders').update({ status, ...(status === 'complete' ? { completed_at: new Date().toISOString() } : {}) }).eq('id', orderId)
    setSelectedOrder(prev => ({ ...prev, status }))
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  async function saveOrderEdit() {
    if (!editingOrder) return
    await supabase.from('orders').update({
      service:      editingOrder.service,
      description:  editingOrder.description,
      total_amount: editingOrder.total_amount,
    }).eq('id', editingOrder.id)
    setSelectedOrder(prev => ({ ...prev, ...editingOrder }))
    setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...o, ...editingOrder } : o))
    setEditingOrder(null)
  }

  async function deleteOrder(orderId) {
    if (!confirm('Delete this order permanently? This cannot be undone.')) return
    await supabase.from('order_messages').delete().eq('order_id', orderId)
    await supabase.from('order_batches').delete().eq('order_id', orderId)
    await supabase.from('orders').delete().eq('id', orderId)
    setOrders(prev => prev.filter(o => o.id !== orderId))
    setOrderView('list')
    setSelectedOrder(null)
    loadOrders()
  }

  async function updateBatchWorkStatus(batchId, work_status) {
    await supabase.from('order_batches').update({
      work_status,
      ...(work_status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
      ...(work_status === 'approved'  ? { approved_at:  new Date().toISOString() } : {}),
    }).eq('id', batchId)
    setOrderBatches(prev => prev.map(b => b.id === batchId ? { ...b, work_status } : b))
  }

  async function updateBatchPayment(batchId, payment_status) {
    await supabase.from('order_batches').update({
      payment_status,
      ...(payment_status === 'paid'     ? { paid_at: new Date().toISOString() } : {}),
    }).eq('id', batchId)
    const updated = orderBatches.map(b => b.id === batchId ? { ...b, payment_status } : b)
    setOrderBatches(updated)
    const paid = updated.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0)
    await supabase.from('orders').update({ paid_amount: paid }).eq('id', selectedOrder.id)
    setSelectedOrder(prev => ({ ...prev, paid_amount: paid }))
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, paid_amount: paid } : o))
  }

  async function saveBatchEdit() {
    if (!editingBatch) return
    await supabase.from('order_batches').update({
      description: editingBatch.description,
      amount:      editingBatch.amount,
    }).eq('id', editingBatch.id)
    setOrderBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...editingBatch } : b))
    setEditingBatch(null)
  }

  async function deleteBatch(batchId) {
    if (!confirm('Delete this batch?')) return
    await supabase.from('order_batches').delete().eq('id', batchId)
    setOrderBatches(prev => prev.filter(b => b.id !== batchId))
  }

  async function addDeliverableLink(batchId) {
    const url = prompt('Enter the deliverable URL (Google Drive, Dropbox, etc.):')
    if (!url) return
    await supabase.from('order_batches').update({ deliverable_url: url }).eq('id', batchId)
    setOrderBatches(prev => prev.map(b => b.id === batchId ? { ...b, deliverable_url: url } : b))
  }

  async function addAdminBatch() {
    if (!newBatchForm.description || !newBatchForm.amount) return
    const batchNum = orderBatches.length + 1
    const { data } = await supabase.from('order_batches').insert({
      order_id:       selectedOrder.id,
      batch_number:   batchNum,
      description:    newBatchForm.description,
      amount:         parseFloat(newBatchForm.amount),
      payment_status: 'unpaid',
      work_status:    'pending',
    }).select().single()
    if (data) setOrderBatches(prev => [...prev, data])
    setNewBatchForm({ description: '', amount: '' })
    setAddingBatch(false)
  }

  async function sendPaymentRequest(batch) {
    const paddleLink = prompt('Enter your Paddle payment link for this batch:')
    if (!paddleLink) return
    const msg = `💳 Payment Request — Batch ${batch.batch_number}\n\nAmount: $${batch.amount}\nFor: ${batch.description}\n\nPlease complete your payment here:\n${paddleLink}\n\nOnce payment is confirmed, we'll begin work on this batch.`
    await supabase.from('order_messages').insert({
      order_id:     selectedOrder.id,
      sender_role:  'admin',
      sender_email: user.email,
      message:      msg,
    })
    const { data: m } = await supabase.from('order_messages').select('*').eq('order_id', selectedOrder.id).order('created_at')
    setOrderMessages(m || [])
  }

  async function sendAdminReply(isInternal = false) {
    if (!adminReply.trim() || !selectedOrder) return
    setSendingReply(true)
    await supabase.from('order_messages').insert({
      order_id:     selectedOrder.id,
      sender_role:  isInternal ? 'admin_internal' : 'admin',
      sender_email: user.email,
      message:      adminReply.trim(),
    })
    setAdminReply('')
    const { data: m } = await supabase.from('order_messages').select('*').eq('order_id', selectedOrder.id).order('created_at')
    setOrderMessages(m || [])
    setSendingReply(false)
  }

  async function deleteMessage(msgId) {
    if (!confirm('Delete this message?')) return
    await supabase.from('order_messages').delete().eq('id', msgId)
    setOrderMessages(prev => prev.filter(m => m.id !== msgId))
  }

  async function changePlan(userId, plan) {
    setPlanChanging(userId)
    await supabase.from('profiles').update({ plan }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u))
    setPlanChanging(null)
  }

  async function adminAction(action, userId, label) {
    if (!confirm(`Are you sure you want to ${label}? This cannot be undone.`)) return
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, userId, requesterId: user.id }) })
    const data = await res.json()
    if (data.error) { alert('Error: ' + data.error); return }
    alert(data.message)
    if (action === 'delete_user') setUsers(prev => prev.filter(u => u.id !== userId))
    if (action === 'reset_count') setUsers(prev => prev.map(u => u.id === userId ? { ...u, posts_count: 0 } : u))
  }

  function newBlogPost() {
    const defaultAuthor = authors.length > 0 ? authors[0].slug : ''
    setBlogForm({ id: null, title: '', slug: '', excerpt: '', content: '', featured_image: '', meta_title: '', meta_description: '', published: false, author_id: defaultAuthor, scheduled_at: null })
    setBlogMsg(''); setBlogView('form')
  }

  function editBlogPost(post) {
    setBlogForm({ ...post, author_id: post.author_id || (authors[0]?.slug || ''), scheduled_at: post.scheduled_at || null })
    setBlogMsg(''); setBlogView('form')
  }

  async function saveBlogPost({ published = false, scheduled_at = null } = {}) {
    if (!blogForm.title.trim()) { setBlogMsg('Title is required.'); return }
    setBlogSaving(true); setBlogMsg('')
    const slug = blogForm.slug.trim() || slugify(blogForm.title)
    const payload = { ...blogForm, slug, meta_title: blogForm.meta_title || blogForm.title, published, scheduled_at, updated_at: new Date().toISOString() }
    let error
    if (blogForm.id) {
      const { error: e } = await supabase.from('blog_posts').update(payload).eq('id', blogForm.id); error = e
    } else {
      const { id: _id, ...payloadWithoutId } = payload
      const { error: e } = await supabase.from('blog_posts').insert({ ...payloadWithoutId, created_at: new Date().toISOString() }); error = e
    }
    if (error) { setBlogMsg('Error: ' + error.message); setBlogSaving(false); return }
    setBlogMsg(scheduled_at ? `Scheduled for ${new Date(scheduled_at).toLocaleString()}` : published ? 'Published!' : 'Saved as draft!')
    setBlogSaving(false); loadPosts()
    setTimeout(() => setBlogView('list'), 900)
  }

  async function deleteBlogPost(id) {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id); loadPosts()
  }

  async function bulkAssignCategory() {
    if (!bulkCategory || selectedPosts.length === 0) return
    setBulkSaving(true)
    await supabase.from('blog_posts').update({ category: bulkCategory }).in('id', selectedPosts)
    setSelectedPosts([])
    setBulkCategory('')
    setBulkSaving(false)
    loadPosts()
  }

  async function togglePublish(post) {
    await supabase.from('blog_posts').update({ published: !post.published, scheduled_at: null }).eq('id', post.id); loadPosts()
  }

  function newAuthor() {
    setAuthorForm({ id: null, slug: '', name: '', title: '', bio: '', avatar: '' })
    setAuthorMsg(''); setAuthorView('form')
  }

  function editAuthor(author) {
    setAuthorForm({ ...author }); setAuthorMsg(''); setAuthorView('form')
  }

  async function saveAuthor() {
    if (!authorForm.name.trim()) { setAuthorMsg('Name is required.'); return }
    setAuthorSaving(true); setAuthorMsg('')
    const slug = authorForm.slug.trim() || slugify(authorForm.name)
    const payload = { ...authorForm, slug }
    let error
    if (authorForm.id) {
      const { error: e } = await supabase.from('authors').update(payload).eq('id', authorForm.id); error = e
    } else {
      const { id: _id, ...payloadWithoutId } = payload
      const { error: e } = await supabase.from('authors').insert({ ...payloadWithoutId, created_at: new Date().toISOString() }); error = e
    }
    if (error) { setAuthorMsg('Error: ' + error.message); setAuthorSaving(false); return }
    setAuthorMsg(authorForm.id ? 'Author updated!' : 'Author created!')
    setAuthorSaving(false); loadAuthors()
    setTimeout(() => setAuthorView('list'), 800)
  }

  async function deleteAuthor(id) {
    if (!confirm('Delete this author?')) return
    await supabase.from('authors').delete().eq('id', id); loadAuthors()
  }

  function newPage() {
    setPageForm({ id: null, title: '', slug: '', content: '', meta_title: '', meta_description: '', published: true })
    setPageMsg(''); setPageView('form')
  }

  function editPage(page) { setPageForm({ ...page }); setPageMsg(''); setPageView('form') }

  async function savePage() {
    if (!pageForm.title.trim()) { setPageMsg('Title is required.'); return }
    setPageSaving(true); setPageMsg('')
    const slug = pageForm.slug.trim() || slugify(pageForm.title)
    const payload = { ...pageForm, slug, meta_title: pageForm.meta_title || pageForm.title, updated_at: new Date().toISOString() }
    let error
    if (pageForm.id) {
      const { error: e } = await supabase.from('cms_pages').update(payload).eq('id', pageForm.id); error = e
    } else {
      const { error: e } = await supabase.from('cms_pages').insert({ ...payload, created_at: new Date().toISOString() }); error = e
    }
    if (error) { setPageMsg('Error: ' + error.message); setPageSaving(false); return }
    setPageMsg(pageForm.id ? 'Page updated!' : 'Page created!')
    setPageSaving(false); loadPages()
    setTimeout(() => setPageView('list'), 800)
  }

  async function deletePage(id) {
    if (!confirm('Delete this page?')) return
    await supabase.from('cms_pages').delete().eq('id', id); loadPages()
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="text-[#1B5FA8] font-semibold">Loading Admin Panel...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-xl font-bold text-[#1B5FA8]">RANKIVO</a>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-[#C9943A] bg-[#C9943A]/10 px-3 py-1 rounded-full border border-[#C9943A]/30">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <a href="/dashboard" className="text-sm text-[#0D9488] hover:underline">Back to Dashboard</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6 sticky top-[60px] z-10 bg-gray-50 py-2 -mx-1 px-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeTab === t.id ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1B5FA8]/40'}`}>
              {t.label}
            </button>
          ))}
        </div>

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
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Blog Posts', tab: 'blog', desc: 'Create and manage blog content' },
                { label: 'Authors', tab: 'authors', desc: 'Manage blog author profiles' },
                { label: 'Pages / CMS', tab: 'pages', desc: 'Edit About, FAQ and custom pages' },
                { label: 'Users', tab: 'users', desc: 'Manage user plans and accounts' },
                { label: '📦 Orders', tab: 'orders', desc: 'Manage client orders and messages' },
              ].map(c => (
                <button key={c.tab} onClick={() => setActiveTab(c.tab)} className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-[#1B5FA8]/40 hover:shadow-sm transition-all group">
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B5FA8]">{c.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">All Users</h2>
            {usersLoading ? <div className="text-center py-10 text-gray-400">Loading users...</div> : (
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
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-800 font-medium">{u.email || <span className="text-gray-400 italic">No email</span>}</td>
                          <td className="px-4 py-3 text-gray-600">{u.full_name || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${u.plan === 'premium' ? 'bg-[#C9943A]/10 text-[#C9943A] border-[#C9943A]/30' : u.plan === 'pro' ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {(u.plan || 'free').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{u.posts_count || 0}</td>
                          <td className="px-4 py-3">
                            <select value={u.plan || 'free'} onChange={e => changePlan(u.id, e.target.value)} disabled={planChanging === u.id}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-[#0D9488] disabled:opacity-50">
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                              <option value="premium">Premium</option>
                              <option value="agency">Agency</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => adminAction('reset_count', u.id, 'reset post count')} className="text-xs px-2 py-1 rounded border border-[#0D9488]/40 text-[#0D9488] hover:bg-[#0D9488]/5 transition-colors">Reset</button>
                              <button onClick={() => adminAction('delete_posts', u.id, 'delete all posts for this user')} className="text-xs px-2 py-1 rounded border border-orange-200 text-orange-500 hover:bg-orange-50 transition-colors">Del Posts</button>
                              <button onClick={() => adminAction('delete_user', u.id, 'permanently delete this user')} className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                            </div>
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

        {activeTab === 'blog' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Blog Posts</h2>
              {blogView === 'list' && <button onClick={newBlogPost} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">+ New Post</button>}
              {blogView === 'form' && <button onClick={() => setBlogView('list')} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg">← Back to Posts</button>}
            </div>

            {blogView === 'list' && (
              postsLoading ? <div className="text-center py-10 text-gray-400">Loading posts...</div> : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {posts.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="font-semibold text-gray-700 mb-1">No blog posts yet</p>
                      <p className="text-sm text-gray-400 mb-4">Create your first post to start your blog.</p>
                      <button onClick={newBlogPost} className="bg-[#1B5FA8] text-white px-5 py-2 rounded-lg text-sm font-semibold">Create First Post</button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {/* Bulk action bar */}
                      {selectedPosts.length > 0 && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-[#1B5FA8]/5 border-b border-[#1B5FA8]/20">
                          <span className="text-sm font-semibold text-[#1B5FA8]">{selectedPosts.length} selected</span>
                          <select value={bulkCategory} onChange={e => setBulkCategory(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#1B5FA8] bg-white">
                            <option value="">— Assign category —</option>
                            <option value="Keyword Research">Keyword Research</option>
                            <option value="SEO Strategy">SEO Strategy</option>
                            <option value="Content Writing">Content Writing</option>
                            <option value="SEO Tools">SEO Tools</option>
                            <option value="Social Media">Social Media</option>
                          </select>
                          <button onClick={bulkAssignCategory} disabled={!bulkCategory || bulkSaving}
                            className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                            {bulkSaving ? 'Saving…' : 'Apply'}
                          </button>
                          <button onClick={() => setSelectedPosts([])} className="text-sm text-gray-400 hover:text-gray-600 ml-auto">Clear selection</button>
                        </div>
                      )}
                      <table className="w-full text-sm min-w-[1100px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3">
                              <input type="checkbox"
                                checked={selectedPosts.length === posts.length && posts.length > 0}
                                onChange={e => setSelectedPosts(e.target.checked ? posts.map(p => p.id) : [])}
                                className="rounded border-gray-300 text-[#1B5FA8]" />
                            </th>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium">Author</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium">Views</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium">URL</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {posts.map(post => {
                            const author = authors.find(a => a.slug === post.author_id)
                            const isTrending = (post.views || 0) >= TRENDING_THRESHOLD
                            const isScheduled = post.scheduled_at && !post.published
                            return (
                              <tr key={post.id} className="group hover:bg-gray-50/70 transition-colors">
                                <td className="px-4 py-3">
                                  <input type="checkbox"
                                    checked={selectedPosts.includes(post.id)}
                                    onChange={e => setSelectedPosts(prev => e.target.checked ? [...prev, post.id] : prev.filter(id => id !== post.id))}
                                    className="rounded border-gray-300 text-[#1B5FA8]" />
                                </td>
                                <td className="px-4 py-3 max-w-[220px] min-w-[180px]">
                                  <div className="flex items-start gap-1.5">
                                    {isTrending && <span title="Trending">🔥</span>}
                                    <p className="font-medium text-gray-900 leading-snug line-clamp-2">{post.title}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {post.category
                                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B5FA8]/10 text-[#1B5FA8] font-medium">{post.category}</span>
                                    : <span className="text-xs text-gray-300 italic">None</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {author ? (
                                    <div className="flex items-center gap-2">
                                      {author.avatar ? <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full bg-gray-100" /> : <div className="w-6 h-6 rounded-full bg-[#1B5FA8]/10 flex items-center justify-center text-[#1B5FA8] text-xs font-bold">{author.name.charAt(0)}</div>}
                                      <span className="text-gray-600 text-xs">{author.name}</span>
                                    </div>
                                  ) : <span className="text-gray-400 text-xs italic">{post.author_id || 'No author'}</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {isScheduled
                                    ? <span className="text-xs px-2 py-0.5 rounded border font-medium bg-[#C9943A]/10 text-[#C9943A] border-[#C9943A]/30">Scheduled</span>
                                    : <span className={`text-xs px-2 py-0.5 rounded border font-medium ${post.published ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{post.published ? 'Published' : 'Draft'}</span>}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                  {isScheduled ? <span className="text-[#C9943A]">🕐 {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> : new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{post.views || 0}</td>
                                <td className="px-4 py-3">
                                  {post.published
                                    ? <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B5FA8] hover:underline flex items-center gap-1 whitespace-nowrap">/blog/{post.slug} <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>
                                    : <span className="text-xs text-gray-400">/blog/{post.slug}</span>}
                                </td>
                                <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <button onClick={() => togglePublish(post)} className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${post.published ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-[#0D9488]/40 text-[#0D9488] hover:bg-[#0D9488]/5'}`}>{post.published ? 'Unpublish' : 'Publish'}</button>
                                    <button onClick={() => editBlogPost(post)} className="text-xs px-2.5 py-1 rounded-lg border border-[#1B5FA8]/40 text-[#1B5FA8] hover:bg-[#1B5FA8]/5 transition-colors font-medium">Edit</button>
                                    <button onClick={() => deleteBlogPost(post.id)} className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors font-medium">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            )}

            {blogView === 'form' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-gray-900">{blogForm.id ? 'Edit Post' : 'New Blog Post'}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" value={blogForm.title} placeholder="Post title"
                      onChange={e => setBlogForm(prev => ({ ...prev, title: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                    <input type="text" value={blogForm.slug} placeholder="post-url-slug"
                      onChange={e => setBlogForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <input type="text" value={blogForm.excerpt} placeholder="Short description shown on blog listing..."
                    onChange={e => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={blogForm.category || ''} onChange={e => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm bg-white">
                    <option value="">— Select a category —</option>
                    <option value="Keyword Research">Keyword Research</option>
                    <option value="SEO Strategy">SEO Strategy</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="SEO Tools">SEO Tools</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  {authorsLoading ? <p className="text-sm text-gray-400">Loading authors...</p> : authors.length === 0 ? (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span>⚠️</span>
                      <p className="text-sm text-amber-700">No authors found. <button type="button" onClick={() => setActiveTab('authors')} className="underline font-medium">Create one first.</button></p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {authors.map(author => (
                        <button key={author.id} type="button" onClick={() => setBlogForm(prev => ({ ...prev, author_id: author.slug }))}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${blogForm.author_id === author.slug ? 'border-[#1B5FA8] bg-[#1B5FA8]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                          {author.avatar ? <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full bg-gray-100" /> : <div className="w-8 h-8 rounded-full bg-[#1B5FA8]/10 flex items-center justify-center text-[#1B5FA8] font-bold text-sm">{author.name.charAt(0)}</div>}
                          <div className="text-left">
                            <p className={`text-sm font-semibold ${blogForm.author_id === author.slug ? 'text-[#1B5FA8]' : 'text-gray-800'}`}>{author.name}</p>
                            <p className="text-xs text-gray-400">{author.title}</p>
                          </div>
                          {blogForm.author_id === author.slug && (
                            <svg className="w-4 h-4 text-[#1B5FA8] ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                  <div className="flex gap-2">
                    <input type="url" value={blogForm.featured_image} placeholder="https://... or upload below"
                      onChange={e => setBlogForm(prev => ({ ...prev, featured_image: e.target.value }))}
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        const file = e.target.files[0]; if (!file) return
                        const compressed = await compressImageFile(file)
                        try {
                          const path = `blog/featured-${Date.now()}.jpg`
                          const { error } = await supabase.storage.from('blog-images').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
                          if (error) throw error
                          const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(path)
                          setBlogForm(prev => ({ ...prev, featured_image: publicUrl }))
                        } catch (err) { alert('Upload failed: ' + err.message) }
                      }} />
                    </label>
                  </div>
                  {blogForm.featured_image && (
                    <div className="mt-2 relative inline-block">
                      <img src={blogForm.featured_image} alt="Featured preview" className="h-24 rounded-lg object-cover border border-gray-200" />
                      <button type="button" onClick={() => setBlogForm(prev => ({ ...prev, featured_image: '' }))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <RichTextEditor value={blogForm.content} onChange={content => setBlogForm(prev => ({ ...prev, content }))} placeholder="Write your blog post content here..." postTitle={blogForm.title} />
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">SEO / Meta</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title <span className={`ml-1 ${blogForm.meta_title.length > 60 ? 'text-red-400' : 'text-gray-400'}`}>({blogForm.meta_title.length}/60)</span></label>
                      <input type="text" value={blogForm.meta_title} placeholder="SEO title (50-60 chars)"
                        onChange={e => setBlogForm(prev => ({ ...prev, meta_title: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description <span className={`ml-1 ${blogForm.meta_description.length > 160 ? 'text-red-400' : 'text-gray-400'}`}>({blogForm.meta_description.length}/160)</span></label>
                      <textarea value={blogForm.meta_description} rows={2} placeholder="SEO description (150-160 chars)"
                        onChange={e => setBlogForm(prev => ({ ...prev, meta_description: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm resize-none" />
                    </div>
                  </div>
                </div>
                {blogForm.published && (
                  <div className="flex items-center gap-2 bg-[#0D9488]/5 border border-[#0D9488]/20 rounded-lg px-4 py-2.5">
                    <span className="text-base">📅</span>
                    <label className="text-sm text-gray-600 font-medium">Published Date</label>
                    <input type="datetime-local"
                      value={blogForm.created_at ? new Date(blogForm.created_at).toISOString().slice(0, 16) : ''}
                      onChange={e => setBlogForm(prev => ({ ...prev, created_at: e.target.value ? new Date(e.target.value).toISOString() : prev.created_at }))}
                      className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                  </div>
                )}
                {blogForm.scheduled_at && (
                  <div className="flex items-center gap-2 bg-[#C9943A]/5 border border-[#C9943A]/20 rounded-lg px-4 py-2.5">
                    <span className="text-base">🕐</span>
                    <p className="text-sm text-[#C9943A] font-medium">Scheduled for {new Date(blogForm.scheduled_at).toLocaleString()}</p>
                    <button onClick={() => setBlogForm(prev => ({ ...prev, scheduled_at: null }))} className="ml-auto text-xs text-gray-400 hover:text-red-400">Remove</button>
                  </div>
                )}
                {blogMsg && <p className={`text-sm font-medium ${blogMsg.startsWith('Error') ? 'text-red-500' : 'text-[#0D9488]'}`}>{blogMsg}</p>}
                <div className="flex flex-wrap gap-3 items-center pt-1">
                  <PublishButton saving={blogSaving} isEdit={!!blogForm.id}
                    onPublish={() => saveBlogPost({ published: true })}
                    onDraft={() => saveBlogPost({ published: false })}
                    onSchedule={() => setShowScheduleModal(true)} />
                  <button onClick={() => setBlogView('list')} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                </div>
              </div>
            )}
            {showScheduleModal && <ScheduleModal initialValue={blogForm.scheduled_at} onConfirm={dt => { setShowScheduleModal(false); saveBlogPost({ published: false, scheduled_at: new Date(dt).toISOString() }) }} onClose={() => setShowScheduleModal(false)} />}
          </div>
        )}

        {activeTab === 'authors' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Authors</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage blog author profiles</p>
              </div>
              {authorView === 'list' && <button onClick={newAuthor} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">+ New Author</button>}
              {authorView === 'form' && <button onClick={() => setAuthorView('list')} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg">← Back to Authors</button>}
            </div>
            {authorView === 'list' && (
              authorsLoading ? <div className="text-center py-10 text-gray-400">Loading authors...</div> : (
                <div className="space-y-3">
                  {authors.length === 0 && (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
                      <p className="font-semibold text-gray-700 mb-1">No authors yet</p>
                      <p className="text-sm text-gray-400 mb-4">Create your first author profile.</p>
                      <button onClick={newAuthor} className="bg-[#1B5FA8] text-white px-5 py-2 rounded-lg text-sm font-semibold">Create First Author</button>
                    </div>
                  )}
                  {authors.map(author => (
                    <div key={author.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-[#1B5FA8]/30 transition-colors">
                      {author.avatar
                        ? <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full bg-gray-100 shrink-0 object-cover" />
                        : <div className="w-12 h-12 rounded-full bg-[#1B5FA8]/10 flex items-center justify-center text-[#1B5FA8] font-bold text-lg shrink-0">{author.name.charAt(0)}</div>}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{author.name}</p>
                          <span className="text-xs text-[#0D9488] bg-[#0D9488]/10 px-2 py-0.5 rounded-full">{author.title}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Slug: {author.slug}</p>
                        {author.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{author.bio}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => editAuthor(author)} className="text-xs px-3 py-1.5 rounded-lg border border-[#1B5FA8]/40 text-[#1B5FA8] hover:bg-[#1B5FA8]/5 transition-colors font-medium">Edit</button>
                        <button onClick={() => deleteAuthor(author.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors font-medium">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {authorView === 'form' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm max-w-2xl">
                <h3 className="font-bold text-gray-900">{authorForm.id ? 'Edit Author' : 'New Author'}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input type="text" value={authorForm.name} placeholder="e.g. Alex Carter"
                      onChange={e => setAuthorForm(prev => ({ ...prev, name: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated)</label>
                    <input type="text" value={authorForm.slug} placeholder="e.g. alex-carter"
                      onChange={e => setAuthorForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title / Role</label>
                  <input type="text" value={authorForm.title} placeholder="e.g. SEO Strategist"
                    onChange={e => setAuthorForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea value={authorForm.bio} rows={3} placeholder="Short author bio..."
                    onChange={e => setAuthorForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="shrink-0">
                      {authorForm.avatar
                        ? <img src={authorForm.avatar} alt="Preview" className="w-16 h-16 rounded-full border-2 border-[#1B5FA8]/20 object-cover" />
                        : <div className="w-16 h-16 rounded-full bg-[#1B5FA8]/10 border-2 border-dashed border-[#1B5FA8]/20 flex items-center justify-center text-[#1B5FA8]/40 text-2xl font-bold">
                            {authorForm.name ? authorForm.name.charAt(0).toUpperCase() : '?'}
                          </div>
                      }
                    </div>
                    <div className="flex-1 space-y-2">
                      {/* Upload button */}
                      <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 hover:border-[#1B5FA8]/40 rounded-lg px-4 py-2.5 transition-colors w-full">
                        <span className="text-base">📁</span>
                        <span className="text-sm font-medium text-gray-700">Upload from computer</span>
                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                          const file = e.target.files[0]; if (!file) return
                          const compressed = await compressImageFile(file, 200, 400)
                          try {
                            const path = `authors/${Date.now()}.jpg`
                            const { error } = await supabase.storage.from('blog-images').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
                            if (error) throw error
                            const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(path)
                            setAuthorForm(prev => ({ ...prev, avatar: publicUrl }))
                          } catch (err) { alert('Upload failed: ' + err.message) }
                        }} />
                      </label>
                      {/* Auto-generate button */}
                      <button type="button"
                        onClick={() => {
                          const seed = authorForm.name.trim() || 'Author'
                          const colors = ['b6e3f4','ffd5dc','c0aede','d1d4f9','ffdfbf']
                          const bg = colors[Math.floor(Math.random() * colors.length)]
                          setAuthorForm(prev => ({ ...prev, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}` }))
                        }}
                        className="flex items-center gap-2 bg-[#0D9488]/5 border border-[#0D9488]/30 hover:border-[#0D9488]/60 rounded-lg px-4 py-2.5 transition-colors w-full">
                        <span className="text-base">✨</span>
                        <span className="text-sm font-medium text-[#0D9488]">Auto-generate avatar</span>
                      </button>
                      {/* Manual URL input */}
                      <input type="url" value={authorForm.avatar} placeholder="Or paste image URL..."
                        onChange={e => setAuthorForm(prev => ({ ...prev, avatar: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:border-[#0D9488] text-xs" />
                      {authorForm.avatar && (
                        <button type="button" onClick={() => setAuthorForm(prev => ({ ...prev, avatar: '' }))}
                          className="text-xs text-red-400 hover:text-red-600">✕ Remove avatar</button>
                      )}
                    </div>
                  </div>
                </div>
                {authorMsg && <p className={`text-sm font-medium ${authorMsg.startsWith('Error') ? 'text-red-500' : 'text-[#0D9488]'}`}>{authorMsg}</p>}
                <div className="flex gap-3">
                  <button onClick={saveAuthor} disabled={authorSaving} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                    {authorSaving ? 'Saving...' : authorForm.id ? 'Update Author' : 'Create Author'}
                  </button>
                  <button onClick={() => setAuthorView('list')} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pages' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pages / CMS</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage About, FAQ, Contact and custom pages</p>
              </div>
              {pageView === 'list' && <button onClick={newPage} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">+ New Page</button>}
              {pageView === 'form' && <button onClick={() => setPageView('list')} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg">Back to Pages</button>}
            </div>
            {pageView === 'list' && (
              pagesLoading ? <div className="text-center py-10 text-gray-400">Loading pages...</div> : (
                <div className="space-y-3">
                  {pages.length === 0 && (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
                      <p className="font-semibold text-gray-700 mb-1">No custom pages yet</p>
                      <p className="text-sm text-gray-400 mb-4">Create pages like About, FAQ, Terms etc.</p>
                      <button onClick={newPage} className="bg-[#1B5FA8] text-white px-5 py-2 rounded-lg text-sm font-semibold">Create First Page</button>
                    </div>
                  )}
                  {pages.map(page => (
                    <div key={page.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#1B5FA8]/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{page.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${page.published ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{page.published ? 'Published' : 'Draft'}</span>
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
                    <input type="text" value={pageForm.title} placeholder="e.g. About Us"
                      onChange={e => setPageForm(prev => ({ ...prev, title: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL path)</label>
                    <input type="text" value={pageForm.slug} placeholder="about-us"
                      onChange={e => setPageForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea value={pageForm.content} rows={12} placeholder="Page content..."
                    onChange={e => setPageForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm resize-y" />
                </div>
                <div className="grid md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
                    <input type="text" value={pageForm.meta_title} placeholder="SEO title"
                      onChange={e => setPageForm(prev => ({ ...prev, meta_title: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
                    <input type="text" value={pageForm.meta_description} placeholder="SEO description"
                      onChange={e => setPageForm(prev => ({ ...prev, meta_description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pageForm.published} onChange={e => setPageForm(prev => ({ ...prev, published: e.target.checked }))} className="w-4 h-4 rounded accent-[#0D9488]" />
                  <span className="text-sm text-gray-700 font-medium">Published</span>
                </label>
                {pageMsg && <p className={`text-sm font-medium ${pageMsg.startsWith('Error') ? 'text-red-500' : 'text-[#0D9488]'}`}>{pageMsg}</p>}
                <div className="flex gap-3">
                  <button onClick={savePage} disabled={pageSaving} className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                    {pageSaving ? 'Saving...' : pageForm.id ? 'Update Page' : 'Create Page'}
                  </button>
                  <button onClick={() => setPageView('list')} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-5xl">

            {/* ── ORDER STATS ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { label: 'Total Orders',  value: orderStats.total,      color: 'text-[#1B5FA8]',  bg: 'bg-[#1B5FA8]/5 border-[#1B5FA8]/20'   },
                { label: 'Pending',       value: orderStats.pending,     color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200'         },
                { label: 'In Progress',   value: orderStats.inProgress,  color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200'         },
                { label: 'Complete',      value: orderStats.complete,    color: 'text-green-600',  bg: 'bg-green-50 border-green-200'           },
                { label: 'Total Revenue', value: `$${orderStats.revenue}`, color: 'text-[#C9943A]', bg: 'bg-[#C9943A]/5 border-[#C9943A]/20'  },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* ── ORDER LIST VIEW ── */}
            {orderView === 'list' && (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {/* Search */}
                  <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                    className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5FA8]/20 focus:border-[#1B5FA8]"
                    placeholder="Search by project ID or email…" />
                  {/* Sort */}
                  <select value={orderSort} onChange={e => setOrderSort(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white text-gray-600">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount_high">Amount High → Low</option>
                    <option value="amount_low">Amount Low → High</option>
                  </select>
                </div>

                {/* Status filters */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {['all','awaiting_brief','brief_received','in_progress','review','complete','cancelled'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        statusFilter === s ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#1B5FA8]/40'
                      }`}>
                      {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  ))}
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12 text-gray-400 text-sm">Loading orders…</div>
                ) : (() => {
                  const STATUS_CONFIG = {
                    awaiting_brief:  { label: 'Awaiting Brief', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '📋' },
                    brief_received:  { label: 'Brief Received', color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: '📨' },
                    in_progress:     { label: 'In Progress',    color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '⚡' },
                    review:          { label: 'Under Review',   color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '👀' },
                    complete:        { label: 'Complete',       color: 'bg-green-100 text-green-700 border-green-200',    icon: '✅' },
                    cancelled:       { label: 'Cancelled',      color: 'bg-red-100 text-red-700 border-red-200',          icon: '❌' },
                  }
                  const filtered = orders
                    .filter(o => statusFilter === 'all' || o.status === statusFilter)
                    .filter(o => !orderSearch || o.project_id?.toLowerCase().includes(orderSearch.toLowerCase()) || o.user_email?.toLowerCase().includes(orderSearch.toLowerCase()))
                    .sort((a, b) => {
                      if (orderSort === 'newest')      return new Date(b.created_at) - new Date(a.created_at)
                      if (orderSort === 'oldest')      return new Date(a.created_at) - new Date(b.created_at)
                      if (orderSort === 'amount_high') return Number(b.total_amount) - Number(a.total_amount)
                      if (orderSort === 'amount_low')  return Number(a.total_amount) - Number(b.total_amount)
                      return 0
                    })
                  return filtered.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="font-semibold text-gray-700 mb-1">No orders found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters or search</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filtered.map(order => {
                        const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.awaiting_brief
                        return (
                          <div key={order.id} onClick={() => openOrderDetail(order)}
                            className="bg-white border border-gray-200 hover:border-[#1B5FA8]/40 rounded-xl p-5 cursor-pointer transition-all hover:shadow-sm">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-xs font-bold text-gray-400 font-mono">{order.project_id}</span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.color}`}>{st.icon} {st.label}</span>
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">{order.service}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{order.user_email}</p>
                                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{order.description}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-gray-900">${order.total_amount}</p>
                                <p className="text-xs text-[#0D9488] font-semibold">Paid: ${order.paid_amount || 0}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </>
            )}

            {/* ── ORDER DETAIL VIEW ── */}
            {orderView === 'detail' && selectedOrder && (() => {
              const STATUS_CONFIG = {
                awaiting_brief:  { label: 'Awaiting Brief', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '📋' },
                brief_received:  { label: 'Brief Received', color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: '📨' },
                in_progress:     { label: 'In Progress',    color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '⚡' },
                review:          { label: 'Under Review',   color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '👀' },
                complete:        { label: 'Complete',       color: 'bg-green-100 text-green-700 border-green-200',    icon: '✅' },
                cancelled:       { label: 'Cancelled',      color: 'bg-red-100 text-red-700 border-red-200',          icon: '❌' },
              }
              const st = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.awaiting_brief
              return (
                <div>
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-5 flex-wrap">
                    <button onClick={() => { setOrderView('list'); setSelectedOrder(null); setEditingOrder(null); setEditingBatch(null) }}
                      className="text-gray-400 hover:text-gray-600 transition-colors mt-1">←</button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-gray-900">{selectedOrder.service}</h2>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.color}`}>{st.icon} {st.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">{selectedOrder.project_id} · {selectedOrder.user_email}</p>
                      <p className="text-xs text-gray-400">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditingOrder({ ...selectedOrder })}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-[#1B5FA8] hover:text-[#1B5FA8] transition-colors">
                        ✏️ Edit
                      </button>
                      <button onClick={() => deleteOrder(selectedOrder.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Edit order modal */}
                  {editingOrder && (
                    <div className="bg-[#1B5FA8]/5 border border-[#1B5FA8]/20 rounded-xl p-5 mb-4">
                      <p className="text-xs font-bold text-[#1B5FA8] uppercase tracking-widest mb-3">Edit Order</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Service</label>
                          <input value={editingOrder.service} onChange={e => setEditingOrder(p => ({ ...p, service: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5FA8]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <textarea value={editingOrder.description} onChange={e => setEditingOrder(p => ({ ...p, description: e.target.value }))}
                            rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5FA8] resize-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Total Amount ($)</label>
                          <input type="number" value={editingOrder.total_amount} onChange={e => setEditingOrder(p => ({ ...p, total_amount: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5FA8]" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveOrderEdit} className="px-4 py-2 bg-[#1B5FA8] text-white rounded-lg text-xs font-bold hover:bg-[#1B5FA8]/90 transition-colors">Save Changes</button>
                          <button onClick={() => setEditingOrder(null)} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold hover:border-gray-400 transition-colors">Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status updater */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => updateOrderStatus(selectedOrder.id, key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            selectedOrder.status === key ? `${cfg.color}` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}>
                          {cfg.icon} {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brief */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Client Brief</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder.description}</p>
                  </div>

                  {/* Batches */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Milestones / Batches</p>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-gray-700">Paid: ${selectedOrder.paid_amount || 0} / ${selectedOrder.total_amount}</p>
                        <button onClick={() => setAddingBatch(true)}
                          className="px-3 py-1.5 rounded-lg bg-[#1B5FA8] text-white text-xs font-bold hover:bg-[#1B5FA8]/90 transition-colors">
                          + Add Batch
                        </button>
                      </div>
                    </div>

                    {/* Add batch form */}
                    {addingBatch && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                        <p className="text-xs font-bold text-gray-500 mb-3">New Batch</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <input value={newBatchForm.description} onChange={e => setNewBatchForm(p => ({ ...p, description: e.target.value }))}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5FA8]"
                            placeholder="Batch description" />
                          <input type="number" value={newBatchForm.amount} onChange={e => setNewBatchForm(p => ({ ...p, amount: e.target.value }))}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5FA8]"
                            placeholder="Amount ($)" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={addAdminBatch} className="px-4 py-2 bg-[#1B5FA8] text-white rounded-lg text-xs font-bold hover:bg-[#1B5FA8]/90 transition-colors">Add</button>
                          <button onClick={() => { setAddingBatch(false); setNewBatchForm({ description: '', amount: '' }) }}
                            className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold hover:border-gray-400 transition-colors">Cancel</button>
                        </div>
                      </div>
                    )}

                    {orderBatches.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No batches yet</p>
                    ) : (
                      <div className="space-y-3">
                        {orderBatches.map(batch => (
                          <div key={batch.id} className="p-4 bg-gray-50 rounded-xl">
                            {editingBatch?.id === batch.id ? (
                              <div className="space-y-2 mb-3">
                                <input value={editingBatch.description} onChange={e => setEditingBatch(p => ({ ...p, description: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5FA8]" />
                                <input type="number" value={editingBatch.amount} onChange={e => setEditingBatch(p => ({ ...p, amount: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5FA8]" />
                                <div className="flex gap-2">
                                  <button onClick={saveBatchEdit} className="px-3 py-1.5 bg-[#1B5FA8] text-white rounded-lg text-xs font-bold hover:bg-[#1B5FA8]/90">Save</button>
                                  <button onClick={() => setEditingBatch(null)} className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <p className="text-xs font-bold text-gray-500 mb-0.5">Batch {batch.batch_number}</p>
                                  <p className="text-sm text-gray-700 font-medium">{batch.description}</p>
                                  {batch.deliverable_url && (
                                    <a href={batch.deliverable_url} target="_blank" rel="noreferrer"
                                      className="text-xs text-[#1B5FA8] hover:underline mt-1 inline-block truncate max-w-xs">
                                      📥 {batch.deliverable_url}
                                    </a>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-bold text-gray-900">${batch.amount}</p>
                                  <div className="flex gap-1 mt-1">
                                    <button onClick={() => setEditingBatch({ ...batch })}
                                      className="text-xs text-gray-400 hover:text-[#1B5FA8] transition-colors">✏️</button>
                                    <button onClick={() => deleteBatch(batch.id)}
                                      className="text-xs text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {/* Work status buttons */}
                              {['pending','in_progress','delivered','approved'].map(s => (
                                <button key={s} onClick={() => updateBatchWorkStatus(batch.id, s)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                    batch.work_status === s ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                  }`}>
                                  {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </button>
                              ))}
                              {/* Payment status */}
                              <button onClick={() => updateBatchPayment(batch.id, batch.payment_status === 'paid' ? 'unpaid' : batch.payment_status === 'unpaid' ? 'paid' : 'refunded')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                  batch.payment_status === 'paid'     ? 'bg-green-100 text-green-700 border-green-300' :
                                  batch.payment_status === 'refunded' ? 'bg-red-100 text-red-500 border-red-200' :
                                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                {batch.payment_status === 'paid' ? '✓ Paid' : batch.payment_status === 'refunded' ? '↩ Refunded' : 'Mark Paid'}
                              </button>
                              {/* Deliverable */}
                              <button onClick={() => addDeliverableLink(batch.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white text-gray-500 border-gray-200 hover:border-[#0D9488] hover:text-[#0D9488] transition-colors">
                                📥 {batch.deliverable_url ? 'Update Link' : 'Add Link'}
                              </button>
                              {/* Payment request */}
                              <button onClick={() => sendPaymentRequest(batch)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-[#C9943A]/10 text-[#C9943A] border-[#C9943A]/30 hover:bg-[#C9943A]/20 transition-colors">
                                💳 Request Payment
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Messages</p>
                    {orderMessages.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
                    ) : (
                      <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                        {orderMessages.map(msg => (
                          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_role !== 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`relative max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed group ${
                              msg.sender_role === 'admin_internal' ? 'bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 rounded-br-sm' :
                              msg.sender_role === 'admin'          ? 'bg-[#C9943A] text-white rounded-br-sm' :
                              'bg-gray-100 text-gray-700 rounded-bl-sm'
                            }`}>
                              {msg.sender_role === 'admin_internal' && (
                                <p className="text-[10px] font-bold text-gray-400 mb-1">🔒 Internal Note (not visible to client)</p>
                              )}
                              <p className="whitespace-pre-line">{msg.message}</p>
                              <p className={`text-[10px] mt-1 ${msg.sender_role !== 'user' ? 'text-white/60' : 'text-gray-400'} ${msg.sender_role === 'admin_internal' ? '!text-gray-400' : ''}`}>
                                {msg.sender_role === 'user' ? 'Client · ' : msg.sender_role === 'admin_internal' ? 'Internal · ' : 'You · '}
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <button onClick={() => deleteMessage(msg.id)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center">
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <textarea value={adminReply} onChange={e => setAdminReply(e.target.value)}
                        rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/20 focus:border-[#C9943A] resize-none"
                        placeholder="Type a message to client…" />
                      <div className="flex gap-2">
                        <button onClick={() => sendAdminReply(false)} disabled={sendingReply || !adminReply.trim()}
                          className="flex-1 py-2.5 bg-[#C9943A] hover:bg-[#C9943A]/90 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                          Send to Client
                        </button>
                        <button onClick={() => sendAdminReply(true)} disabled={sendingReply || !adminReply.trim()}
                          className="px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-gray-400 disabled:opacity-40 text-gray-500 rounded-xl text-sm font-semibold transition-colors"
                          title="Internal note — not visible to client">
                          🔒 Internal Note
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

                {activeTab === 'settings' && (
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Site Settings</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
              <p className="text-sm text-gray-500">Site-wide settings are managed via Supabase.</p>
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

export default function AdminPanel() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="text-[#1B5FA8] font-semibold">Loading...</div></div>}>
      <AdminPanelInner />
    </Suspense>
  )
}
