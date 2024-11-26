'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from '@/components/ui/loading'
import { toast } from '@/hooks/use-toast'
import { EditQuestionDialog } from '@/components/questions/EditQuestionDialog'
import { QuestionBankDialog } from '@/components/questions/QuestionBankDialog'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GripVertical, Pencil, Plus, Trash } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Question {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_option: number
  position: number
}

export default function QuizQuestionsPage({ params }: { params: { id: string } }) {
  const quizId = use(params.id)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false)
  const supabase = createClientComponentClient()

  const fetchQuestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('position')

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
  }, [quizId, supabase])

  useEffect(() => {
    fetchQuestions()
  }, [quizId, fetchQuestions])

  const handleDragEnd = async (result: { destination?: { index: number }, source: { index: number } }) => {
    if (!result.destination) return

    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedQuestions = items.map((item, index) => ({
      ...item,
      position: index + 1
    }))

    setQuestions(updatedQuestions)

    try {
      const updates = updatedQuestions.map((question) => ({
        id: question.id,
        position: question.position
      }))

      const { error } = await supabase
        .from('questions')
        .upsert(updates)

      if (error) throw error
    } catch (error) {
      console.error('Error updating question order:', error)
      toast({
        title: "Error",
        description: "Failed to update question order",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      setQuestions(questions.filter(q => q.id !== questionId))
      toast({
        title: "Success",
        description: "Question deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      })
    }
  }

  const handleQuestionSave = (updatedQuestion: Question) => {
    setQuestions(prevQuestions => {
      if (editingQuestion) {
        return prevQuestions.map(q => 
          q.id === updatedQuestion.id ? updatedQuestion : q
        )
      } else {
        const newQuestion = {
          ...updatedQuestion,
          position: prevQuestions.length + 1
        }
        return [...prevQuestions, newQuestion]
      }
    })
    setEditingQuestion(null)
  }

  const handleQuestionBankSelect = async (selectedQuestions: Question[]) => {
    try {
      const startPosition = questions.length + 1
      const newQuestions = selectedQuestions.map((q, index) => ({
        ...q,
        quiz_id: quizId,
        position: startPosition + index
      }))

      const { error } = await supabase
        .from('questions')
        .insert(newQuestions)

      if (error) throw error

      await fetchQuestions()
      setIsQuestionBankOpen(false)
      toast({
        title: "Success",
        description: "Questions added successfully",
      })
    } catch (error) {
      console.error('Error adding questions:', error)
      toast({
        title: "Error",
        description: "Failed to add questions",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Questions</h1>
        <div className="flex gap-4">
          <Button onClick={() => setIsQuestionBankOpen(true)}>
            Add from Question Bank
          </Button>
          <Button onClick={() => setEditingQuestion({
            id: '',
            quiz_id: quizId,
            question: '',
            options: ['', '', '', ''],
            correct_option: 0,
            position: questions.length + 1
          })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {questions.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  No questions added yet. Add your first question!
                </Card>
              ) : (
                questions.map((question, index) => (
                  <Draggable key={question.id} draggableId={question.id} index={index}>
                    {(provided) => (
                      <Card
                        className="p-4"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div className="flex items-start gap-4">
                          <div {...provided.dragHandleProps} className="mt-1">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
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
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingQuestion(question)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this question? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <EditQuestionDialog
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
        question={editingQuestion}
        onSave={handleQuestionSave}
      />

      <QuestionBankDialog
        open={isQuestionBankOpen}
        onOpenChange={setIsQuestionBankOpen}
        onSelect={handleQuestionBankSelect}
        excludeQuizId={quizId}
      />
    </div>
  )
}
