import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function checkAdminStatus() {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('Session error:', sessionError)
      return null
    }

    if (!session) {
      console.log('No session found')
      return null
    }

    console.log('Session found:', session.user.id)

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.log('Profile error:', profileError)
      return null
    }

    if (!profile) {
      console.log('No profile found for user:', session.user.id)
      return null
    }

    console.log('Profile found:', profile)

    if (profile.role !== 'admin') {
      console.log('User is not admin. Role:', profile.role)
      return null
    }

    console.log('Admin access granted')
    return session.user
  } catch (error) {
    console.error('Error in checkAdminStatus:', error)
    return null
  }
}