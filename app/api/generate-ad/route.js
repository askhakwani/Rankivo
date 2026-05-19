import Anthropic from '@anthropic-ai/sdk'
import { checkGenerationPolicy } from '../../../lib/usagePolicy'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 60

function buildAdPrompt(product, audience, tone, cta, link, hasImage) {
  const linkText = link ? `Include this link naturally in the CTA: ${link}` : ''
  const imageInstruction = hasImage
    ? `An image has been provided. Carefully analyze it — identify the product, colors, mood, setting, lifestyle context, and emotional tone. Use these visual details heavily in your copy.`
    : `No image provided. Generate based on text inputs only.`

  return `You are a senior performance marketing expert and creative ad strategist.

${imageInstruction}

Generate HIGH-CONVERTING ad copy based on:
- Product/Service: ${product}
- Target Audience: ${audience || 'General audience'}
- Tone: ${tone || 'Professional'}
- CTA Style: ${cta || 'Learn More'}
${linkText}

STRICT RULES:
- Keep language natural, not robotic
- Focus on scroll-stopping hooks and emotional or benefit-driven messaging
- Avoid generic AI phrases like "unlock potential" or "best solution ever"
- Each variation must have a different angle (emotional, benefit, urgency, social proof)
- Headline: max 8 words, punchy
- Primary Text: 2-4 lines, conversational
- CTA: short action phrase${link ? ' with the link' : ''}

OUTPUT EXACTLY THIS FORMAT (no extra text before or after):
🔥 Variation 1:
Headline: [headline here]
Primary Text: [text here]
CTA: [cta here]

🔥 Variation 2:
Headline: [headline here]
Primary Text: [text here]
CTA: [cta here]

🔥 Variation 3:
Headline: [headline here]
Primary Text: [text here]
CTA: [cta here]

🔥 Variation 4:
Headline: [headline here]
Primary Text: [text here]
CTA: [cta here]
${hasImage ? `
🖼️ Visual Insight:
[Describe what the image communicates and what creative style would perform best based on it]

💡 Hook Ideas:
- [Hook 1 inspired by image]
- [Hook 2 inspired by image]
- [Hook 3 inspired by image]` : ''}`
}

function parseAdVariations(raw) {
  const variations = []
  const blocks = raw.split(/🔥 Variation \d+:/g).filter(b => b.trim())

  for (const block of blocks) {
    const headlineMatch = block.match(/Headline:\s*(.+)/i)
    const textMatch     = block.match(/Primary Text:\s*([\s\S]+?)(?=CTA:|$)/i)
    const ctaMatch      = block.match(/CTA:\s*(.+)/i)

    if (headlineMatch || textMatch || ctaMatch) {
      variations.push({
        headline:    headlineMatch?.[1]?.trim() || '',
        primaryText: textMatch?.[1]?.trim() || '',
        cta:         ctaMatch?.[1]?.trim() || '',
      })
    }
  }
  return variations
}

function parseVisualInsight(raw) {
  const insightMatch = raw.match(/🖼️ Visual Insight:\s*([\s\S]+?)(?=💡 Hook Ideas:|$)/i)
  return insightMatch?.[1]?.trim() || ''
}

function parseHookIdeas(raw) {
  const hooksMatch = raw.match(/💡 Hook Ideas:\s*([\s\S]+?)$/i)
  if (!hooksMatch) return []
  return hooksMatch[1]
    .split('\n')
    .map(l => l.replace(/^-\s*/, '').trim())
    .filter(Boolean)
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const product  = formData.get('product') || ''
    const audience = formData.get('audience') || ''
    const tone     = formData.get('tone') || 'Professional'
    const cta      = formData.get('cta') || 'Learn More'
    const link     = formData.get('link') || ''
    const imageFile = formData.get('image') || null

    if (!product.trim()) {
      return Response.json({ error: 'Product/Service is required' }, { status: 400 })
    }

    // Auth check
    const policy = await checkGenerationPolicy()
    const isGuest = policy.isGuest

    if (!isGuest && !policy.allowed) {
      return Response.json({
        error: 'LIMIT_REACHED',
        message: policy.message,
        upgrade: true,
        postsUsed: policy.postsUsed,
        postsLimit: policy.postsLimit,
        plan: policy.plan,
      }, { status: 403 })
    }

    const hasImage = !!imageFile && imageFile.size > 0
    const prompt = buildAdPrompt(product, audience, tone, cta, link, hasImage)

    let rawText = ''

    if (hasImage) {
      // Claude with image
      const imageBuffer = await imageFile.arrayBuffer()
      const imageBase64 = Buffer.from(imageBuffer).toString('base64')
      const mediaType   = imageFile.type || 'image/jpeg'

      const response = await anthropic.messages.create({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            {
              type:   'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            { type: 'text', text: prompt },
          ],
        }],
      })
      rawText = response.content.map(b => b.type === 'text' ? b.text : '').join('')
    } else {
      // Claude text-only for ad copy (better quality than Groq for structured ad format)
      const response = await anthropic.messages.create({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })
      rawText = response.content.map(b => b.type === 'text' ? b.text : '').join('')
    }

    const variations    = parseAdVariations(rawText)
    const visualInsight = hasImage ? parseVisualInsight(rawText) : ''
    const hookIdeas     = hasImage ? parseHookIdeas(rawText) : []

    // Track usage for logged-in users
    if (!isGuest) {
      const { incrementPostCount } = await import('../../../lib/usagePolicy')
      await incrementPostCount(policy.user?.id)
    }

    // Guest gets first variation only (others blurred on frontend)
    return Response.json({
      isGuest,
      isPreview: isGuest,
      hasImage,
      variations,
      visualInsight,
      hookIdeas,
    })

  } catch (error) {
    console.error('Ad generation error:', error)
    return Response.json({ error: 'Generation failed: ' + error.message }, { status: 500 })
  }
}
