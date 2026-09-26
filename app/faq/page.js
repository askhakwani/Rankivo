import FaqClient from './FaqClient'

export const metadata = {
  title: 'Frequently Asked Questions — RANKIVO',
  description: 'Answers to common questions about RANKIVO — pricing, plans, supported platforms, languages, security, refunds and more.',
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQ() {
  return <FaqClient />
}
