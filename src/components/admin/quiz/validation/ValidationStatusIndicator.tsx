'use client'

import { 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  ValidationResult, 
  ValidationSeverity,
  ValidationCategory 
} from '@/lib/ai/types'

interface ValidationStatusIndicatorProps {
  validationResult: ValidationResult
  isValidating?: boolean
  progress?: number
  showDetails?: boolean
}

export function ValidationStatusIndicator({
  validationResult,
  isValidating = false,
  progress = 0,
  showDetails = true
}: ValidationStatusIndicatorProps) {
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

  const getCategoryIcon = (category: ValidationCategory) => {
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

  const getSeverityCount = (severity: ValidationSeverity) => 
    validationResult.all.filter(r => !r.passed && r.severity === severity).length

  const getCategoryCount = (category: ValidationCategory) =>
    validationResult.all.filter(r => !r.passed && r.category === category).length

  return (
    <Card className="p-4 space-y-4">
      {/* Progress Indicator */}
      {isValidating && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Validating...</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={getSeverityCount('error') > 0 ? 'destructive' : 'default'}>
          {getSeverityCount('error')} Errors
        </Badge>
        <Badge variant="warning">
          {getSeverityCount('warning')} Warnings
        </Badge>
        <Badge variant="secondary">
          {getSeverityCount('info')} Info
        </Badge>
      </div>

      {/* Detailed Status */}
      {showDetails && !isValidating && (
        <div className="grid grid-cols-2 gap-4">
          {/* Category Status */}
          {(['content', 'structure', 'pedagogy', 'accessibility'] as ValidationCategory[]).map(category => {
            const count = getCategoryCount(category)
            if (count === 0) return null

            return (
              <div key={category} className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <div>
                  <p className="text-sm font-medium capitalize">{category}</p>
                  <p className="text-xs text-muted-foreground">
                    {count} issue{count !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Loading State */}
      {isValidating && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Validating...</span>
        </div>
      )}

      {/* Success State */}
      {!isValidating && validationResult.isValid && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All validation checks passed!</span>
        </div>
      )}
    </Card>
  )
} 