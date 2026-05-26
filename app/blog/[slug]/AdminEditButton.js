'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'askhakwani@gmail.com'

export default function AdminEditButton({ postId }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === ADMIN_EMAIL) setIsAdmin(true)
    })
  }, [])

  if (!isAdmin) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={`/admin?tab=blog&edit=${postId}`}
        className="flex items-center gap-2 bg-[#1B5FA8] hover:bg-[#1B5FA8]/90 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit this post
      </a>
    </div>
  )
}
