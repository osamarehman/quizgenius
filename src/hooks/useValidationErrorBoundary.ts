import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AIError } from '@/lib/ai/types'

interface UseValidationErrorBoundaryOptions {
  onError?: (error: Error) => void
  onRetry?: () => Promise<void>
}

export function useValidationErrorBoundary(options: UseValidationErrorBoundaryOptions = {}) {
  const [error, setError] = useState<Error | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const { toast } = useToast()

  const handleError = useCallback((error: Error) => {
    setError(error)
    options.onError?.(error)

    if (error instanceof AIError && error.details?.category === 'validation') {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Error",
        description: "An unexpected error occurred during validation",
        variant: "destructive",
      })
    }
  }, [options.onError, toast])

  const retry = useCallback(async () => {
    if (!options.onRetry) return

    try {
      setIsRetrying(true)
      await options.onRetry()
      setError(null)
      
      toast({
        title: "Success",
        description: "Validation completed successfully",
      })
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Retry failed'))
    } finally {
      setIsRetrying(false)
    }
  }, [options.onRetry, handleError, toast])

  return {
    error,
    isRetrying,
    handleError,
    retry,
    clearError: () => setError(null)
  }
} 