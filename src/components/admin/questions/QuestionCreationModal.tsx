'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Question {
  id: string
  question_text: string
  question_type: string
  question_explanation?: string
  quiz_id?: string | null
  order_number: number
}

interface QuestionCreationModalProps {
  onQuestionCreated: (question: Question) => void
  quizId?: string | null
}

export function QuestionCreationModal({ onQuestionCreated, quizId }: QuestionCreationModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [questionData, setQuestionData] = useState({
    type: 'mcq' as const,
    text: '',
    explanation: '',
  })

  const resetForm = () => {
    setQuestionData({
      type: 'mcq',
      text: '',
      explanation: '',
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Get the current max order number for the quiz if quizId exists
      let nextOrderNumber = 1
      if (quizId) {
        const { data: currentQuestions, error: orderError } = await supabase
          .from('questions')
          .select('order_number')
          .eq('quiz_id', quizId)
          .order('order_number', { ascending: false })
          .limit(1)

        if (!orderError && currentQuestions && currentQuestions.length > 0) {
          nextOrderNumber = currentQuestions[0].order_number + 1
        }
      }

      // Create the question
      const { data: question, error } = await supabase
        .from('questions')
        .insert({
          question_text: questionData.text,
          question_type: questionData.type,
          question_explanation: questionData.explanation,
          quiz_id: quizId || null,
          order_number: nextOrderNumber // Add order number
        })
        .select()
        .single()

      if (error) throw error

      onQuestionCreated(question)
      setOpen(false)
      resetForm()
      
      toast({
        title: "Success",
        description: "Question created successfully",
      })
    } catch (error) {
      console.error('Error creating question:', error)
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Question</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Question Type</Label>
            <Select
              value={questionData.type}
              onValueChange={(value: 'mcq' | 'true-false' | 'blanks') => 
                setQuestionData({ ...questionData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="blanks">Fill in Blanks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Question Text</Label>
            <Textarea
              value={questionData.text}
              onChange={(e) => setQuestionData({ ...questionData, text: e.target.value })}
              placeholder="Enter your question"
            />
          </div>

          <div>
            <Label>Question Explanation</Label>
            <Textarea
              value={questionData.explanation}
              onChange={(e) => setQuestionData({ ...questionData, explanation: e.target.value })}
              placeholder="Explain the concept behind this question"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating...' : 'Create Question'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 