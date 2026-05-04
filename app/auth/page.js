'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
        setMessage('Check your email to verify your account!')
      }
    } catch (error) {
      setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EFF7FF 0%, #ffffff 50%, #F0FAFA 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #D4EEF9',
        boxShadow: '0 20px 60px rgba(27,95,168,0.12)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #1B5FA8, #0D9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '900', fontSize: '18px'
            }}>R</div>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#0B3D6B' }}>
              Rank<span style={{ color: '#0D9488' }}>ivo</span>
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0B3D6B', marginBottom: '6px' }}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            {isLogin ? 'Login to your Rankivo dashboard' : 'Start creating AI content today'}
          </p>
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#0B3D6B', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Sarah Johnson"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '8px',
                border: '1.5px solid #E5E7EB', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#0B3D6B', display: 'block', marginBottom: '6px' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: '8px',
              border: '1.5px solid #E5E7EB', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#0B3D6B', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: '8px',
              border: '1.5px solid #E5E7EB', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {message && (
          <div style={{
            padding: '12px', borderRadius: '8px', marginBottom: '16px',
            background: message.includes('Check') ? '#D1FAE5' : '#FEE2E2',
            color: message.includes('Check') ? '#065F46' : '#991B1B',
            fontSize: '13px'
          }}>
            {message}
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            width: '100%', padding: '13px', borderRadius: '8px',
            background: loading ? '#9CA3AF' : '#1B5FA8',
            color: 'white', border: 'none', fontSize: '15px',
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '16px'
          }}
        >
          {loading ? 'Please wait...' : isLogin ? 'Login to Rankivo' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: '#1B5FA8', fontWeight: '600', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up free' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  )
}
