import Groq from 'groq-sdk'

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
  const wordMatch = Math.abs(words - wordCount) <= 20
  return wordMatch && hasHeadings && hasBullets && hasLineBreaks
}

function buildBlogPrompt(topic, tone, language, keywords, audience, cta, wordCount) {
  const kwText = keywords?.length ? `Use these SEO keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''

  let structure = ''
  if (wordCount <= 200) {
    structure = `
## Introduction
Write 2-3 sentences introducing the topic.

## Key Points
- Point 1
- Point 2
- Point 3

## Conclusion
Write 1-2 sentences wrapping up.`
  } else if (wordCount <= 500) {
    structure = `
## Introduction
Write a short paragraph introducing the topic.

## Why It Matters
Write a paragraph explaining the importance.

## Key Benefits
- Benefit 1
- Benefit 2
- Benefit 3
- Benefit 4

## How It Works
Write a paragraph explaining how it works.

## Conclusion
Write a closing paragraph.`
  } else {
    structure = `
## Introduction
Write a strong opening paragraph.

## Background
Write a paragraph with context and background.

## Key Benefits
- Benefit 1
- Benefit 2
- Benefit 3
- Benefit 4

## How It Works
Write a detailed paragraph.

### Step by Step
- Step 1
- Step 2
- Step 3

## Real World Applications
Write a paragraph with examples.

## Challenges to Consider
Write a paragraph about challenges.

## Best Practices
- Practice 1
- Practice 2
- Practice 3

## Conclusion
Write a strong closing paragraph.`
  }

  return `You are a blog writer. Fill in the template below. Replace placeholder text with real content about: ${topic}

Tone: ${tone}
Language: ${language}
${kwText}
${audText}
${ctaText}
Target word count: EXACTLY ${wordCount} words for the blog body.

RULES YOU MUST FOLLOW:
- Keep every ## and ### heading exactly as shown
- Keep every - bullet point exactly as shown  
- Add a blank line before and after every ## heading
- Add a blank line between every paragraph
- Add a blank line between bullet lists and paragraphs
- Each bullet point on its own line
- NEVER write everything as one paragraph
- Count words and adjust until EXACTLY ${wordCount} words

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

  // Fallback for any unlisted platform
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
  const content = lines.slice(contentStart).join('\n').trim()
  return { metaTitle, metaDescription, h1, content }
}

async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    temperature: 0.7,
    max_tokens: 512,
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

    console.log('Prompt used:', prompt?.slice(0, 300))

    if (!prompt) {
      return Response.json({ error: 'Unsupported platform: ' + platform }, { status: 400 })
    }

    let rawText = ''
    let metaTitle = '', metaDescription = '', h1 = ''
    let content = ''

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt === 0) {
        rawText = await callGroq(prompt)
      } else {
        // Retry logic only applies to Blog — non-blog platforms do not require headings/bullets
        if (!isBlog) break

        const v = countWords(content)
        const issues = []
        if (!content.includes('## ')) issues.push('MISSING ## headings — every section MUST start with ## on its own line')
        if (!content.includes('\n- ')) issues.push('MISSING bullet points — use "- " at the start of each bullet on its own line')
        if (!content.includes('\n')) issues.push('MISSING line breaks — add blank lines between every section')
        if (Math.abs(v - wordCount) > 20) issues.push(`WRONG word count — got ${v} words, need EXACTLY ${wordCount} words`)

        const retryPrompt = `Your previous response had these problems:\n${issues.join('\n')}\n\nFix ALL problems. Return the complete corrected content only.\n\nPrevious content:\n${content}`
        rawText = await callGroq(retryPrompt)
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

      // Only validate structure for Blog — non-blog platforms break after first successful generation
      if (isBlog && isValid(content, wordCount)) break
      if (!isBlog) break
    }

    return Response.json({
      content: { metaTitle, metaDescription, titles: h1 ? [h1] : [], content }
    })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
