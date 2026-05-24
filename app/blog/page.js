import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

async function getPosts() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, created_at, published, featured_image')
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#1B5FA8]/10 text-[#1B5FA8] text-sm px-4 py-2 rounded-full font-medium mb-4">Blog</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Content & SEO Insights</h1>
            <p className="text-gray-500 text-lg">Tips, guides and strategies from the RANKIVO team.</p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">✍</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Blog Coming Soon</h2>
              <p className="text-gray-500">We're working on great content for you. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#1B5FA8]/40 transition-all">
                  <div className="h-40 overflow-hidden bg-gradient-to-br from-[#1B5FA8]/10 to-[#0D9488]/10">
                    {post.featured_image ? (
                      <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl text-[#1B5FA8]/30">✦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <h2 className="font-bold text-gray-900 mb-2 group-hover:text-[#1B5FA8] transition-colors leading-snug">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.excerpt}</p>}
                    <p className="text-sm text-[#0D9488] font-medium mt-3 group-hover:underline">Read more →</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
