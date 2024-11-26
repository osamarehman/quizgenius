'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from '@/components/ui/loading'
import { toast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Quiz {
  id: string
  title: string
  description: string
  is_published: boolean
  questions_count: number
}

export default function QuizDetailPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data: quizData, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            questions:questions (count)
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error

        const formattedQuiz = {
          ...quizData,
          questions_count: quizData.questions?.[0]?.count || 0
        }

        setQuiz(formattedQuiz)
        setTitle(formattedQuiz.title)
        setDescription(formattedQuiz.description)
      } catch (error) {
        console.error('Error fetching quiz:', error)
        toast({
          title: "Error",
          description: "Failed to load quiz details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [supabase, params.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({
          title,
          description,
        })
        .eq('id', params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Quiz updated successfully",
      })
      
      setQuiz(prev => prev ? { ...prev, title, description } : null)
    } catch (error) {
      console.error('Error updating quiz:', error)
      toast({
        title: "Error",
        description: "Failed to update quiz",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishToggle = async () => {
    if (!quiz) return

    try {
      const { error } = await supabase
        .from('quizzes')
        .update({
          is_published: !quiz.is_published
        })
        .eq('id', params.id)

      if (error) throw error

      setQuiz(prev => prev ? { ...prev, is_published: !prev.is_published } : null)
      toast({
        title: "Success",
        description: `Quiz ${quiz.is_published ? 'unpublished' : 'published'} successfully`,
      })
    } catch (error) {
      console.error('Error toggling publish status:', error)
      toast({
        title: "Error",
        description: "Failed to update quiz status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      })
      router.push('/dashboard/admin/quizzes')
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!quiz) {
    return (
      <Card className="p-6 text-center">
        <p>Quiz not found</p>
        <Button onClick={() => router.push('/dashboard/admin/quizzes')} className="mt-4">
          Back to Quizzes
        </Button>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Quiz</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePublishToggle}
            className={quiz.is_published ? "bg-green-50" : "bg-yellow-50"}
          >
            {quiz.is_published ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Published
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                Draft
              </>
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Quiz</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the quiz
                  and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/admin/quizzes')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Questions ({quiz.questions_count})</h2>
          <Button onClick={() => router.push(`/dashboard/admin/quizzes/${quiz.id}/questions`)}>
            Manage Questions
          </Button>
        </div>
      </Card>
    </div>
  )
}
