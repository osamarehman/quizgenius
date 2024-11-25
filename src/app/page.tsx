import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function HomePage() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    // If user is not authenticated, redirect to auth page
    if (!session) {
      redirect('/auth')
    }

    // If user is authenticated, redirect to dashboard
    return redirect('/dashboard')
  } catch (error) {
    console.error('Auth error:', error)
    return redirect('/auth')
  }
}
