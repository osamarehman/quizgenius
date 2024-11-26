'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronRight
} from "lucide-react"
import { ValidationResult, ValidationSeverity } from '@/types/validation'
import { ValidationProgress } from './ValidationProgress'
import { ValidationStatus } from './ValidationStatus'

interface ValidationPanelProps {
  onValidate: () => Promise<void>
  results: ValidationResult[]
  isValidating: boolean
  value?: number
}

export function ValidationPanel({ onValidate, results, isValidating }: ValidationPanelProps) {
  const categories = results.reduce((acc, result) => {
    if (!acc.includes(result.category)) {
      acc.push(result.category)
    }
    return acc
  }, [] as string[])

  const severityColors: Record<ValidationSeverity, string> = {
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getErrorCount = (severity: ValidationResult['severity']) => 
    results.filter(e => e.severity === severity).length

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Validation Results</h3>
          <p className="text-sm text-muted-foreground">
            {results.every(r => r.severity === 'info') 
              ? 'All checks passed'
              : `${getErrorCount('error')} errors, ${getErrorCount('warning')} warnings`
            }
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onValidate}
          disabled={isValidating}
        >
          <ChevronRight className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          {isValidating ? 'Validating...' : 'Validate'}
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Validation Progress</span>
          <span>{Math.round((results.filter(r => r.severity === 'info').length / results.length) * 100)}%</span>
        </div>
        <ValidationProgress 
          value={(results.filter(r => r.severity === 'info').length / results.length) * 100} 
        />
      </div>

      {/* Summary Badges */}
      <div className="flex gap-2 flex-wrap">
        <ValidationStatus variant="destructive">
          {getErrorCount('error')} Errors
        </ValidationStatus>
        <ValidationStatus variant="warning">
          {getErrorCount('warning')} Warnings
        </ValidationStatus>
        <ValidationStatus variant="secondary">
          {getErrorCount('info')} Suggestions
        </ValidationStatus>
      </div>

      {/* Validation Details */}
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category} className="space-y-2">
            <h3 className="text-lg font-semibold">{category}</h3>
            {results
              .filter(result => result.category === category)
              .map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${severityColors[result.severity]}`}
                >
                  {result.message}
                </div>
              ))}
          </div>
        ))}
      </div>
    </Card>
  )
}