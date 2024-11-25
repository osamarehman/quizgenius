'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { ValidationResult, ValidationError } from '@/lib/ai/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ValidationUIProps {
  validationResults: ValidationResult[]
  subject?: string
  educationSystem?: string
  onFix?: (errorId: string, questionIndex: number) => void
}

export function ValidationUI({ 
  validationResults, 
  subject,
  educationSystem,
  onFix 
}: ValidationUIProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const totalErrors = validationResults.reduce((sum, result) => sum + result.errors.length, 0)
  const totalWarnings = validationResults.reduce((sum, result) => sum + result.warnings.length, 0)
  const totalInfo = validationResults.reduce((sum, result) => sum + result.info.length, 0)
  const validQuestions = validationResults.filter(r => r.isValid).length
  const totalQuestions = validationResults.length

  const validationProgress = (validQuestions / totalQuestions) * 100

  const categories = {
    content: {
      label: 'Content',
      icon: AlertCircle,
      color: 'text-red-500'
    },
    structure: {
      label: 'Structure',
      icon: Info,
      color: 'text-blue-500'
    },
    pedagogy: {
      label: 'Pedagogy',
      icon: AlertTriangle,
      color: 'text-yellow-500'
    },
    accessibility: {
      label: 'Accessibility',
      icon: CheckCircle,
      color: 'text-green-500'
    }
  }

  const getErrorSeverityColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Validation Progress</h3>
          <span className="text-sm text-muted-foreground">
            {validQuestions} of {totalQuestions} questions valid
          </span>
        </div>
        <Progress value={validationProgress} />
      </div>

      {/* Summary Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="destructive">
          {totalErrors} Errors
        </Badge>
        <Badge variant="warning">
          {totalWarnings} Warnings
        </Badge>
        <Badge variant="secondary">
          {totalInfo} Suggestions
        </Badge>
      </div>

      {/* Validation Details */}
      <Accordion type="single" collapsible>
        {validationResults.map((result, questionIndex) => (
          <AccordionItem key={questionIndex} value={`question-${questionIndex}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-medium">Question {questionIndex + 1}</span>
                {result.isValid ? (
                  <Badge variant="success">Valid</Badge>
                ) : (
                  <Badge variant="destructive">
                    {result.errors.length} Issues
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {Object.entries(categories).map(([category, { label, icon: Icon, color }]) => {
                  const issues = result.all.filter(
                    error => !error.passed && error.category === category
                  )
                  
                  if (issues.length === 0) return null

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className="space-y-2 pl-6">
                        {issues.map((issue, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-lg border ${
                              getErrorSeverityColor(issue.severity)
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-sm">{issue.message}</p>
                              {onFix && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onFix(issue.id, questionIndex)}
                                >
                                  Fix
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  )
} 