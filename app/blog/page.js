import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import BlogClient from '../../components/BlogClient'

const CATEGORIES = ['All', 'Keyword Research', 'SEO Strategy', 'Content Writing', 'SEO Tools', 'Social Media']

async function getPosts() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, created_at, published, featured_image, author_id, views, category')
      .eq('published', true)
      .order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Blog — Content & SEO Insights | RANKIVO',
  description: 'Tips, guides and strategies on keyword research, SEO, and content writing from the RANKIVO team.',
}

export const revalidate = 60

export default async function Blog() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero Header ── */}
      <section className="pt-28 pb-12 px-6 bg-gradient-to-b from-[#1B5FA8]/5 to-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Content & SEO Insights</h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Tips, guides and strategies to help you rank higher, write better, and grow faster.
          </p>
          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Popular:</span>
            {CATEGORIES.filter(c => c !== 'All').map(cat => (
              <a key={cat} href={`/blog?category=${encodeURIComponent(cat)}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#1B5FA8]/30 text-[#1B5FA8] bg-[#1B5FA8]/5 hover:bg-[#1B5FA8]/10 transition-colors whitespace-nowrap">
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog Content (client for search/filter/pagination) ── */}
      <BlogClient posts={posts} categories={CATEGORIES} />

      <Footer />
    </div>
  )
}
