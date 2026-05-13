import { createClient } from './supabase'

const TODAY = () => new Date().toISOString().split('T')[0]

export async function getUserUsage(userId) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('plan, credits, searches_today, last_reset_date')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  // Reset daily usage if date changed
  if (data.last_reset_date !== TODAY()) {
    const { data: updated } = await supabase
      .from('profiles')
      .update({ searches_today: 0, last_reset_date: TODAY() })
      .eq('id', userId)
      .select('plan, credits, searches_today, last_reset_date')
      .single()
    return updated
  }

  return data
}

export async function incrementSearch(userId) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('searches_today')
    .eq('id', userId)
    .single()

  await supabase
    .from('profiles')
    .update({ searches_today: (data?.searches_today || 0) + 1 })
    .eq('id', userId)
}

export async function deductCredit(userId) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (!data || data.credits <= 0) return false

  await supabase
    .from('profiles')
    .update({ credits: data.credits - 1 })
    .eq('id', userId)

  return true
}

export async function addCredits(userId, amount) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  await supabase
    .from('profiles')
    .update({ credits: (data?.credits || 0) + amount })
    .eq('id', userId)
}
