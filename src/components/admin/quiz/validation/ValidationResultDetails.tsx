'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { ValidationResult, ValidationCategory, ValidationSeverity, Question } from '@/lib/ai/types'

interface ValidationResultDetailsProps {
  question: Question
  validationResult: ValidationResult
  onFix?: (errorId: string) => void
  onRevalidate?: () => void
  isRevalidating?: boolean
}

const severityStyles: Record<ValidationSeverity, {
  bg: string
  text: string
  border: string
}> = {
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200'
  }
}

const categoryConfig: Record<ValidationCategory, {
  label: string
  icon: typeof AlertCircle
  color: string
  description: string
}> = {
  content: {
    label: 'Content',
    icon: AlertCircle,
    color: 'text-red-500',
    description: 'Issues with question content and accuracy'
  },
  structure: {
    label: 'Structure',
    icon: Info,
    color: 'text-blue-500',
    description: 'Issues with question format and organization'
  },
  pedagogy: {
    label: 'Pedagogy',
    icon: AlertTriangle,
    color: 'text-yellow-500',
    description: 'Issues with educational effectiveness'
  },
  accessibility: {
    label: 'Accessibility',
    icon: CheckCircle,
    color: 'text-green-500',
    description: 'Issues with inclusivity and clarity'
  }
}

export function ValidationResultDetails({
  question,
  validationResult,
  onFix,
  onRevalidate,
  isRevalidating
}: ValidationResultDetailsProps) {
  return (
    <Card className="p-6 space-y-6">
      {/* Question Preview */}
      <div className="space-y-2">
        <h3 className="font-medium">Question</h3>
        <div className="p-4 bg-muted rounded-lg">
          <p>{question.text}</p>
          <div className="mt-4 space-y-2">
            {question.answers.map((answer, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  answer.isCorrect ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                {answer.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Validation Results</h3>
          {onRevalidate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRevalidate}
              disabled={isRevalidating}
            >
              <AlertTriangle className={`h-4 w-4 mr-2 ${isRevalidating ? 'animate-spin' : ''}`} />
              {isRevalidating ? 'Revalidating...' : 'Revalidate'}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant={validationResult.errors.length > 0 ? 'destructive' : 'default'}>
            {validationResult.errors.length} Errors
          </Button>
          <Button variant="warning">
            {validationResult.warnings.length} Warnings
          </Button>
          <Button variant="secondary">
            {validationResult.info.length} Suggestions
          </Button>
        </div>

        {(Object.entries(categoryConfig) as [ValidationCategory, typeof categoryConfig.content][])
          .map(([category, config]) => {
            const issues = validationResult.all.filter(
              error => !error.passed && error.category === category
            )
            
            if (issues.length === 0) return null

            return (
              <div key={category}>
                <div className="flex items-start gap-3">
                  <config.icon className={config.color} />
                  <div className="flex-1">
                    <p className="font-medium">{config.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                    </p>
                  </div>
                </div>
                {issues.map((issue, index) => {
                  const styles = severityStyles[issue.severity]
                  return (
                    <div
                      key={`${issue.id}-${index}`}
                      className={`p-3 rounded-lg border ${styles.bg} ${styles.text} ${styles.border}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{issue.message}</p>
                          {issue.autoFix && (
                            <p className="text-sm mt-1">Auto-fix available</p>
                          )}
                        </div>
                        {onFix && issue.autoFix && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFix(issue.id)}
                          >
                            Fix Issue
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
      </div>
    </Card>
  )
}