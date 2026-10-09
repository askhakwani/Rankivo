// lib/linkCheckerPlans.js
// One place for every Broken Link Checker limit. Change the numbers here and
// both API routes pick them up. (Update the pricing page to match.)

import { createClient } from './supabase'

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

// Returns 'guest' | 'free' | 'starter' | 'pro' | 'agency'
export async function getTier() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'guest'
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    const plan = PLAN_ALIASES[profile?.plan] || profile?.plan
    return PAID_PLANS.includes(plan) ? plan : 'free'
  } catch {
    return 'guest'
  }
}
