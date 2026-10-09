// lib/linkCheckerPlans.js
// One place for every Broken Link Checker limit. Change the numbers here and
// both API routes pick them up. (Update the pricing page to match.)
//
// getTier() reads the login cookie the same way app/api/generate/route.js does,
// then asks Supabase to verify the token, so a forged cookie cannot claim a plan.

import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Max unique links checked per page scan
export const LINK_LIMITS = { guest: 50, free: 100, starter: 300, pro: 500, agency: 1000 }

// Max pages in one bulk scan
export const BATCH_LIMITS = { guest: 1, free: 1, starter: 3, pro: 10, agency: 25 }

// Page scans per hour, per IP address
export const SCAN_LIMITS = { guest: 15, free: 40, starter: 60, pro: 120, agency: 300 }

// Links checked per hour, per IP address
export const LINK_BUDGET = { guest: 300, free: 900, starter: 2000, pro: 5000, agency: 15000 }

// Old plan names that should behave like a current plan
const PLAN_ALIASES = { premium: 'pro' }
const PAID_PLANS = ['starter', 'pro', 'agency']

// Remember a verified token's plan for a minute: the checker calls this on every request
const CACHE_MS = 60 * 1000
const tierCache = new Map() // access token -> { tier, expires }

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

// Returns 'guest' | 'free' | 'starter' | 'pro' | 'agency'
export async function getTier() {
  try {
    const cookieStore = await cookies()
    const token = readAccessToken(cookieStore)
    if (!token) return 'guest'

    const cached = tierCache.get(token)
    if (cached && cached.expires > Date.now()) return cached.tier

    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Supabase checks the token's signature and expiry for us
    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    if (userErr || !userData?.user) return 'guest'

    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', userData.user.id)
      .single()

    const plan = PLAN_ALIASES[profile?.plan] || profile?.plan
    const tier = PAID_PLANS.includes(plan) ? plan : 'free'

    if (tierCache.size > 500) tierCache.clear()
    tierCache.set(token, { tier, expires: Date.now() + CACHE_MS })
    return tier
  } catch {
    return 'guest'
  }
}
