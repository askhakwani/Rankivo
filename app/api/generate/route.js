import Groq from 'groq-sdk'
import { checkGenerationPolicy, incrementPostCount } from '../../../lib/usagePolicy'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const maxDuration = 60

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function isValid(content, wordCount) {
  const words = countWords(content)
  const hasHeadings = content.includes('## ')
  const hasBullets = content.includes('\n- ')
  const hasLineBreaks = content.includes('\n')
  const wordMatch = Math.abs(words - wordCount) <= 40
  return wordMatch && hasHeadings && hasBullets && hasLineBreaks
}

// ── Guest preview: return first ~55% of content ───────────────────────────────
// For blogs: splits on ## sections and returns the first half.
// For short-form: splits on lines and returns the first half.
function getPreviewContent(content) {
  const sections = content.split(/(?=\n## )/)
  if (sections.length >= 3) {
    const cutoff = Math.ceil(sections.length * 0.55)
    return sections.slice(0, cutoff).join('').trim()
  }
  // Fallback: line-based for short-form content
  const lines = content.split('\n').filter(l => l.trim() !== '')
  const cutoff = Math.ceil(lines.length * 0.55)
  return lines.slice(0, cutoff).join('\n').trim()
}

function buildBlogPrompt(topic, tone, language, keywords, audience, cta, wordCount) {
  const kwText = keywords?.length ? `Use these SEO keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''

  let structure = ''
  if (wordCount <= 200) {
    structure = `
## Introduction
Write 2-3 sentences introducing the topic. Make it engaging and relevant.

## Key Points
- Write a full sentence explaining point 1 with detail
- Write a full sentence explaining point 2 with detail
- Write a full sentence explaining point 3 with detail

## Conclusion
Write 2 sentences wrapping up the key takeaway.`
  } else if (wordCount <= 500) {
    structure = `
## Introduction
Write a compelling 3-4 sentence paragraph introducing the topic and why it matters.

## Why It Matters
Write a 3-4 sentence paragraph explaining the importance and real-world impact.

## Key Benefits
- Write a full sentence describing benefit 1 with explanation
- Write a full sentence describing benefit 2 with explanation
- Write a full sentence describing benefit 3 with explanation
- Write a full sentence describing benefit 4 with explanation

## How It Works
Write a 3-4 sentence paragraph explaining the process or mechanism clearly.

## Conclusion
Write a 2-3 sentence closing paragraph summarizing the main message.`
  } else {
    structure = `
## Introduction
Write a strong 4-5 sentence opening paragraph that hooks the reader, introduces the topic, and previews what the article will cover.

## Background
Write a 4-5 sentence paragraph providing context, history, or foundational information the reader needs to understand the topic.

## Key Benefits
- Write a complete 2-sentence explanation of benefit 1, including why it matters
- Write a complete 2-sentence explanation of benefit 2, including why it matters
- Write a complete 2-sentence explanation of benefit 3, including why it matters
- Write a complete 2-sentence explanation of benefit 4, including why it matters

## How It Works
Write a detailed 5-6 sentence paragraph explaining the mechanics, process, or methodology in clear terms.

### Step by Step
- Write a full sentence describing step 1 with what to do and why
- Write a full sentence describing step 2 with what to do and why
- Write a full sentence describing step 3 with what to do and why
- Write a full sentence describing step 4 with what to do and why

## Real World Applications
Write a 4-5 sentence paragraph with concrete examples of how this topic plays out in real life or business scenarios.

## Challenges to Consider
Write a 4-5 sentence paragraph honestly discussing common pitfalls, limitations, or things readers should watch out for.

## Best Practices
- Write a complete sentence describing best practice 1 with actionable advice
- Write a complete sentence describing best practice 2 with actionable advice
- Write a complete sentence describing best practice 3 with actionable advice
- Write a complete sentence describing best practice 4 with actionable advice

## Conclusion
Write a strong 4-5 sentence closing paragraph that summarizes the key takeaways, reinforces the main message, and ends with a forward-looking statement or call to action.`
  }

  return `You are an expert blog writer. Fill in the template below with rich, detailed content about: ${topic}

Tone: ${tone}
Language: ${language}
${kwText}
${audText}
${ctaText}
Target word count: EXACTLY ${wordCount} words for the blog body (between the --- and end of content).

RULES YOU MUST FOLLOW:
- Keep every ## and ### heading exactly as shown
- Replace ALL placeholder text with real, detailed, substantive content
- Each bullet point must be a FULL SENTENCE or TWO — not a short phrase
- Each paragraph must be MULTIPLE SENTENCES — never one sentence per paragraph
- Add a blank line before and after every ## heading
- Add a blank line between every paragraph
- Add a blank line between bullet lists and paragraphs
- Each bullet point on its own line
- NEVER write thin or vague content — every section must be fully developed
- Write until you reach EXACTLY ${wordCount} words — count carefully

OUTPUT THIS EXACT FORMAT:
META_TITLE: (write SEO title here under 60 chars)
META_DESC: (write SEO description here under 160 chars)
H1: (write H1 heading here)
---
${structure}`
}

function buildHashtagPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount) {
  const kwText = keywords?.length ? `Use these keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''

  if (platform === 'Instagram') {
    return `You are a strict Instagram content generator.

Write an Instagram post about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}

MANDATORY RULES — VIOLATIONS WILL BE REJECTED:
- Line 1: A powerful hook (max 8 words)
- Every sentence MUST be on its own new line
- Max 8 words per line — hard limit
- Use 2–5 emojis placed naturally within lines
- End with a CTA line
- Then add 5–10 hashtags, each on its own line starting with #
- NO paragraphs — every line is standalone
- NO formal tone
- NO blog-style writing

OUTPUT ONLY the post. No explanations.`
  }

  if (platform === 'TikTok') {
    return `You are a strict TikTok/Reels content generator.

Write a TikTok caption post about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}

MANDATORY RULES — VIOLATIONS WILL BE REJECTED:
- Line 1: Viral hook (under 10 words)
- Lines 2–5: Short punchy engaging lines (each under 10 words)
- Each line must feel like on-screen text
- Final lines: Caption + CTA
- Add 3–5 hashtags, each on its own line starting with #
- Fast, catchy, viral energy throughout
- NO script paragraphs
- NO blog-style writing

OUTPUT ONLY the post. No explanations.`
  }
}

function buildOtherPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount) {
  const kwText = keywords?.length ? `Use these keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''

  if (platform === 'LinkedIn') {
    return `You are a strict LinkedIn content generator.

Write a LinkedIn post about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}

MANDATORY RULES — VIOLATIONS WILL BE REJECTED:
- Line 1–2: Strong professional hook
- Body: Short paragraphs, max 2 lines each
- Separate every paragraph with a blank line
- End with an insight or open question
- Max 2 emojis total in the entire post
- Professional tone throughout
- NO casual slang
- NO Instagram-style formatting

OUTPUT ONLY the post. No explanations.`
  }

  if (platform === 'Twitter' || platform === 'Twitter/X') {
    return `You are a strict Twitter/X content generator.

Write a Twitter thread about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}

