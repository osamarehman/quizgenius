import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AIError, ErrorCode } from '@/lib/ai/errorHandling'

interface ErrorState {
  hasError: boolean
  error: Error | null
  code?: ErrorCode
  retryCount: number
}

interface UseErrorHandlingOptions {
  maxRetries?: number
  onError?: (error: Error) => void
  onRetry?: () => void
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const { maxRetries = 3, onError, onRetry } = options
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0
  })
  const { toast } = useToast()

  const handleError = useCallback((error: unknown) => {
    const errorDetails = {
      hasError: true,
      error: error instanceof Error ? error : new Error('Unknown error'),
      code: error instanceof AIError ? error.details.code : ErrorCode.UNEXPECTED,
      retryCount: errorState.retryCount + 1
    }

    setErrorState(errorDetails)
    onError?.(errorDetails.error)

    toast({
      title: "Error",
      description: errorDetails.error.message,
      variant: "destructive",
    })
  }, [errorState.retryCount, onError, toast])

  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0
    })
  }, [])

  const retry = useCallback(async () => {
    if (errorState.retryCount >= maxRetries) {
      toast({
        title: "Error",
        description: `Maximum retry attempts (${maxRetries}) reached`,
        variant: "destructive",
      })
      return
    }

    try {
      onRetry?.()
      resetError()
    } catch (error) {
      handleError(error)
    }
  }, [errorState.retryCount, maxRetries, handleError, onRetry, resetError, toast])

  return {
    ...errorState,
    handleError,
    resetError,
    retry,
    canRetry: errorState.retryCount < maxRetries
  }
} 