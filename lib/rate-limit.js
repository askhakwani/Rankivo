// lib/rate-limit.js
// Simple in-memory rate limiter.
//
// Honest limitation: on serverless hosting (Vercel) each warm instance has its own
// memory, so this is a best-effort brake against casual abuse, not a hard guarantee.
// If the tool gets heavy use, move the counters to a Supabase table.

const buckets = new Map()

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

// Returns { ok: true } or { ok: false, retryAfter } (seconds)
export function rateLimit(key, max, windowMs, cost = 1) {
  const now = Date.now()
  let bucket = buckets.get(key)
  if (!bucket || bucket.reset <= now) {
    bucket = { count: 0, reset: now + windowMs }
    buckets.set(key, bucket)
  }
  if (bucket.count + cost > max) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.reset - now) / 1000)) }
  }
  bucket.count += cost

  // Occasional cleanup so the map cannot grow forever
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k)
  }
  return { ok: true }
}