MANDATORY RULES — VIOLATIONS WILL BE REJECTED:
- Write 5–10 tweets
- Each tweet on its own line
- Max 20 words per tweet — hard limit
- First tweet = hook
- Last tweet = CTA or summary
- NO paragraphs
- NO multi-line tweets

OUTPUT ONLY the tweets, one per line. No explanations.`
  }

  if (platform === 'Email') {
    return `You are a strict email copywriter.

Write a marketing email about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}

MANDATORY RULES — VIOLATIONS WILL BE REJECTED:
- Start with a greeting
- Body: conversational tone, short paragraphs (2–3 lines each)
- Include a clear CTA
- End with a professional closing
- NO hashtags
- NO social media tone or emojis

OUTPUT ONLY the email. No explanations.`
  }

  if (platform === 'Ads') {
    return `You are a strict ad copywriter focused on conversion.

Write ad copy about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}

MANDATORY RULES — VIOLATIONS WILL BE REJECTED:
- Line 1: Pain point or key benefit (under 10 words)
- Lines 2–4: Supporting lines (each under 10 words)
- Final line: Urgent CTA (under 10 words)
- Every line under 10 words — hard limit
- Add urgency throughout
- NO storytelling
- NO long explanations

OUTPUT ONLY the ad copy. No explanations.`
  }

  if (platform === 'YouTube') {
    return `You are a strict YouTube script generator.

