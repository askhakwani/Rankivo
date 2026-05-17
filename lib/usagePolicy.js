import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ── Monthly post limits per plan ──────────────────────────────────────────────
export const POST_LIMITS = {
  free:    3,
  starter: 50,
  pro:     200,
  agency:  Infinity,
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
// Only enforces limits for logged-in users.
// Guests always get { allowed: true, isGuest: true } — no tracking, no state.

export async function checkGenerationPolicy() {
  const supabase = adminClient()

  // 1. Check auth — note: server-side getUser() won't work without cookie context.
  // This function is now only used as a fallback; route.js handles auth directly.
  const { data: { user } } = await supabase.auth.getUser()

  // Guest — always allowed, no tracking
  if (!user) {
    return {
      allowed:  true,
      user:     null,
      isGuest:  true,
      plan:     'guest',
    }
  }

  // 2. Fetch profile using admin client so RLS doesn't block
  const admin = adminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('plan, posts_count, reset_date')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return { allowed: true, user, isGuest: false, plan: 'free', postsUsed: 0, postsLimit: POST_LIMITS.free }
  }

  const plan       = profile.plan || 'free'
  const postsLimit = POST_LIMITS[plan] ?? POST_LIMITS.free

  // 3. Reset monthly count if month changed
  let postsUsed      = profile.posts_count || 0
  const currentMonth = CURRENT_MONTH()

  if (!profile.reset_date || profile.reset_date.slice(0, 7) !== currentMonth) {
    await admin
      .from('profiles')
      .update({ posts_count: 0, reset_date: currentMonth })  // stored as YYYY-MM
      .eq('id', user.id)
    postsUsed = 0
  }

  // 4. Unlimited plans — always allow
  if (postsLimit === Infinity) {
    return { allowed: true, user, isGuest: false, plan, postsUsed, postsLimit: 'Unlimited' }
  }

  // 5. Limit reached
  if (postsUsed >= postsLimit) {
    return {
      allowed:    false,
      user,
      isGuest:    false,
      plan,
      postsUsed,
      postsLimit,
      reason:     'LIMIT_REACHED',
      message:    `You've used all ${postsLimit} posts this month on the ${plan} plan. Upgrade to generate more.`,
      upgrade:    true,
    }
  }

  // 6. Allowed
  return { allowed: true, user, isGuest: false, plan, postsUsed, postsLimit }
}

// ── incrementPostCount ────────────────────────────────────────────────────────
// Call this AFTER successful generation. Only runs for logged-in users.
// Uses service role key to bypass RLS — safe because userId is always
// the authenticated user's id passed from the verified server session.

export async function incrementPostCount(userId) {
  if (!userId) return

  // Use service role key so RLS doesn't block server-side writes
  const admin = adminClient()

  const { data } = await admin
    .from('profiles')
    .select('posts_count')
    .eq('id', userId)
    .single()

  await admin
    .from('profiles')
    .update({ posts_count: (data?.posts_count || 0) + 1 })
    .eq('id', userId)
}
