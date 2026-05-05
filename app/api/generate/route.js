import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const maxDuration = 30

export async function POST(request) {
  try {
    const { platform, topic, keywords, tone, audience, cta, length, language, wordCount } = await request.json()

    const keywordText = keywords && keywords.length > 0 ? `SEO keywords to include naturally: ${keywords.join(', ')}.` : ''
    const audienceText = audience ? `Target audience: ${audience}.` : ''
    const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''
    const isBlog = platform === 'Blog'
    const needsHashtags = platform === 'Instagram' || platform === 'TikTok'

    // Adjust word count to be realistic within token limits
    const actualWordCount = length === 'Long' ? 800 : length === 'Medium' ? 400 : 150

    const systemPrompt = `You are a professional content writer. You ALWAYS respond with ONLY a valid JSON object. Never include any text outside the JSON. Never use markdown. Never use code blocks. Only output the raw JSON object.`

    let userPrompt = ''

    if (isBlog) {
      userPrompt = `Write a detailed blog post in ${language} about: ${topic}
Tone: ${tone}
Write approximately ${actualWordCount} words. Be detailed and thorough.
${keywordText}
${audienceText}
${ctaText}

Respond with this exact JSON:
{"metaTitle":"SEO title under 60 chars","metaDescription":"SEO description under 160 chars","titles":["H1 option 1","H1 option 2","H1 option 3"],"content":"Full blog post here"}`
    } else if (needsHashtags) {
      userPrompt = `Write a ${platform} post in ${language} about: ${topic}
Tone: ${tone}
${keywordText}
${audienceText}
${ctaText}
End with 15 relevant hashtags starting with #.

Respond with this exact JSON:
{"metaTitle":"","metaDescription":"","titles":[],"content":"Full ${platform} post with hashtags at the end"}`
    } else {
      userPrompt = `Write a ${platform} post in ${language} about: ${topic}
Tone: ${tone}
${keywordText}
${audienceText}
${ctaText}

Respond with this exact JSON:
{"metaTitle":"","metaDescription":"","titles":[],"content":"Full ${platform} post here"}`
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2500,
    })

    let text = completion.choices[0]?.message?.content || ''
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    text = text.replace(/[\x00-\x1F\x7F]/g, (char) => {
      if (char === '\n') return '\\n'
      if (char === '\r') return '\\r'
      if (char === '\t') return '\\t'
      return ''
    })

    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found in response')
    text = text.substring(jsonStart, jsonEnd + 1)

    const parsed = JSON.parse(text)
    if (parsed.content) {
      parsed.content = parsed.content.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    }

    return Response.json({ content: parsed })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
