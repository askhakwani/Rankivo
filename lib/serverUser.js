// lib/serverUser.js
// Server-side only. Answers "who is logged in, and on which plan?" for API routes.
//
// Why this exists: lib/supabase.js is a browser client, so on the server it cannot see
// the login. This reads the same Supabase auth cookie that app/api/generate/route.js reads,
// but also asks Supabase to verify the token, so a forged cookie cannot claim to be someone.

import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const KNOWN_PLANS = ['free', 'starter', 'pro', 'agency']
const PLAN_ALIASES = { premium: 'pro' } // old plan name

// Any unknown or missing plan counts as free
export function normalizePlan(plan) {
  const p = PLAN_ALIASES[plan] || plan
  return KNOWN_PLANS.includes(p) ? p : 'free'
}

// Service-role client: bypasses RLS, so use it only on the server
export function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Finds the access token in the Supabase auth cookie (handles chunked and base64- cookies)
function readAccessToken(cookieStore) {
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
  const baseName = `sb-${projectId}-auth-token`

  let raw = cookieStore.get(baseName)?.value
  if (!raw) {
    const chunks = []
    for (let i = 0; i < 10; i++) {
      const chunk = cookieStore.get(`${baseName}.${i}`)?.value
      if (!chunk) break
      chunks.push(chunk)
    }
    if (chunks.length) raw = chunks.join('')
  }
  if (!raw) return null

  const json = raw.startsWith('base64-')
    ? Buffer.from(raw.slice(7), 'base64').toString('utf-8')
    : decodeURIComponent(raw)
  return JSON.parse(json)?.access_token || null
}

// Remember a verified login for a minute: some tools call this many times per scan
const CACHE_MS = 60 * 1000
const cache = new Map() // access token -> { user, expires }

// Returns { id, email, plan } for a verified logged-in user, or null for a guest
export async function getServerUser() {
  try {
    const cookieStore = await cookies()
    const token = readAccessToken(cookieStore)
    if (!token) return null

    const cached = cache.get(token)
    if (cached && cached.expires > Date.now()) return cached.user

    const admin = adminClient()

    // Supabase checks the token's signature and expiry for us
    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    if (userErr || !userData?.user) return null

    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', userData.user.id)
      .single()

    const user = {
      id: userData.user.id,
      email: userData.user.email || null,
      plan: normalizePlan(profile?.plan),
    }

    if (cache.size > 500) cache.clear()
    cache.set(token, { user, expires: Date.now() + CACHE_MS })
    return user
  } catch {
    return null
  }
}
