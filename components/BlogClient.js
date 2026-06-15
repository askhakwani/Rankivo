'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const POSTS_PER_PAGE = 9

const AUTHORS = {
  'alex-carter': { name: 'Alex Carter', title: 'SEO Strategist', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexCarter&backgroundColor=b6e3f4' },
  'sarah-malik': { name: 'Sarah Malik', title: 'Content & Keyword Expert', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahMalik&backgroundColor=ffd5dc' },
  'james-wu':    { name: 'James Wu',    title: 'AI & Content Automation',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesWu&backgroundColor=c0aede'  },
}

const TRENDING_THRESHOLD = 100

function BlogClientInner({ posts, categories }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [page, setPage]       = useState(1)

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [search, category])

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchCat = category === 'All' || p.category === category
      const matchSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt || '').toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [posts, category, search])

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)
  const [hero, ...rest] = page === 1 && !search && category === 'All' ? posts : [null, ...paginated]
  const gridPosts = (page === 1 && !search && category === 'All') ? rest.slice(0, POSTS_PER_PAGE - 1) : paginated

  function goPage(n) { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="pt-10 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Search + Category Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1B5FA8] focus:ring-2 focus:ring-[#1B5FA8]/10 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            )}
          </div>
          {/* Category dropdown */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#1B5FA8] bg-white min-w-[180px]"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
        </div>

        {/* ── Results count when filtering ── */}
        {(search || category !== 'All') && (
          <p className="text-sm text-gray-500 mb-6">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
            {category !== 'All' && <span> in <strong className="text-[#1B5FA8]">{category}</strong></span>}
            {search && <span> matching "<strong>{search}</strong>"</span>}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No articles found</h2>
            <p className="text-gray-500 mb-4">Try a different search term or category.</p>
            <button onClick={() => { setSearch(''); setCategory('All') }} className="text-[#1B5FA8] font-semibold hover:underline text-sm">Clear filters</button>
          </div>
        ) : (
          <>
            {/* ── Hero post (only on first unfiltered page) ── */}
            {hero && (
              <Link href={`/blog/${hero.slug}`}
                className="group block mb-12 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#1B5FA8]/30 transition-all duration-300">
                <div className="md:flex">
                  <div className="md:w-1/2 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-[#1B5FA8]/10 to-[#0D9488]/10 relative">
                    {hero.featured_image ? (
                      <img src={hero.featured_image} alt={hero.title} className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[260px]">
                        <span className="text-6xl text-[#1B5FA8]/20">✦</span>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-[#1B5FA8] text-white text-xs font-semibold px-3 py-1 rounded-full">Latest</span>
                    {hero.category && (
                      <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full shadow-sm text-[#1B5FA8]">{hero.category}</span>
                    )}
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <p className="text-xs text-gray-400 mb-3">{new Date(hero.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#1B5FA8] transition-colors leading-snug">{hero.title}</h2>
                    {hero.excerpt && <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">{hero.excerpt}</p>}
                    {hero.author_id && AUTHORS[hero.author_id] && (
                      <div className="flex items-center gap-3 mb-6">
                        <img src={AUTHORS[hero.author_id].avatar} alt={AUTHORS[hero.author_id].name} className="w-9 h-9 rounded-full bg-gray-100" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{AUTHORS[hero.author_id].name}</p>
                          <p className="text-xs text-gray-400">{AUTHORS[hero.author_id].title}</p>
                        </div>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[#1B5FA8] font-semibold text-sm group-hover:gap-2.5 transition-all">
                      Read article
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Grid ── */}
            {gridPosts.length > 0 && (
              <>
                {hero && <h2 className="text-lg font-bold text-gray-700 mb-6">More Articles</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {gridPosts.map(post => {
                    const author = AUTHORS[post.author_id]
                    const isTrending = (post.views || 0) >= TRENDING_THRESHOLD
                    return (
                      <Link key={post.id} href={`/blog/${post.slug}`}
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#1B5FA8]/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                        <div className="h-44 overflow-hidden bg-gradient-to-br from-[#1B5FA8]/10 to-[#0D9488]/10 relative shrink-0">
                          {post.featured_image ? (
                            <img src={post.featured_image} alt={post.title} className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><span className="text-4xl text-[#1B5FA8]/20">✦</span></div>
                          )}
                          {isTrending && (
                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">🔥 Trending</span>
                          )}
                          {post.category && (
                            <span className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">{post.category}</span>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <p className="text-xs text-gray-400 mb-2">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          <h2 className="font-bold text-gray-900 mb-2 group-hover:text-[#1B5FA8] transition-colors leading-snug line-clamp-2">{post.title}</h2>
                          {post.excerpt && <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>}
                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                            {author ? (
                              <div className="flex items-center gap-2">
                                <img src={author.avatar} alt={author.name} className="w-7 h-7 rounded-full bg-gray-100" />
                                <p className="text-xs font-medium text-gray-600">{author.name}</p>
                              </div>
                            ) : <div />}
                            <span className="text-xs text-[#0D9488] font-semibold group-hover:underline flex items-center gap-1">
                              Read more
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                <button onClick={() => goPage(page - 1)} disabled={page === 1}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#1B5FA8] hover:text-[#1B5FA8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold">
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
                  const show = n === 1 || n === totalPages || Math.abs(n - page) <= 1
                  const isEllipsis = !show && (n === 2 || n === totalPages - 1)
                  if (isEllipsis) return <span key={n} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                  if (!show) return null
                  return (
                    <button key={n} onClick={() => goPage(n)}
                      className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-colors ${n === page ? 'bg-[#1B5FA8] text-white border-[#1B5FA8]' : 'border-gray-200 text-gray-600 hover:border-[#1B5FA8] hover:text-[#1B5FA8]'}`}>
                      {n}
                    </button>
                  )
                })}
                <button onClick={() => goPage(page + 1)} disabled={page === totalPages}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#1B5FA8] hover:text-[#1B5FA8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold">
                  ›
                </button>
              </div>
            )}

            {/* ── Mid-page tools banner ── */}
            {page === 1 && !search && category === 'All' && filtered.length >= 6 && (
              <div className="mt-16 bg-gradient-to-br from-[#1B5FA8] to-[#0D9488] rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Put These Tips Into Action</h3>
                <p className="text-white/80 mb-6 max-w-md mx-auto">Use Rankivo's free SEO tools to research keywords, generate content, and check your SEO score.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { label: 'Keyword Research', href: '/tools/keyword-research' },
                    { label: 'Blog Generator',   href: '/tools/blog-generator' },
                    { label: 'SEO Score Checker',href: '/tools/seo-score-checker' },
                    { label: 'Meta Tags',        href: '/tools/meta-tags-generator' },
                  ].map(t => (
                    <a key={t.label} href={t.href}
                      className="bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-white/20">
                      {t.label} →
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function BlogClient({ posts, categories }) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading...</div>}>
      <BlogClientInner posts={posts} categories={categories} />
    </Suspense>
  )
}
