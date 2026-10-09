// app/api/tools/broken-links/check/route.js
// Step 2 of the Broken Link Checker: check up to 10 links per request.
// The browser calls this repeatedly, which gives a live progress bar and keeps
// every request well inside serverless time limits. No AI is used.

import { fetchWithRedirects } from '../../../../../lib/url-safety'
import { rateLimit, getClientIp } from '../../../../../lib/rate-limit'
import { LINK_BUDGET, getTier } from '../../../../../lib/linkCheckerPlans'

export const runtime = 'nodejs'
export const maxDuration = 30 // seconds; lower or remove if your Vercel plan rejects it

const MAX_URLS_PER_REQUEST = 10
const HOUR = 60 * 60 * 1000
const PER_LINK_DEADLINE_MS = 8000

// Turns a result (or error) into one of these statuses:
//   ok            2xx, no redirect
//   redirect      worked, but only after one or more redirects
//   broken        404 / 410, domain not found, or redirects to a 404
//   server_error  5xx (often temporary)
//   unverified    4xx other than 404/410 (usually the site blocking bots)
//   failed        timeout, SSL problem, connection error, redirect loop
function classifyResponse(res) {
  const code = res.status
  const chain = res.chain || []
  const redirected = chain.length > 0
  const redirectType = redirected ? ([301, 308].includes(chain[0].status) ? 'permanent' : 'temporary') : null
  const base = {
    code,
    finalUrl: redirected ? res.finalUrl : null,
    redirectType,
    hops: chain.length,
    firstRedirectCode: redirected ? chain[0].status : null,
  }

  if (code >= 200 && code < 300) {
    return redirected
      ? { ...base, status: 'redirect', note: '' }
      : { ...base, status: 'ok', note: '' }
  }
  if (code === 404 || code === 410) {
    return {
      ...base,
      status: 'broken',
      note: redirected ? 'Redirects to a page that no longer exists.' : 'Page not found.',
    }
  }
  if (code >= 500) {
    return { ...base, status: 'server_error', note: 'The server returned an error. This may be temporary.' }
  }
  if (code >= 400) {
    return {
      ...base,
      status: 'unverified',
      note: 'The site refused our automated check. Open the link yourself to confirm it works.',
    }
  }
  return { ...base, status: 'unverified', note: 'Unusual response. Open the link to confirm it works.' }
}

function classifyError(e) {
  const base = { code: null, finalUrl: null, redirectType: null, hops: 0, firstRedirectCode: null }
  switch (e?.code) {
    case 'DNS_NOT_FOUND':
      return { ...base, status: 'broken', note: 'Domain not found.' }
    case 'TIMEOUT':
      return { ...base, status: 'failed', note: 'The site took too long to respond.' }
    case 'SSL':
      return { ...base, status: 'failed', note: 'SSL certificate problem.' }
    case 'TOO_MANY_REDIRECTS':
      return { ...base, status: 'failed', note: 'Redirect loop or too many redirects.' }
    case 'BLOCKED':
      return { ...base, status: 'failed', note: 'Skipped for security: this address is not public.' }
    case 'INVALID_URL':
    case 'INVALID_REDIRECT':
      return { ...base, status: 'failed', note: 'Invalid or malformed address.' }
    case 'DNS_TEMP':
      return { ...base, status: 'failed', note: 'DNS lookup failed. Try again.' }
    default:
      return { ...base, status: 'failed', note: 'Could not connect to the site.' }
  }
}

async function checkLink(url) {
  const deadline = Date.now() + PER_LINK_DEADLINE_MS
  let res = null
  let err = null

  // 1) HEAD is lighter, so try it first
  try {
    res = await fetchWithRedirects(url, { method: 'HEAD', timeoutMs: 4000, totalMs: PER_LINK_DEADLINE_MS })
  } catch (e) {
    err = e
  }

  // 2) Some servers mishandle HEAD, so confirm any failure with GET before judging the link.
  //    Errors that GET cannot fix (blocked, bad URL, missing domain, SSL, loops) are final.
  const finalErrors = ['BLOCKED', 'INVALID_URL', 'INVALID_REDIRECT', 'DNS_NOT_FOUND', 'SSL', 'TOO_MANY_REDIRECTS']
  const needGet = err ? !finalErrors.includes(err.code) : res.status >= 400
  const remaining = deadline - Date.now()
  if (needGet && remaining > 800) {
    try {
      res = await fetchWithRedirects(url, {
        method: 'GET',
        timeoutMs: Math.min(4500, remaining),
        totalMs: remaining,
      })
      err = null
    } catch (e2) {
      if (!res) err = e2 // keep the HEAD result if there was one
    }
  }

  const outcome = err ? classifyError(err) : classifyResponse(res)
  return { url, ...outcome }
}

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 })
    }

    const urls = body?.urls
    if (!Array.isArray(urls) || urls.length === 0 || urls.length > MAX_URLS_PER_REQUEST) {
      return Response.json({ error: `Send between 1 and ${MAX_URLS_PER_REQUEST} links per request.` }, { status: 400 })
    }
    if (urls.some(u => typeof u !== 'string' || u.length > 2000)) {
      return Response.json({ error: 'Invalid link in request.' }, { status: 400 })
    }

    const tier = await getTier()
    const limit = rateLimit(
      `check:${getClientIp(request)}`,
      LINK_BUDGET[tier],
      HOUR,
      urls.length
    )
    if (!limit.ok) {
      const minutes = Math.ceil(limit.retryAfter / 60)
      return Response.json(
        { error: `You have reached the hourly link-check limit. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.` },
        { status: 429 }
      )
    }

    const results = await Promise.all(urls.map(checkLink))
    return Response.json({ results })
  } catch (error) {
    console.error('Broken link check error:', error)
    return Response.json({ error: 'Something went wrong while checking links. Please try again.' }, { status: 500 })
  }
}
