// lib/link-extractor.js
// Pulls every <a href> link out of an HTML string.
// Returns unique links (fragments removed) in page order.

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&#(\d+);/g, (_, c) => safeChar(parseInt(c, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, c) => safeChar(parseInt(c, 16)))
    .replace(/&amp;/g, '&') // last, so "&amp;lt;" is not double-decoded
}

function safeChar(code) {
  try {
    return String.fromCodePoint(code)
  } catch {
    return ''
  }
}

function parseAttrs(attrString) {
  const attrs = {}
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g
  let m
  while ((m = re.exec(attrString))) {
    const name = m[1].toLowerCase()
    if (!(name in attrs)) attrs[name] = m[2] ?? m[3] ?? m[4] ?? ''
  }
  return attrs
}

function hostKey(hostname) {
  return hostname.toLowerCase().replace(/^www\./, '')
}

export function extractLinks(html, pageUrl) {
  const page = pageUrl instanceof URL ? pageUrl : new URL(pageUrl)

  const clean = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')

  // <base href="..."> changes how relative links resolve
  let base = page
  const baseMatch = clean.match(/<base\b([^>]*)>/i)
  if (baseMatch) {
    const href = parseAttrs(baseMatch[1]).href
    if (href) {
      try {
        base = new URL(decodeEntities(href.trim()), page)
      } catch {
        /* ignore a broken base tag */
      }
    }
  }

  const pageHost = hostKey(page.hostname)
  const seen = new Map()
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(clean))) {
    const attrs = parseAttrs(m[1])
    if (!attrs.href) continue
    const raw = decodeEntities(attrs.href.trim())
    if (!raw || raw.startsWith('#')) continue

    let u
    try {
      u = new URL(raw, base)
    } catch {
      continue
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') continue // skips mailto:, tel:, javascript: ...
    u.hash = ''
    const key = u.toString()

    const existing = seen.get(key)
    if (existing) {
      existing.count += 1
      continue
    }

    let anchor = decodeEntities(m[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
    if (!anchor) {
      const alt = m[2].match(/<img\b[^>]*\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
      const altText = alt ? decodeEntities((alt[1] ?? alt[2] ?? '').trim()) : ''
      anchor = altText ? `[image] ${altText}` : '[no anchor text]'
    }

    const rel = (attrs.rel || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t === 'nofollow' || t === 'sponsored' || t === 'ugc')

    seen.set(key, {
      url: key,
      anchor: anchor.slice(0, 120),
      rel: rel.join(' '),
      internal: hostKey(u.hostname) === pageHost,
      count: 1,
    })
  }
  return Array.from(seen.values())
}
