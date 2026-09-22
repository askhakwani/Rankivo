import { createClient } from '../../../../lib/supabase'
import { generateWithFallback } from '../../../../lib/groq-helper'

export async function POST(request) {
  try {
    const { keyword, title, description } = await request.json()

    if (!keyword || !title) {
      return Response.json({ error: 'Keyword and title are required.' }, { status: 400 })
    }

    // Check auth — determine free vs paid
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let plan = 'free'
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      plan = profile?.plan || 'free'
    }

    const isPaid = plan === 'pro' || plan === 'premium' || plan === 'agency'

    const prompt = `You are an expert SEO meta tag writer. Generate meta tags for the following page.

Keyword: ${keyword}
Page Title: ${title}
${description ? `Description hint: ${description}` : ''}

Rules:
- SEO Title: 50–60 characters, naturally includes the keyword, compelling and clickable
- Meta Description: 140–160 characters, includes keyword, has a clear benefit and soft CTA
${isPaid ? `- Also generate: 3 title variations (A/B test options, each 50–60 chars)
- OG Title: for social sharing (max 60 chars)
- OG Description: for social sharing (max 160 chars)
- Twitter Title: punchy, max 60 chars
- Twitter Description: max 160 chars` : ''}

Return ONLY valid JSON, no markdown, no explanation:
{
  "seoTitle": "string",
  "metaDescription": "string",
  "seoTitleLength": number,
  "metaDescriptionLength": number${isPaid ? `,
  "titleVariations": ["string", "string", "string"],
  "ogTitle": "string",
  "ogDescription": "string",
  "twitterTitle": "string",
  "twitterDescription": "string"` : ''}
}`

    const completion = await generateWithFallback({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    let text = completion.choices[0]?.message?.content || ''
    text = text.replace(/```json|```/g, '').trim()
    const jsonStart = text.indexOf('{')
    const jsonEnd   = text.lastIndexOf('}')
    text = text.substring(jsonStart, jsonEnd + 1)

    let result
    try {
      result = JSON.parse(text)
    } catch (parseError) {
      console.error('Meta tags JSON parse failed. Raw text:', text)
      return Response.json(
        { error: 'Generation failed: the AI response was incomplete. Please try again.' },
        { status: 500 }
      )
    }

    // Always recalculate lengths server-side — don't trust AI counts
    result.seoTitleLength          = result.seoTitle?.length          || 0
    result.metaDescriptionLength   = result.metaDescription?.length   || 0

    return Response.json({ result, plan, isPaid })

  } catch (error) {
    console.error('Meta tags error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
