import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AIError, ErrorCode } from '@/lib/ai/errorHandling'

interface UseAIErrorHandlingOptions {
  maxRetries?: number
  onError?: (error: AIError) => void
  onRetry?: () => Promise<void>
  retryableErrors?: ErrorCode[]
}

export function useAIErrorHandling(options: UseAIErrorHandlingOptions = {}) {
  const {
    maxRetries = 3,
    onError,
    onRetry,
    retryableErrors = [
      ErrorCode.API_ERROR,
      ErrorCode.RATE_LIMIT,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT
    ]
  } = options

  const [error, setError] = useState<AIError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

  const handleError = useCallback((error: unknown) => {
    const aiError = error instanceof AIError 
      ? error 
      : new AIError('An unexpected error occurred', {
          code: ErrorCode.UNEXPECTED,
          message: error instanceof Error ? error.message : 'Unknown error',
          retryable: false,
          severity: 'error'
        })

    setError(aiError)
    onError?.(aiError)

    toast({
      title: aiError.details.code,
      description: aiError.message,
      variant: "destructive",
    })
  }, [onError, toast])

  const retry = useCallback(async () => {
    if (!error || !onRetry) return
    if (retryCount >= maxRetries) {
      toast({
        title: "Error",
        description: `Maximum retry attempts (${maxRetries}) reached`,
        variant: "destructive",
      })
      return
    }

    if (!retryableErrors.includes(error.details.code)) {
      toast({
        title: "Error",
        description: "This error cannot be retried",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRetrying(true)
      await onRetry()
      setError(null)
      setRetryCount(0)
      
      toast({
        title: "Success",
        description: "Operation completed successfully after retry",
      })
    } catch (newError) {
      handleError(newError)
      setRetryCount(prev => prev + 1)
    } finally {
      setIsRetrying(false)
    }
  }, [error, retryCount, maxRetries, onRetry, retryableErrors, handleError, toast])

  const reset = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setIsRetrying(false)
  }, [])

  return {
    error,
    isRetrying,
    retryCount,
    canRetry: error?.details.retryable && retryCount < maxRetries,
    handleError,
    retry,
    reset
  }
} 