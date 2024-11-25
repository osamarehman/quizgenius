'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import OpenAI from 'openai'
import { splitIntoChunks, preprocessText } from '@/lib/ai/fileProcessing'
import { RefreshCw, Loader2 } from "lucide-react"
import { PromptCustomization } from './PromptCustomization'
import { defaultPrompts } from '@/lib/prompts/defaultPrompts'

interface QuestionGenerationProps {
  quizData: {
    materials: File[]
    title: string
    description: string
    category: string
    educationSystem: string
  }
  onUpdate: (data: any) => void
}

interface GeneratedQuestion {
  id: string
  text: string
  type: 'mcq' | 'true-false' | 'blanks'
  explanation?: string
  answers: {
    id: string
    text: string
    isCorrect: boolean
    explanation?: string
  }[]
}

export function QuestionGeneration({ quizData, onUpdate }: QuestionGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const { toast } = useToast()
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({})

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const generateQuestions = async () => {
    try {
      setIsGenerating(true)

      // Process and combine all material text
      let combinedText = ''
      for (const file of quizData.materials) {
        const text = await file.text()
        combinedText += preprocessText(text) + '\n\n'
      }

      // Split text into manageable chunks (max 50,000 characters per chunk)
      const chunks = splitIntoChunks(combinedText, 50000)
      const allQuestions: GeneratedQuestion[] = []

      // Process each chunk
      for (const chunk of chunks) {
        // Create an assistant for each chunk
        const assistant = await openai.beta.assistants.create({
          name: "Quiz Generator",
          instructions: customPrompts['context'] || defaultPrompts.context,
          tools: [{ type: "code_interpreter" }],
          model: "gpt-4-1106-preview"
        })

        // Create a thread
        const thread = await openai.beta.threads.create()

        // Add message to thread
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: "Generate questions based on the provided content."
        })

        // Run the assistant
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistant.id
        })

        // Poll for completion
        while (true) {
          const status = await openai.beta.threads.runs.retrieve(thread.id, run.id)
          
          if (status.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id)
            const response = messages.data[0].content[0]
            
            if ('text' in response) {
              const questions = parseQuestions(response.text.value)
              allQuestions.push(...questions)
            }
            break
          }
          
          if (status.status === 'failed') {
            throw new Error('Failed to generate questions for chunk')
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Clean up
        await openai.beta.assistants.del(assistant.id)
      }

      setGeneratedQuestions(allQuestions)
      onUpdate({ ...quizData, questions: allQuestions })
      
      toast({
        title: "Success",
        description: `Generated ${allQuestions.length} questions`,
      })
    } catch (error) {
      console.error('Error generating questions:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate questions',
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const parseQuestions = (text: string): GeneratedQuestion[] => {
    try {
      // Split text into question blocks
      const questionBlocks = text.split(/Q\d+[\):.]/g).filter(block => block.trim())
      const timestamp = Date.now() // Add timestamp for unique keys
      
      return questionBlocks.map((block, index) => {
        const lines = block.trim().split('\n').filter(line => line.trim())
        
        // First line is the question text
        const questionText = lines[0].trim()
        
        // Next 4 lines are options
        const options = lines.slice(1, 5).map(line => {
          const optionMatch = line.match(/[A-D][\):.]\s*(.+)/)
          return optionMatch ? optionMatch[1].trim() : line.trim()
        })
        
        // Find correct answer
        const correctAnswerLine = lines.find(line => line.toLowerCase().includes('correct'))
        const correctAnswerIndex = correctAnswerLine 
          ? 'ABCD'.indexOf(correctAnswerLine.match(/[A-D]/)?.[0] || 'A')
          : 0
        
        // Find explanation
        const explanationIndex = lines.findIndex(line => 
          line.toLowerCase().includes('explanation') || 
          line.toLowerCase().includes('reason')
        )
        const explanation = explanationIndex !== -1
          ? lines.slice(explanationIndex + 1).join('\n')
          : ''

        // Generate a unique ID using timestamp and index
        const uniqueId = `gen-${timestamp}-${index}`

        return {
          id: uniqueId,
          text: questionText,
          type: 'mcq',
          explanation,
          answers: options.map((text, i) => ({
            id: `${uniqueId}-ans-${i}`, // Add unique IDs for answers too
            text,
            isCorrect: i === correctAnswerIndex,
            explanation: ''
          }))
        }
      })
    } catch (error) {
      console.error('Error parsing questions:', error)
      return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Prompt Customization */}
      <PromptCustomization 
        onPromptsChange={setCustomPrompts}
      />

      {/* Generation Controls */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Generate Questions</h3>
            <p className="text-sm text-muted-foreground">
              Generate questions from your study materials
            </p>
          </div>
          <Button
            onClick={generateQuestions}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Generated Questions</h3>
          {generatedQuestions.map((question) => (
            <Card key={question.id} className="p-4">
              <div className="space-y-4">
                <p className="font-medium">Question: {question.text}</p>
                <div className="space-y-2">
                  {question.answers.map((answer) => (
                    <div
                      key={answer.id} // Use the unique answer ID
                      className={`p-2 rounded ${
                        answer.isCorrect ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      {answer.text}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-2">
                    <p className="font-medium">Explanation:</p>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 