'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

// Types
interface BulkUploadModalProps {
  type: 'quizzes' | 'questions'
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FileValidationResult {
  file: File
  isValid: boolean
  errors: string[]
}

interface Quiz {
  id: string
  title: string
}

interface Question {
  question_text: string
  answer_1: string
  answer_2: string
  answer_3: string
  answer_4: string
  correct_answer: string
  explanation?: string
  category?: string
  difficulty?: string
  answer_1_explanation?: string
  answer_2_explanation?: string
  answer_3_explanation?: string
  answer_4_explanation?: string
  answer_5?: string
  answer_5_explanation?: string
  answer_6?: string
  answer_6_explanation?: string
  question_type?: string
  position?: number
}

interface UploadData {
  questions: Question[]
  metadata: {
    totalRows: number
    validRows: number
    errors: string[]
  }
}

export function BulkUploadModal({ type, open, onOpenChange }: BulkUploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [validationResults, setValidationResults] = useState<FileValidationResult[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const { toast } = useToast()

  const validateFiles = (files: File[]): FileValidationResult[] => {
    return files.map(file => {
      const errors: string[] = []
      
      // Check file type
      if (!file.type.includes('csv') && !file.type.includes('excel')) {
        errors.push('Invalid file type. Only CSV and Excel files are allowed.')
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push('File size exceeds 5MB limit.')
      }

      return {
        file,
        isValid: errors.length === 0,
        errors
      }
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      const results = validateFiles(newFiles)
      setValidationResults(results)
      
      const validFiles = newFiles.filter((_, index) => results[index].isValid)
      setFiles(validFiles)

      // Show errors for invalid files
      results.forEach(result => {
        if (!result.isValid) {
          toast({
            title: `Invalid file: ${result.file.name}`,
            description: result.errors.join(' '),
            variant: "destructive"
          })
        }
      })
    }
  }

  const processQuestions = async (questions: Question[], quizId: string) => {
    try {
      const { data: existingQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('position')
        .eq('quiz_id', quizId)
        .order('position', { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      let startPosition = existingQuestions && existingQuestions.length > 0
        ? existingQuestions[0].position + 1
        : 1

      for (const question of questions) {
        // Only validate question text as required
        if (!question.question_text) {
          throw new Error('Question text is required')
        }

        // Create question object with only provided fields
        const questionData: {
          quiz_id: string
          question_text: string
          question_type: string
          position: number
          question_explanation?: string
        } = {
          quiz_id: quizId,
          question_text: question.question_text,
          question_type: 'mcq',
          position: startPosition++
        }

        // Add optional fields only if they exist
        if (question.question_explanation) {
          questionData.question_explanation = question.question_explanation
        }
        if (question.question_type) {
          questionData.question_type = question.question_type
        }
        if (question.position) {
          questionData.position = question.position
        }

        const { data: insertedQuestion, error: questionError } = await supabase
          .from('questions')
          .insert(questionData)
          .select()
          .single()

        if (questionError || !insertedQuestion) {
          throw questionError || new Error('Failed to insert question')
        }

        // Process answers - collect only provided answers
        const answers = []
        const answerFields = [
          { text: question.answer_1, explanation: question.answer_1_explanation },
          { text: question.answer_2, explanation: question.answer_2_explanation },
          { text: question.answer_3, explanation: question.answer_3_explanation },
          { text: question.answer_4, explanation: question.answer_4_explanation },
          { text: question.answer_5, explanation: question.answer_5_explanation },
          { text: question.answer_6, explanation: question.answer_6_explanation }
        ]

        answerFields.forEach((answer, index) => {
          if (answer.text) {
            const answerData: {
              answer_text: string
              is_correct: boolean
              position: number
              question_id: string
              explanation?: string
            } = {
              answer_text: answer.text,
              is_correct: answer.text === question.correct_answer,
              position: index + 1,
              question_id: insertedQuestion.id
            }
            
            if (answer.explanation) {
              answerData.explanation = answer.explanation
            }
            
            answers.push(answerData)
          }
        })

        // Ensure at least one answer exists
        if (answers.length === 0) {
          throw new Error('At least one answer is required')
        }

        // Insert only the provided answers
        const { error: answersError } = await supabase
          .from('answers')
          .insert(answers)

        if (answersError) {
          throw answersError
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error processing questions:', error)
      return { success: false, error }
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUploading(true)

      for (const file of files) {
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
              created_by: supabase.auth.user()?.id,
              created_at: new Date().toISOString()
            })

          if (historyError) {
            console.error('Error recording history:', historyError)
            throw historyError
          }
        } else {
          // Handle quiz data
          const mappedData = data.questions.map(row => ({
            title: row.question_text,
            description: '',
            time_limit: 30,
            category_id: '',
            sub_category_id: '',
            education_system_id: '',
            is_published: false,
            created_by: supabase.auth.user()?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          const { error } = await supabase
            .from('quizzes')
            .insert(mappedData)

          if (error) throw error
        }
      }

      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${files.length} file(s).`
      })
      onOpenChange(false)
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive"
        })
      }
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    const loadQuizzes = async () => {
      if (type === 'questions' && open) {
        await fetchQuizzes();
      }
    };
    void loadQuizzes();
  }, [type, open, fetchQuizzes]);

  const fetchQuizzes = useCallback(async () => {
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
  }, [toast])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload {type}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          <div>
            <Label htmlFor="file-upload">Select Files</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFiles(files.filter((_, i) => i !== index))
                        setValidationResults(validationResults.filter((_, i) => i !== index))
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onOpenChange} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}