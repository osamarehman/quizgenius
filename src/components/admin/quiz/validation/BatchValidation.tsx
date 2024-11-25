'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { validateQuestion, getValidationSummary } from '@/lib/ai/validation'
import { Question } from '@/lib/ai/types'

interface BatchValidationProps {
  questions: Question[]
  onValidationComplete: (results: any) => void
}

export function BatchValidation({ questions, onValidationComplete }: BatchValidationProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)

  const runBatchValidation = async () => {
    setIsValidating(true)
    const results = []
    
    for (let i = 0; i < questions.length; i++) {
      const validationResult = validateQuestion(questions[i])
      results.push({
        questionIndex: i,
        ...validationResult
      })
      setProgress(((i + 1) / questions.length) * 100)
    }

    const summary = results.reduce((acc, curr) => ({
      totalErrors: acc.totalErrors + curr.errors.length,
      totalWarnings: acc.totalWarnings + curr.warnings.length,
      totalInfo: acc.totalInfo + curr.info.length,
      categories: {
        content: acc.categories.content + curr.all.filter(r => !r.passed && r.category === 'content').length,
        structure: acc.categories.structure + curr.all.filter(r => !r.passed && r.category === 'structure').length,
        pedagogy: acc.categories.pedagogy + curr.all.filter(r => !r.passed && r.category === 'pedagogy').length,
        accessibility: acc.categories.accessibility + curr.all.filter(r => !r.passed && r.category === 'accessibility').length,
      }
    }), {
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      categories: {
        content: 0,
        structure: 0,
        pedagogy: 0,
        accessibility: 0
      }
    })

    onValidationComplete({ results, summary })
    setIsValidating(false)
    setProgress(0)
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Batch Validation</h3>
        <Button
          onClick={runBatchValidation}
          disabled={isValidating}
        >
          {isValidating ? 'Validating...' : 'Validate All Questions'}
        </Button>
      </div>

      {isValidating && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">
            Validating questions... {Math.round(progress)}%
          </p>
        </div>
      )}
    </Card>
  )
} 