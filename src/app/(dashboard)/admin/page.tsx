'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Redirect to admin quizzes page
    router.push('/dashboard/admin/quizzes')
  }, [router])

  return null
}
