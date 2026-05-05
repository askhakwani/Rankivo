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

You MUST respond ONLY with a valid JSON object. No text before or after. No markdown. No backticks. Just pure JSON like this:
{"metaTitle":"your meta title here","metaDescription":"your meta description here","titles":["H1 option 1","H1 option 2","H1 option 3"],"content":"your full blog post here"}`
      : `You are an expert ${platform} content writer. Write a ${platform} post in ${language}.
Topic: ${topic}
Tone: ${tone}
Word count: approximately ${wordCount} words
${keywordText}
${audienceText}
${ctaText}

You MUST respond ONLY with a valid JSON object. No text before or after. No markdown. No backticks. Just pure JSON like this:
{"metaTitle":"","metaDescription":"","titles":[],"content":"your full ${platform} post here"}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    })

    const text = completion.choices[0]?.message?.content || ''
    
    // Clean the response aggressively
    let cleaned = text.trim()
    cleaned = cleaned.replace(/^```json\s*/i, '')
    cleaned = cleaned.replace(/^```\s*/i, '')
    cleaned = cleaned.replace(/\s*```$/i, '')
    cleaned = cleaned.trim()
    
    // Find JSON object in the response
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
    }

    const parsed = JSON.parse(cleaned)
    return Response.json({ content: parsed })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