Write a YouTube video script about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}

MANDATORY RULES — VIOLATIONS WILL BE REJECTED:
- Start with a strong hook (spoken style)
- Then intro section
- Then main content section
- End with outro + CTA
- Use frequent line breaks — spoken delivery style
- Keep it engaging throughout
- NO blog paragraphs
- NO formal essay structure

OUTPUT ONLY the script. No explanations.`
  }

  if (platform === 'Pinterest') {
    return `You are a strict Pinterest content generator.

Write a Pinterest pin description about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}

MANDATORY RULES — VIOLATIONS WILL BE REJECTED:
- Write 1–2 short keyword-focused lines only
- Then add 3–6 hashtags, each on its own line starting with #
- NO long text
- NO paragraphs

OUTPUT ONLY the pin description. No explanations.`
  }

  // Fallback
  const structure = wordCount <= 200
    ? `Write a short opening paragraph.\n\n## Key Points\n- Point 1\n- Point 2\n- Point 3\n\nWrite a closing sentence.`
    : `Write an opening paragraph.\n\n## Main Section\nWrite a paragraph here.\n\n## Key Benefits\n- Benefit 1\n- Benefit 2\n- Benefit 3\n\n## Conclusion\nWrite a closing paragraph.`

  return `Write a ${platform} post about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText}
Target word count: EXACTLY ${wordCount} words.

RULES:
- Keep every ## heading exactly as shown
- Keep every - bullet on its own line
- Add blank lines between sections
- NEVER write as one paragraph

OUTPUT:
${structure}`
}

function parseBlogMeta(raw) {
  const lines = raw.split('\n')
  let metaTitle = '', metaDescription = '', h1 = '', contentStart = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('META_TITLE:')) metaTitle = lines[i].replace('META_TITLE:', '').trim()
    else if (lines[i].startsWith('META_DESC:')) metaDescription = lines[i].replace('META_DESC:', '').trim()
    else if (lines[i].startsWith('H1:')) h1 = lines[i].replace('H1:', '').trim()
    else if (lines[i].trim() === '---') { contentStart = i + 1; break }
  }
  // If no --- was found, extract meta from all lines
  if (contentStart === 0) {
    for (const line of lines) {
      if (!metaTitle && line.startsWith('META_TITLE:')) metaTitle = line.replace('META_TITLE:', '').trim()
      if (!metaDescription && (line.startsWith('META_DESC:') || line.startsWith('META_DESCRIPTION:'))) {
        metaDescription = line.replace(/^META_DESC(?:RIPTION)?:/, '').trim()
      }
      if (!h1 && line.startsWith('H1:')) h1 = line.replace('H1:', '').trim()
    }
  }

  // Strip leaked META/H1/--- lines from content body
  const content = lines
    .slice(contentStart)
    .filter(line => {
      const t = line.trim()
      return (
        !t.startsWith('META_TITLE:') &&
        !t.startsWith('META_DESC:') &&
        !t.startsWith('META_DESCRIPTION:') &&
        !t.startsWith('H1:') &&
        t !== '---'
      )
    })
    .join('\n')
    .trim()

  return { metaTitle, metaDescription, h1, content }
}

