'use client'

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { useUser } from '@/lib/stores/useUser'
import { LoadingSpinner } from '@/components/ui/loading'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'

interface QuizAttempt {
  id: string
  quiz_id: string
  score: number
  completed_at: string
  quiz: {
    title: string
    category: {
      name: string
    }
  }
}

interface SubjectPerformance {
  subject: string
  attempts: number
  averageScore: number
}

export default function ProgressPage() {
  const { profile, isLoading, fetchProfile } = useUser()
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
    fetchQuizAttempts()
  }, [fetchProfile, fetchQuizAttempts])

  const fetchQuizAttempts = async () => {
    try {
      const { data: attempts, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz:quizzes (
            title,
            category:categories (name)
          )
        `)
        .order('completed_at', { ascending: false })

      if (error) throw error

      setQuizAttempts(attempts)
      calculateSubjectPerformance(attempts)
    } catch (error) {
      console.error('Error fetching quiz attempts:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const calculateSubjectPerformance = (attempts: QuizAttempt[]) => {
    const subjectStats: Record<string, { total: number, count: number }> = {}
    
    attempts.forEach(attempt => {
      const subject = attempt.quiz.category.name
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, count: 0 }
      }
      subjectStats[subject].total += attempt.score
      subjectStats[subject].count += 1
    })

    const performance = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      attempts: stats.count,
      averageScore: stats.total / stats.count
    }))

    setSubjectPerformance(performance)
  }

  if (isLoading || isLoadingData) {
    return <LoadingSpinner />
  }

  if (!profile) {
    return <div>Please sign in to view your progress</div>
  }

  const chartData = quizAttempts.map(attempt => ({
    date: format(new Date(attempt.completed_at), 'MMM d'),
    score: attempt.score
  })).reverse()

  const latestAttempt = quizAttempts[0]
  const lastAttemptDate = new Date(latestAttempt?.completed_at || Date.now())

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Progress</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Total Quizzes Completed</h3>
          <p className="text-2xl font-bold">{profile.total_quizzes_taken}</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Average Score</h3>
          <p className="text-2xl font-bold">{profile.average_score.toFixed(1)}%</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Study Streak</h3>
          <p className="text-2xl font-bold">{calculateStreak(quizAttempts)} days</p>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Score Progression</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#2563eb" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Subject Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Subject Performance</h2>
        <div className="space-y-4">
          {subjectPerformance.map((subject) => (
            <div key={subject.subject} className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium">{subject.subject}</h3>
                <div className="h-2 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${subject.averageScore}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{subject.averageScore.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">
                  {subject.attempts} attempts
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Attempts */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Attempts</h2>
        <div className="space-y-4">
          {quizAttempts.slice(0, 5).map((attempt) => (
            <div 
              key={attempt.id} 
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{attempt.quiz.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(attempt.completed_at), 'PPp')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{attempt.score}%</p>
                <p className="text-sm text-muted-foreground">
                  {attempt.quiz.category.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function calculateStreak(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  let lastAttemptDate = new Date(attempts[0].completed_at)

  // If no attempt today, check if there was one yesterday
  if (format(currentDate, 'yyyy-MM-dd') !== format(lastAttemptDate, 'yyyy-MM-dd')) {
    currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1))
  }

  for (let i = 0; i < attempts.length; i++) {
    const attemptDate = new Date(attempts[i].completed_at)
    if (format(currentDate, 'yyyy-MM-dd') === format(attemptDate, 'yyyy-MM-dd')) {
      streak++
      currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1))
    } else if (
      format(currentDate, 'yyyy-MM-dd') !== format(attemptDate, 'yyyy-MM-dd') &&
      i === 0
    ) {
      // First attempt is not from today/yesterday, break
      break
    }
  }

  return streak
} 