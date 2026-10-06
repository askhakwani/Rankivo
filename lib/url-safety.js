// lib/url-safety.js
// Safe outbound HTTP requests for tools that fetch URLs supplied by users.
//
// What this protects against (SSRF = server-side request forgery):
//  - Requests to private/internal addresses (localhost, 10.x, 192.168.x, 169.254.x cloud metadata, etc.)
//  - Redirects that send a safe-looking URL to an internal one (every hop is re-checked)
//  - DNS tricks: the IP address is validated at connection time, not just before it
//  - Non-standard ports, credentials in URLs, and non-http(s) protocols
//  - Huge responses (body reads are capped)
//
// Uses Node's built-in http/https modules, so no extra packages are needed.
// Must run on the Node.js runtime (not Edge).

import http from 'http'
import https from 'https'
import dns from 'dns'
import net from 'net'

export class SafeFetchError extends Error {
  constructor(code, message) {
    super(message || code)
    this.code = code
  }
}

const ALLOWED_PORTS = new Set(['', '80', '443']) // URL() returns '' for default ports
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308])

export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (compatible; RankivoLinkChecker/1.0; +https://www.rankivo.co)'

// ── IP address checks ───────────────────────────────────────────────────────
function isBlockedIPv4(ip) {
  const p = ip.split('.').map(Number)
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true
  const [a, b, c] = p
  if (a === 0 || a === 10 || a === 127) return true             // "this" network, private, loopback
  if (a === 100 && b >= 64 && b <= 127) return true             // carrier-grade NAT
  if (a === 169 && b === 254) return true                       // link-local (cloud metadata lives here)
  if (a === 172 && b >= 16 && b <= 31) return true              // private
  if (a === 192 && b === 168) return true                       // private
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true // reserved / documentation
  if (a === 198 && (b === 18 || b === 19)) return true          // benchmarking
  if (a === 198 && b === 51 && c === 100) return true           // documentation
  if (a === 203 && b === 0 && c === 113) return true            // documentation
  if (a >= 224) return true                                     // multicast / reserved
  return false
}

function isBlockedIPv6(ip) {
  const lower = ip.toLowerCase().split('%')[0]
  const first = lower.split(':')[0]
  if (first === '') return true                   // ::, ::1, ::ffff:x.x.x.x (IPv4-mapped) and similar
  const value = parseInt(first, 16)
  if (Number.isNaN(value)) return true
  if ((value & 0xe000) !== 0x2000) return true    // only allow global unicast 2000::/3
  if (value === 0x2002) return true               // 6to4 (embeds an IPv4 address)
  if (lower.startsWith('2001:db8')) return true   // documentation range
  return false
}

export function isBlockedIp(ip) {
  if (net.isIPv4(ip)) return isBlockedIPv4(ip)
  if (net.isIPv6(ip)) return isBlockedIPv6(ip)
  return true
}

// DNS lookup that refuses to resolve to blocked addresses. Used as the `lookup`
// option of http(s).request, so it runs at connection time (defeats DNS rebinding).
function guardedLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err)
    const list = Array.isArray(addresses) ? addresses : [{ address: addresses, family: 4 }]
    const allowed = list.filter(a => !isBlockedIp(a.address))
    if (allowed.length === 0) {
      const blocked = new Error('Blocked address')
      blocked.code = 'BLOCKED_ADDRESS'
      return callback(blocked)
    }
    if (options && options.all) return callback(null, allowed)
    callback(null, allowed[0].address, allowed[0].family)
  })
}

// ── URL checks ──────────────────────────────────────────────────────────────
export function assertSafeUrl(u) {
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new SafeFetchError('INVALID_URL', 'Only http and https links can be checked.')
  }
  if (u.username || u.password) {
    throw new SafeFetchError('INVALID_URL', 'URLs containing a username or password are not supported.')
  }
  if (!ALLOWED_PORTS.has(u.port)) {
    throw new SafeFetchError('BLOCKED', 'Only standard web ports (80 and 443) are supported.')
  }
  const host = u.hostname.replace(/^\[|\]$/g, '')
  if (!host || host.length > 253) {
    throw new SafeFetchError('INVALID_URL', 'Invalid web address.')
  }
  if (net.isIP(host) && isBlockedIp(host)) {
    throw new SafeFetchError('BLOCKED', 'That address cannot be checked.')
  }
}

