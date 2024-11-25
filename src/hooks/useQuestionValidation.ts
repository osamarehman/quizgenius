import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  Question,
  ValidationResult,
  ValidationSummary,
  ValidationCategory,
  ValidationSeverity 
} from '@/lib/ai/types'
import { validateQuestionBatch } from '@/lib/ai/batchValidation'
import { useAIOperation } from './useAIOperation'

interface UseQuestionValidationOptions {
  subject?: string
  educationSystem?: string
  onValidationComplete?: (result: ValidationResult) => void
}

export function useQuestionValidation(options: UseQuestionValidationOptions = {}) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()

  const validateQuestion = useCallback(async (question: Question) => {
    try {
      setIsValidating(true)
      const result = await validateQuestionBatch(
        [question],
        options.subject,
        options.educationSystem
      )

      const validationResult = result.results[0]
      setValidationResult(validationResult)
      options.onValidationComplete?.(validationResult)

      if (!validationResult.isValid) {
        toast({
          title: "Validation Issues Found",
          description: `${validationResult.errors.length} errors, ${validationResult.warnings.length} warnings`,
          variant: "warning",
        })
      } else {
        toast({
          title: "Validation Passed",
          description: "Question meets all requirements",
          variant: "default",
        })
      }

      return validationResult
    } catch (error) {
      console.error('Validation error:', error)
      toast({
        title: "Validation Error",
        description: "Failed to validate question",
        variant: "destructive",
      })
      return null
    } finally {
      setIsValidating(false)
    }
  }, [options.subject, options.educationSystem, options.onValidationComplete, toast])

  const getValidationSummary = useCallback(() => {
    if (!validationResult) return null

    return {
      errors: validationResult.errors.length,
      warnings: validationResult.warnings.length,
      info: validationResult.info.length,
      categories: validationResult.all.reduce((acc, result) => {
        if (!result.passed) {
          acc[result.category] = (acc[result.category] || 0) + 1
        }
        return acc
      }, {} as Record<ValidationCategory, number>)
    }
  }, [validationResult])

  const getSeverityCount = useCallback((severity: ValidationSeverity) => {
    if (!validationResult) return 0
    return validationResult.all.filter(r => !r.passed && r.severity === severity).length
  }, [validationResult])

  const getCategoryIssues = useCallback((category: ValidationCategory) => {
    if (!validationResult) return []
    return validationResult.all.filter(r => !r.passed && r.category === category)
  }, [validationResult])

  const hasAutoFixableIssues = useCallback(() => {
    if (!validationResult) return false
    return validationResult.all.some(r => !r.passed && r.autoFix)
  }, [validationResult])

  const resetValidation = useCallback(() => {
    setValidationResult(null)
  }, [])

  return {
    validationResult,
    isValidating,
    validateQuestion,
    getValidationSummary,
    getSeverityCount,
    getCategoryIssues,
    hasAutoFixableIssues,
    resetValidation,
    hasErrors: validationResult?.errors.length > 0,
    hasWarnings: validationResult?.warnings.length > 0,
    isValid: validationResult?.isValid ?? false
  }
} 