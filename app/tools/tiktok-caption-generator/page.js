import PlatformGeneratorPage from '../PlatformGeneratorPage'

export const metadata = {
  title: 'Free TikTok Caption Generator AI | Rankivo',
  description: 'Generate viral TikTok captions with hooks, hashtags and CTAs using AI. Get 4 unique variations free.',
}

export default function TikTokCaptionGenerator() {
  return (
    <PlatformGeneratorPage config={{
      platform:    'TikTok',
      slug:        'tiktok-caption-generator',
      title:       'TikTok Caption Generator',
      subtitle:    'Generate 4 viral TikTok captions with hooks, hashtags and CTAs — powered by AI.',
      badge:       'AI TikTok Generator',
      icon:        '🎵',
      placeholder: 'e.g. 5 morning habits that changed my life',
      tips: [
        'The first line is everything on TikTok — make it impossible to scroll past.',
        'Keep captions short and punchy — TikTok audiences have short attention spans.',
        'Use trending hashtags alongside niche ones for maximum reach.',
        'Add a "Part 2?" or "Save this" CTA to boost engagement signals.',
        'Match your caption energy to your video tone — high energy or calm and informative.',
      ],
      faqs: [
        { q: 'How does the TikTok caption generator work?', a: 'Enter your topic, choose a tone, and our AI generates 4 caption variations optimized for TikTok engagement.' },
        { q: 'Can I add my link to TikTok captions?', a: 'Yes. Add your link and it will appear naturally in the caption — great for driving traffic to your bio link.' },
        { q: 'Are TikTok captions important for views?', a: 'Yes — captions with strong hooks and relevant hashtags help TikTok\'s algorithm surface your content to the right audience.' },
        { q: 'Is this tool free?', a: 'Preview one caption free. Sign up for free to unlock all 4 variations.' },
      ],
    }} />
  )
}
