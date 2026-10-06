// app/api/tools/broken-links/extract/route.js
// Step 1 of the Broken Link Checker: fetch ONE page and return the links on it.
// No AI is used, so this costs nothing in Groq credits.

import { createClient } from '../../../../../lib/supabase'
import { fetchWithRedirects, SafeFetchError } from '../../../../../lib/url-safety'
import { extractLinks } from '../../../../../lib/link-extractor'
import { rateLimit, getClientIp } from '../../../../../lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30 // seconds; lower or remove if your Vercel plan rejects it

// How many links one scan may check, by plan. Change these numbers any time.
const LINK_LIMITS = { guest: 50, free: 100, paid: 300 }
const PAID_PLANS = ['starter', 'pro', 'premium', 'agency']

// Scans per hour, per IP address
const SCAN_LIMITS = { guest: 15, member: 40 }
const HOUR = 60 * 60 * 1000

async function getTier() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'guest'
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    return PAID_PLANS.includes(profile?.plan) ? 'paid' : 'free'
  } catch {
    return 'guest'
  }
}

function errorResponse(message, status) {
  return Response.json({ error: message }, { status })
}

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid request.', 400)
    }

    let input = typeof body?.url === 'string' ? body.url.trim() : ''
    if (!input) return errorResponse('Please enter a page URL.', 400)
    if (input.length > 2000) return errorResponse('That URL is too long.', 400)
    if (!/^https?:\/\//i.test(input)) input = 'https://' + input

    const tier = await getTier()

    const limit = rateLimit(
      `extract:${getClientIp(request)}`,
      tier === 'guest' ? SCAN_LIMITS.guest : SCAN_LIMITS.member,
      HOUR
    )
    if (!limit.ok) {
      const minutes = Math.ceil(limit.retryAfter / 60)
      return errorResponse(`You have reached the scan limit. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`, 429)
    }

    let res
    try {
      res = await fetchWithRedirects(input, {
        method: 'GET',
        timeoutMs: 7000,
        totalMs: 10000,
        maxBytes: 2_000_000,
        headers: { Accept: 'text/html,application/xhtml+xml' },
      })
    } catch (e) {
      if (e instanceof SafeFetchError) {
        switch (e.code) {
          case 'INVALID_URL':
            return errorResponse('Please enter a valid web address, for example https://example.com/page', 400)
          case 'BLOCKED':
            return errorResponse('That address cannot be scanned. Enter a public web page.', 400)
          case 'TIMEOUT':
            return errorResponse('The page took too long to respond. Try again or use a different page.', 504)
          case 'DNS_NOT_FOUND':
            return errorResponse('That domain could not be found. Check the spelling of the URL.', 502)
          case 'SSL':
            return errorResponse('That site has an SSL certificate problem, so it could not be scanned.', 502)
          case 'TOO_MANY_REDIRECTS':
            return errorResponse('That URL redirects too many times.', 502)
          default:
            return errorResponse('Could not reach that page. Check the URL and try again.', 502)
        }
      }
      console.error('Broken link extract error:', e)
      return errorResponse('Could not reach that page. Check the URL and try again.', 502)
    }

    if (res.status === 404 || res.status === 410) {
      return errorResponse('That page returned a 404 (not found), so there is nothing to scan. Check the URL.', 422)
    }
    if (res.status >= 400) {
      return errorResponse(`That page returned an error (${res.status}) or blocked the scanner. Try a different page.`, 422)
    }

    const contentType = String(res.headers['content-type'] || '').toLowerCase()
    if (contentType && !/html|xml/.test(contentType)) {
      return errorResponse('That URL is not a web page (HTML). Enter the address of a page, not a file.', 422)
    }

    const finalUrl = new URL(res.finalUrl)
    const allLinks = extractLinks(res.body, finalUrl)
    const cap = LINK_LIMITS[tier]
    const links = allLinks.slice(0, cap)

    const titleMatch = res.body.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim().slice(0, 150) : ''

    return Response.json({
      pageUrl: finalUrl.toString(),
      title,
      tier,
      limit: cap,
      found: allLinks.length,
      truncated: allLinks.length > cap,
      links,
    })
  } catch (error) {
    console.error('Broken link extract error:', error)
    return errorResponse('Something went wrong while scanning that page. Please try again.', 500)
  }
}
