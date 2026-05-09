'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthForm() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const m = searchParams.get('mode')
    if (m === 'signup') setMode('signup')
    if (m === 'forgot') setMode('forgot')
  }, [searchParams])

  async function handleSubmit() {
    setError('')
    setMessage('')
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (mode !== 'forgot' && !password.trim()) { setError('Please enter your password.'); return }
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.href = '/dashboard'
    }

    if (mode === 'signup') {
      if (!fullName.trim()) { setError('Please enter your full name.'); setLoading(false); return }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { phone: phone, full_name: fullName, country: country } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setMessage('Account created! Please check your email to verify your account.')
    }

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) { setError(error.message); setLoading(false); return }
      setMessage('Password reset link sent! Please check your email.')
    }

    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <a href="/" className="text-3xl font-bold text-teal-400">RANKIVO</a>
          <p className="text-gray-400 text-sm mt-2">AI Content and SEO Platform</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Your full name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500">
                    <option value="">Select your country</option>
                    <option>Pakistan</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>United Arab Emirates</option>
                    <option>Saudi Arabia</option>
                    <option>India</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Your city"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="State"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ZIP / Postal code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={e => setZip(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="12345"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone number (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </>
            )}

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button onClick={() => setMode('forgot')} className="text-teal-400 text-sm hover:text-teal-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Please wait...' : mode === 'login' ? 'Login to RANKIVO' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' ? (
              <p>No account? <button onClick={() => setMode('signup')} className="text-teal-400 hover:text-teal-300">Sign up free</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setMode('login')} className="text-teal-400 hover:text-teal-300">Login</button></p>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  )
}

export default function Auth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-teal-400">Loading...</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
