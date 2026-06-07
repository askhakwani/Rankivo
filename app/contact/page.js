'use client'
import { useState } from 'react'
...
'use client'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSending(true)
    // Log to console — replace with email service when ready
    console.log('Contact form submission:', form)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#C9943A]/10 text-[#C9943A] text-sm px-4 py-2 rounded-full font-medium mb-4">Get In Touch</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-gray-500 text-lg">We'd love to hear from you. We typically respond within 24 hours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">How Can We Help?</h2>
                {[
                  { icon: '✉', title: 'Email Us', desc: 'support@rankivo.co', sub: 'We reply within 24 hours', color: '#1B5FA8' },
                  { icon: '◈', title: 'Sales Enquiries', desc: 'sales@rankivo.co', sub: 'For enterprise and agency plans', color: '#0D9488' },
                  { icon: '◉', title: 'Report a Bug', desc: 'bugs@rankivo.co', sub: 'Help us improve RANKIVO', color: '#C9943A' },
                ].map(c => (
                  <div key={c.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                    <div className="text-xl w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ color: c.color, backgroundColor: c.color + '15' }}>{c.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                      <p className="text-sm font-medium mt-0.5" style={{ color: c.color }}>{c.desc}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5 rounded-xl p-6 border border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">Response Time</p>
                <p className="text-sm text-gray-500">We aim to respond to all messages within 24 hours during business days. For urgent issues, email us directly at support@rankivo.co</p>
              </div>
            </div>

            {/* Form */}
            {sent ? (
              <div className="flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 p-10">
                <div className="text-center">
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }} className="mt-5 text-[#1B5FA8] hover:underline text-sm">Send another message</button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-400">*</span></label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="What is this about?" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-400">*</span></label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={6} placeholder="Tell us how we can help..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0D9488] text-sm resize-none" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleSubmit} disabled={sending} className="w-full bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
