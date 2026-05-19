'use client'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'

const FAQS = [
  { q: 'What is RANKIVO?', a: 'RANKIVO is an AI-powered content and SEO platform that helps you generate high-quality, SEO-optimized content for Instagram, TikTok, LinkedIn, blogs, YouTube, emails, ads and more — in seconds.' },
  { q: 'How many free posts do I get?', a: 'Free users get 3 posts per month at no cost. No credit card required to sign up. Free usage resets monthly, based on your subscription start date.' },
  { q: 'What platforms does RANKIVO support?', a: 'RANKIVO supports Instagram, TikTok, LinkedIn, Blog, YouTube Scripts, Twitter/X, Pinterest, Email and Ads — with more platforms being added regularly.' },
  { q: 'What languages are supported?', a: 'Currently we support English, Spanish, French, German, Arabic and Urdu. More languages are coming soon.' },
  { q: 'What is included in the SEO optimization?', a: 'Every piece of content includes SEO keyword integration, meta titles, meta descriptions, H1 headline options and hashtags (for social platforms).' },
  { q: 'Can I upgrade or downgrade my plan?', a: 'Yes. You can upgrade or downgrade your plan at any time from your account settings or the upgrade page.' },
  { q: 'How does the content history work?', a: 'Every piece of content you generate is automatically saved to your content history. You can access, copy and reuse it anytime from your dashboard.' },
  { q: 'Is my data secure?', a: 'Yes. We use Supabase for secure data storage with row-level security (RLS) enabled. Your content is protected with secure authentication and database-level security (RLS).' },
  { q: 'Can I cancel anytime?', a: 'Yes. There are no long-term contracts. You can cancel your subscription at any time.' },
  { q: 'Do you offer refunds?', a: 'We offer a 7-day money-back guarantee on eligible plans. Refunds are available within 7 days of purchase for eligible plans. Requests are reviewed based on account activity and usage to prevent abuse. Contact us at support@rankivo.co if you need a refund.' },
  { q: 'What is the difference between Pro and Premium?', a: 'Pro gives you 50 posts per month with full SEO tools and email support. Premium gives you 300 posts per month with priority generation and priority support.' },
  { q: 'How do I contact support?', a: 'You can reach us through the Contact page or email us at support@rankivo.co. We typically respond within 24 hours.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
        <span className="font-medium text-gray-900 pr-4">{q}</span>
        <span className={`text-[#1B5FA8] text-xl font-bold shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#0D9488]/10 text-[#0D9488] text-sm px-4 py-2 rounded-full font-medium mb-4">FAQ</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-500 text-lg">Everything you need to know about RANKIVO.</p>
          </div>
          <div className="space-y-3 mb-12">
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
          <div className="bg-gradient-to-br from-[#1B5FA8]/5 to-[#0D9488]/5 rounded-2xl p-8 text-center border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h2>
            <p className="text-gray-500 mb-5">We're happy to help. Reach out to us directly.</p>
            <Link href="/contact" className="bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-block">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
