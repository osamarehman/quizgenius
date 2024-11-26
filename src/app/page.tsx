import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return redirect('/auth')
    }

    // Check if user is admin for admin dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role === 'admin') {
      return redirect('/admin/dashboard')
    }

    return redirect('/dashboard')
  } catch (authError) {
    console.error('Auth error:', authError)
    return redirect('/auth')
  }
}
