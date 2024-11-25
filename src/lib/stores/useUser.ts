import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UserProfile {
  id: string
  full_name: string | null
  first_name?: string | null
  avatar_url: string | null
  email: string
  education_level?: string
  preferred_subjects?: string[]
  total_quizzes_taken: number
  average_score: number
}

interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

export const useUser = create<UserState>((set) => ({
  profile: null,
  isLoading: true,
  fetchProfile: async () => {
    const supabase = createClientComponentClient()
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        set({ profile: null, isLoading: false })
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      const firstName = profile.full_name?.split(' ')[0] || null
      console.log('Extracted first name:', firstName)

      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('user_id', session.user.id)

      if (attemptsError) throw attemptsError

      const totalQuizzes = attempts?.length || 0
      const averageScore = attempts?.length > 0
        ? attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.length
        : 0

      const updatedProfile = {
        ...profile,
        first_name: firstName,
        total_quizzes_taken: totalQuizzes,
        average_score: averageScore,
        email: session.user.email!
      }

      console.log('Updated profile:', updatedProfile)

      set({
        profile: updatedProfile,
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      set({ isLoading: false })
    }
  },
  updateProfile: async (data) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session.user.id)

      if (error) throw error

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null
      }))
    } catch (error) {
      console.error('Error updating user profile:', error)
    }
  }
})) 