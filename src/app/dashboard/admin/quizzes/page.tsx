'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from '@/components/ui/loading'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
  is_published: boolean
  questions_count: number
}

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const fetchQuizzes = useCallback(async () => {
    try {
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:questions (count)
        `)
        .order('created_at', { ascending: false })

      if (quizzesError) throw quizzesError

      setQuizzes(quizzesData.map(quiz => ({
        ...quiz,
        questions_count: quiz.questions?.[0]?.count || 0
      })))
    } catch (err) {
      console.error('Error fetching quizzes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Button onClick={() => router.push('/dashboard/admin/quizzes/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quizzes.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No quizzes found. Create your first quiz!
          </Card>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {quiz.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      {quiz.questions_count} questions
                    </span>
                    <span className={`text-sm ${quiz.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                      {quiz.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/admin/quizzes/${quiz.id}`)}
                >
                  View
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
