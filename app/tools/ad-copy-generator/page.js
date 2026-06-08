import PlatformGeneratorPage from '../PlatformGeneratorPage'

export const metadata = {
  title: 'Free AI Ad Copy Generator | Rankivo',
  description: 'Generate high-converting ad copy for Google, Facebook and Instagram ads using AI. Get 4 variations free.',
  alternates: { canonical: 'https://www.rankivo.co/tools/ad-copy-generator' },
}


export default function AdCopyGenerator() {
  return (
    <PlatformGeneratorPage config={{
      platform:    'Ads',
      slug:        'ad-copy-generator',
      title:       'Ad Copy Generator',
      subtitle:    'Generate 4 high-converting ad copy variations for Google, Facebook and Instagram — powered by AI.',
      badge:       'AI Ad Copy Generator',
      icon:        '📣',
      placeholder: 'e.g. Online course teaching freelancers how to get clients',
      tips: [
        'Lead with the biggest benefit or the most painful problem your product solves.',
        'Use numbers and specifics — "Save 3 hours a day" beats "Save time".',
        'Create urgency with words like "today", "limited", or "before it\'s gone".',
        'Match your ad copy to your landing page for higher Quality Scores and conversions.',
        'Test 3-4 variations simultaneously to find your highest-performing copy.',
      ],
      faqs: [
        { q: 'What ad platforms does this work for?', a: 'The generated copy works for Google Ads, Facebook Ads, Instagram Ads, LinkedIn Ads and more.' },
        { q: 'How many ad variations does this generate?', a: 'It generates 4 unique variations per request, each with a different angle and CTA.' },
        { q: 'Can I include a landing page link in the ad copy?', a: 'Yes — add your URL and it will be included in the CTA line of each variation.' },
        { q: 'Is this ad copy generator free?', a: 'Preview one variation free. Sign up for a free account to unlock all 4 variations.' },
      ],
    }} />
  )
}
