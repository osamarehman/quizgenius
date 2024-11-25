'use client'

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { ValidationResult, ValidationSeverity } from '@/lib/ai/types'

interface ValidationProgressProps {
  results: ValidationResult[]
  isValidating: boolean
  progress: number
  showDetails?: boolean
}

export function ValidationProgress({
  results,
  isValidating,
  progress,
  showDetails = true
}: ValidationProgressProps) {
  const totalQuestions = results.length
  const validQuestions = results.filter(r => r.isValid).length
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)
  const totalInfo = results.reduce((sum, r) => sum + r.info.length, 0)

  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {isValidating ? 'Validating...' : 'Validation Progress'}
          </span>
          <span className="text-sm text-muted-foreground">
            {validQuestions}/{totalQuestions} valid
          </span>
        </div>
        <Progress 
          value={isValidating ? progress : (validQuestions / totalQuestions) * 100} 
        />
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        {isValidating ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validating questions...</span>
          </div>
        ) : (
          <>
            <Badge variant={totalErrors > 0 ? 'destructive' : 'default'}>
              {totalErrors} Errors
            </Badge>
            <Badge variant="warning">
              {totalWarnings} Warnings
            </Badge>
            <Badge variant="secondary">
              {totalInfo} Suggestions
            </Badge>
          </>
        )}
      </div>

      {/* Detailed Status */}
      {showDetails && !isValidating && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">Critical Issues</p>
              <p className="text-xs text-muted-foreground">
                {totalErrors} error{totalErrors !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Warnings</p>
              <p className="text-xs text-muted-foreground">
                {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Suggestions</p>
              <p className="text-xs text-muted-foreground">
                {totalInfo} suggestion{totalInfo !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Valid Questions</p>
              <p className="text-xs text-muted-foreground">
                {validQuestions} of {totalQuestions} questions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {!isValidating && validQuestions === totalQuestions && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All questions are valid!</span>
        </div>
      )}
    </Card>
  )
} 