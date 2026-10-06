// app/api/tools/fetch-url/route.js
// PATCHED VERSION: identical behaviour to your current file, except the page is now
// fetched through lib/url-safety.js. That blocks requests to localhost, private
// networks and cloud-metadata addresses (SSRF), re-checks every redirect, and caps
// the download size. Everything else (extraction, entity decoding, limits) is unchanged.

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

    // Fetch the page with a browser-like User-Agent — many sites block
    // requests that don't look like they're coming from a real browser.
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

    // ── Extract meta title ──────────────────────────────────────────────
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const metaTitle = titleMatch ? decodeEntities(titleMatch[1].trim()) : ''

    // ── Extract meta description ────────────────────────────────────────
    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)
    const metaDescription = descMatch ? decodeEntities(descMatch[1].trim()) : ''

    // ── Extract visible body content ────────────────────────────────────
    let bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    let bodyHtml = bodyMatch ? bodyMatch[1] : html

    // Strip script/style/nav/header/footer blocks before extracting text,
    // since these usually aren't part of the actual article content.
    bodyHtml = bodyHtml
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')

    // Preserve paragraph/heading breaks as newlines before stripping tags,
    // so the extracted text still reads as separate lines/paragraphs.
    bodyHtml = bodyHtml.replace(/<\/(p|h1|h2|h3|h4|h5|h6|div|li|br)>/gi, '\n')

    let content = bodyHtml
      .replace(/<[^>]+>/g, ' ')     // strip remaining tags
      .replace(/[ \t]+/g, ' ')      // collapse repeated spaces
      .replace(/\n\s*\n+/g, '\n\n') // collapse repeated blank lines
      .trim()

    content = decodeEntities(content)

    if (!content || content.length < 50) {
      return Response.json(
        { error: 'Could not extract readable content from that page. Try pasting content manually.' },
        { status: 422 }
      )
    }

    // Cap content length to keep downstream AI calls reasonable
    content = content.slice(0, 6000)

    return Response.json({ content, metaTitle, metaDescription })

  } catch (error) {
    console.error('Fetch URL error:', error)
    return Response.json({ error: 'Could not fetch URL. Try pasting content manually.' }, { status: 500 })
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
    // Numeric decimal entities, e.g. &#39;
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    // Numeric hex entities, e.g. &#x27;
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
}
