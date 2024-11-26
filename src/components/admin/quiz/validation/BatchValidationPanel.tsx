'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react'
import { 
  Question,
  ValidationResult,
  ValidationSummary,
  ValidationCategory,
  ValidationSeverity 
} from '@/lib/ai/types'
import { validateQuestion } from '@/lib/ai/validation'

interface BatchValidationPanelProps {
  questions: Question[]
  subject?: string
  educationSystem?: string
  onValidationComplete?: (results: ValidationResult[]) => void
  onRetry?: () => void
}

export function BatchValidationPanel({
  questions,
  subject,
  educationSystem,
  onValidationComplete,
  onRetry
}: BatchValidationPanelProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [summary, setSummary] = useState<ValidationSummary | null>(null)

  const runBatchValidation = async () => {
    try {
      setIsValidating(true)
      setProgress(0)
      const results: ValidationResult[] = []

      // Process questions in batches
      for (let i = 0; i < questions.length; i++) {
        const result = await validateQuestion(questions[i], {
          subject,
          educationSystem
        })
        results.push(result)
        setValidationResults(prev => [...prev, result])
        setProgress(((i + 1) / questions.length) * 100)
      }

      // Calculate summary
      const summary = calculateValidationSummary(results)
      setSummary(summary)

      // Notify parent component
      if (onValidationComplete) {
        onValidationComplete(results)
      }
    } catch (error) {
      console.error('Batch validation error:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const getValidationStatusColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      case 'info':
        return 'text-blue-500'
      default:
        return 'text-green-500'
    }
  }

  const calculateValidationSummary = (results: ValidationResult[]) => {
    const summary: ValidationSummary = {
      totalQuestions: results.length,
      validQuestions: results.filter(r => r.isValid).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      totalInfo: results.reduce((sum, r) => sum + r.info.length, 0),
      categorySummary: {
        content: results.reduce((sum, r) => 
          sum + r.all.filter(i => !i.passed && i.category === 'content').length, 0),
        structure: results.reduce((sum, r) => 
          sum + r.all.filter(i => !i.passed && i.category === 'structure').length, 0),
        pedagogy: results.reduce((sum, r) => 
          sum + r.all.filter(i => !i.passed && i.category === 'pedagogy').length, 0),
        accessibility: results.reduce((sum, r) => 
          sum + r.all.filter(i => !i.passed && i.category === 'accessibility').length, 0)
      },
      autoFixableCount: results.reduce((sum, r) => 
        sum + r.all.filter(i => !i.passed && i.autoFix).length, 0)
    }

    return summary
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Validation Results</h3>
          {validationResults.length > 0 && (
            <p className="text-sm text-gray-500">
              {validationResults.length} questions processed
            </p>
          )}
        </div>
        <Button
          onClick={isValidating ? onRetry : runBatchValidation}
          disabled={isValidating}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Start Validation
            </>
          )}
        </Button>
      </div>

      {/* Progress */}
      {isValidating && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">
            Validating... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Valid Questions</p>
              <p className="text-2xl font-bold text-green-500">
                {summary.validQuestions}/{summary.totalQuestions}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Errors</p>
              <p className="text-2xl font-bold text-red-500">
                {summary.totalErrors}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Warnings</p>
              <p className="text-2xl font-bold text-yellow-500">
                {summary.totalWarnings}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Auto-fixable Issues</p>
              <p className="text-2xl font-bold text-blue-500">
                {summary.autoFixableCount}
              </p>
            </div>
          </div>

          {/* Category Summary */}
          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(summary.categorySummary) as [ValidationCategory, number][])
              .map(([category, count]) => (
                <div key={category} className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${getValidationStatusColor('info')}`}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium capitalize">{category}</p>
                    <p className="text-sm text-muted-foreground">
                      {count} issues found
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Success State */}
      {summary && summary.validQuestions === summary.totalQuestions && (
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle className="h-5 w-5" />
          <span>All questions passed validation!</span>
        </div>
      )}
    </Card>
  )
} 