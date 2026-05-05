import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const { platform, topic, keywords, tone, audience, cta, length, language, wordCount } = await request.json()

    const keywordText = keywords && keywords.length > 0 ? `SEO keywords to include naturally: ${keywords.join(', ')}.` : ''
    const audienceText = audience ? `Target audience: ${audience}.` : ''
    const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''
    const isBlog = platform === 'Blog'

    const prompt = isBlog
      ? `You are an expert SEO blog writer. Write a blog post in ${language}.
Topic: ${topic}
Tone: ${tone}
Word count: approximately ${wordCount} words
${keywordText}
${audienceText}
${ctaText}

Respond ONLY in this exact JSON format with no extra text:
{
  "metaTitle": "SEO optimized title under 60 characters",
  "metaDescription": "SEO meta description under 160 characters",
  "titles": ["H1 option 1", "H1 option 2", "H1 option 3"],
  "content": "The full blog post content here"
}`
      : `You are an expert ${platform} content writer. Write a ${platform} post in ${language}.
Topic: ${topic}
Tone: ${tone}
Word count: approximately ${wordCount} words
${keywordText}
${audienceText}
${ctaText}

Respond ONLY in this exact JSON format with no extra text:
{
  "metaTitle": "",
  "metaDescription": "",
  "titles": [],
  "content": "The full ${platform} post content here"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    })

    const text = completion.choices[0]?.message?.content || ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return Response.json({ content: parsed })
  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: 'Generation failed' }, { status: 500 })
  }
}
