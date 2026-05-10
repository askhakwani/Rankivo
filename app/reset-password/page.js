'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Logo from '../../components/Logo'

function ResetForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', ok: true })
  const [ready, setReady] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Supabase puts the session in the URL hash on redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    setMsg({ text: '', ok: true })
    if (!password) { setMsg({ text: 'Please enter a new password.', ok: false }); return }
    if (password.length < 6) { setMsg({ text: 'Password must be at least 6 characters.', ok: false }); return }
    if (password !== confirm) { setMsg({ text: 'Passwords do not match.', ok: false }); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMsg({ text: error.message, ok: false })
    } else {
      setMsg({ text: 'Password updated! Redirecting to login...', ok: true })
      setTimeout(() => router.push('/auth'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <a href="/"><Logo size="lg" /></a>
          <p className="text-gray-400 text-sm mt-2">AI Content & SEO Platform</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#1B5FA8]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-[#1B5FA8] text-xl">🔒</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Set New Password</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your new password below.</p>
          </div>

          {!ready ? (
            <div className="text-center py-6">
              <div className="text-gray-400 text-sm mb-2">Verifying your reset link...</div>
              <div className="text-xs text-gray-300">If nothing happens, please request a new password reset link.</div>
              <a href="/auth?mode=forgot" className="mt-4 inline-block text-[#1B5FA8] text-sm hover:underline">Request new link</a>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  placeholder="Repeat your new password"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>

              {msg.text && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.ok ? 'bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                  {msg.text}
                </div>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          Remembered your password? <a href="/auth" className="text-[#1B5FA8] hover:underline">Login</a>
        </p>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#1B5FA8] font-semibold">Loading...</div>
      </div>
    }>
      <ResetForm />
    </Suspense>
  )
}
