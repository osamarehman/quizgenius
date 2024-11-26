'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import  Image  from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface Answer {
  text: string
  explanation: string
  isCorrect: boolean
}

interface Question {
  id?: string
  question_text: string
  question_type: 'mcq' | 'true-false' | 'blanks'
  explanation?: string
  image_url?: string
  quiz_id?: string | null
  order_number?: number
  answers?: Answer[]
}

interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

interface QuestionModalProps {
  onQuestionSaved?: (question: Question) => void | Promise<void>
  initialQuestion?: Question
  quizId?: string
  triggerLabel?: string
  mode?: 'create' | 'edit'
}

export function QuestionModal({ 
  onQuestionSaved, 
  initialQuestion, 
  quizId,
  triggerLabel = 'Add Question',
  mode = 'create'
}: QuestionModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionData, setQuestionData] = useState<Question>({
    question_text: '',
    question_type: 'mcq',
    explanation: '',
    image_url: '',
    answers: [
      { text: '', explanation: '', isCorrect: false },
      { text: '', explanation: '', isCorrect: false },
    ]
  })

  useEffect(() => {
    if (initialQuestion) {
      setQuestionData({
        ...initialQuestion,
        answers: initialQuestion.answers || [
          { text: '', explanation: '', isCorrect: false },
          { text: '', explanation: '', isCorrect: false },
        ]
      })
    }
  }, [initialQuestion])

  const resetForm = () => {
    setQuestionData({
      question_text: '',
      question_type: 'mcq',
      explanation: '',
      image_url: '',
      answers: [
        { text: '', explanation: '', isCorrect: false },
        { text: '', explanation: '', isCorrect: false },
      ]
    })
  }

  const handleAnswerChange = (index: number, field: keyof Answer, value: string | boolean) => {
    const newAnswers = [...(questionData.answers || [])]
    newAnswers[index] = { ...newAnswers[index], [field]: value }
    
    if (field === 'isCorrect' && value === true) {
      newAnswers.forEach((answer, i) => {
        if (i !== index) answer.isCorrect = false
      })
    }
    
    setQuestionData({ ...questionData, answers: newAnswers })
  }

  const addAnswer = () => {
    if (questionData.answers && questionData.answers.length < 6) {
      setQuestionData({
        ...questionData,
        answers: [
          ...(questionData.answers || []),
          { text: '', explanation: '', isCorrect: false }
        ]
      })
    }
  }

  const removeAnswer = (index: number) => {
    if (questionData.answers && questionData.answers.length > 2) {
      const newAnswers = questionData.answers.filter((_, i) => i !== index)
      setQuestionData({ ...questionData, answers: newAnswers })
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const filename = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('quiz-assets')
        .upload(filename, file)

      if (error) throw error

      const imageUrl = supabase.storage
        .from('quiz-assets')
        .getPublicUrl(data.path).data.publicUrl

      setQuestionData(prev => ({
        ...prev,
        image_url: imageUrl
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      console.log('Starting question save process...')
      console.log('Question data:', questionData)

      // Validate question
      if (!questionData.question_text.trim()) {
        throw new Error('Question text is required')
      }

      if (!questionData.explanation?.trim()) {
        throw new Error('Question explanation is required')
      }

      if (!questionData.answers?.some(a => a.isCorrect)) {
        throw new Error('At least one answer must be marked as correct')
      }

      if (questionData.answers?.some(a => !a.text.trim())) {
        throw new Error('All answers must have text')
      }

      // Get the next order number if this is for a quiz
      let orderNumber = 1
      if (quizId) {
        console.log('Fetching order number for quiz:', quizId)
        const { data: currentQuestions, error: orderError } = await supabase
          .from('questions')
          .select('order_number')
          .eq('quiz_id', quizId)
          .order('order_number', { ascending: false })
          .limit(1)

        if (orderError) {
          console.error('Error fetching order number:', orderError)
          throw orderError
        }

        if (currentQuestions && currentQuestions.length > 0) {
          orderNumber = currentQuestions[0].order_number + 1
        }
        console.log('Using order number:', orderNumber)
      }

      // Save question
      const questionToSave = {
        quiz_id: quizId || null,
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        question_explanation: questionData.explanation,
        image_url: questionData.image_url,
        order_number: orderNumber,
        answers: questionData.answers?.map(answer => ({
          text: answer.text,
          explanation: answer.explanation || '',
          is_correct: answer.isCorrect
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Saving question:', questionToSave)

      let savedQuestion
      if (mode === 'edit' && initialQuestion?.id) {
        console.log('Updating existing question:', initialQuestion.id)
        const { data, error } = await supabase
          .from('questions')
          .update(questionToSave)
          .eq('id', initialQuestion.id)
          .select()
          .single()

        if (error) throw error
        savedQuestion = data
      } else {
        console.log('Creating new question')
        const { data, error } = await supabase
          .from('questions')
          .insert([questionToSave])
          .select()
          .single()

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        savedQuestion = data
      }

      console.log('Question saved:', savedQuestion)

      // Close modal and reset form
      setOpen(false)
      resetForm()

      // Call callback if provided
      if (typeof onQuestionSaved === 'function') {
        try {
          await onQuestionSaved(savedQuestion)
        } catch (callbackError) {
          console.error('Error in onQuestionSaved callback:', callbackError)
        }
      }

      toast({
        title: "Success",
        description: `Question ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      })
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error)
      
      // Type guard to handle potential Supabase errors
      const errorMessage = error instanceof Error 
        ? error.message
        : (error as SupabaseError)?.message || "Failed to save question"
      
      console.error('Error details:', {
        message: (error as SupabaseError)?.message,
        code: (error as SupabaseError)?.code,
        details: (error as SupabaseError)?.details,
        hint: (error as SupabaseError)?.hint
      })
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'edit' ? 'outline' : 'default'}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {mode === 'edit' ? 'update the' : 'create a new'} question.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Question Type</Label>
            <Select
              value={questionData.question_type}
              onValueChange={(value: 'mcq' | 'true-false' | 'blanks') => 
                setQuestionData({ ...questionData, question_type: value })
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
              value={questionData.question_text}
              onChange={(e) => setQuestionData({ ...questionData, question_text: e.target.value })}
              placeholder="Enter your question"
            />
          </div>

          <div className="space-y-2">
            <Label>Question Image (Optional)</Label>
            <ImageUpload
              value={questionData.image_url}
              onUpload={handleImageUpload}
              preview={
                questionData.image_url && (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={questionData.image_url}
                      alt="Question image"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )
              }
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

          <div className="space-y-4">
            <Label>Answers</Label>
            {questionData.answers?.map((answer, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Textarea
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    placeholder={`Answer ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant={answer.isCorrect ? "default" : "outline"}
                    onClick={() => handleAnswerChange(index, 'isCorrect', !answer.isCorrect)}
                  >
                    {answer.isCorrect ? 'Correct' : 'Mark Correct'}
                  </Button>
                  {questionData.answers && questionData.answers.length > 2 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeAnswer(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <Textarea
                  value={answer.explanation}
                  onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                  placeholder="Explanation for this answer (optional)"
                />
              </div>
            ))}
            {questionData.question_type === 'mcq' && questionData.answers.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={addAnswer}
              >
                Add Answer Option
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 