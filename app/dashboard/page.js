'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contentType, setContentType] = useState('📷 Instagram Caption')
  const [language, setLanguage] = useState('🌍 English')
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please describe your topic first!')
      return
    }
    setGenerating(true)
    setError('')
    setGeneratedContent('')
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, language, topic })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setGeneratedContent(data.content)
    } catch (err) {
      setError(err.message)
    }
    setGenerating(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'sans-serif', background: '#EFF7FF'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚡</div>
        <p style={{ color: '#1B5FA8', fontWeight: '600' }}>Loading Rankivo...</p>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F9FAFB' }}>

      {/* NAVBAR */}
      <nav style={{
        background: 'white', padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #1B5FA8, #0D9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '900', fontSize: '16px'
          }}>R</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0B3D6B' }}>
            Rank<span style={{ color: '#0D9488' }}>ivo</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>
            👋 {user?.user_metadata?.full_name || user?.email}
          </span>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1.5px solid #E5E7EB',
            padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
            cursor: 'pointer', color: '#6B7280'
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 64px)' }}>

        {/* SIDEBAR */}
        <div style={{ background: '#0B3D6B', padding: '24px 12px' }}>
          {[
            { icon: '🏠', label: 'Dashboard', active: true },
            { icon: '✦', label: 'Generate Content' },
            { icon: '🖼️', label: 'AI Images' },
            { icon: '🎬', label: 'Video Creator' },
            { icon: '📅', label: 'Calendar' },
            { icon: '🔍', label: 'SEO Tools' },
            { icon: '✍️', label: 'Order Editing' },
            { icon: '💳', label: 'Billing' },
            { icon: '⚙️', label: 'Settings' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
              background: item.active ? '#1B5FA8' : 'transparent',
              color: item.active ? 'white' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500'
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* MAIN */}
        <div style={{ padding: '32px', overflowY: 'auto' }}>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0B3D6B', marginBottom: '4px' }}>
              Welcome to Rankivo! 🚀
            </h1>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              Generate AI content instantly for any platform
            </p>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { icon: '✦', num: '0', label: 'Posts generated', color: '#1B5FA8' },
              { icon: '📈', num: '0', label: 'SEO score avg', color: '#0D9488' },
              { icon: '✍️', num: '3', label: 'Free posts left', color: '#C9943A' },
              { icon: '🔥', num: '0', label: 'Top viral score', color: '#1B5FA8' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: '14px', padding: '20px',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: stat.color }}>{stat.num}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* AI GENERATOR */}
          <div style={{
            background: 'white', borderRadius: '16px', padding: '28px',
            border: '1px solid #E5E7EB', marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0B3D6B', marginBottom: '20px' }}>
              ✦ AI Content Generator
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0B3D6B', display: 'block', marginBottom: '6px' }}>
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1.5px solid #E5E7EB', fontSize: '13px', background: 'white'
                  }}>
                  <option>📷 Instagram Caption</option>
                  <option>🎵 TikTok Caption</option>
                  <option>💼 LinkedIn Post</option>
                  <option>📝 SEO Blog Post</option>
                  <option>📧 Email Newsletter</option>
                  <option>📣 Ad Copy</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0B3D6B', display: 'block', marginBottom: '6px' }}>
                  Language
                </label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1.5px solid #E5E7EB', fontSize: '13px', background: 'white'
                  }}>
                  <option>🌍 English</option>
                  <option>🇪🇸 Spanish</option>
                  <option>🇫🇷 French</option>
                  <option>🇩🇪 German</option>
                  <option>🇸🇦 Arabic</option>
                  <option>🇵🇰 Urdu</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#0B3D6B', display: 'block', marginBottom: '6px' }}>
                Describe your topic or product
              </label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. A fitness app that helps busy professionals work out in 15 minutes..."
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '14px',
                  minHeight: '100px', resize: 'vertical', boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px', borderRadius: '8px', marginBottom: '16px',
                background: '#FEE2E2', color: '#991B1B', fontSize: '13px'
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                background: generating ? '#9CA3AF' : '#1B5FA8',
                color: 'white', border: 'none',
                padding: '12px 28px', borderRadius: '8px', fontSize: '14px',
                fontWeight: '600', cursor: generating ? 'not-allowed' : 'pointer'
              }}>
              {generating ? '⚡ Generating...' : '✦ Generate Content'}
            </button>
          </div>

          {/* GENERATED CONTENT */}
          {generatedContent && (
            <div style={{
              background: 'white', borderRadius: '16px', padding: '28px',
              border: '2px solid #0D9488', marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0D4A4A' }}>
                  ✅ Generated Content
                </h2>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? '#0D9488' : '#F0FAFA',
                    color: copied ? 'white' : '#0D9488',
                    border: '1.5px solid #0D9488',
                    padding: '7px 16px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div style={{
                background: '#F0FAFA', borderRadius: '10px', padding: '20px',
                fontSize: '14px', lineHeight: '1.8', color: '#374151',
                whiteSpace: 'pre-wrap'
              }}>
                {generatedContent}
              </div>
            </div>
          )}

          {/* PLAN UPGRADE */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF7FF, #F0FAFA)',
            borderRadius: '16px', padding: '24px', border: '1px solid #D4EEF9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B3D6B', marginBottom: '4px' }}>
                  🆓 Free Plan — 3 posts/month
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  Upgrade to Starter ($19/month) for unlimited AI content!
                </p>
              </div>
              <button style={{
                background: '#C9943A', color: 'white', border: 'none',
                padding: '10px 20px', borderRadius: '8px', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer'
              }}>
                Upgrade Now ⭐
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}