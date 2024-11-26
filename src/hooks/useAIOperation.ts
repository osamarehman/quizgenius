import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface AIOperationOptions<T> {
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
  onProgress?: (progress: number) => void
  retryCount?: number
  retryDelay?: number
}

interface AIOperationState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  progress: number
}

export function useAIOperation<T>(
  operation: () => Promise<T>,
  options: AIOperationOptions<T> = {}
) {
  const [state, setState] = useState<AIOperationState<T>>({
    data: null,
    error: null,
    isLoading: false,
    progress: 0
  })

  const { onSuccess, onError, onProgress, retryCount = 3, retryDelay = 1000 } = options
  const { toast } = useToast()

  const executeOperation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    let attempts = 0

    const attempt = async (): Promise<T> => {
      try {
        const result = await operation()
        setState(prev => ({ ...prev, data: result, isLoading: false }))
        onSuccess?.(result)
        return result
      } catch (error) {
        if (attempts < retryCount) {
          attempts++
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          return attempt()
        }
        const finalError = error instanceof Error ? error : new Error('Operation failed')
        setState(prev => ({ ...prev, error: finalError, isLoading: false }))
        onError?.(finalError)
        toast({
          title: 'Error',
          description: finalError.message,
          variant: 'destructive'
        })
        throw finalError
      }
    }

    return attempt()
  }, [operation, onSuccess, onError, retryCount, retryDelay, toast])

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }))
    onProgress?.(progress)
  }, [onProgress])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      progress: 0
    })
  }, [])

  return {
    ...state,
    execute: executeOperation,
    updateProgress,
    reset
  }
}