import Groq from 'groq-sdk'
import { checkGenerationPolicy, incrementPostCount } from '../../../lib/usagePolicy'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

function getPreviewContent(content) {
  const sections = content.split(/(?=\n## )/)
  if (sections.length >= 3) {
    const cutoff = Math.ceil(sections.length * 0.55)
    return sections.slice(0, cutoff).join('').trim()
  }
  const lines = content.split('\n').filter(l => l.trim() !== '')
  const cutoff = Math.ceil(lines.length * 0.55)
  return lines.slice(0, cutoff).join('\n').trim()
}

function parseVariations(raw) {
  const blocks = raw.split(/\n---\n/).map(b => b.trim()).filter(Boolean)
  return blocks.map(block => block.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
}

function buildBlogPrompt(topic, tone, language, keywords, audience, cta, wordCount, link) {
  const kwText = keywords?.length ? `Use these SEO keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''
  const linkText = link ? `Include this link naturally near the end of the article: ${link}` : ''

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
${linkText}
Target word count: EXACTLY ${wordCount} words for the blog body.

RULES:
- Keep every ## and ### heading exactly as shown
- Replace ALL placeholder text with real, detailed content
- Each bullet = FULL SENTENCE or TWO, not a short phrase
- Each paragraph = MULTIPLE SENTENCES
- Add blank lines before/after headings and between sections
- Write until EXACTLY ${wordCount} words

OUTPUT THIS EXACT FORMAT:
META_TITLE: (SEO title under 60 chars)
META_DESC: (SEO description under 160 chars)
H1: (H1 heading)
---
${structure}`
}

function buildHashtagPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount, link) {
  const kwText = keywords?.length ? `Use these keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `Use a "${cta}" call to action.` : ''
  const linkText = link ? `Include this link naturally in the caption: ${link}` : ''

  if (platform === 'Instagram') {
    return `You are a strict Instagram content generator.

Generate 4 different Instagram caption variations about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

RULES:
- Write exactly 4 variations numbered 1. 2. 3. 4.
- Each starts with a powerful hook (max 8 words) on its own line
- Every sentence on its own line, max 8 words per line
- Use 2-5 emojis per variation
- End each with a CTA line${link ? ' and the link' : ''}
- Add 5-8 hashtags after each variation, each starting with #
- Separate variations with a blank line, "---", blank line
- NO paragraphs

OUTPUT ONLY the 4 variations. No explanations.`
  }

  if (platform === 'TikTok') {
    return `You are a strict TikTok content generator.

Generate 4 different TikTok caption variations about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

RULES:
- Write exactly 4 variations numbered 1. 2. 3. 4.
- Each starts with a viral hook (under 10 words)
- Lines 2-5: short punchy lines (each under 10 words)
- Final line: CTA${link ? ' + link' : ''}
- Add 3-5 hashtags after each variation
- Separate variations with a blank line, "---", blank line

OUTPUT ONLY the 4 variations. No explanations.`
  }
}

function buildOtherPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount, link) {
  const kwText = keywords?.length ? `Use these keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `Use a "${cta}" call to action.` : ''
  const linkText = link ? `Include this link naturally: ${link}` : ''

  if (platform === 'LinkedIn') {
    return `You are a strict LinkedIn content generator.

Generate 4 different LinkedIn post variations about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

RULES:
- Write exactly 4 variations numbered 1. 2. 3. 4.
- Each variation: EXACTLY ${wordCount} words (count carefully)
- Each: strong professional hook on line 1-2
- Body: short paragraphs, max 2 lines each, blank lines between
- End each with insight, question, or CTA${link ? ' + link' : ''}
- Max 2 emojis per variation
- Separate variations with a blank line, "---", blank line

OUTPUT ONLY the 4 variations. No explanations.`
  }

  if (platform === 'X' || platform === 'Twitter' || platform === 'Twitter/X') {
    return `You are a strict X (formerly Twitter) content generator.

Generate 4 different X post variations about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

RULES:
- Write exactly 4 variations numbered 1. 2. 3. 4.
- Each is a single post, max 280 characters
- First line = hook, last line = CTA${link ? ' + link' : ''}
- Punchy, direct, engaging
- Separate variations with a blank line, "---", blank line

OUTPUT ONLY the 4 variations. No explanations.`
  }

  if (platform === 'Email') {
    return `You are a strict email copywriter.

Write a marketing email about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

RULES:
- Line 1: Subject line (format: "Subject: ...")
- Then blank line, then email body
- Body: EXACTLY ${wordCount} words (excluding subject line, count carefully)
- Body: conversational, short paragraphs (2-3 lines each)
- Clear CTA${link ? ' with the link' : ''}
- Professional closing
- NO hashtags

OUTPUT ONLY the email. No explanations.`
  }

  if (platform === 'Ads') {
    return `You are a strict ad copywriter.

Generate 4 different ad copy variations about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

RULES:
- Write exactly 4 variations numbered 1. 2. 3. 4.
- Line 1: pain point or key benefit (under 10 words)
- Lines 2-3: supporting lines (each under 10 words)
- Final line: urgent CTA (under 10 words)${link ? ' + link' : ''}
- Separate variations with a blank line, "---", blank line

OUTPUT ONLY the 4 variations. No explanations.`
  }

  if (platform === 'YouTube') {
    return `You are a strict YouTube script generator.

Write a YouTube video script about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

RULES:
- Strong hook (spoken style)
- Intro, main content, outro + CTA${link ? ' + link' : ''}
- EXACTLY ${wordCount} words total (count carefully)
- Frequent line breaks, spoken delivery style
- NO blog paragraphs

OUTPUT ONLY the script. No explanations.`
  }

  if (platform === 'Pinterest') {
    return `You are a strict Pinterest content generator.

Generate 4 Pinterest pin description variations about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

RULES:
- Write exactly 4 variations numbered 1. 2. 3. 4.
- Each: 1-2 short keyword-focused lines${link ? ' + link' : ''}
- Add 3-6 hashtags after each variation
- Separate variations with a blank line, "---", blank line

OUTPUT ONLY the 4 variations. No explanations.`
  }

  return `Write a ${platform} post about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}
Keep it concise and engaging.

OUTPUT ONLY the post. No explanations.`
}

function parseBlogMeta(raw) {
  const lines = raw.split('\n')
  let metaTitle = '', metaDescription = '', h1 = '', contentStart = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('META_TITLE:')) metaTitle = lines[i].replace('META_TITLE:', '').trim()
    else if (lines[i].startsWith('META_DESC:') || lines[i].startsWith('META_DESCRIPTION:')) {
      metaDescription = lines[i].replace(/^META_DESC(?:RIPTION)?:/, '').trim()
    }
    else if (lines[i].startsWith('H1:')) h1 = lines[i].replace('H1:', '').trim()
    else if (lines[i].trim() === '---') { contentStart = i + 1; break }
  }

  if (contentStart === 0) {
    for (const line of lines) {
      if (!metaTitle && line.startsWith('META_TITLE:')) metaTitle = line.replace('META_TITLE:', '').trim()
      if (!metaDescription && (line.startsWith('META_DESC:') || line.startsWith('META_DESCRIPTION:'))) {
        metaDescription = line.replace(/^META_DESC(?:RIPTION)?:/, '').trim()
      }
      if (!h1 && line.startsWith('H1:')) h1 = line.replace('H1:', '').trim()
    }
  }

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
          content: 'You are an expert blog writer. You ALWAYS write complete, fully developed blog posts. You NEVER truncate. You hit the exact target word count.'
        },
        { role: 'user', content: prompt }
      ]
    : [{ role: 'user', content: prompt }]

  const completion = await groq.chat.completions.create({
    messages,
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    temperature: 0.7,
    max_tokens: 3000,
  })
  return completion.choices[0]?.message?.content || ''
}

