import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AIError, ErrorCode, RetryOptions, defaultRetryOptions, createAIError } from '@/lib/ai/errors'

interface UseAIOperationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: AIError) => void
  retryOptions?: Partial<RetryOptions>
}

export function useAIOperation<T = unknown>(
  operation: () => Promise<T>,
  options: UseAIOperationOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AIError | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

  const retryOptions = {
    ...defaultRetryOptions,
    ...options.retryOptions
  }

  const handleError = useCallback((error: unknown) => {
    const aiError = error instanceof AIError 
      ? error 
      : createAIError(
          ErrorCode.UNEXPECTED,
          error instanceof Error ? error.message : 'Unknown error'
        )

    setError(aiError)
    options.onError?.(aiError)

    toast({
      title: aiError.details.code,
      description: aiError.message,
      variant: "destructive",
    })
  }, [options.onError, toast])

  const execute = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await operation()
      options.onSuccess?.(result)
      return result
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [operation, options.onSuccess, handleError])

  const retry = useCallback(async () => {
    if (!error?.details.retryable || retryCount >= retryOptions.maxAttempts) {
      toast({
        title: "Error",
        description: `Maximum retry attempts (${retryOptions.maxAttempts}) reached`,
        variant: "destructive",
      })
      return null
    }

    setRetryCount(prev => prev + 1)
    return execute()
  }, [error, retryCount, retryOptions.maxAttempts, execute, toast])

  const reset = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    error,
    retryCount,
    canRetry: error?.details.retryable && retryCount < retryOptions.maxAttempts,
    execute,
    retry,
    reset
  }
} 