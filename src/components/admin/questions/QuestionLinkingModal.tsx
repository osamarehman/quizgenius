'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { LoadingSpinner } from '@/components/ui/loading'

interface Question {
  id: string
  question_text: string
  question_type: string
  quiz_id: string | null
  created_at: string
}

interface QuestionLinkingModalProps {
  quizId: string
  onQuestionLinked: () => void
}

export function QuestionLinkingModal({ quizId, onQuestionLinked }: QuestionLinkingModalProps) {
  const [open, setOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const fetchUnlinkedQuestions = useCallback(async () => {
    try {
      setIsLoading(true)
      // Fetch questions that are not linked to any quiz
      const { data } = await supabase
        .from('questions')
        .select('*')
        .is('quiz_id', null)
        .order('created_at', { ascending: false })

      console.log('Fetched questions:', data) // Debug log
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    if (open) {
      fetchUnlinkedQuestions()
    }
  }, [open, fetchUnlinkedQuestions])

  const handleLinkQuestion = async (questionId: string) => {
    try {
      setIsLinking(true)

      // Get the current max order number for the quiz
      const { data: currentQuestions, error: orderError } = await supabase
        .from('questions')
        .select('order_number')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: false })
        .limit(1)

      if (orderError) throw orderError

      const nextOrderNumber = currentQuestions && currentQuestions.length > 0 
        ? (currentQuestions[0].order_number + 1) 
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

      // Remove the linked question from the local state
      setQuestions(questions.filter(q => q.id !== questionId))

      toast({
        title: "Success",
        description: "Question linked successfully",
      })

      onQuestionLinked()
    } catch (error) {
      console.error('Error linking question:', error)
      toast({
        title: "Error",
        description: "Failed to link question",
        variant: "destructive",
      })
    } finally {
      setIsLinking(false)
    }
  }

  const filteredQuestions = questions.filter(question =>
    question.question_text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Link Existing Questions</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Link Questions to Quiz</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredQuestions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.question_text}</TableCell>
                    <TableCell className="uppercase">{question.question_type}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleLinkQuestion(question.id)}
                        disabled={isLinking}
                      >
                        {isLinking ? 'Linking...' : 'Link'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery 
                ? 'No questions found matching your search'
                : 'No unlinked questions available'
              }
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}