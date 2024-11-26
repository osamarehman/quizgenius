'use client'

interface Quiz {
  id: string
  title: string
}

interface QuestionWithQuiz extends Question {
  quiz: {
    title: string
  } | null
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { type Question } from '@/types'
import { EditQuestionDialog } from "@/components/questions/EditQuestionDialog"
import Image from 'next/image'

export function QuestionBankClient() {
  const [questions, setQuestions] = useState<QuestionWithQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterQuiz, setFilterQuiz] = useState<string>('all')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [editQuestion, setEditQuestion] = useState<QuestionWithQuiz | undefined>()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchQuizzes()
    fetchQuestions()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title')
      
      if (error) {
        console.error('Error fetching quizzes:', error)
        return
      }
      
      if (data) {
        setQuizzes(data)
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err)
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          quiz:quizzes(title)
        `)
      
      if (error) {
        console.error('Error fetching questions:', error)
        return
      }
      
      if (data) {
        setQuestions(data)
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (question: QuestionWithQuiz) => {
    setEditQuestion(question)
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditQuestion(undefined)
    setEditDialogOpen(false)
    fetchQuestions() // Refresh questions after edit
  }

  const filteredQuestions = questions.filter((question): question is QuestionWithQuiz => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesQuiz = filterQuiz === 'all' || question.quiz_id === filterQuiz
    return matchesSearch && matchesQuiz
  })

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading questions...</div>
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterQuiz}
            onValueChange={setFilterQuiz}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by quiz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quizzes</SelectItem>
              {quizzes.map((quiz) => (
                <SelectItem key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Answers</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium max-w-md truncate">
                  {question.question_text}
                </TableCell>
                <TableCell>
                  {question.image_url && (
                    <div className="relative w-10 h-10">
                      <Image
                        src={question.image_url}
                        alt="Question image"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>{question.quiz?.title}</TableCell>
                <TableCell>{question.question_type}</TableCell>
                <TableCell>{question.answers?.length || 0} answers</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClick(question)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <EditQuestionDialog
        open={editDialogOpen}
        onOpenChange={handleEditClose}
        question={editQuestion}
      />
    </div>
  )
}
