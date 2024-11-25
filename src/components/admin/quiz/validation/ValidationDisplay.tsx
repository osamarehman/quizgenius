'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  ValidationResult, 
  ValidationError, 
  ValidationCategory,
  ValidationSeverity 
} from '@/lib/ai/types'

interface ValidationDisplayProps {
  validationResult: ValidationResult
  onFix?: (errorId: string) => void
  onRetry?: () => void
  isRetrying?: boolean
}

interface CategoryConfig {
  label: string
  icon: typeof AlertCircle
  color: string
  description: string
}

const categoryConfigs: Record<ValidationCategory, CategoryConfig> = {
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

const severityStyles: Record<ValidationSeverity, string> = {
  error: 'bg-red-100 text-red-800 border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200'
}

export function ValidationDisplay({ 
  validationResult,
  onFix,
  onRetry,
  isRetrying = false
}: ValidationDisplayProps) {
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

  const getErrorCount = (severity: ValidationSeverity) => 
    validationResult.all.filter(e => !e.passed && e.severity === severity).length

  const validationProgress = 
    (validationResult.all.filter(r => r.passed).length / validationResult.all.length) * 100

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Validation Results</h3>
          <p className="text-sm text-muted-foreground">
            {validationResult.isValid 
              ? 'All checks passed'
              : `${getErrorCount('error')} errors, ${getErrorCount('warning')} warnings`
            }
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? 'Retrying...' : 'Retry Validation'}
          </Button>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Validation Progress</span>
          <span>{Math.round(validationProgress)}%</span>
        </div>
        <Progress value={validationProgress} />
      </div>

      {/* Summary Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={getErrorCount('error') > 0 ? 'destructive' : 'default'}>
          {getErrorCount('error')} Errors
        </Badge>
        <Badge variant="warning">
          {getErrorCount('warning')} Warnings
        </Badge>
        <Badge variant="secondary">
          {getErrorCount('info')} Suggestions
        </Badge>
      </div>

      {/* Validation Details */}
      <div className="space-y-4">
        {(Object.entries(categoryConfigs) as [ValidationCategory, CategoryConfig][])
          .map(([category, config]) => {
            const issues = validationResult.all.filter(
              error => !error.passed && error.category === category
            )
            
            if (issues.length === 0) return null

            const isExpanded = expandedCategories.has(category)
            const Icon = config.icon

            return (
              <div key={category} className="border rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                  onClick={() => toggleCategory(category)}
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
                        className={`p-3 rounded-lg border ${severityStyles[issue.severity]}`}
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

      {validationResult.isValid && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All validation checks passed!</span>
        </div>
      )}
    </Card>
  )
} 