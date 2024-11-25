import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  Question, 
  ValidationResult, 
  ValidationError,
  ValidationCategory,
  ValidationSeverity 
} from '@/lib/ai/types'
import { validateQuestionBatch } from '@/lib/ai/batchValidation'
import { useAIErrorHandling } from './useAIErrorHandling'

interface UseRealTimeValidationOptions {
  subject?: string
  educationSystem?: string
  debounceMs?: number
  onValidationComplete?: (result: ValidationResult) => void
}

export function useRealTimeValidation(
  options: UseRealTimeValidationOptions = {}
) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { handleError } = useAIErrorHandling()

  const validateQuestion = useCallback(async (question: Question) => {
    try {
      setIsValidating(true)
      const result = await validateQuestionBatch(
        [question],
        options.subject,
        options.educationSystem
      )

      setValidationResult(result.results[0])
      options.onValidationComplete?.(result.results[0])

      // Show toast only for errors
      if (result.results[0].errors.length > 0) {
        toast({
          title: "Validation Issues",
          description: `Found ${result.results[0].errors.length} validation errors`,
          variant: "destructive",
        })
      }

      return result.results[0]
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setIsValidating(false)
    }
  }, [options.subject, options.educationSystem, options.onValidationComplete, toast, handleError])

  const debouncedValidate = useCallback((question: Question) => {
    if (validationTimeout) {
      clearTimeout(validationTimeout)
    }

    const timeout = setTimeout(() => {
      validateQuestion(question)
    }, options.debounceMs || 500)

    setValidationTimeout(timeout)
  }, [validateQuestion, options.debounceMs, validationTimeout])

  const getValidationStatus = useCallback((
    category?: ValidationCategory,
    severity?: ValidationSeverity
  ) => {
    if (!validationResult) return null

    const filteredErrors = validationResult.all.filter(error => {
      if (category && error.category !== category) return false
      if (severity && error.severity !== severity) return false
      return !error.passed
    })

    return {
      hasIssues: filteredErrors.length > 0,
      issueCount: filteredErrors.length,
      issues: filteredErrors
    }
  }, [validationResult])

  const getCategoryStatus = useCallback((category: ValidationCategory) => {
    if (!validationResult) return null

    const categoryIssues = validationResult.all.filter(
      error => !error.passed && error.category === category
    )

    return {
      errors: categoryIssues.filter(issue => issue.severity === 'error').length,
      warnings: categoryIssues.filter(issue => issue.severity === 'warning').length,
      info: categoryIssues.filter(issue => issue.severity === 'info').length,
      total: categoryIssues.length,
      hasIssues: categoryIssues.length > 0
    }
  }, [validationResult])

  const resetValidation = useCallback(() => {
    if (validationTimeout) {
      clearTimeout(validationTimeout)
    }
    setValidationResult(null)
    setIsValidating(false)
  }, [validationTimeout])

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout)
      }
    }
  }, [validationTimeout])

  return {
    isValidating,
    validationResult,
    validateQuestion,
    debouncedValidate,
    getValidationStatus,
    getCategoryStatus,
    resetValidation,
    hasErrors: validationResult?.errors.length ?? 0 > 0,
    hasWarnings: validationResult?.warnings.length ?? 0 > 0,
    isValid: validationResult?.isValid ?? false
  }
} 