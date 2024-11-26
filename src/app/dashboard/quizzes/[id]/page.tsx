'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, ListChecks, Star, Trophy, ChevronRight } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading'

interface Quiz {
  id: string
  title: string
  description: string
  time_limit: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: {
    name: string
  }
  education_system: {
    name: string
  }
  _count: {
    questions: number
  } | null
}

export default function QuizOverviewPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [previousBestScore, setPreviousBestScore] = useState<number | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const fetchQuizData = useCallback(async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select(`
          *,
          category:categories(name),
          education_system:education_systems(name),
          _count {
            questions: questions(count)
          }
        `)
        .eq('id', params.id)
        .single()

      if (quizError) throw quizError
      setQuiz(quizData)

      // Fetch user's previous best score if they're logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: scoreData } = await supabase
          .from('quiz_attempts')
          .select('score')
          .eq('quiz_id', params.id)
          .eq('user_id', session.user.id)
          .order('score', { ascending: false })
          .limit(1)
          .single()

        if (scoreData) {
          setPreviousBestScore(scoreData.score)
        }
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [params.id, supabase])

  useEffect(() => {
    fetchQuizData()
  }, [fetchQuizData])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!quiz) {
    return <div>Quiz not found</div>
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="space-y-4 text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold">{quiz.title}</h1>
        <div className="flex justify-center items-center gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
            {quiz.difficulty?.toUpperCase() || 'MEDIUM'}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{quiz.category?.name}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Time Limit</p>
            <p className="font-medium">{quiz.time_limit} minutes</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <ListChecks className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Questions</p>
            <p className="font-medium">{quiz._count?.questions || 0} questions</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <Star className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <p className="font-medium capitalize">{quiz.difficulty || 'Medium'}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <Trophy className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Best Score</p>
            <p className="font-medium">
              {previousBestScore !== null ? `${previousBestScore}%` : 'Not attempted'}
            </p>
          </div>
        </Card>
      </div>

      {/* Description and Instructions */}
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">About this Quiz</h2>
        <p className="text-muted-foreground mb-4">{quiz.description}</p>
        <div className="space-y-2">
          <h3 className="font-medium">Before you start:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Make sure you have a stable internet connection</li>
            <li>You have {quiz.time_limit} minutes to complete the quiz</li>
            <li>You can&apos;t pause the quiz once started</li>
            <li>Each question can only be answered once</li>
          </ul>
        </div>
      </Card>

      {/* Start Button */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="animate-pulse"
          onClick={() => router.push(`/quizzes/${quiz.id}/take`)}
        >
          Start Quiz
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 