import Groq from 'groq-sdk'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request) {
  try {
    const { contentType, language, topic } = await request.json()

    if (!topic) {
      return Response.json({ error: 'Topic is required' }, { status: 400 })
    }

    const prompts = {
      '📷 Instagram Caption': `Write an engaging Instagram caption for: "${topic}". Include relevant emojis, a call to action, and 10 relevant hashtags. Make it conversational and authentic.`,
      '🎵 TikTok Caption': `Write a viral TikTok caption for: "${topic}". Make it trendy, fun and include relevant hashtags and emojis. Keep it short and punchy.`,
      '💼 LinkedIn Post': `Write a professional LinkedIn post about: "${topic}". Make it insightful, add value, and end with a question to drive engagement. Professional tone.`,
      '📝 SEO Blog Post': `Write a complete SEO-optimized blog post about: "${topic}". Include: a compelling title, introduction, 5 main sections with subheadings, and conclusion. Make it informative and engaging. Around 800 words.`,
      '📧 Email Newsletter': `Write an email newsletter about: "${topic}". Include: subject line, greeting, main content, call to action, and sign-off. Make it engaging and personal.`,
      '📣 Ad Copy': `Write compelling ad copy for: "${topic}". Include: headline, subheadline, main benefits, social proof placeholder, and strong call to action. Make it conversion-focused.`,
    }

    const languageInstructions = {
      '🌍 English': 'Write in English.',
      '🇪🇸 Spanish': 'Write in Spanish.',
      '🇫🇷 French': 'Write in French.',
      '🇩🇪 German': 'Write in German.',
      '🇸🇦 Arabic': 'Write in Arabic.',
      '🇵🇰 Urdu': 'Write in Urdu.',
    }

    const prompt = `${prompts[contentType] || prompts['📷 Instagram Caption']} ${languageInstructions[language] || 'Write in English.'}`

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    })

    return Response.json({
      content: completion.choices[0].message.content,
      contentType,
      topic
    })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}