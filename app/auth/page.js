'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Only allow simple internal paths (letters, numbers, - _ /).
// Prevents "//dashboard" (from redirect=/dashboard) and open redirects like "//evil.com".
function safeRedirect(value) {
  const path = (value || '').replace(/^\/+/, '')
  return /^[a-zA-Z0-9\-_/]+$/.test(path) ? path : 'dashboard'
}

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
  const [fieldErrors, setFieldErrors] = useState({})

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const m = searchParams.get('mode')
    if (m === 'signup') setMode('signup')
    if (m === 'forgot') setMode('forgot')
  }, [searchParams])

  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const activated = searchParams.get('activated') || ''
  const activatedQuery = activated ? '?activated=' + encodeURIComponent(activated) : ''

  // After email verification, Supabase returns the user to this page with a session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        window.location.href = `/${redirectTo}${activatedQuery}`
      }
    })
    return () => subscription.unsubscribe()
  }, [redirectTo, activated])

  function switchMode(newMode) {
    setMode(newMode)
    setError('')
    setMessage('')
    setFieldErrors({})
  }

  function validate() {
    const errs = {}
    const cleanEmail = email.trim()
    if (!cleanEmail) errs.email = 'Please enter your email address.'
    else if (!EMAIL_REGEX.test(cleanEmail)) errs.email = 'Please enter a valid email address, like you@example.com.'

    if (mode === 'login' && !password) errs.password = 'Please enter your password.'
    if (mode === 'signup') {
      if (!fullName.trim()) errs.fullName = 'Please enter your full name.'
      if (!password) errs.password = 'Please choose a password.'
      else if (password.length < 8) errs.password = 'Password must be at least 8 characters.'
    }
    return errs
  }

  function friendlyAuthError(msg = '') {
    const m = msg.toLowerCase()
    if (m.includes('invalid login credentials')) return 'Incorrect email or password.'
    if (m.includes('email not confirmed')) return 'Please verify your email first. Check your inbox for the verification link.'
    if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a few minutes and try again.'
    return msg || 'Something went wrong. Please try again.'
  }

  async function handleSubmit() {
    setError('')
    setMessage('')
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    const cleanEmail = email.trim()
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      if (error) { setError(friendlyAuthError(error.message)); setLoading(false); return }
      window.location.href = `/${redirectTo}${activatedQuery}`
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { phone: phone, full_name: fullName, country: country, city: city, state: state, zip: zip } }
      })
      if (error) { setError(friendlyAuthError(error.message)); setLoading(false); return }
      setMessage(`Almost there! We've sent a verification link to ${cleanEmail}. Check your inbox (and spam folder), then click the link to activate your account. If you already have an account with this email, log in instead or reset your password.`)
    }

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) { setError(friendlyAuthError(error.message)); setLoading(false); return }
      setMessage('If an account exists for that email, a password reset link is on its way. Check your inbox and spam folder.')
    }

    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <a href="/" className="text-3xl font-bold text-[#1B5FA8]">RANKIVO</a>
          <div className="mt-2">
            <span className="inline-block bg-[#C9943A]/10 text-[#C9943A] text-xs px-3 py-1 rounded-full font-medium border border-[#C9943A]/20">AI Content and SEO Platform</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-[#0D9488]/10 border border-[#0D9488]/30 text-[#0D9488] text-sm px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]"
              />
              {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Your full name"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]"
                  />
              {fieldErrors.fullName && <p className="text-red-600 text-xs mt-1">{fieldErrors.fullName}</p>}
                </div>
                               <div>
                  <label className="block text-sm text-gray-600 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-500">
                    <option value="">Select your country</option>
                    <option>Afghanistan</option>
                    <option>Albania</option>
                    <option>Algeria</option>
                    <option>Andorra</option>
                    <option>Angola</option>
                    <option>Argentina</option>
                    <option>Armenia</option>
                    <option>Australia</option>
                    <option>Austria</option>
                    <option>Azerbaijan</option>
                    <option>Bahamas</option>
                    <option>Bahrain</option>
                    <option>Bangladesh</option>
                    <option>Barbados</option>
                    <option>Belarus</option>
                    <option>Belgium</option>
                    <option>Belize</option>
                    <option>Benin</option>
                    <option>Bhutan</option>
                    <option>Bolivia</option>
                    <option>Bosnia and Herzegovina</option>
                    <option>Botswana</option>
                    <option>Brazil</option>
                    <option>Brunei</option>
                    <option>Bulgaria</option>
                    <option>Burkina Faso</option>
                    <option>Burundi</option>
                    <option>Cambodia</option>
                    <option>Cameroon</option>
                    <option>Canada</option>
                    <option>Cape Verde</option>
                    <option>Central African Republic</option>
                    <option>Chad</option>
                    <option>Chile</option>
                    <option>China</option>
                    <option>Colombia</option>
                    <option>Comoros</option>
                    <option>Congo</option>
                    <option>Costa Rica</option>
                    <option>Croatia</option>
                    <option>Cuba</option>
                    <option>Cyprus</option>
                    <option>Czech Republic</option>
                    <option>Denmark</option>
                    <option>Djibouti</option>
                    <option>Dominica</option>
                    <option>Dominican Republic</option>
                    <option>Ecuador</option>
                    <option>Egypt</option>
                    <option>El Salvador</option>
                    <option>Equatorial Guinea</option>
                    <option>Eritrea</option>
                    <option>Estonia</option>
                    <option>Eswatini</option>
                    <option>Ethiopia</option>
                    <option>Fiji</option>
                    <option>Finland</option>
                    <option>France</option>
                    <option>Gabon</option>
                    <option>Gambia</option>
                    <option>Georgia</option>
                    <option>Germany</option>
                    <option>Ghana</option>
                    <option>Greece</option>
                    <option>Grenada</option>
                    <option>Guatemala</option>
                    <option>Guinea</option>
                    <option>Guinea-Bissau</option>
                    <option>Guyana</option>
                    <option>Haiti</option>
                    <option>Honduras</option>
                    <option>Hungary</option>
                    <option>Iceland</option>
                    <option>India</option>
                    <option>Indonesia</option>
                    <option>Iran</option>
                    <option>Iraq</option>
                    <option>Ireland</option>
                    <option>Israel</option>
                    <option>Italy</option>
                    <option>Ivory Coast</option>
                    <option>Jamaica</option>
                    <option>Japan</option>
                    <option>Jordan</option>
                    <option>Kazakhstan</option>
                    <option>Kenya</option>
                    <option>Kiribati</option>
                    <option>Kosovo</option>
                    <option>Kuwait</option>
                    <option>Kyrgyzstan</option>
                    <option>Laos</option>
                    <option>Latvia</option>
                    <option>Lebanon</option>
                    <option>Lesotho</option>
                    <option>Liberia</option>
                    <option>Libya</option>
                    <option>Liechtenstein</option>
                    <option>Lithuania</option>
                    <option>Luxembourg</option>
                    <option>Madagascar</option>
                    <option>Malawi</option>
                    <option>Malaysia</option>
                    <option>Maldives</option>
                    <option>Mali</option>
                    <option>Malta</option>
                    <option>Marshall Islands</option>
                    <option>Mauritania</option>
                    <option>Mauritius</option>
                    <option>Mexico</option>
                    <option>Micronesia</option>
                    <option>Moldova</option>
                    <option>Monaco</option>
                    <option>Mongolia</option>
                    <option>Montenegro</option>
                    <option>Morocco</option>
                    <option>Mozambique</option>
                    <option>Myanmar</option>
                    <option>Namibia</option>
                    <option>Nauru</option>
                    <option>Nepal</option>
                    <option>Netherlands</option>
                    <option>New Zealand</option>
                    <option>Nicaragua</option>
                    <option>Niger</option>
                    <option>Nigeria</option>
                    <option>North Korea</option>
                    <option>North Macedonia</option>
                    <option>Norway</option>
                    <option>Oman</option>
                    <option>Pakistan</option>
                    <option>Palau</option>
                    <option>Palestine</option>
                    <option>Panama</option>
                    <option>Papua New Guinea</option>
                    <option>Paraguay</option>
                    <option>Peru</option>
                    <option>Philippines</option>
                    <option>Poland</option>
                    <option>Portugal</option>
                    <option>Qatar</option>
                    <option>Romania</option>
                    <option>Russia</option>
                    <option>Rwanda</option>
                    <option>Saint Kitts and Nevis</option>
                    <option>Saint Lucia</option>
                    <option>Saint Vincent and the Grenadines</option>
                    <option>Samoa</option>
                    <option>San Marino</option>
                    <option>Sao Tome and Principe</option>
                    <option>Saudi Arabia</option>
                    <option>Senegal</option>
                    <option>Serbia</option>
                    <option>Seychelles</option>
                    <option>Sierra Leone</option>
                    <option>Singapore</option>
                    <option>Slovakia</option>
                    <option>Slovenia</option>
                    <option>Solomon Islands</option>
                    <option>Somalia</option>
                    <option>South Africa</option>
                    <option>South Korea</option>
                    <option>South Sudan</option>
                    <option>Spain</option>
                    <option>Sri Lanka</option>
                    <option>Sudan</option>
                    <option>Suriname</option>
                    <option>Sweden</option>
                    <option>Switzerland</option>
                    <option>Syria</option>
                    <option>Taiwan</option>
                    <option>Tajikistan</option>
                    <option>Tanzania</option>
                    <option>Thailand</option>
                    <option>Timor-Leste</option>
                    <option>Togo</option>
                    <option>Tonga</option>
                    <option>Trinidad and Tobago</option>
                    <option>Tunisia</option>
                    <option>Turkey</option>
                    <option>Turkmenistan</option>
                    <option>Tuvalu</option>
                    <option>Uganda</option>
                    <option>Ukraine</option>
                    <option>United Arab Emirates</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>Uruguay</option>
                    <option>Uzbekistan</option>
                    <option>Vanuatu</option>
                    <option>Vatican City</option>
                    <option>Venezuela</option>
                    <option>Vietnam</option>
                    <option>Yemen</option>
                    <option>Zambia</option>
                    <option>Zimbabwe</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Your city"
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="State"
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ZIP / Postal code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={e => setZip(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="12345"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone number (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
              </>
            )}

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D9488]"
                />
              {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button onClick={() => switchMode('forgot')} className="text-[#0D9488] text-sm hover:text-[#0D9488]/80 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Please wait...' : mode === 'login' ? 'Login to RANKIVO' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' ? (
              <p>No account? <button onClick={() => switchMode('signup')} className="text-[#1B5FA8] hover:text-[#1B5FA8]/80">Sign up free</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => switchMode('login')} className="text-[#1B5FA8] hover:text-[#1B5FA8]/80">Login</button></p>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  )
}

export default function Auth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-teal-400">Loading...</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
