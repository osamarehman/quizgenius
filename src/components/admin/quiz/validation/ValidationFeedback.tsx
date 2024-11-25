'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { ValidationResult } from '@/lib/ai/types'

interface ValidationFeedbackProps {
  validationResult: ValidationResult
  onFix?: (id: string) => void
}

export function ValidationFeedback({ validationResult, onFix }: ValidationFeedbackProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const categoryIcons = {
    content: AlertCircle,
    structure: Info,
    pedagogy: Info,
    accessibility: Info
  }

  const severityColors = {
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  }

  const groupedIssues = {
    content: validationResult.all.filter(r => !r.passed && r.category === 'content'),
    structure: validationResult.all.filter(r => !r.passed && r.category === 'structure'),
    pedagogy: validationResult.all.filter(r => !r.passed && r.category === 'pedagogy'),
    accessibility: validationResult.all.filter(r => !r.passed && r.category === 'accessibility')
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Summary */}
      <div className="flex gap-2">
        <Badge variant={validationResult.errors.length > 0 ? 'destructive' : 'default'}>
          {validationResult.errors.length} Errors
        </Badge>
        <Badge variant="warning">
          {validationResult.warnings.length} Warnings
        </Badge>
        <Badge variant="secondary">
          {validationResult.info.length} Suggestions
        </Badge>
      </div>

      {/* Categories */}
      {Object.entries(groupedIssues).map(([category, issues]) => {
        if (issues.length === 0) return null
        const Icon = categoryIcons[category as keyof typeof categoryIcons]

        return (
          <div key={category} className="space-y-2">
            <button
              className="flex items-center gap-2 w-full text-left"
              onClick={() => setExpandedCategory(
                expandedCategory === category ? null : category
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium capitalize">{category}</span>
              <span className="text-sm text-muted-foreground">
                ({issues.length} issues)
              </span>
            </button>

            {expandedCategory === category && (
              <div className="pl-6 space-y-2">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-2 rounded-lg ${severityColors[issue.severity]}`}
                  >
                    <p className="text-sm">{issue.message}</p>
                    {onFix && (
                      <button
                        className="text-sm underline mt-1"
                        onClick={() => onFix(issue.id)}
                      >
                        Fix this issue
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Success state */}
      {validationResult.isValid && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All validation checks passed!</span>
        </div>
      )}
    </Card>
  )
} 