'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Loader2
} from 'lucide-react'
import { ValidationResult } from '@/lib/ai/types'

interface ValidationStatusProps {
  results: ValidationResult[]
  isValidating?: boolean
  progress?: number
}

export function ValidationStatus({
  results,
  isValidating = false,
  progress = 0
}: ValidationStatusProps) {
  const totalQuestions = results.length
  const validQuestions = results.filter(r => r.isValid).length
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)
  const totalInfo = results.reduce((sum, r) => sum + r.info.length, 0)

  return (
    <Card className="p-4 space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {isValidating ? 'Validating...' : 'Validation Status'}
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