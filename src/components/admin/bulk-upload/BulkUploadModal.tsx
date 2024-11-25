'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileSpreadsheet } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'
import { generateTemplates } from '@/lib/csv-templates/quiz-template'
import * as XLSX from 'xlsx'

interface BulkUploadModalProps {
  type: 'quizzes' | 'questions'
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DatabaseFields {
  quizzes: {
    title: string
    description: string
    time_limit: number
    category_id: string
    sub_category_id: string
    education_system_id: string
    is_published: boolean
    created_by: string
    created_at: string
    updated_at: string
    image_url?: string
  }
  questions: {
    question_text: string
    question_type: 'mcq' | 'true-false' | 'blanks'
    question_explanation: string
    quiz_id: string
    order_number: number
    answers: Array<{
      text: string
      explanation: string
      is_correct: boolean
    }>
    created_at: string
    updated_at: string
  }
}

interface Quiz {
  id: string
  title: string
}

interface UploadData {
  questions: Question[]
  metadata: {
    totalRows: number
    validRows: number
    errors: string[]
  }
}

interface Question {
  question: string
  correct_answer: string
  incorrect_answers: string[]
  explanation?: string
  category?: string
  difficulty?: string
}

export function BulkUploadModal({ type, open, onOpenChange }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [headers, setHeaders] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    if (type === 'questions' && open) {
      void fetchQuizzes()
    }
  }, [type, open])

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuizzes(data || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive"
      })
    }
  }

  const processQuestions = async (questions: Question[], quizId: string) => {
    try {
      // Get the current highest order number for this quiz
      const { data: existingQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('order_number')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      let startOrderNumber = existingQuestions && existingQuestions.length > 0
        ? existingQuestions[0].order_number + 1
        : 1

      for (const question of questions) {
        // Validate required fields
        if (!question.question) {
          throw new Error('Question text is required')
        }

        // Insert question with auto-incremented order number
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: quizId,
            question_text: question.question,
            question_explanation: question.explanation || '',
            question_type: 'mcq',
            image_url: null,
            order_number: startOrderNumber++
          })
          .select()
          .single()

        if (questionError || !questionData) throw questionError || new Error('Failed to insert question')

        // Process answers
        const answers = []
        const correctAnswer = question.correct_answer

        // Process each answer
        for (let i = 0; i < question.incorrect_answers.length; i++) {
          const answer = {
            answer_text: question.incorrect_answers[i],
            explanation: '',
            is_correct: false,
            order_number: i + 1,
            question_id: questionData.id
          }
          answers.push(answer)
        }

        const correctAnswerData = {
          answer_text: correctAnswer,
          explanation: '',
          is_correct: true,
          order_number: answers.length + 1,
          question_id: questionData.id
        }
        answers.push(correctAnswerData)

        // Insert answers
        const { error: answersError } = await supabase
          .from('answers')
          .insert(answers)

        if (answersError) {
          console.error('Error inserting answers:', answersError)
          throw answersError
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error processing questions:', error)
      return { success: false, error }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[firstSheetName]
          if (!sheet) {
            throw new Error('No data found in the file')
          }

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet)
          if (!jsonData || jsonData.length === 0) {
            throw new Error('No data found in the file')
          }
          
          // Get headers
          const headers = Object.keys(jsonData[0] || {})
          setHeaders(headers)
          
          // Create initial mappings
          const initialMappings: Record<string, string> = {}
          headers.forEach(header => {
            initialMappings[header] = header
          })
          setMappings(initialMappings)
          
          // Store the parsed data
          setFile(selectedFile)
        } catch (error) {
          console.error('Error parsing file:', error)
          toast({
            title: "Error",
            description: "Failed to parse file. Make sure it's a valid CSV or Excel file.",
            variant: "destructive"
          })
        }
      }
      reader.readAsArrayBuffer(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    if (!selectedQuiz && type === 'questions') {
      toast({
        title: "Error",
        description: "Please select a quiz",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    try {
      const reader = new FileReader()
      const data = await new Promise<UploadData>((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[firstSheetName]
            if (!sheet) {
              throw new Error('No data found in the file')
            }
            const jsonData = XLSX.utils.sheet_to_json(sheet)
            const uploadData: UploadData = {
              questions: jsonData,
              metadata: {
                totalRows: jsonData.length,
                validRows: jsonData.length,
                errors: []
              }
            }
            resolve(uploadData)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })

      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Not authenticated')

      if (type === 'questions' && selectedQuiz) {
        const result = await processQuestions(data.questions, selectedQuiz.id)
        if (!result.success) {
          throw result.error
        }

        // Record upload history
        const { error: historyError } = await supabase
          .from('bulk_upload_history')
          .insert({
            file_name: file.name,
            type: type,
            status: 'completed',
            questions_count: data.questions.length,
            quiz_id: selectedQuiz.id,
            quiz_name: selectedQuiz.title,
            created_by: session.user.id,
            created_at: new Date().toISOString()
          })

        if (historyError) {
          console.error('Error recording history:', historyError)
          throw historyError
        }
      } else {
        // Handle quiz data
        const mappedData = data.questions.map(row => ({
          title: row.question,
          description: '',
          time_limit: 30,
          category_id: '',
          sub_category_id: '',
          education_system_id: '',
          is_published: false,
          created_by: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('quizzes')
          .insert(mappedData)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Successfully uploaded ${data.questions.length} ${type}`,
      })

      onOpenChange(false)
      setFile(null)
      setMappings({})
      setHeaders([])
      setSelectedQuiz(null)
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to upload ${type}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getAvailableFields = () => {
    if (type === 'quizzes') {
      return [
        { value: 'title', label: 'Title' },
        { value: 'description', label: 'Description' },
        { value: 'time_limit', label: 'Time Limit' },
        { value: 'category_id', label: 'Category ID' },
        { value: 'sub_category_id', label: 'Sub Category ID' },
        { value: 'education_system_id', label: 'Education System ID' },
        { value: 'is_published', label: 'Is Published' }
      ]
    }
    return [
      { value: 'question', label: 'Question Text' },
      { value: 'correct_answer', label: 'Correct Answer' },
      { value: 'incorrect_answers', label: 'Incorrect Answers' },
      { value: 'explanation', label: 'Explanation' },
      { value: 'category', label: 'Category' },
      { value: 'difficulty', label: 'Difficulty' }
    ]
  }

  const downloadTemplate = async () => {
    try {
      const workbook = await generateTemplates(type)
      XLSX.writeFile(workbook, `${type}-template.xlsx`)

      toast({
        title: "Success",
        description: "Template downloaded with reference data",
      })
    } catch (error) {
      console.error('Error downloading template:', error)
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload {type}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {type === 'questions' && (
            <div className="space-y-4 mb-4">
              <h3 className="font-medium">Select Quiz</h3>
              <select
                value={selectedQuiz?.id || ''}
                onChange={(e) => {
                  const quiz = quizzes.find(q => q.id === e.target.value)
                  setSelectedQuiz(quiz || null)
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a quiz</option>
                {quizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-2 border-dashed rounded-lg p-6">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <FileSpreadsheet className="h-12 w-12 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                Click to select CSV or Excel file
              </span>
            </label>
          </div>

          {headers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Map CSV Fields</h3>
              {headers.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <span className="text-sm">{header}</span>
                  <select
                    value={mappings[header]}
                    onChange={(e) => setMappings({
                      ...mappings,
                      [header]: e.target.value
                    })}
                    className="flex-1 p-2 border rounded"
                  >
                    <option value="">Skip this field</option>
                    {getAvailableFields().map(field => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}