function classifyError(e) {
  if (e instanceof SafeFetchError) return e
  const code = e.code || ''
  if (code === 'BLOCKED_ADDRESS') return new SafeFetchError('BLOCKED', 'That address cannot be checked.')
  if (code === 'ENOTFOUND' || code === 'ENODATA') return new SafeFetchError('DNS_NOT_FOUND', 'Domain not found.')
  if (code === 'EAI_AGAIN') return new SafeFetchError('DNS_TEMP', 'DNS lookup failed. Try again.')
  if (/CERT|SSL|TLS/i.test(code) || /certificate|self[- ]signed/i.test(e.message || '')) {
    return new SafeFetchError('SSL', 'SSL certificate problem.')
  }
  return new SafeFetchError('CONNECTION', 'Could not connect.')
}

// ── One request (no redirect following) ─────────────────────────────────────
function singleRequest(u, { method, timeoutMs, maxBytes, headers }) {
  return new Promise((resolve, reject) => {
    const isHttps = u.protocol === 'https:'
    const lib = isHttps ? https : http
    let settled = false
    const chunks = []
    let size = 0
    let status = 0
    let resHeaders = {}

    const timer = setTimeout(() => {
      req.destroy(new SafeFetchError('TIMEOUT', 'Timed out.'))
    }, timeoutMs)

    function done(err) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (err) return reject(classifyError(err))
      resolve({
        status,
        headers: resHeaders,
        body: maxBytes ? Buffer.concat(chunks).toString('utf8') : '',
      })
    }

    const req = lib.request(
      {
        protocol: u.protocol,
        hostname: u.hostname.replace(/^\[|\]$/g, ''),
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + u.search,
        method,
        agent: false,
        lookup: guardedLookup,
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          Accept: '*/*',
          'Accept-Encoding': 'identity', // no compression, so the body can be read as-is
          ...headers,
        },
      },
      res => {
        status = res.statusCode
        resHeaders = res.headers
        if (!maxBytes) {
          // Only the status line and headers are needed
          done()
          res.destroy()
          return
        }
        res.on('data', chunk => {
          size += chunk.length
          if (size > maxBytes) {
            chunks.push(chunk.subarray(0, chunk.length - (size - maxBytes)))
            res.destroy()
            done()
            return
          }
          chunks.push(chunk)
        })
        res.on('end', () => done())
        res.on('close', () => done())
        res.on('error', e => (chunks.length ? done() : done(e)))
      }
    )
    req.on('error', e => done(e))
    req.end()
  })
}

// ── Request with manual, validated redirect following ──────────────────────
// Returns { status, headers, body, finalUrl, chain }.
// chain = [{ url, status }] for each redirect hop that was followed.
// Throws SafeFetchError with one of these codes: INVALID_URL, BLOCKED, TIMEOUT,
// DNS_NOT_FOUND, DNS_TEMP, SSL, CONNECTION, TOO_MANY_REDIRECTS, INVALID_REDIRECT.
export async function fetchWithRedirects(startUrl, options = {}) {
  const {
    method = 'GET',
    headers = {},
    timeoutMs = 5000, // per request
    totalMs = 10000,  // across all redirect hops
    maxBytes = 0,     // 0 = do not read the body
    maxRedirects = 5,
  } = options

  const deadline = Date.now() + totalMs
  let current
  try {
    current = new URL(startUrl)
  } catch {
    throw new SafeFetchError('INVALID_URL', 'Invalid web address.')
  }

  const chain = []
  for (let hop = 0; hop <= maxRedirects; hop++) {
    assertSafeUrl(current)
    const remaining = deadline - Date.now()
    if (remaining < 250) throw new SafeFetchError('TIMEOUT', 'Timed out.')

    const res = await singleRequest(current, {
      method,
      headers,
      maxBytes,
      timeoutMs: Math.min(timeoutMs, remaining),
    })

    const location = res.headers.location
    if (REDIRECT_CODES.has(res.status) && location) {
      chain.push({ url: current.toString(), status: res.status })
      try {
        current = new URL(location, current)
      } catch {
        throw new SafeFetchError('INVALID_REDIRECT', 'Redirects to an invalid address.')
      }
      continue
    }
    return { ...res, finalUrl: current.toString(), chain }
  }
  throw new SafeFetchError('TOO_MANY_REDIRECTS', 'Too many redirects.')
}
