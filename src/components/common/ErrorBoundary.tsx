'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AIError, ErrorCode } from '@/lib/ai/errorHandling'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Something went wrong</h3>
          </div>

          <div className="text-sm text-muted-foreground">
            {this.state.error instanceof AIError ? (
              <>
                <p>{this.state.error.message}</p>
                <p className="mt-1">Error Code: {this.state.error.details.code}</p>
              </>
            ) : (
              <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </Card>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
  onReset?: () => void
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onReset={onReset}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setError(error)
    } else {
      setError(new Error('An unknown error occurred'))
    }
  }

  const resetError = () => {
    setError(null)
  }

  return {
    error,
    handleError,
    resetError
  }
} 