'use client'

import { Card } from "@/components/ui/card"
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
      default:
        return <Info className="h-4 w-4 text-gray-500" />
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
      default:
        return 'Unknown Issues'
    }
  }

  const totalIssues = summary.totalErrors + summary.totalWarnings + summary.totalInfo

  return (
    <Card className="p-4 space-y-4">
      {isValidating ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validating questions...</span>
          </div>
          <Progress value={progress} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>{summary.totalErrors} Errors</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>{summary.totalWarnings} Warnings</span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span>{summary.totalInfo} Info</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Categories</h3>
            <div className="grid gap-2">
              {Object.entries(summary.categorySummary).map(([category, count]) => (
                count > 0 && (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category as keyof ValidationSummaryType['categorySummary'])}
                      <span>{getCategoryLabel(category as keyof ValidationSummaryType['categorySummary'])}</span>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {totalIssues === 0 && (
            <div className="flex items-center space-x-2 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span>All validations passed!</span>
            </div>
          )}
        </>
      )}
    </Card>
  )
}