import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request) {
  try {
    const { action, userId, requesterId } = await request.json()

    // Verify requester is admin
    const supabase = getAdminClient()
    const { data: { user } } = await supabase.auth.admin.getUserById(requesterId)
    if (!user || user.email !== ADMIN_EMAIL) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'delete_user') {
      // Delete content history
      await supabase.from('content_history').delete().eq('user_id', userId)
      // Delete profile
      await supabase.from('profiles').delete().eq('id', userId)
      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) return Response.json({ error: error.message }, { status: 500 })
      return Response.json({ success: true, message: 'User deleted' })
    }

    if (action === 'delete_posts') {
      const { error } = await supabase.from('content_history').delete().eq('user_id', userId)
      if (error) return Response.json({ error: error.message }, { status: 500 })
      return Response.json({ success: true, message: 'Posts deleted' })
    }

    if (action === 'reset_count') {
      const { error } = await supabase.from('profiles').update({ posts_count: 0 }).eq('id', userId)
      if (error) return Response.json({ error: error.message }, { status: 500 })
      return Response.json({ success: true, message: 'Post count reset' })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })

  } catch (error) {
    console.error('Admin error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
