'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type Question } from '@/types'
import { useToast } from "@/hooks/use-toast"

interface Answer {
  text: string;
  is_correct: boolean;
  explanation?: string;
}

interface EditQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question?: Question
}

export function EditQuestionDialog({
  open,
  onOpenChange,
  question
}: EditQuestionDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [linkedQuizzes, setLinkedQuizzes] = useState<string[]>([])
  const [availableQuizzes, setAvailableQuizzes] = useState<{id: string, title: string}[]>([])
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'MULTIPLE_CHOICE',
    question_explanation: '',
    answers: [] as Answer[],
  })

  const fetchLinkedQuizzes = useCallback(async () => {
    if (!question) return
    const { data } = await supabase
      .from('quiz_questions')
      .select('quiz_id')
      .eq('question_id', question.id)
    
    if (data) {
      setLinkedQuizzes(data.map(q => q.quiz_id))
    }
  }, [question])

  const fetchAvailableQuizzes = async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('id, title')
    
    if (data) {
      setAvailableQuizzes(data)
    }
  }

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        question_type: question.question_type,
        question_explanation: question.question_explanation || '',
        answers: question.answers || [],
      })
      setImageUrl(question.image_url || '')
      fetchLinkedQuizzes()
    }
    fetchAvailableQuizzes()
  }, [question, fetchLinkedQuizzes])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
  }

  const handleQuizLinkChange = async (quizId: string) => {
    if (linkedQuizzes.includes(quizId)) {
      setLinkedQuizzes(prev => prev.filter(id => id !== quizId))
    } else {
      setLinkedQuizzes(prev => [...prev, quizId])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let updatedImageUrl = imageUrl

      // Upload new image if selected
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`
        const { error: uploadError } = await supabase
          .storage
          .from('question-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase
          .storage
          .from('question-images')
          .getPublicUrl(fileName)

        updatedImageUrl = publicUrl
      }

      // Update question
      const { error: questionError } = await supabase
        .from('questions')
        .update({
          ...formData,
          image_url: updatedImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', question?.id)

      if (questionError) throw questionError

      // Update quiz links
      if (question) {
        // Remove old links
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('question_id', question.id)

        // Add new links
        if (linkedQuizzes.length > 0) {
          const quizLinks = linkedQuizzes.map(quizId => ({
            quiz_id: quizId,
            question_id: question.id,
          }))

          const { error: linkError } = await supabase
            .from('quiz_questions')
            .insert(quizLinks)

          if (linkError) throw linkError
        }
      }

      toast({
        title: "Success",
        description: "Question updated successfully",
      })

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating question:', error)
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleAnswerChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => 
        i === index ? { ...answer, [field]: value } : answer
      ),
    }))
  }

  const addAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answers: [...prev.answers, { text: '', is_correct: false, explanation: '' }],
    }))
  }

  const removeAnswer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Can&apos;t find the quiz you&apos;re looking for?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question_text">Question Text</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Question Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imageUrl && (
                <div className="relative w-20 h-20">
                  <Image
                    src={imageUrl}
                    alt="Question image"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Linked Quizzes</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableQuizzes.map((quiz) => (
                <Button
                  key={quiz.id}
                  type="button"
                  variant={linkedQuizzes.includes(quiz.id) ? "default" : "outline"}
                  onClick={() => handleQuizLinkChange(quiz.id)}
                >
                  {quiz.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Answers</Label>
              <Button type="button" variant="outline" onClick={addAnswer}>
                Add Answer
              </Button>
            </div>
            {formData.answers.map((answer, index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <div className="flex items-center gap-2">
                  <Input
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    placeholder="Answer text"
                  />
                  <Button
                    type="button"
                    variant={answer.is_correct ? "default" : "outline"}
                    onClick={() => handleAnswerChange(index, 'is_correct', (!answer.is_correct).toString())}
                  >
                    {answer.is_correct ? "Correct" : "Incorrect"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeAnswer(index)}
                  >
                    Remove
                  </Button>
                </div>
                <Textarea
                  value={answer.explanation || ''}
                  onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                  placeholder="Answer explanation (optional)"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
