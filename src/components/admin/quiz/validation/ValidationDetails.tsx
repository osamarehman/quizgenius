'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react'
import { 
  ValidationResult, 
  ValidationCategory,
  ValidationSeverity,
  Question 
} from '@/lib/ai/types'

interface ValidationDetailsProps {
  question: Question
  validationResult: ValidationResult
  onFix?: (errorId: string) => void
  onRevalidate?: () => void
  isRevalidating?: boolean
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

export function ValidationDetails({
  question,
  validationResult,
  onFix,
  onRevalidate,
  isRevalidating
}: ValidationDetailsProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ValidationCategory>>(new Set())

  const toggleCategory = (category: ValidationCategory) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const getErrorSeverityColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

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
          <div>
            <h3 className="font-medium">Validation Results</h3>
            <p className="text-sm text-muted-foreground">
              {validationResult.errors.length} errors, {validationResult.warnings.length} warnings
            </p>
          </div>
          {onRevalidate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRevalidate}
              disabled={isRevalidating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRevalidating ? 'animate-spin' : ''}`} />
              {isRevalidating ? 'Revalidating...' : 'Revalidate'}
            </Button>
          )}
        </div>

        {/* Categories */}
        {Object.entries(categoryConfig).map(([category, config]) => {
          const issues = validationResult.all.filter(
            error => !error.passed && error.category === category as ValidationCategory
          )
          
          if (issues.length === 0) return null

          const isExpanded = expandedCategories.has(category as ValidationCategory)
          const Icon = config.icon

          return (
            <div key={category} className="border rounded-lg">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                onClick={() => toggleCategory(category as ValidationCategory)}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <div className="text-left">
                    <span className="font-medium">{config.label}</span>
                    <p className="text-sm text-muted-foreground">
                      {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isExpanded && (
                <div className="p-4 border-t space-y-3">
                  {issues.map((issue, index) => (
                    <div
                      key={`${issue.id}-${index}`}
                      className={`p-3 rounded-lg border ${getErrorSeverityColor(issue.severity)}`}
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
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
} 