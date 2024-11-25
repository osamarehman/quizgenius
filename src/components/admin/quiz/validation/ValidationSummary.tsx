'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { ValidationSummary as ValidationSummaryType } from '@/lib/ai/types'

interface ValidationSummaryProps {
  summary: ValidationSummaryType
  isValidating?: boolean
  progress?: number
}

export function ValidationSummary({
  summary,
  isValidating = false,
  progress = 0
}: ValidationSummaryProps) {
  const getCategoryIcon = (category: keyof ValidationSummaryType['categorySummary']) => {
    switch (category) {
      case 'content':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'structure':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'pedagogy':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'accessibility':
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getCategoryLabel = (category: keyof ValidationSummaryType['categorySummary']) => {
    switch (category) {
      case 'content':
        return 'Content Issues'
      case 'structure':
        return 'Structure Issues'
      case 'pedagogy':
        return 'Pedagogical Issues'
      case 'accessibility':
        return 'Accessibility Issues'
    }
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {isValidating ? 'Validating...' : 'Validation Summary'}
          </span>
          <span className="text-sm text-muted-foreground">
            {summary.validQuestions}/{summary.totalQuestions} valid
          </span>
        </div>
        <Progress 
          value={isValidating ? progress : (summary.validQuestions / summary.totalQuestions) * 100} 
        />
      </div>

      {/* Issue Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Errors</p>
          <p className="text-2xl font-bold text-red-500">
            {summary.totalErrors}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Warnings</p>
          <p className="text-2xl font-bold text-yellow-500">
            {summary.totalWarnings}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Info</p>
          <p className="text-2xl font-bold text-blue-500">
            {summary.totalInfo}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Auto-fixable</p>
          <p className="text-2xl font-bold text-green-500">
            {summary.autoFixableCount}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h3 className="font-medium">Issue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(summary.categorySummary) as [keyof ValidationSummaryType['categorySummary'], number][])
            .map(([category, count]) => (
              <div key={category} className="flex items-center gap-3 p-4 border rounded-lg">
                {getCategoryIcon(category)}
                <div>
                  <p className="font-medium">{getCategoryLabel(category)}</p>
                  <p className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'issue' : 'issues'} found
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Loading State */}
      {isValidating && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Validating questions...</span>
        </div>
      )}
    </Card>
  )
} 