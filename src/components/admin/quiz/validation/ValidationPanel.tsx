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
  RefreshCw
} from 'lucide-react'
import { 
  ValidationResult, 
  ValidationError, 
  ValidationSummary,
  Question 
} from '@/lib/ai/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ValidationPanelProps {
  question: Question
  validationResult: ValidationResult
  subject?: string
  educationSystem?: string
  onRetry?: () => void
  onFix?: (errorId: string) => void
  isRetrying?: boolean
}

export function ValidationPanel({
  question,
  validationResult,
  subject,
  educationSystem,
  onRetry,
  onFix,
  isRetrying = false
}: ValidationPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const categories = {
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

  const severityColors = {
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getErrorCount = (severity: ValidationError['severity']) => 
    validationResult.all.filter(e => !e.passed && e.severity === severity).length

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
            <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry Validation'}
          </Button>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Validation Progress</span>
          <span>{Math.round((validationResult.all.filter(r => r.passed).length / validationResult.all.length) * 100)}%</span>
        </div>
        <Progress 
          value={(validationResult.all.filter(r => r.passed).length / validationResult.all.length) * 100} 
        />
      </div>

      {/* Summary Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="destructive">
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
      <Accordion type="single" collapsible>
        {Object.entries(categories).map(([category, { label, icon: Icon, color, description }]) => {
          const issues = validationResult.all.filter(
            error => !error.passed && error.category === category
          )
          
          if (issues.length === 0) return null

          return (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <div className="text-left">
                    <span className="font-medium">{label}</span>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-4">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-3 rounded-lg border ${severityColors[issue.severity]}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{issue.message}</p>
                          {issue.autoFix && (
                            <p className="text-sm mt-1">
                              Auto-fix available
                            </p>
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
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {validationResult.isValid && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All validation checks passed!</span>
        </div>
      )}
    </Card>
  )
} 