import PlatformGeneratorPage from '../PlatformGeneratorPage'

export const metadata = {
  title: 'Free LinkedIn Post Generator AI | Rankivo',
  description: 'Generate professional LinkedIn posts with AI. Get 4 unique variations with hooks, insights and CTAs — free.',
}

export default function LinkedInPostGenerator() {
  return (
    <PlatformGeneratorPage config={{
      platform:    'LinkedIn',
      title:       'LinkedIn Post Generator',
      subtitle:    'Generate 4 professional LinkedIn posts with strong hooks and CTAs — powered by AI.',
      badge:       'AI LinkedIn Generator',
      icon:        '💼',
      placeholder: 'e.g. Lessons learned from scaling a SaaS from 0 to 10k users',
      tips: [
        'Start with a bold statement or surprising fact to stop the scroll.',
        'Use short paragraphs with line breaks — dense text gets ignored on LinkedIn.',
        'End with an open question to encourage comments and boost reach.',
        'Personal stories outperform generic advice — add your own experience.',
        'Post consistently — LinkedIn rewards regular activity with wider reach.',
      ],
      faqs: [
        { q: 'What kind of posts perform best on LinkedIn?', a: 'Personal stories, industry insights, lessons learned, and opinion pieces tend to drive the most engagement.' },
        { q: 'How long should a LinkedIn post be?', a: 'Aim for 150-300 words. Enough to add value, short enough to read in under a minute.' },
        { q: 'Can I include a link in my LinkedIn post?', a: 'Yes. Add your link and it will be woven naturally into the post content.' },
        { q: 'Is this free to use?', a: 'Preview one variation free. Create a free account to unlock all 4 variations.' },
      ],
    }} />
  )
}
