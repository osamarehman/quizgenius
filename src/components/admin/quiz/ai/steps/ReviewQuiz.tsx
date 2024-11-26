'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Question, Answer } from '@/types'

interface QuizData {
  title: string
  description: string
  educationSystem: string
  category: string
  questions: Question[]
}

interface ReviewQuizProps {
  quizData: QuizData
  onUpdate: (data: QuizData) => void
}

export function ReviewQuiz({ quizData, onUpdate }: ReviewQuizProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSaveQuiz = async () => {
    try {
      setIsSubmitting(true)

      // Get the authenticated user
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError) throw authError
      if (!session) throw new Error('No authenticated user')

      // Create the quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: quizData.title,
          description: quizData.description,
          education_system_id: quizData.educationSystem,
          category_id: quizData.category,
          created_by: session.user.id,
          is_published: false,
          time_limit: 30 // Default time limit
        })
        .select()
        .single()

      if (quizError) throw quizError

      // Create questions and answers
      for (const question of quizData.questions) {
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: quiz.id,
            question_text: question.text,
            question_type: question.type,
            question_explanation: question.explanation,
            order_number: quizData.questions.indexOf(question) + 1
          })
          .select()
          .single()

        if (questionError) throw questionError

        // Create answers for the question
        const answersToInsert = question.answers.map((answer: Answer, index: number) => ({
          question_id: questionData.id,
          answer_text: answer.text,
          explanation: answer.explanation,
          is_correct: answer.isCorrect,
          order_number: index + 1
        }))

        const { error: answersError } = await supabase
          .from('answers')
          .insert(answersToInsert)

        if (answersError) throw answersError
      }

      toast({
        title: "Success",
        description: "Quiz created successfully",
      })

      // Redirect to quiz management
      window.location.href = '/admin/quizzes'
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast({
        title: "Error",
        description: "Failed to save quiz",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Review Quiz</h2>
        <Button
          onClick={handleSaveQuiz}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Quiz...
            </>
          ) : (
            'Save Quiz'
          )}
        </Button>
      </div>

      {/* Quiz Details */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={quizData.title}
              onChange={(e) => onUpdate({ ...quizData, title: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={quizData.description}
              onChange={(e) => onUpdate({ ...quizData, description: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </Card>

      {/* Questions Review */}
      <div className="space-y-4">
        <h3 className="font-medium">Questions ({quizData.questions.length})</h3>
        {quizData.questions.map((question: Question, index: number) => (
          <Card key={question.id} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {question.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Question {index + 1}
                    </span>
                  </div>
                  <p className="mt-2 font-medium">{question.text}</p>
                </div>
                {question.explanation ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>

              <div className="space-y-2">
                <Label>Answers</Label>
                {question.answers.map((answer: Answer, answerIndex: number) => (
                  <div
                    key={answerIndex}
                    className={`p-2 rounded ${
                      answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <p>{answer.text}</p>
                    {answer.explanation && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {answer.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 