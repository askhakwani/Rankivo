import Groq from 'groq-sdk'
import { createClient } from '../../../../lib/supabase'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const { content, keyword, metaTitle, metaDescription } = await request.json()

    if (!content || !keyword) {
      return Response.json({ error: 'Content and keyword are required.' }, { status: 400 })
    }

    // Check auth — free vs paid
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

    // Word count (server-side)
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length

    // Word count score (no penalty for under 1000 words)
    let wordCountScore = 0
    if (wordCount >= 700 && wordCount <= 900) wordCountScore = 10
    else if (wordCount >= 500)               wordCountScore = 7
    else if (wordCount >= 300)               wordCountScore = 5
    else                                     wordCountScore = 3

    // Meta tag length scores (server-side — deterministic)
    const metaTitleScore = metaTitle
      ? (metaTitle.length >= 50 && metaTitle.length <= 60 ? 10 : metaTitle.length > 0 ? 5 : 0)
      : 0
    const metaDescScore  = metaDescription
      ? (metaDescription.length >= 140 && metaDescription.length <= 160 ? 10 : metaDescription.length > 0 ? 5 : 0)
      : 0

    const prompt = `You are an expert SEO analyst. Analyze this content and return a strict JSON score breakdown.

KEYWORD: "${keyword}"
WORD COUNT: ${wordCount}
META TITLE: "${metaTitle || ''}"
META DESCRIPTION: "${metaDescription || ''}"

CONTENT:
"""
${content.slice(0, 3000)}
"""

SCORING RULES — each factor is worth exactly 10 points:
1. keywordInTitle (0, 5, or 10): Is the keyword in the first heading/title? 10=yes exact, 5=partial, 0=no
2. keywordInFirstParagraph (0, 5, or 10): Is keyword in first paragraph? 10=yes, 5=partial/related, 0=no
3. keywordInHeadings (0, 5, or 10): Does keyword appear in H2/H3 subheadings? 10=2+ times, 5=once, 0=no
4. keywordDensity (0, 5, or 10): Is keyword density 1–3%? 10=optimal, 5=slightly over/under, 0=absent or stuffed
5. readability (0, 5, or 10): Short sentences, short paragraphs (2-3 lines), simple language? 10=great, 5=ok, 0=poor
6. internalLink (0, 5, or 10): Does content contain any hyperlink or [insert link] placeholder? 10=yes, 0=no
7. structure (0, 5, or 10): Proper H1/H2/H3 hierarchy used? 10=well structured, 5=partial, 0=no headings

DO NOT score: wordCount, metaTitle, metaDescription — those are pre-calculated.

${isPaid ? `Also return full suggestions array — one specific actionable suggestion per factor that scored below 10.` : `Return only 3 suggestions maximum for the lowest-scoring factors.`}

Return ONLY valid JSON, no markdown:
{
  "scores": {
    "keywordInTitle": number,
    "keywordInFirstParagraph": number,
    "keywordInHeadings": number,
    "keywordDensity": number,
    "readability": number,
    "internalLink": number,
    "structure": number
  },
  "suggestions": [
    { "factor": "string", "issue": "string", "fix": "string" }
  ],
  "summary": "string (1 sentence overall assessment)"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 800,
    })

    let text = completion.choices[0]?.message?.content || ''
    text = text.replace(/```json|```/g, '').trim()
    const jsonStart = text.indexOf('{')
    const jsonEnd   = text.lastIndexOf('}')
    text = text.substring(jsonStart, jsonEnd + 1)

    const aiResult = JSON.parse(text)

    // Merge AI scores with server-side deterministic scores
    const scores = {
      ...aiResult.scores,
      wordCount:       wordCountScore,
      metaTitleLength: metaTitleScore,
      metaDescLength:  metaDescScore,
    }

    // Clamp all scores to 0–10, multiples of 5 only
    Object.keys(scores).forEach(k => {
      scores[k] = Math.min(10, Math.max(0, scores[k]))
    })

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)

    // Free users: cap at 3 suggestions
    const suggestions = isPaid
      ? aiResult.suggestions
      : (aiResult.suggestions || []).slice(0, 3)

    return Response.json({
      totalScore,
      scores,
      suggestions,
      summary:   aiResult.summary,
      wordCount,
      plan,
      isPaid,
    })

  } catch (error) {
    console.error('SEO score error:', error)
    return Response.json({ error: 'Scoring failed: ' + error.message }, { status: 500 })
  }
}
