import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ── Monthly limits per plan ───────────────────────────────────────────────────
export const POST_LIMITS = {
  free:    3,
  starter: 30,
  pro:     100,
  agency:  Infinity,
}

export const SEARCH_LIMITS = {
  free:    3,
  starter: 30,
  pro:     100,
  agency:  300,
}

const CURRENT_MONTH = () => new Date().toISOString().slice(0, 7) // "YYYY-MM"

// Service role client — bypasses RLS for server-side reads/writes
function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// ── checkGenerationPolicy ─────────────────────────────────────────────────────
export async function checkGenerationPolicy() {
  const supabase = adminClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Guest — always allowed, no tracking
  if (!user) {
    return {
      allowed: true,
      user:    null,
      isGuest: true,
      plan:    'guest',
    }
  }

  const admin = adminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('plan, posts_count, searches_count, reset_date, post_credits, search_credits')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return { allowed: true, user, isGuest: false, plan: 'free', postsUsed: 0, postsLimit: POST_LIMITS.free }
  }

  const plan        = profile.plan || 'free'
  const postsLimit  = POST_LIMITS[plan] ?? POST_LIMITS.free

  // Reset monthly counts if month changed
  let postsUsed    = profile.posts_count || 0
  let searchesUsed = profile.searches_count || 0
  const currentMonth = CURRENT_MONTH()

  if (!profile.reset_date || profile.reset_date.slice(0, 7) !== currentMonth) {
    await admin
      .from('profiles')
      .update({ posts_count: 0, searches_count: 0, reset_date: currentMonth + '-01' })
      .eq('id', user.id)
    postsUsed    = 0
    searchesUsed = 0
  }

  // Unlimited posts plan
  if (postsLimit === Infinity) {
    return { allowed: true, user, isGuest: false, plan, postsUsed, postsLimit: 'Unlimited', searchesUsed }
  }

  // Check post credits as fallback
  const postCredits = profile.post_credits || 0

  // Limit reached — check credits
  if (postsUsed >= postsLimit) {
    if (postCredits > 0) {
      return { allowed: true, user, isGuest: false, plan, postsUsed, postsLimit, searchesUsed, usingCredits: true }
    }
    return {
      allowed:   false,
      user,
      isGuest:   false,
      plan,
      postsUsed,
      postsLimit,
      searchesUsed,
      reason:    'LIMIT_REACHED',
      message:   `You've used all ${postsLimit} posts this month on the ${plan} plan. Upgrade or buy post credits.`,
      upgrade:   true,
    }
  }

  return { allowed: true, user, isGuest: false, plan, postsUsed, postsLimit, searchesUsed }
}

// ── checkSearchPolicy ─────────────────────────────────────────────────────────
export async function checkSearchPolicy(userId) {
  if (!userId) return { allowed: true, isGuest: true }

  const admin = adminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('plan, searches_count, reset_date, search_credits')
    .eq('id', userId)
    .single()

  if (error || !profile) return { allowed: true }

  const plan         = profile.plan || 'free'
  const searchLimit  = SEARCH_LIMITS[plan] ?? SEARCH_LIMITS.free
  const searchesUsed = profile.searches_count || 0
  const searchCredits = profile.search_credits || 0

  if (searchesUsed >= searchLimit) {
    if (searchCredits > 0) {
      return { allowed: true, usingCredits: true, searchesUsed, searchLimit }
    }
    return {
      allowed:      false,
      plan,
      searchesUsed,
      searchLimit,
      reason:       'SEARCH_LIMIT_REACHED',
      message:      `You've used all ${searchLimit} searches today on the ${plan} plan. Upgrade or buy search credits.`,
      upgrade:      true,
    }
  }

  return { allowed: true, plan, searchesUsed, searchLimit }
}

// ── incrementPostCount ────────────────────────────────────────────────────────
export async function incrementPostCount(userId) {
  if (!userId) return

  const admin = adminClient()
  const { data } = await admin
    .from('profiles')
    .select('posts_count, post_credits')
    .eq('id', userId)
    .single()

  const postsCount  = data?.posts_count || 0
  const postCredits = data?.post_credits || 0
  const planLimit   = POST_LIMITS[data?.plan || 'free'] ?? POST_LIMITS.free

  // If over plan limit, deduct from credits
  if (postsCount >= planLimit && postCredits > 0) {
    await admin.from('profiles').update({ post_credits: postCredits - 1 }).eq('id', userId)
  } else {
    await admin.from('profiles').update({ posts_count: postsCount + 1 }).eq('id', userId)
  }
}

// ── incrementSearchCount ──────────────────────────────────────────────────────
export async function incrementSearchCount(userId) {
  if (!userId) return

  const admin = adminClient()
  const { data } = await admin
    .from('profiles')
    .select('searches_count, search_credits, plan')
    .eq('id', userId)
    .single()

  const searchesCount  = data?.searches_count || 0
  const searchCredits  = data?.search_credits || 0
  const searchLimit    = SEARCH_LIMITS[data?.plan || 'free'] ?? SEARCH_LIMITS.free

  // If over plan limit, deduct from credits
  if (searchesCount >= searchLimit && searchCredits > 0) {
    await admin.from('profiles').update({ search_credits: searchCredits - 1 }).eq('id', userId)
  } else {
    await admin.from('profiles').update({ searches_count: searchesCount + 1 }).eq('id', userId)
  }
}
