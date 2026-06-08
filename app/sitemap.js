import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function sitemap() {
  const staticPages = [
    // Core
    { url: 'https://www.rankivo.co',                                          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: 'https://www.rankivo.co/about',                                    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/blog',                                     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: 'https://www.rankivo.co/contact',                                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://www.rankivo.co/faq',                                      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://www.rankivo.co/upgrade',                                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/privacy',                                  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: 'https://www.rankivo.co/terms',                                    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: 'https://www.rankivo.co/refund',                                   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    // Tools
    { url: 'https://www.rankivo.co/tools/ad-copy-generator',                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/blog-generator',                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/email-generator',                    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/instagram-caption-generator',        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/keyword-research',                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/linkedin-post-generator',            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/meta-tags-generator',                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/seo-score-checker',                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/tiktok-caption-generator',           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/x-post-generator',                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/tools/youtube-script-generator',           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    // Services
    { url: 'https://www.rankivo.co/services/content-strategy',                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/services/email-sequences',                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/services/human-writing',                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/services/product-descriptions',            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/services/seo-blog-writing',                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/services/social-media-content',            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/services/video-scripts',                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.rankivo.co/services/website-copywriting',             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  // Blog posts — fetched dynamically from Supabase
  let blogPages = []
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    if (posts?.length) {
      blogPages = posts.map(post => ({
        url: `https://www.rankivo.co/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    }
  } catch (e) {
    console.error('Sitemap: failed to fetch blog posts', e)
  }

  return [...staticPages, ...blogPages]
}
