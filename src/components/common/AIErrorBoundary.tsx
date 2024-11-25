'use client'

import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AIError, ErrorCode } from '@/lib/ai/errorHandling'
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'

interface AIErrorFallbackProps {
  error: Error
  resetError: () => void
  isRetrying?: boolean
}

function AIErrorFallback({ error, resetError, isRetrying }: AIErrorFallbackProps) {
  const isAIError = error instanceof AIError
  const errorCode = isAIError ? error.details.code : ErrorCode.UNEXPECTED
  const isRetryable = isAIError ? error.details.retryable : true

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-medium">AI Operation Failed</h3>
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <p>{error.message}</p>
        {isAIError && (
          <>
            <p>Error Code: {errorCode}</p>
            {error.details.context && (
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(error.details.context, null, 2)}
              </pre>
            )}
          </>
        )}
      </div>

      {isRetryable && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetError}
          disabled={isRetrying}
          className="gap-2"
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Try Again
            </>
          )}
        </Button>
      )}
    </Card>
  )
}

interface AIErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error) => void
  onRetry?: () => void
  isRetrying?: boolean
}

export function AIErrorBoundary({
  children,
  onError,
  onRetry,
  isRetrying
}: AIErrorBoundaryProps) {
  const handleReset = () => {
    onRetry?.()
  }

  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <AIErrorFallback
          error={error}
          resetError={() => {
            resetError()
            handleReset()
          }}
          isRetrying={isRetrying}
        />
      )}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  )
} 