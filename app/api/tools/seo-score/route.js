// app/api/tools/seo-score/route.js
// UPDATED VERSION (consistent scoring):
//  - ALL 10 scores are now calculated by code, so the same page + keyword always gives the same score
//  - the AI only writes the suggestions and the one-line summary (it can no longer change a score)
//  - if the AI fails, you still get the full score (with no suggestions) instead of an error
//  - plan check (pro / premium / agency) is unchanged

import { createClient } from '../../../../lib/supabase'
import { generateWithFallback } from '../../../../lib/groq-helper'

// ── text helpers ─────────────────────────────────────────────────────────
const norm = s =>
  String(s || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()

const stem = w => (w.length > 4 ? w.slice(0, 4) : w)

const stripLinks = s => s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')

const countWords = s => s.split(/\s+/).filter(Boolean).length

// 10 = exact phrase, or all its words close together (any form, e.g. "finding guest posting sites")
//  5 = at least half of the keyword's words are present, 0 = no
function keywordMatchScore(text, keyword) {
  const t = norm(text)
  const k = norm(keyword)
  if (!t || !k) return 0
  if (t.includes(k)) return 10
  if (countKeywordHits(text, keyword).hits > 0) return 10
  const textStems = new Set(t.split(' ').map(stem))
  const keyStems = k.split(' ').filter(w => w.length > 2).map(stem)
  if (!keyStems.length) return 0
  const present = keyStems.filter(s => textStems.has(s)).length
  return present / keyStems.length >= 0.5 ? 5 : 0
}

// Counts how many times the keyword appears (exact phrase or all its words close together)
function countKeywordHits(text, keyword) {
  const words = norm(text).split(' ').filter(Boolean)
  const need = [...new Set(norm(keyword).split(' ').filter(w => w.length > 2).map(stem))]
  if (!need.length) return { hits: 0, total: words.length }
  const span = need.length + 3
  let hits = 0
  let i = 0
  while (i < words.length) {
    const win = new Set(words.slice(i, i + span).map(stem))
    if (need.every(s => win.has(s))) { hits++; i += span } else { i++ }
  }
  return { hits, total: words.length }
}

// If the user pasted HTML, convert headings/links to the same markers fetch-url uses
function normalizeContent(raw) {
  let t = String(raw || '')
  if (/<(p|div|h[1-6]|a|ul|ol|li|br|span|strong|em)\b/i.test(t)) {
    const clean = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    t = t
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, l, inner) => `\n\n${'#'.repeat(Number(l))}${clean(inner)}\n\n`)
      .replace(/<a\s[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
        const text = clean(inner)
        return text ? `[${text}](${href})` : ''
      })
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|ul|ol|tr|blockquote|section|figure|table)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/[ \t]+/g, ' ')
  }
  return t.trim()
}

// Plain text with no # marks: treat short standalone lines (no end punctuation) as headings
function looksLikeHeading(line) {
  const n = countWords(line)
  return (
    n >= 2 && n <= 12 &&
    !/[.!?,;:]$/.test(line) &&
    !line.includes('](') &&
    !/^[\p{Extended_Pictographic}\-•*]/u.test(line)
  )
}

