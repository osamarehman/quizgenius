'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { Timer } from '@/components/ui/timer'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizSummary } from '@/components/quiz/QuizSummary'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Quiz, type Question } from '@/types'

export function TakeQuizClient({ quiz, questions }: { quiz: Quiz, questions: Question[] }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = useCallback(async () => {
    if (!isComplete) return

    const endTime = Date.now()
    const timeSpent = Math.round((endTime - startTime) / 1000) // Convert to seconds

    try {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to submit a quiz')
        return
      }

      // Calculate score
      let correctAnswers = 0;
      questions.forEach(question => {
        const selectedAnswerIndex = selectedAnswers[question.id];
        const selectedAnswer = question.answers[parseInt(selectedAnswerIndex)];
        if (selectedAnswer && selectedAnswer.is_correct) {
          correctAnswers++;
        }
      });
      const score = Math.round((correctAnswers / questions.length) * 100);

      // Save attempt
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score,
          time_spent: timeSpent,
          answers: Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
            question_id: questionId,
            answer_id: answerId
          }))
        })

      if (error) throw error

      toast.success('Quiz submitted successfully!')
      router.push(`/dashboard/quizzes/${quiz.id}/results`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    }
  }, [isComplete, startTime, questions, selectedAnswers, quiz.id, toast, router])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isComplete) {
        handleSubmit()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [isComplete, handleSubmit])

  const handleAnswerSelect = useCallback((questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }, [])

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }, [currentQuestionIndex, questions.length])

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (!currentQuestion) return null

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <Timer 
            duration={quiz.time_limit || 0} 
            onComplete={() => setIsComplete(true)} 
          />
        </div>

        <Progress value={progress} className="mb-8" />

        <QuizQuestion
          question={currentQuestion}
          selectedAnswer={selectedAnswers[currentQuestion.id]}
          onAnswerSelect={(answerId) => handleAnswerSelect(currentQuestion.id, answerId)}
        />

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedAnswers[currentQuestion.id]}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </Card>

      {isComplete && (
        <QuizSummary
          questions={questions}
          selectedAnswers={selectedAnswers}
          timeSpent={Math.round((Date.now() - startTime) / 1000)}
        />
      )}
    </div>
  )
}
