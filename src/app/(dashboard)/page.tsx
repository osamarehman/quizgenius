'use client'

import { useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from '@/lib/stores/useUser'
import { LoadingSpinner } from '@/components/ui/loading'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Trophy,
  Target
} from 'lucide-react'

export default function DashboardPage() {
  const { profile, isLoading, fetchProfile } = useUser()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      fetchProfile()
    }
    
    checkSession()
  }, [fetchProfile, router, supabase.auth])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <Button onClick={() => router.push('/auth')}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {profile.full_name || 'Student'}!</h1>
        <p className="text-muted-foreground">
          Track your progress and continue learning
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
            <p className="text-2xl font-bold">{profile.total_quizzes_taken}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold">{profile.average_score.toFixed(1)}%</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Next Goal</p>
            <p className="text-2xl font-bold">80%</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          className="w-full"
          onClick={() => router.push('/dashboard/quizzes')}
        >
          Start New Quiz
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push('/dashboard/progress')}
        >
          View Progress
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push('/dashboard/learning-paths')}
        >
          Learning Paths
        </Button>
      </div>
    </div>
  )
}