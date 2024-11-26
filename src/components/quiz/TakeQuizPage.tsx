'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from '@/components/ui/loading'
import { QuizFeedback } from '@/components/quiz/QuizFeedback'
import { QuizOverview } from '@/components/quiz/QuizOverview'
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from '@/hooks/use-toast'
import { Timer } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  question_type: string
  question_explanation: string
  answers: {
    id: string
    answer_text: string
    is_correct: boolean
    explanation: string
  }[]
}

interface Quiz {
  id: string
  title: string
  time_limit: number
  difficulty: string
  questions: Question[]
}

interface QuizResults {
  score: number
  timeSpent: number
  correctAnswers: number
  questionFeedback: Array<{
    questionText: string
    isCorrect: boolean
    userAnswer: string
    correctAnswer: string
    explanation: string
  }>
}

export function TakeQuizPage({ quizId }: { quizId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [startTime] = useState(Date.now())
  const [isComplete, setIsComplete] = useState(false)
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const loadQuiz = useCallback(async () => {
    try {
      const { data: quizData, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          time_limit,
          difficulty,
          questions (
            id,
            question_text,
            question_type,
            question_explanation,
            answers (
              id,
              answer_text,
              is_correct,
              explanation
            )
          )
        `)
        .eq('id', quizId)
        .single()

      if (error) throw error
      setQuiz(quizData)
    } catch (error) {
      console.error('Error loading quiz:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [quizId, toast, supabase])

  useEffect(() => {
    loadQuiz()
  }, [loadQuiz])

  const handleAnswerSelect = useCallback((questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!quiz || isSubmitting) return

    // If not showing confirmation dialog and not all questions are answered
    if (!showConfirmSubmit && Object.keys(selectedAnswers).length < quiz.questions.length) {
      toast({
        title: "Warning",
        description: "You haven't answered all questions. Are you sure you want to submit?",
        variant: "warning",
      })
      setShowConfirmSubmit(true)
      return
    }

    try {
      setIsSubmitting(true)
      const timeSpent = Math.round((Date.now() - startTime) / 1000) // in seconds

      // Calculate results
      let correctCount = 0
      const feedback = quiz.questions.map(question => {
        const selectedAnswerId = selectedAnswers[question.id]
        const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
        const correctAnswer = question.answers.find(a => a.is_correct)

        const isCorrect = selectedAnswer?.is_correct ?? false
        if (isCorrect) correctCount++

        return {
          questionText: question.question_text,
          isCorrect,
          userAnswer: selectedAnswer?.answer_text ?? 'Not answered',
          correctAnswer: correctAnswer?.answer_text ?? '',
          explanation: question.question_explanation
        }
      })

      const score = Math.round((correctCount / quiz.questions.length) * 100)

      // Save attempt to database
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { error: attemptError } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_id: quiz.id,
            user_id: session.user.id,
            score,
            time_spent: timeSpent,
            completed_at: new Date().toISOString()
          })

        if (attemptError) throw attemptError

        // Check for achievements
        await fetch('/api/achievements/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'COMPLETE_QUIZ',
            data: { score, timeSpent }
          })
        })
      }

      setQuizResults({
        score,
        timeSpent,
        correctAnswers: correctCount,
        questionFeedback: feedback
      })
      setIsComplete(true)

    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [quiz, selectedAnswers, startTime, supabase, toast, isSubmitting, showConfirmSubmit])

  useEffect(() => {
    if (quiz?.time_limit) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = quiz.time_limit * 60 - elapsed
        setTimeRemaining(remaining)

        if (remaining <= 0) {
          clearInterval(timer)
          handleSubmit()
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quiz, startTime, handleSubmit])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!quiz) {
    return (
      <Card className="p-6">
        <p>Quiz not found</p>
      </Card>
    )
  }

  if (isComplete && quizResults) {
    return <QuizFeedback results={quizResults} />
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {timeRemaining !== null && (
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <span>
              {Math.floor(timeRemaining / 60)}:
              {(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Badge>{quiz.difficulty}</Badge>
        <Badge variant="outline">
          {quiz.questions.length} Questions
        </Badge>
        {quiz.time_limit && (
          <Badge variant="outline">
            {quiz.time_limit} Minutes
          </Badge>
        )}
      </div>

      <Progress 
        value={(Object.keys(selectedAnswers).length / quiz.questions.length) * 100} 
        className="w-full"
      />

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="space-y-4">
              <h3 className="font-medium">
                {index + 1}. {question.question_text}
              </h3>
              <div className="space-y-2">
                {question.answers.map(answer => (
                  <div
                    key={answer.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-accent ${
                      selectedAnswers[question.id] === answer.id
                        ? 'bg-accent border-primary'
                        : 'border-input'
                    }`}
                    onClick={() => handleAnswerSelect(question.id, answer.id)}
                  >
                    {answer.answer_text}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <QuizOverview
        title={quiz.title}
        difficulty={quiz.difficulty}
        timeLimit={quiz.time_limit}
        questionCount={quiz.questions.length}
        onStart={() => {}}
      />

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </div>
    </div>
  )
}
