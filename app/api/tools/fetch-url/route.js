// app/api/tools/fetch-url/route.js
// UPDATED VERSION (scoring fix):
//  - reads only the article body (not breadcrumb / menus / related-post boxes)
//  - keeps headings as lines starting with ## (glued to the text so they add no extra "words")
//  - keeps links as [anchor text](link); links to your own site become /relative-paths,
//    so the SEO score tool can detect internal links
//  - drops standalone date lines
//  - no longer cuts content at 6000 characters (that would chop 1,000+ word articles)
// The safe-fetch protection (lib/url-safety.js) is unchanged.

import { fetchWithRedirects, SafeFetchError } from '../../../../lib/url-safety'

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url || !url.trim()) {
      return Response.json({ error: 'URL is required.' }, { status: 400 })
    }

    let targetUrl
    try {
      targetUrl = new URL(url.trim())
    } catch {
      return Response.json({ error: 'Please enter a valid URL (including https://).' }, { status: 400 })
    }

    let res
    try {
      res = await fetchWithRedirects(targetUrl.toString(), {
        method: 'GET',
        timeoutMs: 10000,
        totalMs: 10000,
        maxBytes: 2_000_000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
      })
    } catch (fetchError) {
      if (fetchError instanceof SafeFetchError) {
        if (fetchError.code === 'TIMEOUT') {
          return Response.json({ error: 'The page took too long to respond. Try pasting content manually.' }, { status: 504 })
        }
        if (fetchError.code === 'BLOCKED' || fetchError.code === 'INVALID_URL') {
          return Response.json({ error: 'That address cannot be fetched. Enter a public web page URL.' }, { status: 400 })
        }
      }
      return Response.json({ error: 'Could not reach that URL. Try pasting content manually.' }, { status: 502 })
    }

    if (res.status >= 400) {
      return Response.json(
        { error: `That page returned an error (${res.status}). Try pasting content manually.` },
        { status: 502 }
      )
    }

    const html = res.body

    // ── Meta title ──────────────────────────────────────────────────────
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const metaTitle = titleMatch ? decodeEntities(titleMatch[1].trim()) : ''

    // ── Meta description ────────────────────────────────────────────────
    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)
    const metaDescription = descMatch ? decodeEntities(descMatch[1].trim()) : ''

    // ── Article text ────────────────────────────────────────────────────
    const content = extractArticleText(html, targetUrl)

    if (!content || content.length < 50) {
      return Response.json(
        { error: 'Could not extract readable content from that page. Try pasting content manually.' },
        { status: 422 }
      )
    }

    return Response.json({ content: content.slice(0, 40000), metaTitle, metaDescription })

  } catch (error) {
    console.error('Fetch URL error:', error)
    return Response.json({ error: 'Could not fetch URL. Try pasting content manually.' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────
function extractArticleText(html, baseUrl) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  let scope = bodyMatch ? bodyMatch[1] : html

  // Remove things that are never article text
  scope = scope
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')

  // Pick the container: the longest <article>, else <main>, else the whole page
  let container = ''
  const articles = [...scope.matchAll(/<article[\s\S]*?<\/article>/gi)].map(m => m[0])
  if (articles.length) {
    container = articles.sort((a, b) => b.length - a.length)[0]
  }
  if (container.length < 1500) {
    const mainMatch = scope.match(/<main[\s\S]*?<\/main>/i)
    if (mainMatch && mainMatch[0].length > container.length) container = mainMatch[0]
  }

  if (container.length >= 1500) {
    // Inside an article/main: drop menus, footers, side boxes and forms (keep <header>, it often holds the title)
    container = container
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<form[\s\S]*?<\/form>/gi, ' ')
  } else {
    // No article/main found: use the whole page minus site menus
    container = scope
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<form[\s\S]*?<\/form>/gi, ' ')
  }

  // Start at the first <h1> — everything before it (breadcrumb, category tag) is not article text
  const h1Index = container.search(/<h1[\s>]/i)
  if (h1Index > 0) container = container.slice(h1Index)

  // Headings -> "##Heading text" (marker glued to the text so it doesn't count as an extra word)
  let t = container.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => {
    const text = stripTags(inner)
    return text ? `\n\n${'#'.repeat(Number(level))}${text}\n\n` : '\n'
  })

  // Links -> [anchor text](link). Own-site links become /relative-paths.
  t = t.replace(/<a\s[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
    const text = stripTags(inner)
    if (!text) return ''
    const link = normalizeHref(href, baseUrl)
    return link ? `[${text}](${link})` : text
  })

  // Paragraph / list / line breaks
  t = t
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|ul|ol|tr|blockquote|section|figure|table)>/gi, '\n')

  // Remove remaining tags, clean up lines
  t = decodeEntities(t.replace(/<[^>]+>/g, ' '))

  const dateLine = /^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}$/i

  const lines = t
    .split('\n')
    .map(l => l.replace(/[ \t]+/g, ' ').trim())
    .filter(l => l && !dateLine.test(l))

  return lines.join('\n\n').trim()
}

function stripTags(str) {
  return decodeEntities(str.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function normalizeHref(href, baseUrl) {
  const h = decodeEntities(href.trim())
  if (!h || h.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(h)) return null
  try {
    const u = new URL(h, baseUrl)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    const sameSite = u.hostname.replace(/^www\./, '') === baseUrl.hostname.replace(/^www\./, '')
    const out = sameSite ? (u.pathname + u.search) || '/' : u.toString()
    return out.replace(/\s/g, '%20').replace(/\)/g, '%29')
  } catch {
    return null
  }
}

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
}
