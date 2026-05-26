import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import AdminEditButton from './AdminEditButton'

const AUTHORS = {
  'alex-carter': {
    name: 'Alex Carter',
    title: 'SEO Strategist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexCarter&backgroundColor=b6e3f4',
    bio: 'Alex has spent 8+ years helping brands dominate search rankings. Specializes in technical SEO, keyword strategy, and content systems that drive compounding organic traffic.',
    social: 'https://twitter.com',
  },
  'sarah-malik': {
    name: 'Sarah Malik',
    title: 'Content & Keyword Expert',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahMalik&backgroundColor=ffd5dc',
    bio: 'Sarah blends data-driven keyword research with compelling storytelling. She helps SaaS brands build topical authority through content that ranks and converts.',
    social: 'https://twitter.com',
  },
  'james-wu': {
    name: 'James Wu',
    title: 'AI & Content Automation',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesWu&backgroundColor=c0aede',
    bio: 'James explores the intersection of AI and content marketing. He writes about using tools like RANKIVO to produce high-quality, SEO-optimized content at scale.',
    social: 'https://twitter.com',
  },
}

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

async function incrementViews(id) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // use service role to bypass RLS
    )
    await supabase.rpc('increment_blog_views', { post_id: id })
  } catch {
    // silently fail — views are non-critical
  }
}

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found — RANKIVO' }
  return {
    title: post.meta_title || `${post.title} — RANKIVO`,
    description: post.meta_description || post.excerpt || '',
  }
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  // Increment view count in background (non-blocking)
  incrementViews(post.id)

  const author = AUTHORS[post.author_id] || null

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
            {post.excerpt && <p className="text-lg text-gray-500 mb-5">{post.excerpt}</p>}

            {/* Author + date row */}
            {author && (
              <div className="flex items-center gap-3">
                <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full bg-gray-100" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{author.name}</p>
                  <p className="text-xs text-gray-400">
                    {author.title} · {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {!author && (
              <p className="text-sm text-gray-400">
                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-[#1B5FA8]/30 via-[#0D9488]/30 to-transparent mb-8" />

          {/* Featured image */}
          {post.featured_image && (
            <div className="rounded-xl overflow-hidden mb-8 aspect-video">
              <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Post content */}
          <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-a:text-[#1B5FA8] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-600"
            style={{ lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Divider */}
          <div className="h-px bg-gray-200 mt-12 mb-8" />

          {/* ── Author card ── */}
          {author && (
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 mb-8 flex gap-5 items-start">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-16 h-16 rounded-full bg-gray-100 shrink-0 border-2 border-white shadow-md"
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#0D9488] uppercase tracking-wide mb-1">Written by</p>
                <p className="text-lg font-bold text-gray-900 mb-0.5">{author.name}</p>
                <p className="text-sm text-[#1B5FA8] font-medium mb-3">{author.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{author.bio}</p>
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          <div className="bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5 rounded-2xl p-8 text-center border border-gray-200 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to create content like this?</h3>
            <p className="text-gray-500 mb-5 text-sm">Use RANKIVO to generate SEO-optimized content in seconds. Start free today.</p>
            <Link href="/auth?mode=signup" className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-block">
              Start Free — No Credit Card
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/blog" className="text-[#0D9488] hover:underline text-sm">← Back to Blog</Link>
          </div>

          {/* ── Admin-only edit button (client component) ── */}
          <AdminEditButton postId={post.id} />

        </div>
      </div>
      <Footer />
    </div>
  )
}
