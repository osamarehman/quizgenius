import { useState, useCallback } from 'react'
import { 
  ValidationResult, 
  ValidationSeverity,
  ValidationCategory 
} from '@/lib/ai/types'

interface ValidationStatus {
  isValid: boolean
  hasErrors: boolean
  hasWarnings: boolean
  hasInfo: boolean
  severityCounts: Record<ValidationSeverity, number>
  categoryCounts: Record<ValidationCategory, number>
  autoFixableCount: number
}

export function useValidationStatus(initialResult?: ValidationResult) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(initialResult ?? null)

  const getStatus = useCallback((): ValidationStatus | null => {
    if (!validationResult) return null

    const severityCounts: Record<ValidationSeverity, number> = {
      error: 0,
      warning: 0,
      info: 0
    }

    const categoryCounts: Record<ValidationCategory, number> = {
      content: 0,
      structure: 0,
      pedagogy: 0,
      accessibility: 0
    }

    let autoFixableCount = 0

    validationResult.all.forEach(result => {
      if (!result.passed) {
        severityCounts[result.severity]++
        categoryCounts[result.category]++
        if (result.autoFix) autoFixableCount++
      }
    })

    return {
      isValid: validationResult.isValid,
      hasErrors: severityCounts.error > 0,
      hasWarnings: severityCounts.warning > 0,
      hasInfo: severityCounts.info > 0,
      severityCounts,
      categoryCounts,
      autoFixableCount
    }
  }, [validationResult])

  const updateValidationResult = useCallback((newResult: ValidationResult) => {
    setValidationResult(newResult)
  }, [])

  const resetValidationStatus = useCallback(() => {
    setValidationResult(null)
  }, [])

  return {
    validationResult,
    status: getStatus(),
    updateValidationResult,
    resetValidationStatus
  }
} 