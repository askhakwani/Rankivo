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
  // Falling short of the promised word count is the real problem — overshooting is fine.
  // Only trigger a retry if it's meaningfully under target, or absurdly over (runaway output).
  const minWords = Math.round(wordCount * 0.9)
  const maxWords = Math.round(wordCount * 2.5)
  const wordMatch = words >= minWords && words <= maxWords
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

// Builds a per-section word-count plan whose numbers intentionally sum to MORE than
// the customer-facing target (the AI reliably undershoots a single overall number,
// but hits section-level quotas much more reliably — and the cushion means even a
// partial shortfall still clears the real target).
function buildSectionPlan(wordCount) {
  const INFLATION = 1.7
  const total = Math.round(wordCount * INFLATION)

  if (wordCount <= 200) {
    return [
      { heading: '## Introduction', words: Math.round(total * 0.28), note: 'Introduce the topic in an engaging, relevant way.' },
      { heading: '## Key Points', bullets: 3, bulletWords: Math.round(total * 0.48 / 3), note: 'Each bullet a full, detailed sentence explaining one point.' },
      { heading: '## Conclusion', words: Math.round(total * 0.24), note: 'Wrap up the key takeaway.' },
    ]
  }
  if (wordCount <= 500) {
    return [
      { heading: '## Introduction', words: Math.round(total * 0.12), note: 'Introduce the topic and why it matters.' },
      { heading: '## Why It Matters', words: Math.round(total * 0.16), note: 'Explain the importance and real-world impact.' },
      { heading: '## Key Benefits', bullets: 4, bulletWords: Math.round(total * 0.32 / 4), note: 'Each bullet a full sentence with explanation.' },
      { heading: '## How It Works', words: Math.round(total * 0.24), note: 'Explain the process or mechanism clearly.' },
      { heading: '## Conclusion', words: Math.round(total * 0.16), note: 'Summarize the main message.' },
    ]
  }
  return [
    { heading: '## Introduction', words: Math.round(total * 0.09), note: 'A strong hook, introduce the topic, preview what the article covers.' },
    { heading: '## Background', words: Math.round(total * 0.09), note: 'Provide context, history, or foundational information.' },
    { heading: '## Key Benefits', bullets: 4, bulletWords: Math.round(total * 0.14 / 4), note: 'Each bullet a full explanation including why it matters.' },
    { heading: '## How It Works', words: Math.round(total * 0.10), note: 'Explain the mechanics, process, or methodology.',
      subsection: { heading: '### Step by Step', bullets: 4, bulletWords: Math.round(total * 0.08 / 4), note: 'Each step: what to do and why.' } },
    { heading: '## Real World Applications', words: Math.round(total * 0.12), note: 'Concrete examples of how this plays out in real life or business.' },
    { heading: '## Challenges to Consider', words: Math.round(total * 0.10), note: 'Honestly discuss common pitfalls, limitations, or things to watch for.' },
    { heading: '## Best Practices', bullets: 4, bulletWords: Math.round(total * 0.14 / 4), note: 'Each bullet actionable advice.' },
    { heading: '## Conclusion', words: Math.round(total * 0.14), note: 'Summarize key takeaways, reinforce the main message, forward-looking close.' },
  ]
}

function renderSectionPlan(plan) {
  return plan.map(s => {
    let text = `\n${s.heading}\n`
    text += s.bullets
      ? `Write ${s.bullets} bullet points. ${s.note} Each bullet should be about ${s.bulletWords} words.`
      : `${s.note} Write approximately ${s.words} words for this section.`
    if (s.subsection) {
      text += `\n\n${s.subsection.heading}\n`
      text += `Write ${s.subsection.bullets} bullet points. ${s.subsection.note} Each bullet should be about ${s.subsection.bulletWords} words.`
    }
    return text
  }).join('\n')
}

