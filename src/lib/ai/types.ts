export type ExplanationStyle = 'basic' | 'detailed' | 'conceptual' | 'practical' | 'step_by_step'
export type PromptStyle = 'standard' | 'analytical' | 'practical' | 'conceptual' | 'advanced' | 'beginner'
export type QuestionType = 'mcq' | 'true-false' | 'blanks'
export type EducationLevel = 'elementary' | 'middle' | 'high' | 'university' | 'professional'
export type EducationSystem = 'o-levels' | 'a-levels' | 'mcat' | 'sat' | 'custom'
export type ValidationCategory = 'content' | 'structure' | 'pedagogy' | 'accessibility'
export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface Answer {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  explanation?: string
  answers: Answer[]
  created_at: string
  quiz_id?: string
  order_number?: number
  category?: string
  difficulty?: string
}

export interface ValidationRule {
  id: string
  test: (question: Question) => boolean
  message: string
  severity: ValidationSeverity
  category: ValidationCategory
  autoFix?: (text: string) => string
}

export interface ValidationError {
  id: string
  message: string
  severity: ValidationSeverity
  category: ValidationCategory
  passed: boolean
  autoFix?: (text: string) => string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
  all: ValidationError[]
}

export interface ValidationSummary {
  totalQuestions: number
  validQuestions: number
  totalErrors: number
  totalWarnings: number
  totalInfo: number
  categorySummary: Record<ValidationCategory, number>
  autoFixableCount: number
}

export interface SubjectTemplate {
  keyTerms: string[]
  concepts: string[]
  commonMisconceptions: string[]
  questionTypes: Record<QuestionType, {
    structure: string
    examples: string[]
    tips: string[]
  }>
  validationRules: {
    content: string[]
    structure: string[]
    pedagogy: string[]
  }
}

export interface AIError extends Error {
  code: string
  retryable: boolean
}

export interface RetryOptions {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
}

export interface BatchProcessingOptions {
  batchSize: number
  maxRetries: number
  delayBetweenBatches: number
  validateResults: boolean
}

export interface BatchProcessingResult<T> {
  success: boolean
  data?: T
  error?: string
  retryCount: number
  timestamp: string
}

export interface PromptTemplate {
  prefix: string
  instruction: string
  format: string
  examples?: string[]
}

export interface ExplanationOptions {
  style: ExplanationStyle
  subject: string
  level: string
  includeExamples: boolean
  includeReferences: boolean
}

export interface Quiz {
  id: string
  title: string
  category_id: string
  education_system_id: string
  description?: string
  time_limit?: number
  created_by: string
  is_published: boolean
  category_details?: {
    name: string
  }
}

export interface AutoFixSuggestion {
  id: string
  description: string
  apply: (text: string) => string
  category: ValidationCategory
  severity: ValidationSeverity
}