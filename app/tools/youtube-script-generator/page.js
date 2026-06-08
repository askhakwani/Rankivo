import PlatformGeneratorPage from '../PlatformGeneratorPage'

export const metadata = {
  title: 'Free YouTube Script Generator AI | Rankivo',
  description: 'Generate full YouTube video scripts with hooks, structure and CTAs using AI. Free to preview — no signup required.',
  alternates: { canonical: 'https://www.rankivo.co/tools/youtube-script-generator' },
}


export default function YouTubeScriptGenerator() {
  return (
    <PlatformGeneratorPage config={{
      platform:    'YouTube',
      slug:        'youtube-script-generator',
      title:       'YouTube Script Generator',
      subtitle:    'Generate engaging YouTube video scripts with strong hooks, structured content and CTAs — powered by AI.',
      badge:       'AI YouTube Generator',
      icon:        '🎬',
      placeholder: 'e.g. How to build a morning routine for maximum productivity',
      tips: [
        'The first 15 seconds determine if viewers stay — make your hook impossible to ignore.',
        'Use pattern interrupts every 60-90 seconds to maintain viewer attention.',
        'Write how you speak — conversational scripts feel more authentic and engaging.',
        'Include timestamps in longer videos to improve watch time and UX.',
        'Always end with a clear CTA: like, subscribe, comment, or visit a link.',
      ],
      faqs: [
        { q: 'How long will the generated YouTube script be?', a: 'Scripts are generated to be a solid foundation — typically 400-600 words, covering hook, intro, main content and outro.' },
        { q: 'Can I include my website link in the script?', a: 'Yes — add your link and the AI will include it naturally as a verbal CTA in the script.' },
        { q: 'Is a YouTube script generator useful for beginners?', a: 'Absolutely. A script helps you stay on track, reduces filler words, and makes editing much easier.' },
        { q: 'Is this tool free?', a: 'Yes — sign up free to generate and copy full YouTube scripts.' },
      ],
humanServiceLink: '/services/human-writing',   // ← add this line
    }} />
  )
}