function buildBlogPrompt(topic, tone, language, keywords, audience, cta, wordCount, link) {
  const kwText = keywords?.length ? `Use these SEO keywords naturally: ${keywords.join(', ')}.` : ''
  const audText = audience ? `Target audience: ${audience}.` : ''
  const ctaText = cta && cta !== 'None' ? `End with a "${cta}" call to action.` : ''
  const linkText = link ? `Include this link naturally near the end of the article: ${link}` : ''

  const plan = buildSectionPlan(wordCount)
  const structure = renderSectionPlan(plan)
  const planTotal = plan.reduce((sum, s) => sum + (s.bullets ? s.bulletWords * s.bullets : s.words) + (s.subsection ? s.subsection.bulletWords * s.subsection.bullets : 0), 0)

  return `You are an expert blog writer. Fill in the template below with rich, detailed content about: ${topic}

Tone: ${tone}
Language: ${language}
${kwText}
${audText}
${ctaText}
${linkText}
The finished article must be AT LEAST ${wordCount} words. Follow the per-section word counts below closely — they add up to roughly ${planTotal} words, which is intentional, so the finished piece comfortably clears the ${wordCount}-word minimum even if a section or two runs a little short.

RULES:
- Keep every ## and ### heading exactly as shown
- Replace ALL placeholder text with real, detailed content
- Hit or exceed the word count given for EACH section below — never fall noticeably short of a section's number
- Each bullet = FULL SENTENCE or TWO, not a short phrase
- Each paragraph = MULTIPLE SENTENCES
- Add blank lines before/after headings and between sections
- Longer than the numbers below is fine. Shorter is not.

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
    const linkedInStructure = wordCount <= 100
      ? `- Hook line (1 punchy sentence)\n- 2 short body paragraphs (2 sentences each)\n- 1 closing CTA or question`
      : wordCount <= 180
      ? `- Hook line (1-2 sentences)\n- 3 body paragraphs (2-3 sentences each)\n- 1 closing insight or question\n- 1 CTA line`
      : `- Hook line (2 sentences that create curiosity)\n- 4 body paragraphs (3 sentences each, blank line between each)\n- 1 key takeaway paragraph (2 sentences)\n- 1 closing question or CTA${link ? " + link" : ""}`
    return `You are a strict LinkedIn content generator.

Generate 4 different LinkedIn post variations about: ${topic}
Tone: ${tone} | Language: ${language}
${kwText} ${audText} ${ctaText} ${linkText}

REQUIRED STRUCTURE — use this exact structure for every variation:
${linkedInStructure}

RULES:
- Write exactly 4 variations numbered 1. 2. 3. 4.
- Every variation must include ALL sections listed in the structure above
- Do not skip any section
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
    model: 'openai/gpt-oss-120b',
    temperature: 0.7,
    max_tokens: 6000,
    reasoning_effort: 'medium',
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
    console.log('=== wordCount:', wordCount, '| length:', length, '| platform:', platform)

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

    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt === 0) {
        rawText = await callGroq(prompt, isBlog)
      } else {
        if (!isBlog) break
        const v = countWords(content)
        const issues = []
        if (!content.includes('## ')) issues.push('MISSING ## headings')
        if (!content.includes('\n- ')) issues.push('MISSING bullet points')
        const minWords = Math.round(wordCount * 0.9)
        const maxWords = Math.round(wordCount * 2.5)
        if (v < minWords) issues.push(`TOO SHORT: got ${v} words, need at least ${wordCount}`)
        if (v > maxWords) issues.push(`TOO LONG: got ${v} words, need around ${wordCount}`)
        const wordsNeeded = wordCount - v
        const lengthInstruction = wordsNeeded > 0
          ? `The article is too SHORT. It currently has ${v} words but needs ${wordCount}. You MUST add approximately ${wordsNeeded} more words. Expand every section with more detail, examples, and explanation — do not just repeat what's already there, and do not shorten or remove any existing section.`
          : `The article is too LONG. It currently has ${v} words but needs ${wordCount}. Trim it down by approximately ${Math.abs(wordsNeeded)} words while keeping all sections and headings.`
        const retryPrompt = `The blog post below is supposed to be about: "${topic}"\n\nFix these problems:\n${issues.join('\n')}\n${lengthInstruction}\n\nKeep the same topic (${topic}) — do not change the subject. Return the complete corrected article at the full target length.\n\nPrevious:\n${content}`
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
