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

  return `Write a ${platform} post about: ${topic}

Tone: ${tone}
Language: ${language}
${kwText}
${audText}
${ctaText}

RULES:
- Hook sentence first
- Then 2-3 short paragraphs separated by blank lines
- Include bullet points using "- " format
- End with exactly 15 hashtags each on its own line starting with #
- Content body must be EXACTLY ${wordCount} words (not counting hashtags)
- Add blank lines between sections`
}

function buildOtherPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount) {
  const kwText = keywords?.length ? `Use these keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''

  let structure = ''
  if (wordCount <= 200) {
    structure = `
Write a short opening paragraph.

## Key Points
- Point 1
- Point 2
- Point 3

Write a closing sentence.`
  } else {
    structure = `
Write an opening paragraph.

## Main Section
Write a paragraph here.

## Key Benefits
- Benefit 1
- Benefit 2
- Benefit 3

## Conclusion
Write a closing paragraph.`
  }

  return `Write a ${platform} post about: ${topic}

Tone: ${tone}
Language: ${language}
${kwText}
${audText}
${ctaText}
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
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    max_tokens: 4000,
  })
  return completion.choices[0]?.message?.content || ''
}

export async function POST(request) {
  try {
    const { platform, topic, keywords, tone, audience, cta, length, language } = await request.json()

    const isBlog = platform === 'Blog'
    const needsHashtags = platform === 'Instagram' || platform === 'TikTok'
    const wordCount = length === 'Long' ? 800 : length === 'Medium' ? 400 : 150

    let prompt = ''
    if (isBlog) {
      prompt = buildBlogPrompt(topic, tone, language, keywords, audience, cta, wordCount)
    } else if (needsHashtags) {
      prompt = buildHashtagPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount)
    } else {
      prompt = buildOtherPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount)
    }

    let rawText = ''
    let metaTitle = '', metaDescription = '', h1 = ''
    let content = ''

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt === 0) {
        rawText = await callGroq(prompt)
      } else {
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

      if (isValid(content, wordCount)) break
    }

    return Response.json({
      content: { metaTitle, metaDescription, titles: h1 ? [h1] : [], content }
    })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
