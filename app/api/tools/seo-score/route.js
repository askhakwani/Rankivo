// app/api/tools/seo-score/route.js
// UPDATED VERSION (scoring fix):
//  - "Keyword in First Paragraph" and "Internal Link" are now calculated by code (reliable),
//    not guessed by the AI
//  - the AI now sees up to 8000 characters (was 3000) and is told how headings and links are marked
//  - everything else (plans, meta scores, word-count score, model) is unchanged

import { createClient } from '../../../../lib/supabase'
import { generateWithFallback } from '../../../../lib/groq-helper'

// ── helpers ──────────────────────────────────────────────────────────────
const norm = s =>
  s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()

const stem = w => (w.length > 4 ? w.slice(0, 4) : w)

// 10 = exact keyword phrase present, 5 = nearly all keyword words present (any form), 0 = no
function keywordMatchScore(text, keyword) {
  const t = norm(text)
  const k = norm(keyword)
  if (!t || !k) return 0
  if (t.includes(k)) return 10
  const textStems = new Set(t.split(' ').map(stem))
  const keyStems = k.split(' ').filter(w => w.length > 2).map(stem)
  if (!keyStems.length) return 0
  const hits = keyStems.filter(s => textStems.has(s)).length
  return hits / keyStems.length >= 0.75 ? 5 : 0
}

// First real paragraph = first non-heading line with 12+ words
function getFirstParagraph(content) {
  const lines = content.split(/\n+/).map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (/^#{1,6}/.test(line)) continue
    const plain = line.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    if (plain.split(/\s+/).length >= 12) return plain
  }
  return ''
}

// 10 = internal link (or [insert link] placeholder), 5 = only external links, 0 = no links
function getLinkScore(content) {
  const placeholder = /\[(?:insert|internal)[^\]]*link[^\]]*\]/i.test(content)
  const mdLinks = [...content.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map(m => m[1])
  const htmlInternal = /<a\s[^>]*href=["']\/(?!\/)/i.test(content)
  const internal = mdLinks.some(h => h.startsWith('/')) || htmlInternal
  const anyLink =
    mdLinks.length > 0 || /<a\s[^>]*href=/i.test(content) || /https?:\/\/\S+/i.test(content)
  if (internal || placeholder) return 10
  if (anyLink) return 5
  return 0
}

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

    // First paragraph + internal link (server-side — deterministic)
    const firstParagraph = getFirstParagraph(content)
    const firstParagraphScore = keywordMatchScore(firstParagraph, keyword)
    const internalLinkScore = getLinkScore(content)

    const prompt = `You are an expert SEO analyst. Analyze this content and return a strict JSON score breakdown.

KEYWORD: "${keyword}"
WORD COUNT: ${wordCount}
META TITLE: "${metaTitle || ''}"
META DESCRIPTION: "${metaDescription || ''}"

HOW THE CONTENT IS FORMATTED:
- A line starting with # is the main title (H1), ## is an H2 subheading, ### is an H3 (the # marks are attached to the text).
- [anchor text](/path) is a link. A link starting with / is an internal link; one starting with http is external.
- If the content has no # marks, it is plain text pasted by the user: judge headings from context as best you can.

CONTENT:
"""
${content.slice(0, 8000)}
"""

SCORING RULES — each factor is worth exactly 10 points:
1. keywordInTitle (0, 5, or 10): Is the keyword in the first heading/title? 10=yes exact, 5=partial, 0=no
2. keywordInHeadings (0, 5, or 10): Does keyword appear in H2/H3 subheadings? 10=2+ times, 5=once, 0=no
3. keywordDensity (0, 5, or 10): Is keyword density 1–3%? 10=optimal, 5=slightly over/under, 0=absent or stuffed
4. readability (0, 5, or 10): Short sentences, short paragraphs (2-3 lines), simple language? 10=great, 5=ok, 0=poor
5. structure (0, 5, or 10): Proper H1/H2/H3 hierarchy used? 10=well structured, 5=partial, 0=no headings

DO NOT score: wordCount, metaTitle, metaDescription, keywordInFirstParagraph, internalLink — those are pre-calculated.
Pre-calculated results (out of 10): keywordInFirstParagraph = ${firstParagraphScore}, internalLink = ${internalLinkScore}.
${firstParagraphScore < 10 ? `The first paragraph analysed was: "${firstParagraph.slice(0, 300)}"` : ''}

${isPaid ? `Also return full suggestions array — one specific actionable suggestion per factor that scored below 10 (include keywordInFirstParagraph and internalLink if their pre-calculated score is below 10).` : `Return only 3 suggestions maximum for the lowest-scoring factors.`}

Return ONLY valid JSON, no markdown:
{
  "scores": {
    "keywordInTitle": number,
    "keywordInHeadings": number,
    "keywordDensity": number,
    "readability": number,
    "structure": number
  },
  "suggestions": [
    { "factor": "string", "issue": "string", "fix": "string" }
  ],
  "summary": "string (1 sentence overall assessment)"
}`

    const completion = await generateWithFallback({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    let text = completion.choices[0]?.message?.content || ''
    text = text.replace(/```json|```/g, '').trim()
    const jsonStart = text.indexOf('{')
    const jsonEnd   = text.lastIndexOf('}')
    text = text.substring(jsonStart, jsonEnd + 1)

    let aiResult
    try {
      aiResult = JSON.parse(text)
    } catch (parseError) {
      console.error('SEO score JSON parse failed. Raw text:', text)
      return Response.json(
        { error: 'Scoring failed: the AI response was incomplete. Please try again.' },
        { status: 500 }
      )
    }

    // Merge AI scores with server-side deterministic scores
    const scores = {
      ...aiResult.scores,
      keywordInFirstParagraph: firstParagraphScore,
      internalLink:            internalLinkScore,
      wordCount:               wordCountScore,
      metaTitleLength:         metaTitleScore,
      metaDescLength:          metaDescScore,
    }

    // Clamp all scores to 0–10
    Object.keys(scores).forEach(k => {
      scores[k] = Math.min(10, Math.max(0, Number(scores[k]) || 0))
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
