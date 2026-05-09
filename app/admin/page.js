'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({ total: 0, free: 0, paid: 0, suspended: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [adminTab, setAdminTab] = useState('overview')
  const [successMsg, setSuccessMsg] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { checkAdmin() }, [])

  useEffect(() => {
    let result = [...users]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.country || '').toLowerCase().includes(q)
      )
    }
    if (planFilter !== 'all') result = result.filter(u => (u.plan || 'free') === planFilter)
    if (statusFilter !== 'all') result = result.filter(u => statusFilter === 'suspended' ? u.suspended : !u.suspended)
    setFiltered(result)
  }, [search, planFilter, statusFilter, users])

  async function checkAdmin() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      router.push('/dashboard')
      return
    }
    setUser(currentUser)
    await loadUsers()
    await loadRecentActivity()
    setLoading(false)
  }

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) {
      setUsers(data)
      setFiltered(data)
      setStats({
        total: data.length,
        free: data.filter(u => !u.plan || u.plan === 'free').length,
        paid: data.filter(u => u.plan && u.plan !== 'free').length,
        suspended: data.filter(u => u.suspended).length,
      })
    }
  }

  async function loadRecentActivity() {
    const { data } = await supabase
      .from('content_history')
      .select('id, user_id, platform, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setRecentActivity(data)
  }

  function showSuccess(msg) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  async function updatePlan(userId, newPlan) {
    setUpdating(userId)
    await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId)
    await loadUsers()
    showSuccess('Plan updated.')
    setUpdating(null)
  }

  async function resetPosts(userId) {
    setUpdating(userId)
    await supabase.from('profiles').update({ posts_count: 0 }).eq('id', userId)
    await loadUsers()
    showSuccess('Posts reset.')
    setUpdating(null)
  }

  async function toggleSuspend(userId, suspended) {
    setUpdating(userId)
    await supabase.from('profiles').update({ suspended: !suspended }).eq('id', userId)
    await loadUsers()
    showSuccess(suspended ? 'User unsuspended.' : 'User suspended.')
    setUpdating(null)
  }

  async function makeAdmin(userId, isAdminNow) {
    setUpdating(userId)
    await supabase.from('profiles').update({ role: isAdminNow ? 'user' : 'admin' }).eq('id', userId)
    await loadUsers()
    showSuccess('Role updated.')
    setUpdating(null)
  }

  function openEdit(u) {
    setEditUser(u)
    setEditForm({
      full_name: u.full_name || '',
      country: u.country || '',
      city: u.city || '',
      state: u.state || '',
      zip: u.zip || '',
      phone: u.phone || '',
      plan: u.plan || 'free',
      posts_count: u.posts_count || 0,
    })
  }

  async function saveEdit() {
    setEditSaving(true)
    await supabase.from('profiles').update(editForm).eq('id', editUser.id)
    await loadUsers()
    showSuccess('User updated.')
    setEditUser(null)
    setEditSaving(false)
  }

  async function confirmDelete() {
    if (deleteConfirm !== deleteTarget?.email) return
    setDeleting(true)
    await supabase.from('content_history').delete().eq('user_id', deleteTarget.id)
    await supabase.from('profiles').delete().eq('id', deleteTarget.id)
    await loadUsers()
    showSuccess('User deleted.')
    setDeleteTarget(null)
    setDeleteConfirm('')
    setDeleting(false)
  }

  const planBadge = (plan) => {
    const styles = {
      agency: 'bg-purple-100 text-purple-700 border border-purple-200',
      pro: 'bg-blue-100 text-blue-700 border border-blue-200',
      starter: 'bg-teal-100 text-teal-700 border border-teal-200',
      free: 'bg-gray-100 text-gray-600 border border-gray-200',
    }
    return <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles[plan] || styles.free}`}>{(plan || 'free').toUpperCase()}</span>
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-[#1B5FA8] text-xl font-semibold">Loading Admin Panel...</div>
    </div>
  )

  const countries = ['Pakistan','United States','United Kingdom','United Arab Emirates','Saudi Arabia','India','Canada','Australia','Germany','France','Other']

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-[#0D9488] text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-[#1B5FA8]">RANKIVO</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500 font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#C9943A]/10 text-[#C9943A] px-2 py-1 rounded border border-[#C9943A]/20 font-semibold">ADMIN</span>
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={() => router.push('/dashboard')} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm transition-colors">
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-56 min-h-screen bg-white border-r border-gray-200 p-4 space-y-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'All Users' },
            { id: 'activity', label: 'Recent Activity' },
          ].map(t => (
            <button key={t.id} onClick={() => setAdminTab(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${adminTab === t.id ? 'bg-[#0D9488]/10 text-[#0D9488] font-semibold border border-[#0D9488]/20' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-8">

          {/* ── OVERVIEW ── */}
          {adminTab === 'overview' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
              <p className="text-gray-500 mb-6">Platform statistics at a glance.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: stats.total, color: 'text-[#1B5FA8]' },
                  { label: 'Free Users', value: stats.free, color: 'text-gray-700' },
                  { label: 'Paid Users', value: stats.paid, color: 'text-[#0D9488]' },
                  { label: 'Suspended', value: stats.suspended, color: 'text-red-500' },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-gray-400 text-sm mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Plan breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Plan Breakdown</h3>
                <div className="space-y-3">
                  {['free', 'starter', 'pro', 'agency'].map(plan => {
                    const count = users.filter(u => (u.plan || 'free') === plan).length
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                    const colors = { free: '#9CA3AF', starter: '#0D9488', pro: '#1B5FA8', agency: '#C9943A' }
                    return (
                      <div key={plan} className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-600 w-16 uppercase">{plan}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[plan] }} />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{count} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent users */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Recent Signups</h3>
                  <button onClick={() => setAdminTab('users')} className="text-xs text-[#0D9488] hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#1B5FA8]/10 flex items-center justify-center text-[#1B5FA8] text-xs font-bold">
                          {(u.full_name || u.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium">{u.full_name || 'No name'}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {planBadge(u.plan)}
                        <span className="text-xs text-gray-400">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ALL USERS ── */}
          {adminTab === 'users' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">All Users</h1>
              <p className="text-gray-500 mb-6">Search, filter, edit, and manage all users.</p>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-5">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, country..."
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#0D9488] w-72"
                />
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]">
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0D9488]">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <span className="text-sm text-gray-400 self-center">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">USER</th>
                        <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">PLAN</th>
                        <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">POSTS</th>
                        <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">STATUS</th>
                        <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">JOINED</th>
                        <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(u => (
                        <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1B5FA8]/10 flex items-center justify-center text-[#1B5FA8] text-sm font-bold shrink-0">
                                {(u.full_name || u.email || '?')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{u.full_name || <span className="text-gray-400 italic">No name</span>}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                                {u.country && <p className="text-xs text-gray-400">{u.city ? `${u.city}, ` : ''}{u.country}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={u.plan || 'free'}
                              onChange={e => updatePlan(u.id, e.target.value)}
                              disabled={updating === u.id}
                              className="border border-gray-200 text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#0D9488] bg-white text-gray-700"
                            >
                              <option value="free">Free</option>
                              <option value="starter">Starter</option>
                              <option value="pro">Pro</option>
                              <option value="agency">Agency</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700 font-medium">{u.posts_count || 0}</span>
                              <button onClick={() => resetPosts(u.id)} disabled={updating === u.id} className="text-xs text-gray-400 hover:text-[#0D9488] transition-colors">Reset</button>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {u.suspended
                              ? <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 font-medium">Suspended</span>
                              : <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded border border-green-200 font-medium">Active</span>
                            }
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-400">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setSelectedUser(u)} className="text-xs bg-gray-100 hover:bg-[#1B5FA8]/10 hover:text-[#1B5FA8] text-gray-600 px-2 py-1 rounded transition-colors">View</button>
                              <button onClick={() => openEdit(u)} className="text-xs bg-gray-100 hover:bg-[#0D9488]/10 hover:text-[#0D9488] text-gray-600 px-2 py-1 rounded transition-colors">Edit</button>
                              <button onClick={() => toggleSuspend(u.id, u.suspended)} disabled={updating === u.id} className={`text-xs px-2 py-1 rounded transition-colors ${u.suspended ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}>
                                {u.suspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                              <button onClick={() => { setDeleteTarget(u); setDeleteConfirm('') }} className="text-xs bg-red-100 hover:bg-red-200 text-red-500 px-2 py-1 rounded transition-colors">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">No users match your filters.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVITY ── */}
          {adminTab === 'activity' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Recent Activity</h1>
              <p className="text-gray-500 mb-6">Latest content generated across the platform.</p>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">USER ID</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">PLATFORM</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3">DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map(a => (
                      <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3 text-xs text-gray-500 font-mono">{a.user_id?.slice(0, 16)}...</td>
                        <td className="px-5 py-3"><span className="text-xs bg-[#1B5FA8]/10 text-[#1B5FA8] px-2 py-0.5 rounded border border-[#1B5FA8]/20 font-medium">{a.platform}</span></td>
                        <td className="px-5 py-3 text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {recentActivity.length === 0 && <tr><td colSpan={3} className="text-center py-10 text-gray-400 text-sm">No activity yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── VIEW USER MODAL ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Full Name', selectedUser.full_name || 'N/A'],
                ['Email', selectedUser.email || 'N/A'],
                ['Plan', (selectedUser.plan || 'free').toUpperCase()],
                ['Posts Used', selectedUser.posts_count || 0],
                ['Country', selectedUser.country || 'N/A'],
                ['City', selectedUser.city || 'N/A'],
                ['State', selectedUser.state || 'N/A'],
                ['ZIP', selectedUser.zip || 'N/A'],
                ['Phone', selectedUser.phone || 'N/A'],
                ['Status', selectedUser.suspended ? 'Suspended' : 'Active'],
                ['Role', selectedUser.role || 'user'],
                ['Joined', selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedUser(null)} className="w-full mt-5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium">Close</button>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text' },
                { label: 'City', key: 'city', type: 'text' },
                { label: 'State', key: 'state', type: 'text' },
                { label: 'ZIP', key: 'zip', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Posts Count', key: 'posts_count', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select value={editForm.country || ''} onChange={e => setEditForm({ ...editForm, country: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]">
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select value={editForm.plan || 'free'} onChange={e => setEditForm({ ...editForm, plan: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488]">
                  {['free', 'starter', 'pro', 'agency'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveEdit} disabled={editSaving} className="flex-1 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditUser(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-xl">⚠</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
                <p className="text-xs text-gray-400">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete <span className="font-semibold text-gray-800">{deleteTarget.full_name || deleteTarget.email}</span> and all their content history.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type their email to confirm:</label>
              <p className="text-xs text-gray-400 mb-1">{deleteTarget.email}</p>
              <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type email here..." className="w-full border border-red-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-red-400 text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={confirmDelete} disabled={deleting || deleteConfirm !== deleteTarget?.email} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40">
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
              <button onClick={() => { setDeleteTarget(null); setDeleteConfirm('') }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