const MULTI_VARIATION_PLATFORMS = ['Instagram', 'TikTok', 'LinkedIn', 'X', 'Twitter', 'Twitter/X', 'Ads', 'Pinterest']
const LONG_FORM_PLATFORMS = ['Email', 'YouTube']

export async function POST(request) {
  try {
    const { platform, topic, keywords, tone, audience, cta, length, language, wordCount: wc, link } = await request.json()

    console.log('Platform:', platform)

    const isBlog = platform === 'Blog'
    const isMultiVariation = MULTI_VARIATION_PLATFORMS.includes(platform)
    const needsHashtags = platform === 'Instagram' || platform === 'TikTok'
    const platformWordCounts = {
      LinkedIn: { Short: 80,  Medium: 150, Long: 250 },
      Email:    { Short: 100, Medium: 250, Long: 400 },
      YouTube:  { Short: 200, Medium: 400, Long: 700 },
    }
    const wordCount = wc || platformWordCounts[platform]?.[length] || (length === 'Long' ? 800 : length === 'Medium' ? 400 : 150)

    let prompt = ''
    if (isBlog) {
      prompt = buildBlogPrompt(topic, tone, language, keywords, audience, cta, wordCount, link)
    } else if (needsHashtags) {
      prompt = buildHashtagPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount, link)
    } else {
      prompt = buildOtherPrompt(platform, topic, tone, language, keywords, audience, cta, wordCount, link)
    }

    if (!prompt) {
      return Response.json({ error: 'Unsupported platform: ' + platform }, { status: 400 })
    }

    // ── Auth: manually parse Supabase cookie (handles base64- prefix format) ──
    const cookieStore = await cookies()
    const { createClient: makeAdminClient } = await import('@supabase/supabase-js')
    const adminDb = makeAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    let serverUser = null
    try {
      const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
      const baseName = `sb-${projectId}-auth-token`

      // Reassemble chunked cookie (.0, .1, ...) written by @supabase/ssr createBrowserClient
      let raw = cookieStore.get(baseName)?.value
      if (!raw) {
        let chunks = []
        for (let i = 0; i < 10; i++) {
          const chunk = cookieStore.get(`${baseName}.${i}`)?.value
          if (!chunk) break
          chunks.push(chunk)
        }
        if (chunks.length) raw = chunks.join('')
      }

      console.log('=== cookie raw found:', !!raw)
      if (raw) {
        const json = raw.startsWith('base64-')
          ? Buffer.from(raw.slice(7), 'base64').toString('utf-8')
          : decodeURIComponent(raw)
        const parsed = JSON.parse(json)
        const accessToken = parsed.access_token
        if (accessToken) {
          const payloadBase64 = accessToken.split('.')[1]
          const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'))
          console.log('=== JWT sub:', payload.sub, '| exp:', new Date(payload.exp * 1000).toISOString())
          const isExpired = payload.exp * 1000 < Date.now()
          if (!isExpired && payload.sub) {
            const { data: userData, error: userErr } = await adminDb
              .from('profiles').select('id').eq('id', payload.sub).single()
            console.log('=== profile lookup:', userData?.id, '| err:', userErr?.message)
            if (!userErr && userData) serverUser = { id: payload.sub, email: payload.email }
          } else if (isExpired) {
            console.log('=== JWT expired — treating as guest')
          }
        }
      }
    } catch (e) {
      console.error('=== Cookie parse error:', e.message)
    }

    const isGuest = !serverUser
    console.log('=== AUTH isGuest:', isGuest, 'userId:', serverUser?.id)

    if (!isGuest) {
      const LIMITS = { free: 3, starter: 50, pro: 200, agency: Infinity }
      const { data: profile, error: profErr } = await adminDb
        .from('profiles').select('plan, posts_count, reset_date').eq('id', serverUser.id).single()
      console.log('=== PROFILE:', profile, 'profErr:', profErr)
      const plan  = profile?.plan || 'free'
      const limit = LIMITS[plan] ?? 3
      const used  = profile?.posts_count || 0
      const currentMonth = new Date().toISOString().slice(0, 7)
      const resetMonth   = profile?.reset_date ? String(profile.reset_date).slice(0, 7) : null
      console.log('=== currentMonth:', currentMonth, 'resetMonth:', resetMonth, 'used:', used, 'limit:', limit)
      if (!resetMonth || resetMonth !== currentMonth) {
        await adminDb.from('profiles')
          .update({ posts_count: 0, reset_date: currentMonth + '-01' })
          .eq('id', serverUser.id)
        console.log('=== RESET posts_count to 0')
      } else if (limit !== Infinity && used >= limit) {
        return Response.json({
          error: 'LIMIT_REACHED',
          message: `You've used all ${limit} posts this month on the ${plan} plan.`,
          upgrade: true, postsUsed: used, postsLimit: limit, plan,
        }, { status: 403 })
      }
    }

    // ── Generate ──────────────────────────────────────────────────────────────
    let rawText = ''
    let metaTitle = '', metaDescription = '', h1 = ''
    let content = ''
    let variations = []

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt === 0) {
        rawText = await callGroq(prompt, isBlog)
      } else {
        if (!isBlog) break
        const v = countWords(content)
        const issues = []
        if (!content.includes('## ')) issues.push('MISSING ## headings')
        if (!content.includes('\n- ')) issues.push('MISSING bullet points')
        if (Math.abs(v - wordCount) > 40) issues.push(`WRONG word count: got ${v}, need ${wordCount}`)
        const retryPrompt = `Fix:\n${issues.join('\n')}\n\nReturn complete corrected content.\n\nPrevious:\n${content}`
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
        if (isMultiVariation) variations = parseVariations(rawText)
      }

      if (isBlog && isValid(content, wordCount)) break
      if (!isBlog) break
    }

    // ── Track usage ───────────────────────────────────────────────────────────
    if (!isGuest && serverUser) {
      console.log('=== INCREMENT for userId:', serverUser.id)
      const { data: cur, error: selErr } = await adminDb
        .from('profiles').select('posts_count').eq('id', serverUser.id).single()
      console.log('=== pre-increment posts_count:', cur?.posts_count, 'selErr:', selErr)
      const { data: upd, error: updErr } = await adminDb
        .from('profiles')
        .update({ posts_count: (cur?.posts_count || 0) + 1 })
        .eq('id', serverUser.id)
        .select()
      console.log('=== post-increment result:', upd, 'updErr:', updErr)
    } else {
      console.log('=== SKIPPED — isGuest:', isGuest, 'hasUser:', !!serverUser)
    }

    // ── Response ──────────────────────────────────────────────────────────────
    if (isBlog) {
      const returnContent = isGuest ? getPreviewContent(content) : content
      return Response.json({
        isGuest,
        isPreview: isGuest,
        content: { metaTitle, metaDescription, titles: h1 ? [h1] : [], content: returnContent }
      })
    }

    if (isMultiVariation) {
      return Response.json({
        isGuest,
        isPreview: isGuest,
        variations,
        content: { metaTitle: '', metaDescription: '', titles: [], content }
      })
    }

    // Email / YouTube — single output, guest gets preview, logged-in gets full
    const returnContent = isGuest ? getPreviewContent(content) : content
    return Response.json({
      isGuest,
      isPreview: isGuest,
      content: { metaTitle: '', metaDescription: '', titles: [], content: returnContent }
    })

  } catch (error) {
    console.error('Generation error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