async function callGroq(prompt, isBlog) {
  const messages = isBlog
    ? [
        {
          role: 'system',
          content: 'You are an expert blog writer. You ALWAYS write complete, fully developed blog posts. You NEVER truncate or summarize. You write every section in full. You count words carefully and hit the exact target word count specified.'
        },
        { role: 'user', content: prompt }
      ]
    : [
        { role: 'user', content: prompt }
      ]

  const completion = await groq.chat.completions.create({
    messages,
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    temperature: 0.7,
    max_tokens: 3000,
  })
  return completion.choices[0]?.message?.content || ''
}

export async function POST(request) {
  try {

    const { platform, topic, keywords, tone, audience, cta, length, language, wordCount: wc } = await request.json()

    console.log('Platform:', platform)

    const isBlog = platform === 'Blog'
    const needsHashtags = platform === 'Instagram' || platform === 'TikTok'
    const wordCount = wc || (length === 'Long' ? 800 : length === 'Medium' ? 400 : 150)

    let prompt = ''
    if (isBlog) {
      prompt = buildBlogPrompt(topic, tone, language, keywords, audience, cta, wordCount)
    } else if (needsHashtags) {
      prompt = buildHashtagPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount)
    } else {
      prompt = buildOtherPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount)
    }

    if (!prompt) {
      return Response.json({ error: 'Unsupported platform: ' + platform }, { status: 400 })
    }

    // ── STEP 1: Auth check — limits only apply to logged-in users ─────────────
    const policy = await checkGenerationPolicy()
    const isGuest = policy.isGuest

    if (!isGuest && !policy.allowed) {
      return Response.json({
        error:      'LIMIT_REACHED',
        message:    policy.message,
        upgrade:    true,
        postsUsed:  policy.postsUsed,
        postsLimit: policy.postsLimit,
        plan:       policy.plan,
      }, { status: 403 })
    }

    // ── STEP 2: Generate full content (always) ────────────────────────────────
    let rawText = ''
    let metaTitle = '', metaDescription = '', h1 = ''
    let content = ''

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt === 0) {
        rawText = await callGroq(prompt, isBlog)
      } else {
        if (!isBlog) break

        const v = countWords(content)
        const issues = []
        if (!content.includes('## ')) issues.push('MISSING ## headings — every section MUST start with ## on its own line')
        if (!content.includes('\n- ')) issues.push('MISSING bullet points — use "- " at the start of each bullet on its own line')
        if (!content.includes('\n')) issues.push('MISSING line breaks — add blank lines between every section')
        if (Math.abs(v - wordCount) > 40) issues.push(`WRONG word count — got ${v} words, need EXACTLY ${wordCount} words. Expand every section with more detail.`)

        const retryPrompt = `Your previous response had these problems:\n${issues.join('\n')}\n\nFix ALL problems. Expand every section with more detail. Return the COMPLETE corrected content only — do not truncate.\n\nPrevious content:\n${content}`
        rawText = await callGroq(retryPrompt, isBlog)
      }

      if (isBlog) {
        const parsed = parseBlogMeta(rawText)
        if (attempt === 0 || parsed.metaTitle) metaTitle = parsed.metaTitle
        if (attempt === 0 || parsed.metaDescription) metaDescription = parsed.metaDescription
        if (attempt === 0 || parsed.h1) h1 = parsed.h1
        content = parsed.content
      } else {
        content = rawText.trim()
      }

      if (isBlog && isValid(content, wordCount)) break
      if (!isBlog) break
    }

    // ── STEP 3: Track usage — logged-in users only ────────────────────────────
    if (!isGuest) {
      await incrementPostCount(policy.user?.id)
    }

    // ── STEP 4: Return preview for guests, full content for logged-in ─────────
    const returnContent = isGuest ? getPreviewContent(content) : content

    return Response.json({
      isGuest,
      isPreview: isGuest,
      content: {
        metaTitle,
        metaDescription,
        titles: h1 ? [h1] : [],
        content: returnContent,
      }
    })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
