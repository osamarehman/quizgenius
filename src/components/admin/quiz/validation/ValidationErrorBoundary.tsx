'use client'

import React from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIError } from '@/lib/ai/types'
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { useAIErrorHandling } from '@/hooks/useAIErrorHandling'

interface ValidationErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error) => void
  onRetry?: () => Promise<void>
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ValidationErrorBoundary extends React.Component<ValidationErrorBoundaryProps, State> {
  constructor(props: ValidationErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  handleRetry = async () => {
    try {
      await this.props.onRetry?.()
      this.setState({ hasError: false, error: null })
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ValidationErrorFallback
          error={this.state.error!}
          onRetry={this.props.onRetry ? this.handleRetry : undefined}
        />
      )
    }

    return this.props.children
  }
}

interface ValidationErrorFallbackProps {
  error: Error
  onRetry?: () => Promise<void>
}

function ValidationErrorFallback({ error, onRetry }: ValidationErrorFallbackProps) {
  const { isRetrying, retry } = useAIErrorHandling({
    maxRetries: 3,
    onRetry
  })

  const isValidationError = error instanceof AIError && error.details?.category === 'validation'

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-medium">
          {isValidationError ? 'Validation Error' : 'Error'}
        </h3>
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <p>{error.message}</p>
        {isValidationError && error instanceof AIError && (
          <pre className="text-xs bg-muted p-2 rounded">
            {JSON.stringify(error.details.context, null, 2)}
          </pre>
        )}
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => retry()}
          disabled={isRetrying}
          className="gap-2"
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Retrying Validation...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Retry Validation
            </>
          )}
        </Button>
      )}
    </Card>
  )
}

export function withValidationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ValidationErrorBoundaryProps, 'children'>
) {
  return function WithValidationErrorBoundary(props: P) {
    return (
      <ValidationErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ValidationErrorBoundary>
    )
  }
} 