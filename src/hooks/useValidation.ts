import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  Question, 
  ValidationResult, 
  ValidationSummary 
} from '@/lib/ai/types'
import { validateQuestionBatch } from '@/lib/ai/batchValidation'
import { useAIErrorHandling } from './useAIErrorHandling'

interface UseValidationOptions {
  subject?: string
  educationSystem?: string
  onValidationComplete?: (results: ValidationResult[]) => void
}

export function useValidation(options: UseValidationOptions = {}) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [summary, setSummary] = useState<ValidationSummary | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()
  const { handleError } = useAIErrorHandling()

  const validateQuestions = useCallback(async (
    questions: Question[],
    batchSize = 5
  ) => {
    try {
      setIsValidating(true)
      setProgress(0)

      const results: ValidationResult[] = []

      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, Math.min(i + batchSize, questions.length))
        const batchResults = await validateQuestionBatch(
          batch,
          options.subject,
          options.educationSystem
        )
        
        results.push(...batchResults.results)
        setProgress(((i + batch.length) / questions.length) * 100)
      }

      setValidationResults(results)
      options.onValidationComplete?.(results)

      // Calculate summary
      const summary: ValidationSummary = {
        totalQuestions: questions.length,
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

      setSummary(summary)

      toast({
        title: "Validation Complete",
        description: `${summary.validQuestions} of ${summary.totalQuestions} questions valid`,
      })
    } catch (error) {
      handleError(error)
    } finally {
      setIsValidating(false)
      setProgress(0)
    }
  }, [options.subject, options.educationSystem, options.onValidationComplete, toast, handleError])

  const resetValidation = useCallback(() => {
    setValidationResults([])
    setSummary(null)
    setProgress(0)
    setIsValidating(false)
  }, [])

  return {
    isValidating,
    validationResults,
    summary,
    progress,
    validateQuestions,
    resetValidation
  }
} 