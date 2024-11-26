import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  ValidationResult, 
  ValidationError, 
  ValidationCategory,
  ValidationSeverity 
} from '@/lib/ai/types'

interface ValidationErrorState {
  hasError: boolean
  errors: ValidationError[]
  category?: ValidationCategory
  severity?: ValidationSeverity
}

interface UseValidationErrorOptions {
  onError?: (errors: ValidationError[]) => void
  onResolve?: () => void
}

export function useValidationError(options: UseValidationErrorOptions = {}) {
  const { toast } = useToast()
  const [errorState, setErrorState] = useState<ValidationErrorState>({
    hasError: false,
    errors: []
  })

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useCallback(() => options, [options])()

  const handleValidationError = useCallback((
    result: ValidationResult,
    category?: ValidationCategory,
    severity?: ValidationSeverity
  ) => {
    const filteredErrors = result.all.filter(error => {
      if (category && error.category !== category) return false
      if (severity && error.severity !== severity) return false
      return !error.passed
    })

    if (filteredErrors.length > 0) {
      setErrorState({
        hasError: true,
        errors: filteredErrors,
        category,
        severity
      })

      memoizedOptions.onError?.(filteredErrors)

      // Show toast for critical errors
      if (severity === 'error' || !severity) {
        toast({
          title: "Validation Failed",
          description: `${filteredErrors.length} validation ${
            filteredErrors.length === 1 ? 'error' : 'errors'
          } found`,
          variant: "destructive",
        })
      }
    }
  }, [memoizedOptions, toast])

  const clearErrors = useCallback(() => {
    setErrorState({
      hasError: false,
      errors: []
    })
    memoizedOptions.onResolve?.()
  }, [memoizedOptions])

  const getErrorsByCategory = useCallback((category: ValidationCategory) => {
    return errorState.errors.filter(error => error.category === category)
  }, [errorState.errors])

  const getErrorsBySeverity = useCallback((severity: ValidationSeverity) => {
    return errorState.errors.filter(error => error.severity === severity)
  }, [errorState.errors])

  const hasErrorsOfType = useCallback((
    category?: ValidationCategory,
    severity?: ValidationSeverity
  ) => {
    return errorState.errors.some(error => {
      if (category && error.category !== category) return false
      if (severity && error.severity !== severity) return false
      return true
    })
  }, [errorState.errors])

  const getErrorSummary = useCallback(() => {
    return {
      total: errorState.errors.length,
      bySeverity: {
        error: getErrorsBySeverity('error').length,
        warning: getErrorsBySeverity('warning').length,
        info: getErrorsBySeverity('info').length
      },
      byCategory: {
        content: getErrorsByCategory('content').length,
        structure: getErrorsByCategory('structure').length,
        pedagogy: getErrorsByCategory('pedagogy').length,
        accessibility: getErrorsByCategory('accessibility').length
      }
    }
  }, [errorState.errors, getErrorsByCategory, getErrorsBySeverity])

  return {
    ...errorState,
    handleValidationError,
    clearErrors,
    getErrorsByCategory,
    getErrorsBySeverity,
    hasErrorsOfType,
    getErrorSummary
  }
} 