'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [stats, setStats] = useState({ total: 0, free: 0, paid: 0 })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/dashboard')
      return
    }
    setUser(user)
    await loadUsers()
    setLoading(false)
  }

  async function loadUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setUsers(data)
      setStats({
        total: data.length,
        free: data.filter(u => u.plan === 'free' || !u.plan).length,
        paid: data.filter(u => u.plan && u.plan !== 'free').length,
      })
    }
  }

  async function updatePlan(userId, newPlan) {
    setUpdating(userId)
    await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId)
    await loadUsers()
    setUpdating(null)
  }

  async function resetPosts(userId) {
    setUpdating(userId)
    await supabase.from('profiles').update({ posts_count: 0, long_posts_count: 0 }).eq('id', userId)
    await loadUsers()
    setUpdating(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-teal-400 text-xl">Loading Admin Panel...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-400">RANKIVO Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Manage users and subscriptions</p>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
            Back to Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-gray-400 text-sm mt-1">Total Users</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.free}</p>
            <p className="text-gray-400 text-sm mt-1">Free Users</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-teal-400">{stats.paid}</p>
            <p className="text-gray-400 text-sm mt-1">Paid Users</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">EMAIL</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">PLAN</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">POSTS USED</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">JOINED</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-4 text-sm text-white">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        u.plan === 'agency' ? 'bg-purple-500/20 text-purple-400' :
                        u.plan === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                        u.plan === 'starter' ? 'bg-teal-500/20 text-teal-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {(u.plan || 'free').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{u.posts_count || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.plan || 'free'}
                          onChange={e => updatePlan(u.id, e.target.value)}
                          disabled={updating === u.id}
                          className="bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-teal-500">
                          <option value="free">Free</option>
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="agency">Agency</option>
                        </select>
                        <button
                          onClick={() => resetPosts(u.id)}
                          disabled={updating === u.id}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded border border-gray-700 transition-colors">
                          Reset Posts
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
