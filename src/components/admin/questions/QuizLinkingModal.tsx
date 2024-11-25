'use client'

import { useState, useEffect } from 'react'
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
import { Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Quiz {
  id: string
  title: string
  category_details?: {
    name: string
  }
}

interface QuizLinkingModalProps {
  questionId: string
  onQuestionLinked: () => void
}

export function QuizLinkingModal({ questionId, onQuestionLinked }: QuizLinkingModalProps) {
  const [open, setOpen] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchQuizzes()
    }
  }, [open])

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          category_details:categories!quiz_category_fk (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch error:', error)
        throw error
      }

      setQuizzes(data || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkToQuiz = async (quizId: string) => {
    try {
      setIsLoading(true)

      // Get the current max order number for the quiz
      const { data: currentQuestions, error: orderError } = await supabase
        .from('questions')
        .select('order_number')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: false })
        .limit(1)

      if (orderError) throw orderError

      const nextOrderNumber = currentQuestions && currentQuestions.length > 0
        ? currentQuestions[0].order_number + 1
        : 1

      // Update the question with quiz_id and order_number
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          quiz_id: quizId,
          order_number: nextOrderNumber
        })
        .eq('id', questionId)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Question linked to quiz successfully",
      })

      setOpen(false)
      onQuestionLinked()
    } catch (error) {
      console.error('Error linking question:', error)
      toast({
        title: "Error",
        description: "Failed to link question to quiz",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Link to Quiz</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Link Question to Quiz</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.category_details?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleLinkToQuiz(quiz.id)}
                      disabled={isLoading}
                    >
                      Link
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isLoading && <div className="text-center py-4">Loading...</div>}
          {!isLoading && filteredQuizzes.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No quizzes found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 