import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const AUTHORS = {
  'alex-carter': {
    name: 'Alex Carter',
    title: 'SEO Strategist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexCarter&backgroundColor=b6e3f4',
  },
  'sarah-malik': {
    name: 'Sarah Malik',
    title: 'Content & Keyword Expert',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahMalik&backgroundColor=ffd5dc',
  },
  'james-wu': {
    name: 'James Wu',
    title: 'AI & Content Automation',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesWu&backgroundColor=c0aede',
  },
}

const TRENDING_THRESHOLD = 100

async function getPosts() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, created_at, published, featured_image, author_id, views')
      .eq('published', true)
      .order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Blog — RANKIVO',
  description: 'Tips, guides and insights on AI content creation and SEO from the RANKIVO team.',
}

export const revalidate = 60

export default async function Blog() {
  const posts = await getPosts()
  const [hero, ...rest] = posts

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-block bg-[#1B5FA8]/10 text-[#1B5FA8] text-sm px-4 py-2 rounded-full font-medium mb-4">Blog</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Content & SEO Insights</h1>
            <p className="text-gray-500 text-lg">Tips, guides and strategies from the RANKIVO team.</p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">✍</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Blog Coming Soon</h2>
              <p className="text-gray-500">We're working on great content for you. Check back soon.</p>
            </div>
          ) : (
            <>
              {/* ── Hero post (latest) ── */}
              {hero && (
                <Link
                  href={`/blog/${hero.slug}`}
                  className="group block mb-12 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#1B5FA8]/30 transition-all duration-300"
                >
                  <div className="md:flex">
                    <div className="md:w-1/2 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-[#1B5FA8]/10 to-[#0D9488]/10 relative">
                      {hero.featured_image ? (
                        <img
                          src={hero.featured_image}
                          alt={hero.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center min-h-[260px]">
                          <span className="text-6xl text-[#1B5FA8]/20">✦</span>
                        </div>
                      )}
                      {/* Latest badge */}
                      <span className="absolute top-4 left-4 bg-[#1B5FA8] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Latest
                      </span>
                      {(hero.views || 0) >= TRENDING_THRESHOLD && (
                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                          🔥 Trending
                        </span>
                      )}
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                      <p className="text-xs text-gray-400 mb-3">
                        {new Date(hero.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#1B5FA8] transition-colors leading-snug">
                        {hero.title}
                      </h2>
                      {hero.excerpt && (
                        <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">{hero.excerpt}</p>
                      )}
                      {/* Author */}
                      {hero.author_id && AUTHORS[hero.author_id] && (
                        <div className="flex items-center gap-3 mb-6">
                          <img
                            src={AUTHORS[hero.author_id].avatar}
                            alt={AUTHORS[hero.author_id].name}
                            className="w-9 h-9 rounded-full bg-gray-100"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{AUTHORS[hero.author_id].name}</p>
                            <p className="text-xs text-gray-400">{AUTHORS[hero.author_id].title}</p>
                          </div>
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-[#1B5FA8] font-semibold text-sm group-hover:gap-2.5 transition-all">
                        Read article
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* ── Rest of posts grid ── */}
              {rest.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-gray-700 mb-6">More Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map(post => {
                      const author = AUTHORS[post.author_id]
                      const isTrending = (post.views || 0) >= TRENDING_THRESHOLD
                      return (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#1B5FA8]/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                        >
                          {/* Image */}
                          <div className="h-44 overflow-hidden bg-gradient-to-br from-[#1B5FA8]/10 to-[#0D9488]/10 relative shrink-0">
                            {post.featured_image ? (
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl text-[#1B5FA8]/20">✦</span>
                              </div>
                            )}
                            {isTrending && (
                              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                                🔥 Trending
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5 flex flex-col flex-1">
                            <p className="text-xs text-gray-400 mb-2">
                              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <h2 className="font-bold text-gray-900 mb-2 group-hover:text-[#1B5FA8] transition-colors leading-snug line-clamp-2">
                              {post.title}
                            </h2>
                            {post.excerpt && (
                              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                            )}

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                              {/* Author */}
                              {author ? (
                                <div className="flex items-center gap-2">
                                  <img src={author.avatar} alt={author.name} className="w-7 h-7 rounded-full bg-gray-100" />
                                  <p className="text-xs font-medium text-gray-600">{author.name}</p>
                                </div>
                              ) : <div />}
                              <span className="text-xs text-[#0D9488] font-semibold group-hover:underline flex items-center gap-1">
                                Read more
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
