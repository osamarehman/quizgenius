'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface Answer {
  id?: string
  text: string
  explanation: string
  isCorrect: boolean
}

interface Question {
  id?: string
  type: 'mcq' | 'true-false' | 'blanks'
  text: string
  explanation: string
  answers: Answer[]
}

interface QuestionEditorProps {
  quizId: string
  onSave: () => void
}

interface Answer {
  id?: string  // Add optional id
  text: string
  explanation: string
  isCorrect: boolean
}

interface Question {
  id?: string  // Add optional id
  type: 'mcq' | 'true-false' | 'blanks'
  text: string
  explanation: string
  answers: Answer[]
}

export function QuestionEditor({ quizId, onSave }: QuestionEditorProps) {
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [saving, setSaving] = React.useState(false)

  // Add a new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      type: 'mcq',
      text: '',
      explanation: '',
      answers: [
        { id: `temp-${Date.now()}-1`, text: '', explanation: '', isCorrect: false },
        { id: `temp-${Date.now()}-2`, text: '', explanation: '', isCorrect: false },
      ]
    }
    setQuestions([...questions, newQuestion])
  }

  // Add an answer option
  const addAnswer = (questionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers.push({
      id: `temp-${Date.now()}`,
      text: '',
      explanation: '',
      isCorrect: false
    })
    setQuestions(newQuestions)
  }

  // Update question text
  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[index].text = text
    setQuestions(newQuestions)
  }

  // Update question explanation
  const updateQuestionExplanation = (index: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[index].explanation = text
    setQuestions(newQuestions)
  }

  // Update answer text
  const updateAnswerText = (questionIndex: number, answerIndex: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers[answerIndex].text = text
    setQuestions(newQuestions)
  }

  // Update answer explanation
  const updateAnswerExplanation = (questionIndex: number, answerIndex: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers[answerIndex].explanation = text
    setQuestions(newQuestions)
  }

  // Toggle correct answer
  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers.forEach((answer, i) => {
      answer.isCorrect = i === answerIndex
    })
    setQuestions(newQuestions)
  }

  // Remove a question
  const removeQuestion = (index: number) => {
    const newQuestions = [...questions]
    newQuestions.splice(index, 1)
    setQuestions(newQuestions)
  }

  // Remove an answer
  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers.splice(answerIndex, 1)
    setQuestions(newQuestions)
  }

  // Save questions
  const saveQuestions = async () => {
    setSaving(true)
    try {
      // First, insert all questions
      for (const question of questions) {
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .upsert({
            quiz_id: quizId,
            question_text: question.text,
            explanation: question.explanation,
            type: question.type,
          })
          .select()
          .single()

        if (questionError) throw questionError

        // Then, insert all answers for this question
        const answersToInsert = question.answers.map(answer => ({
          question_id: questionData.id,
          answer_text: answer.text,
          explanation: answer.explanation,
          is_correct: answer.isCorrect
        }))

        const { error: answersError } = await supabase
          .from('answers')
          .upsert(answersToInsert)

        if (answersError) throw answersError
      }

      toast({
        title: 'Success',
        description: 'Questions saved successfully',
      })
      onSave()
    } catch (error) {
      console.error('Error saving questions:', error)
      toast({
        title: 'Error',
        description: 'Failed to save questions',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {questions.map((question, qIndex) => (
        <div key={question.id || `q-${qIndex}`} className="p-6 border rounded-lg space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question {qIndex + 1}</label>
                <Textarea
                  value={question.text}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  placeholder="Enter your question"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                <Textarea
                  value={question.explanation || ''}
                  onChange={(e) => updateQuestionExplanation(qIndex, e.target.value)}
                  placeholder="Explain the correct answer"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Options</label>
                {question.answers.map((answer, aIndex) => (
                  <div key={answer.id || `a-${qIndex}-${aIndex}`} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <Input
                        value={answer.text}
                        onChange={(e) => updateAnswerText(qIndex, aIndex, e.target.value)}
                        placeholder={`Option ${aIndex + 1}`}
                      />
                      <Button
                        type="button"
                        variant={answer.isCorrect ? "default" : "outline"}
                        onClick={() => toggleCorrectAnswer(qIndex, aIndex)}
                      >
                        Correct
                      </Button>
                      {question.answers.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAnswer(qIndex, aIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={answer.explanation || ''}
                      onChange={(e) => updateAnswerExplanation(qIndex, aIndex, e.target.value)}
                      placeholder={`Explanation for option ${aIndex + 1} (optional)`}
                      className="mt-2"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addAnswer(qIndex)}
                >
                  Add Option
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeQuestion(qIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>

        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSave()}
          >
            Cancel
          </Button>
          <Button
            onClick={saveQuestions}
            disabled={saving || !questions.length}
          >
            {saving ? 'Saving...' : 'Save & Finish'}
          </Button>
        </div>
      </div>
    </div>
  )
} 