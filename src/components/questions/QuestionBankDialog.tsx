'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSpinner } from '@/components/ui/loading'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from '@/hooks/use-toast'

interface Question {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_option: number
  order: number
}

interface QuestionBankDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (questions: Question[]) => void
  excludeQuizId?: string
}

export function QuestionBankDialog({
  open,
  onOpenChange,
  onSelect,
  excludeQuizId
}: QuestionBankDialogProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let query = supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false })

        if (excludeQuizId) {
          query = query.neq('quiz_id', excludeQuizId)
        }

        const { data, error } = await query

        if (error) throw error

        setQuestions(data || [])
      } catch (error) {
        console.error('Error fetching questions:', error)
        toast({
          title: "Error",
          description: "Failed to load questions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchQuestions()
      setSelectedQuestions(new Set())
    }
  }, [open, excludeQuizId, supabase])

  const handleSelect = (questionId: string) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedQuestions(newSelected)
  }

  const handleAddQuestions = () => {
    const selectedQuestionsList = questions.filter(q => selectedQuestions.has(q.id))
    onSelect(selectedQuestionsList)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Bank</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {questions.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  No questions available in the question bank.
                </Card>
              ) : (
                questions.map((question) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedQuestions.has(question.id)}
                        onCheckedChange={() => handleSelect(question.id)}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{question.question}</h3>
                        <div className="mt-2 space-y-1">
                          {question.options.map((option, i) => (
                            <div
                              key={i}
                              className={`text-sm ${
                                i === question.correct_option
                                  ? 'text-green-600 font-medium'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddQuestions}
                disabled={selectedQuestions.size === 0}
              >
                Add Selected ({selectedQuestions.size})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
