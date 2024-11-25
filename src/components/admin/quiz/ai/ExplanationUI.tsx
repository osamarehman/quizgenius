'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, Book, Lightbulb } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExplanationStyle } from '@/lib/ai/types'
import { generateExplanations } from '@/lib/ai/explanationGenerator'
import OpenAI from 'openai'

interface ExplanationUIProps {
  question: {
    text: string
    type: string
    answers: Array<{ text: string; isCorrect: boolean }>
  }
  onUpdate: (explanations: {
    questionExplanation: string
    answerExplanations: string[]
  }) => void
}

export function ExplanationUI({ question, onUpdate }: ExplanationUIProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [style, setStyle] = useState<ExplanationStyle>('basic')
  const [includeExamples, setIncludeExamples] = useState(true)
  const [includeReferences, setIncludeReferences] = useState(false)
  const { toast } = useToast()
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const handleGenerateExplanation = async () => {
    try {
      setIsGenerating(true)
      const explanations = await generateExplanations(
        question,
        {
          style,
          subject: 'subject', // TODO: Get from context
          level: 'level', // TODO: Get from context
          includeExamples,
          includeReferences
        },
        openai
      )

      onUpdate(explanations)
      toast({
        title: "Success",
        description: "Explanations generated successfully",
      })
    } catch (error) {
      console.error('Error generating explanations:', error)
      toast({
        title: "Error",
        description: "Failed to generate explanations",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">Generate Explanations</h3>
          <p className="text-sm text-muted-foreground">
            Generate AI-powered explanations for this question
          </p>
        </div>
        <Button
          onClick={handleGenerateExplanation}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Explanation Style</Label>
          <Select
            value={style}
            onValueChange={(value) => setStyle(value as ExplanationStyle)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="conceptual">Conceptual</SelectItem>
              <SelectItem value="practical">Practical</SelectItem>
              <SelectItem value="step_by_step">Step by Step</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={includeExamples ? "default" : "outline"}
            onClick={() => setIncludeExamples(!includeExamples)}
            size="sm"
          >
            <Book className="mr-2 h-4 w-4" />
            Include Examples
          </Button>
          <Button
            variant={includeReferences ? "default" : "outline"}
            onClick={() => setIncludeReferences(!includeReferences)}
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Include References
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{question.text}</p>
            <div className="mt-4 space-y-2">
              {question.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    answer.isCorrect ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  {answer.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 