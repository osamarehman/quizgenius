'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'
import { useQuizStore } from "@/lib/stores/useQuizStore"

interface Question {
  id: string
  text: string
  answers: Answer[]
  correctAnswer: string
  explanation: string
}

interface Answer {
  id: string
  text: string
  isCorrect: boolean
}

interface QuestionGenerationProps {
  onNext: () => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  questions: Question[]
  setQuestions: (questions: Question[]) => void
}

export function QuestionGeneration({
  onNext,
  onBack,
  isFirstStep,
  questions,
  setQuestions
}: Omit<QuestionGenerationProps, 'isLastStep'>) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentChunk, setCurrentChunk] = useState<string>('')
  const { toast } = useToast()
  const quizData = useQuizStore(state => state.quizData)

  const parseQuestions = useCallback((text: string) => {
    try {
      // Split text into question blocks
      const questionBlocks = text.split(/Q\d+[\):.]/g).filter(block => block.trim())
      const timestamp = Date.now() // Add timestamp for unique keys
      
      return questionBlocks.map((block, index) => {
        // Extract question text
        const questionMatch = block.match(/([^?]+\?)/)?.[0] || ''
        const questionText = questionMatch.trim()

        // Extract options
        const optionsMatch = block.match(/[A-D][):.]\s*([^A-D\n]+)/g) || []
        const options = optionsMatch.map(opt => opt.replace(/^[A-D][):.]\s*/, '').trim())

        // Extract correct answer
        const correctAnswerMatch = block.match(/Correct Answer:\s*([A-D])/i)
        const correctAnswerLetter = correctAnswerMatch?.[1] || 'A'
        const correctAnswerIndex = correctAnswerLetter.charCodeAt(0) - 65 // Convert A-D to 0-3

        // Extract explanation
        const explanationMatch = block.match(/Explanation:\s*([^\n]+)/i)
        const explanation = explanationMatch?.[1]?.trim() || ''

        const uniqueId = `gen-${timestamp}-${index}`

        return {
          id: uniqueId,
          text: questionText,
          answers: options.map((text, i) => ({
            id: `${uniqueId}-ans-${i}`,
            text,
            isCorrect: i === correctAnswerIndex
          })),
          correctAnswer: options[correctAnswerIndex],
          explanation
        }
      })
    } catch (error) {
      console.error('Error parsing questions:', error)
      if (error instanceof Error) {
        toast({
          title: "Error parsing questions",
          description: error.message,
          variant: "destructive",
        })
      }
      return []
    }
  }, [toast])

  const processChunk = useCallback(async (text: string) => {
    try {
      const parsedQuestions = parseQuestions(text)
      setQuestions(prev => [...prev, ...parsedQuestions])
      setProgress(prev => Math.min(prev + 10, 100))
      setCurrentChunk('')
    } catch (error) {
      console.error('Error processing chunk:', error)
      if (error instanceof Error) {
        toast({
          title: "Error processing questions",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }, [parseQuestions, setQuestions, toast, setProgress, setCurrentChunk])

  const generateQuestions = useCallback(async () => {
    if (isProcessing || !quizData.materials.length) return

    try {
      setIsProcessing(true)
      setProgress(0)
      setQuestions([])

      for (const material of quizData.materials) {
        await processChunk(material.content)
      }

      onNext()
    } catch (error) {
      console.error('Error generating questions:', error)
      if (error instanceof Error) {
        toast({
          title: "Error generating questions",
          description: error.message,
          variant: "destructive",
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, quizData.materials, processChunk, setQuestions, onNext, toast, setIsProcessing])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generate Questions</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep || isProcessing}
          >
            Back
          </Button>
          <Button
            onClick={generateQuestions}
            disabled={isProcessing || quizData.materials.length === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Questions'
            )}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Generating questions...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {currentChunk && (
            <div className="text-sm text-muted-foreground mt-2">
              Processing: {currentChunk.substring(0, 100)}...
            </div>
          )}
        </div>
      )}

      {/* Generated Questions */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Generated Questions ({questions.length})
          </h3>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="font-medium mb-2">
                  {index + 1}. {question.text}
                </div>
                <div className="space-y-2 ml-4">
                  {question.answers.map((answer, i) => (
                    <div
                      key={answer.id}
                      className={`${
                        answer.isCorrect ? 'text-green-600 font-medium' : ''
                      }`}
                    >
                      {String.fromCharCode(65 + i)}) {answer.text}
                    </div>
                  ))}
                  {question.explanation && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Explanation: {question.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}