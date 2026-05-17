import PlatformGeneratorPage from '../PlatformGeneratorPage'

export const metadata = {
  title: 'Free X (Twitter) Post Generator AI | Rankivo',
  description: 'Generate punchy X posts with hooks and CTAs using AI. Get 4 unique variations free — formerly Twitter.',
}

export default function XPostGenerator() {
  return (
    <PlatformGeneratorPage config={{
      platform:    'X',
      title:       'X Post Generator',
      subtitle:    'Generate 4 punchy X (formerly Twitter) posts with strong hooks and CTAs — powered by AI.',
      badge:       'AI X Post Generator',
      icon:        '✖️',
      placeholder: 'e.g. Why most people fail at building habits',
      tips: [
        'You have 280 characters — every word counts. Cut anything that doesn\'t add value.',
        'Strong opinions and bold takes get more replies and retweets on X.',
        'Use line breaks to make your post easier to scan.',
        'Ask a question or make a statement that invites debate.',
        'Include a link in your last line if you want to drive traffic.',
      ],
      faqs: [
        { q: 'What is X formerly known as?', a: 'X was formerly known as Twitter. It was rebranded in 2023 by Elon Musk after his acquisition of the platform.' },
        { q: 'How long can an X post be?', a: 'Standard X posts are limited to 280 characters. X Premium users can post longer content.' },
        { q: 'Can I add a link to my X post?', a: 'Yes — add your URL in the link field and it will appear naturally in the generated post.' },
        { q: 'Is this X post generator free?', a: 'Preview one variation for free. Sign up for a free account to unlock all 4 variations.' },
      ],
    }} />
  )
}
