'use client'

import React from 'react'
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Clock, Brain, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface QuizFeedbackProps {
  score: number
  timeSpent: number
  totalQuestions: number
  correctAnswers: number
  difficulty: string
  questionFeedback: Array<{
    questionText: string
    isCorrect: boolean
    userAnswer: string
    correctAnswer: string
    explanation: string
  }>
}

export function QuizFeedback({
  score,
  timeSpent,
  totalQuestions,
  correctAnswers,
  difficulty,
  questionFeedback
}: QuizFeedbackProps) {
  const router = useRouter()

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-blue-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getPerformanceMessage = (score: number, difficulty: string) => {
    if (score >= 90) {
      return difficulty === 'expert' 
        ? "Outstanding! You've mastered this topic at the expert level!" 
        : "Excellent! Consider trying a higher difficulty level!"
    }
    if (score >= 70) return "Good job! Keep practicing to improve further."
    if (score >= 50) return "Not bad! Review the topics you missed and try again."
    return "Keep practicing! Review the material and try again."
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Score Overview */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <div className="flex justify-center items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
          <p className="text-muted-foreground">
            {getPerformanceMessage(score, difficulty)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="font-medium">{correctAnswers} of {totalQuestions}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Time Spent</p>
              <p className="font-medium">{Math.round(timeSpent / 60)} minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <p className="font-medium capitalize">{difficulty}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Feedback */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Question Review</h3>
        <div className="space-y-6">
          {questionFeedback.map((feedback, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  feedback.isCorrect 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {feedback.isCorrect ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{feedback.questionText}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Your answer: </span>
                      <span className={feedback.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {feedback.userAnswer}
                      </span>
                    </p>
                    {!feedback.isCorrect && (
                      <p>
                        <span className="text-muted-foreground">Correct answer: </span>
                        <span className="text-green-600">{feedback.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                  {feedback.explanation && (
                    <p className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded">
                      {feedback.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline"
          onClick={() => router.push('/quizzes')}
        >
          Try Another Quiz
        </Button>
        <Button
          onClick={() => router.push('/dashboard/progress')}
        >
          View Progress
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
