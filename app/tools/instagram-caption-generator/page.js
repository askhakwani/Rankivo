import PlatformGeneratorPage from '../PlatformGeneratorPage'

export const metadata = {
  title: 'Free Instagram Caption Generator AI | Rankivo',
  description: 'Generate 4 unique Instagram captions instantly with AI. Include hashtags, CTAs and links. Free to use — no signup required to preview.',
}

export default function InstagramCaptionGenerator() {
  return (
    <PlatformGeneratorPage config={{
      platform:    'Instagram',
      slug:        'instagram-caption-generator',
      title:       'Instagram Caption Generator',
      subtitle:    'Generate 4 unique, scroll-stopping Instagram captions with hashtags and CTAs — powered by AI.',
      badge:       'AI Instagram Generator',
      icon:        '📸',
      placeholder: 'e.g. New product launch for eco-friendly water bottles',
      tips: [
        'Use a strong hook in the first line — Instagram cuts off captions after 2-3 lines.',
        'Add 5-10 relevant hashtags to improve discoverability.',
        'Include a clear CTA like "Link in bio" or "Shop now" to drive traffic.',
        'Emojis increase engagement — use 3-5 per caption strategically.',
        'Test multiple variations to see which resonates best with your audience.',
      ],
      faqs: [
        { q: 'How many captions does this tool generate?', a: 'It generates 4 unique variations per request, each with a different hook, tone, and hashtag set.' },
        { q: 'Can I include my website link in the caption?', a: 'Yes — add your link in the optional link field and it will be included naturally in the generated captions.' },
        { q: 'Is this Instagram caption generator free?', a: 'Yes, you can preview one caption for free. Sign up for a free account to unlock all 4 variations.' },
        { q: 'What makes a good Instagram caption?', a: 'A strong hook, relevant emojis, a clear CTA, and targeted hashtags. This tool handles all of that automatically.' },
      ],
    }} />
  )
}
