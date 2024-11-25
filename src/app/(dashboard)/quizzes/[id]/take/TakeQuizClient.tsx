'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
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

interface TakeQuizClientProps {
  quiz: Quiz
}

export function TakeQuizClient({ quiz: initialQuiz }: TakeQuizClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const [showOverview, setShowOverview] = useState(true)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [quizResults, setQuizResults] = useState<{
    score: number
    timeSpent: number
    correctAnswers: number
    questionFeedback: {
      questionText: string
      isCorrect: boolean
      userAnswer: string
      correctAnswer: string
      explanation: string
    }[]
  } | null>(null)

  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (initialQuiz?.time_limit && !isComplete) {
      const timeLimit = initialQuiz.time_limit * 60
      setTimeLeft(timeLimit)
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        clearInterval(timer)
      }
    }
  }, [initialQuiz])

  const currentQuestion = initialQuiz.questions[currentQuestionIndex]

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: answerId,
    })
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">{currentQuestion.question_text}</h2>
          {currentQuestion.answers && currentQuestion.answers.length > 0 ? (
            <div className="space-y-4">
              {currentQuestion.answers.map((answer) => (
                <div
                  key={answer.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswers[currentQuestion.id] === answer.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => handleAnswerSelect(answer.id)}
                >
                  {answer.answer_text}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No answers available for this question.</p>
          )}
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!initialQuiz || isSubmitting) return

    if (!showConfirmSubmit && Object.keys(selectedAnswers).length < initialQuiz.questions.length) {
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
      const timeSpent = Math.round((Date.now() - startTime) / 1000)

      let correctCount = 0
      const feedback = initialQuiz.questions.map(question => {
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

      const score = Math.round((correctCount / initialQuiz.questions.length) * 100)

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { error: attemptError } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_id: initialQuiz.id,
            user_id: session.user.id,
            score,
            time_taken: timeSpent,
            completed_at: new Date().toISOString()
          })

        if (attemptError) throw attemptError

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
  }

  if (!initialQuiz) {
    return <LoadingSpinner />
  }

  if (showOverview) {
    return (
      <QuizOverview
        title={initialQuiz.title}
        difficulty={initialQuiz.difficulty}
        timeLimit={initialQuiz.time_limit}
        questionCount={initialQuiz.questions.length}
        questions={initialQuiz.questions}
        selectedAnswers={{}}
        onAnswerSelect={() => {}}
        onStart={() => setShowOverview(false)}
      />
    )
  }

  if (isComplete && quizResults) {
    return (
      <QuizFeedback
        score={quizResults.score}
        timeSpent={quizResults.timeSpent}
        totalQuestions={initialQuiz.questions.length}
        correctAnswers={quizResults.correctAnswers}
        difficulty={initialQuiz.difficulty}
        questionFeedback={quizResults.questionFeedback}
      />
    )
  }

  const progress = ((currentQuestionIndex + 1) / initialQuiz.questions.length) * 100

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">{initialQuiz.title}</h1>
          {timeLeft !== null && (
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6">
        {renderQuestion()}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          {currentQuestionIndex === initialQuiz.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
