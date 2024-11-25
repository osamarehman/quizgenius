'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  ValidationError, 
  ValidationCategory,
  ValidationSeverity,
  Question 
} from '@/lib/ai/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ValidationResultDetailsProps {
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

const severityStyles: Record<ValidationSeverity, {
  bg: string
  text: string
  border: string
}> = {
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200'
  }
}

export function ValidationResultDetails({
  question,
  validationResult,
  onFix,
  onRevalidate,
  isRevalidating
}: ValidationResultDetailsProps) {
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
          <h3 className="font-medium">Validation Results</h3>
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

        <Accordion type="single" collapsible>
          {(Object.entries(categoryConfig) as [ValidationCategory, typeof categoryConfig.content][])
            .map(([category, config]) => {
              const issues = validationResult.all.filter(
                error => !error.passed && error.category === category
              )
              
              if (issues.length === 0) return null

              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <config.icon className={config.color} />
                      <div>
                        <span className="font-medium">{config.label}</span>
                        <p className="text-sm text-muted-foreground">
                          {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-4">
                      {issues.map((issue, index) => {
                        const styles = severityStyles[issue.severity]
                        return (
                          <div
                            key={`${issue.id}-${index}`}
                            className={`p-3 rounded-lg border ${styles.bg} ${styles.text} ${styles.border}`}
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
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
        </Accordion>
      </div>
    </Card>
  )
} 