export class AIError extends Error {
  constructor(
    message: string,
    public details: {
      code: ErrorCode
      message: string
      retryable: boolean
      severity: 'error' | 'warning' | 'info'
      category?: 'validation' | 'generation' | 'processing'
      context?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = 'AIError'
  }
}

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

export interface RetryOptions {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
  retryableErrors?: ErrorCode[]
}

export const defaultRetryOptions: RetryOptions = {
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

export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.API_ERROR]: 'API error occurred',
  [ErrorCode.RATE_LIMIT]: 'Rate limit exceeded',
  [ErrorCode.NETWORK_ERROR]: 'Network error occurred',
  [ErrorCode.TIMEOUT]: 'Operation timed out',
  [ErrorCode.VALIDATION_FAILED]: 'Validation failed',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCode.MISSING_REQUIRED]: 'Required fields missing',
  [ErrorCode.GENERATION_FAILED]: 'Failed to generate content',
  [ErrorCode.PARSING_FAILED]: 'Failed to parse response',
  [ErrorCode.PROCESSING_ERROR]: 'Error processing request',
  [ErrorCode.AUTH_REQUIRED]: 'Authentication required',
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.FORBIDDEN]: 'Access forbidden',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.DUPLICATE]: 'Duplicate resource',
  [ErrorCode.DATA_CORRUPTION]: 'Data corruption detected',
  [ErrorCode.SYSTEM_ERROR]: 'System error occurred',
  [ErrorCode.UNEXPECTED]: 'An unexpected error occurred'
}

export function createAIError(
  code: ErrorCode,
  message?: string,
  context?: Record<string, unknown>
): AIError {
  return new AIError(message || errorMessages[code], {
    code,
    message: message || errorMessages[code],
    retryable: defaultRetryOptions.retryableErrors?.includes(code) ?? false,
    severity: getSeverityForErrorCode(code),
    context
  })
}

function getSeverityForErrorCode(code: ErrorCode): 'error' | 'warning' | 'info' {
  switch (code) {
    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.INVALID_INPUT:
    case ErrorCode.MISSING_REQUIRED:
      return 'warning'
    case ErrorCode.API_ERROR:
    case ErrorCode.RATE_LIMIT:
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.TIMEOUT:
      return 'info'
    default:
      return 'error'
  }
} 