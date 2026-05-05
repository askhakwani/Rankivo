import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const { platform, topic, keywords, tone, audience, cta, length, language, wordCount } = await request.json()

    const keywordText = keywords && keywords.length > 0 ? `SEO keywords to include naturally: ${keywords.join(', ')}.` : ''
    const audienceText = audience ? `Target audience: ${audience}.` : ''
    const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''
    const isBlog = platform === 'Blog'

    const systemPrompt = `You are a content writer. You ALWAYS respond with ONLY a valid JSON object. Never include any text outside the JSON. Never use markdown. Never use code blocks. Only output the raw JSON object.`

    const userPrompt = isBlog
      ? `Write a blog post in ${language} about: ${topic}
Tone: ${tone}, Word count: ~${wordCount} words
${keywordText} ${audienceText} ${ctaText}

Respond with this exact JSON structure:
{"metaTitle":"SEO title under 60 chars","metaDescription":"SEO description under 160 chars","titles":["H1 option 1","H1 option 2","H1 option 3"],"content":"Full blog post text here"}`
      : `Write a ${platform} post in ${language} about: ${topic}
Tone: ${tone}, Word count: ~${wordCount} words
${keywordText} ${audienceText} ${ctaText}

Respond with this exact JSON structure:
{"metaTitle":"","metaDescription":"","titles":[],"content":"Full ${platform} post text here"}`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    })

    let text = completion.choices[0]?.message?.content || ''
    
    // Remove any markdown or extra text
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    
    // Remove control characters that break JSON
    text = text.replace(/[\x00-\x1F\x7F]/g, (char) => {
      if (char === '\n') return '\\n'
      if (char === '\r') return '\\r'
      if (char === '\t') return '\\t'
      return ''
    })

    // Extract JSON object
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON found in response')
    }
    text = text.substring(jsonStart, jsonEnd + 1)

    const parsed = JSON.parse(text)
    
    // Clean up escaped newlines in content for display
    if (parsed.content) {
      parsed.content = parsed.content.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    }

    return Response.json({ content: parsed })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
