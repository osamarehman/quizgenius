import { toast } from '@/hooks/use-toast'

export enum ErrorCode {
  // API Errors
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Validation Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED = 'MISSING_REQUIRED',

  // Processing Errors
  GENERATION_FAILED = 'GENERATION_FAILED',
  PARSING_FAILED = 'PARSING_FAILED',
  PROCESSING_ERROR = 'PROCESSING_ERROR',

  // Authentication Errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Data Errors
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  DATA_CORRUPTION = 'DATA_CORRUPTION',

  // System Errors
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  UNEXPECTED = 'UNEXPECTED'
}

export interface ErrorDetails {
  code: ErrorCode
  message: string
  retryable: boolean
  severity: 'error' | 'warning' | 'info'
  context?: Record<string, unknown>
}

export class AIError extends Error {
  constructor(
    message: string,
    public details: ErrorDetails
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export interface RetryOptions {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
  retryableErrors?: ErrorCode[]
}

const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    ErrorCode.API_ERROR,
    ErrorCode.RATE_LIMIT,
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT
  ]
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const retryOptions = { ...defaultRetryOptions, ...options }
  let lastError: AIError | null = null
  let delay = retryOptions.initialDelay

  for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof AIError) {
        lastError = error
        
        // Check if error is retryable
        const isRetryable = retryOptions.retryableErrors?.includes(error.details.code)
        if (!isRetryable) {
          throw error
        }
      } else {
        lastError = new AIError('Unexpected error occurred', {
          code: ErrorCode.UNEXPECTED,
          message: error instanceof Error ? error.message : 'Unknown error',
          retryable: false,
          severity: 'error'
        })
        throw lastError
      }

      if (attempt === retryOptions.maxAttempts) {
        throw new AIError(`Operation failed after ${attempt} attempts`, {
          code: ErrorCode.PROCESSING_ERROR,
          message: lastError.message,
          retryable: false,
          severity: 'error',
          context: { attempts: attempt }
        })
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
      delay = Math.min(delay * retryOptions.backoffFactor, retryOptions.maxDelay)

      // Show retry toast
      toast({
        title: `Retry Attempt ${attempt}/${retryOptions.maxAttempts}`,
        description: `Operation failed, retrying...`,
        variant: "destructive"
      })
    }
  }

  throw lastError
}

export function handleAIError(error: unknown): never {
  if (error instanceof AIError) {
    toast({
      title: getErrorTitle(error.details.code),
      description: error.message,
      variant: "destructive"
    })
    throw error
  }

  if (error instanceof Error) {
    const aiError = new AIError(error.message, {
      code: ErrorCode.UNEXPECTED,
      message: error.message,
      retryable: false,
      severity: 'error'
    })
    
    toast({
      title: "Unexpected Error",
      description: error.message,
      variant: "destructive"
    })
    
    throw aiError
  }

  const unknownError = new AIError('Unknown error occurred', {
    code: ErrorCode.UNEXPECTED,
    message: 'An unknown error occurred',
    retryable: false,
    severity: 'error'
  })

  toast({
    title: "Unknown Error",
    description: "An unknown error occurred",
    variant: "destructive"
  })

  throw unknownError
}

function getErrorTitle(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.API_ERROR:
      return 'API Error'
    case ErrorCode.RATE_LIMIT:
      return 'Rate Limit Exceeded'
    case ErrorCode.NETWORK_ERROR:
      return 'Network Error'
    case ErrorCode.TIMEOUT:
      return 'Operation Timeout'
    case ErrorCode.VALIDATION_FAILED:
      return 'Validation Failed'
    case ErrorCode.GENERATION_FAILED:
      return 'Generation Failed'
    case ErrorCode.AUTH_REQUIRED:
      return 'Authentication Required'
    case ErrorCode.UNAUTHORIZED:
      return 'Unauthorized'
    case ErrorCode.FORBIDDEN:
      return 'Access Denied'
    default:
      return 'Error'
  }
}

export async function safeAIOperation<T>(
  operation: () => Promise<T>,
  retryOptions?: Partial<RetryOptions>
): Promise<T> {
  try {
    return await withRetry(operation, retryOptions)
  } catch (error) {
    return handleAIError(error)
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof AIError) {
    return error.details.retryable
  }

  // Network errors are usually retryable
  if (error instanceof TypeError && error.message.includes('network')) {
    return true
  }

  // Rate limit errors are retryable
  if (error instanceof Error && error.message.includes('rate limit')) {
    return true
  }

  // Default to non-retryable for unknown errors
  return false
}

export const errorMessages = {
  VALIDATION_FAILED: 'Question validation failed',
  GENERATION_FAILED: 'Failed to generate question',
  PARSING_FAILED: 'Failed to parse AI response',
  API_ERROR: 'AI API error occurred',
  RATE_LIMIT: 'Rate limit exceeded',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT: 'Operation timed out',
  UNEXPECTED: 'An unexpected error occurred'
} as const

export type ErrorCode = keyof typeof errorMessages 