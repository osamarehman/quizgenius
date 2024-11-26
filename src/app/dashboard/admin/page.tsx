'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin quizzes page
    router.push('/dashboard/admin/quizzes')
  }, [router])

  return null
}
