import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

async function getPost(slug) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    return data
  } catch {
    return null
  }
}

export const revalidate = 60

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Post Not Found — RANKIVO' }
  return {
    title: post.meta_title || `${post.title} — RANKIVO`,
    description: post.meta_description || post.excerpt || '',
  }
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-[#1B5FA8]">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#1B5FA8]">Blog</Link>
            <span>/</span>
            <span className="text-gray-600 truncate">{post.title}</span>
          </div>

          {/* Post header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
            {post.excerpt && <p className="text-lg text-gray-500 mb-4">{post.excerpt}</p>}
            <p className="text-sm text-gray-400">
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-[#1B5FA8]/30 via-[#0D9488]/30 to-transparent mb-8" />

          {/* Post content */}
          <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4"
            style={{ lineHeight: '1.8' }}
          >
            {post.content?.split('\n').map((para, i) => (
              para.trim() ? <p key={i} className="text-gray-600">{para}</p> : <br key={i} />
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mt-12 mb-8" />

          {/* CTA */}
          <div className="bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5 rounded-2xl p-8 text-center border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to create content like this?</h3>
            <p className="text-gray-500 mb-5 text-sm">Use RANKIVO to generate SEO-optimized content in seconds. Start free today.</p>
            <Link href="/auth?mode=signup" className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-block">
              Start Free — No Credit Card
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link href="/blog" className="text-[#0D9488] hover:underline text-sm">← Back to Blog</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
