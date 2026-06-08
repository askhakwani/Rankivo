import PlatformGeneratorPage from '../PlatformGeneratorPage'

export const metadata = {
  title: 'Free AI Email Generator | Rankivo',
  description: 'Generate professional emails instantly with AI. Write cold outreach, newsletters, follow-ups and more for free.',
  alternates: { canonical: 'https://www.rankivo.co/tools/email-generator' },
}


export default function EmailGenerator() {
  return (
    <PlatformGeneratorPage config={{
      platform:    'Email',
      slug:        'email-generator',
      title:       'Email Generator',
      subtitle:    'Generate professional marketing emails with subject lines, body copy and CTAs — powered by AI.',
      badge:       'AI Email Generator',
      icon:        '📧',
      placeholder: 'e.g. Announce a new product launch to existing customers',
      tips: [
        'Subject lines determine whether your email gets opened — make them specific and curiosity-driven.',
        'Keep your email body concise — most readers skim rather than read word for word.',
        'Include one clear CTA per email — multiple CTAs dilute focus and reduce clicks.',
        'Personalize with the recipient\'s name and relevant context when possible.',
        'Test different subject lines with A/B testing to improve open rates over time.',
      ],
      faqs: [
        { q: 'What types of emails can this tool generate?', a: 'Marketing emails, product announcements, newsletters, follow-ups, cold outreach and more.' },
        { q: 'Does the generated email include a subject line?', a: 'Yes — every generated email starts with an optimized subject line.' },
        { q: 'Can I include a link in the email?', a: 'Yes — add your URL in the link field and the AI will include it as a CTA in the email body.' },
        { q: 'Is this email generator free?', a: 'Yes — sign up for a free account to generate and copy full emails.' },
      ],
    }} />
  )
}
