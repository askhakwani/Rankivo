// lib/linkCheckerPlans.js
// One place for every Broken Link Checker limit. Change the numbers here and
// both API routes pick them up. (Update the pricing page to match.)
//
// getTier() asks lib/serverUser.js who is logged in (the login token is verified there).

import { getServerUser } from './serverUser'

// Max unique links checked per page scan
export const LINK_LIMITS = { guest: 25, free: 50, starter: 200, pro: 500, agency: 1000 }

// Max pages in one bulk scan
export const BATCH_LIMITS = { guest: 1, free: 1, starter: 5, pro: 10, agency: 25 }

// Page scans per hour, per IP address
export const SCAN_LIMITS = { guest: 15, free: 40, starter: 60, pro: 120, agency: 300 }

// Links checked per hour, per IP address
export const LINK_BUDGET = { guest: 300, free: 900, starter: 2000, pro: 5000, agency: 15000 }

// Returns 'guest' | 'free' | 'starter' | 'pro' | 'agency'
export async function getTier() {
  const user = await getServerUser()
  return user ? user.plan : 'guest'
}