// Split the content into headings and body lines
function analyse(content) {
  const lines = content.split(/\n+/).map(l => l.trim()).filter(Boolean)
  const hasMarkers = lines.some(l => /^#{1,6}/.test(l))
  const headings = []
  const body = []
  lines.forEach(line => {
    const m = line.match(/^(#{1,6})\s*(.+)$/)
    if (m) {
      headings.push({ level: m[1].length, text: stripLinks(m[2]) })
    } else if (!hasMarkers && looksLikeHeading(line)) {
      headings.push({ level: headings.length ? 2 : 1, text: line })
    } else {
      body.push(stripLinks(line))
    }
  })
  return { lines, headings, body }
}

// 10 = internal link (or [insert link] placeholder), 5 = only external links, 0 = no links
function getLinkScore(content) {
  const placeholder = /\[(?:insert|internal)[^\]]*link[^\]]*\]/i.test(content)
  const mdLinks = [...content.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map(m => m[1])
  const internal = mdLinks.some(h => h.startsWith('/') && !h.startsWith('//'))
  const anyLink = mdLinks.length > 0 || /https?:\/\/\S+/i.test(content)
  if (internal || placeholder) return 10
  if (anyLink) return 5
  return 0
}

// Readability from sentence length and paragraph length
function getReadability(body) {
  const sentenceLengths = body
    .flatMap(p => p.split(/(?<=[.!?])\s+/))
    .map(countWords)
    .filter(n => n > 0)
  if (!sentenceLengths.length) return { score: 0, avgSentence: 0, avgParagraph: 0 }

  const avgSentence = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
  const longShare = sentenceLengths.filter(n => n > 25).length / sentenceLengths.length
  const paraLengths = body.map(countWords).filter(n => n > 0)
  const avgParagraph = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length

  let points = 0
  if (avgSentence <= 22) points++
  if (longShare <= 0.25) points++
  if (avgParagraph <= 100) points++

  return {
    score: points >= 2 ? 10 : points === 1 ? 5 : 0,
    avgSentence: Math.round(avgSentence),
    avgParagraph: Math.round(avgParagraph),
  }
}

export async function POST(request) {
  try {
    const { content: rawContent, keyword, metaTitle, metaDescription } = await request.json()

    if (!rawContent || !keyword) {
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

    const content = normalizeContent(rawContent)
    const { lines, headings, body } = analyse(content)

    // ── Every score below is calculated by code (same input = same result) ──
    const wordCount = countWords(content)

    let wordCountScore = 0
    if (wordCount >= 700)                    wordCountScore = 10
    else if (wordCount >= 500)               wordCountScore = 7
    else if (wordCount >= 300)               wordCountScore = 5
    else                                     wordCountScore = 3

    const metaTitleScore = metaTitle
      ? (metaTitle.length >= 50 && metaTitle.length <= 60 ? 10 : metaTitle.length > 0 ? 5 : 0)
      : 0
    const metaDescScore  = metaDescription
      ? (metaDescription.length >= 140 && metaDescription.length <= 160 ? 10 : metaDescription.length > 0 ? 5 : 0)
      : 0

    const h1 = headings.find(h => h.level === 1)
    const subHeadings = headings.filter(h => h.level >= 2)

    const titleText = h1?.text || metaTitle || lines[0] || ''
    const keywordInTitle = keywordMatchScore(titleText, keyword)

    const firstParagraph = body.find(p => countWords(p) >= 12) || ''
    const keywordInFirstParagraph = keywordMatchScore(firstParagraph, keyword)

    const headingHits = subHeadings.filter(h => keywordMatchScore(h.text, keyword) === 10).length
    const headingPartial = subHeadings.some(h => keywordMatchScore(h.text, keyword) >= 5)
    const keywordInHeadings = headingHits >= 1 ? 10 : headingPartial ? 5 : 0

    const structure = h1 && subHeadings.length >= 1 ? 10 : (h1 || subHeadings.length >= 1) ? 5 : 0

    const { hits, total } = countKeywordHits(content, keyword)
    const density = total ? (hits / total) * 100 : 0
    const longPhrase = norm(keyword).split(' ').filter(Boolean).length >= 3
    const minDensity = longPhrase ? 0.3 : 1
    let keywordDensity = 0
    if (density >= minDensity && density <= 3) keywordDensity = 10
    else if (hits > 0 && density <= 4) keywordDensity = 5

    const readability = getReadability(body)
    const internalLink = getLinkScore(content)

    const scores = {
      keywordInTitle,
      keywordInFirstParagraph,
      keywordInHeadings,
      keywordDensity,
      readability: readability.score,
      internalLink,
      structure,
      wordCount:       wordCountScore,
      metaTitleLength: metaTitleScore,
      metaDescLength:  metaDescScore,
    }

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)

    // ── AI only writes the suggestions and summary ──
    const weak = Object.entries(scores).filter(([, v]) => v < 10).map(([k, v]) => `${k} = ${v}/10`)

    const prompt = `You are an expert SEO analyst. The scores below were already calculated and are final. Do NOT change or restate them. Write helpful suggestions only.

KEYWORD: "${keyword}"
WORD COUNT: ${wordCount}
META TITLE: "${metaTitle || ''}"
META DESCRIPTION: "${metaDescription || ''}"

FACTS ABOUT THE CONTENT:
- Main title (H1): "${titleText}"
- Sub-headings: ${subHeadings.length} total, ${headingHits} contain the keyword
- Keyword appears about ${hits} time(s) (${density.toFixed(2)}% density; ideal is ${minDensity}–3%)
- Average sentence length: ${readability.avgSentence} words; average paragraph length: ${readability.avgParagraph} words
- First paragraph: "${firstParagraph.slice(0, 300)}"

FACTORS BELOW 10 (these need suggestions): ${weak.join(', ') || 'none'}

CONTENT (a line starting with # is a heading; [text](/path) is an internal link):
"""
${content.slice(0, 6000)}
"""

${isPaid ? `Return one specific, actionable suggestion for EACH factor listed above as below 10. Use the exact factor name as the "factor" value.` : `Return only 3 suggestions maximum, for the lowest-scoring factors. Use the exact factor name as the "factor" value.`}

Return ONLY valid JSON, no markdown:
{
  "suggestions": [
    { "factor": "string", "issue": "string", "fix": "string" }
  ],
  "summary": "string (1 sentence overall assessment)"
}`

    let suggestions = []
    let summary = ''
    try {
      const completion = await generateWithFallback({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-20b',
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      })

      let text = completion.choices[0]?.message?.content || ''
      text = text.replace(/```json|```/g, '').trim()
      text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
      const aiResult = JSON.parse(text)
      suggestions = Array.isArray(aiResult.suggestions) ? aiResult.suggestions : []
      summary = aiResult.summary || ''
    } catch (aiError) {
      // Scores are already calculated, so still return them without suggestions
      console.error('SEO score suggestions failed:', aiError)
    }

    if (!isPaid) suggestions = suggestions.slice(0, 3)

    return Response.json({
      totalScore,
      scores,
      suggestions,
      summary,
      wordCount,
      plan,
      isPaid,
    })

  } catch (error) {
    console.error('SEO score error:', error)
    return Response.json({ error: 'Scoring failed: ' + error.message }, { status: 500 })
  }
}
