import { 
  Question, 
  ValidationResult, 
  ValidationSummary,
  ValidationRule,
  AutoFixSuggestion
} from './types'
import { subjectValidationRules, educationSystemRules } from './subjectValidation'

export async function validateQuestionBatch(
  questions: Question[],
  subject?: string,
  educationSystem?: string,
  options?: {
    autoFix?: boolean
    validateAnswers?: boolean
  }
): Promise<{
  results: ValidationResult[]
  summary: ValidationSummary
  autoFixSuggestions: AutoFixSuggestion[]
}> {
  const results: ValidationResult[] = []
  const autoFixSuggestions: AutoFixSuggestion[] = []

  // Get all applicable rules
  const baseRules = getBaseValidationRules()
  const subjectRules = subject ? subjectValidationRules[subject] || [] : []
  const systemRules = educationSystem ? educationSystemRules[educationSystem] || [] : []
  const allRules = [...baseRules, ...subjectRules, ...systemRules]

  // Validate each question
  for (const question of questions) {
    const validationResult = validateSingleQuestion(question, allRules)
    results.push(validationResult)

    // Generate auto-fix suggestions
    if (options?.autoFix) {
      const fixes = generateAutoFixSuggestions(question, validationResult, subject)
      autoFixSuggestions.push(...fixes)
    }
  }

  // Generate summary
  const summary = generateValidationSummary(results)

  return {
    results,
    summary,
    autoFixSuggestions
  }
}

function getBaseValidationRules(): ValidationRule[] {
  return [
    {
      id: 'question-text',
      test: (q: Question) => Boolean(q.text?.trim()),
      message: 'Question text is required',
      severity: 'error',
      category: 'content'
    },
    {
      id: 'answer-count',
      test: (q: Question) => q.answers.length >= 2,
      message: 'At least two answers are required',
      severity: 'error',
      category: 'content'
    },
    {
      id: 'correct-answer',
      test: (q: Question) => q.answers.some(a => a.isCorrect),
      message: 'At least one correct answer is required',
      severity: 'error',
      category: 'content'
    },
    {
      id: 'answer-text',
      test: (q: Question) => q.answers.every(a => Boolean(a.text?.trim())),
      message: 'All answers must have text',
      severity: 'error',
      category: 'content'
    }
  ]
}

function validateSingleQuestion(
  question: Question,
  rules: ValidationRule[]
): ValidationResult {
  const validationResults = rules.map(rule => ({
    id: rule.id,
    passed: rule.test(question),
    message: rule.message,
    severity: rule.severity,
    category: rule.category,
    autoFix: rule.autoFix
  }))

  return {
    isValid: validationResults.every(r => r.passed || r.severity !== 'error'),
    errors: validationResults.filter(r => !r.passed && r.severity === 'error'),
    warnings: validationResults.filter(r => !r.passed && r.severity === 'warning'),
    info: validationResults.filter(r => !r.passed && r.severity === 'info'),
    all: validationResults
  }
}

function generateValidationSummary(results: ValidationResult[]): ValidationSummary {
  return {
    totalQuestions: results.length,
    validQuestions: results.filter(r => r.isValid).length,
    totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    totalInfo: results.reduce((sum, r) => sum + r.info.length, 0),
    categorySummary: {
      content: results.reduce((sum, r) => 
        sum + r.all.filter(i => !i.passed && i.category === 'content').length, 0
      ),
      structure: results.reduce((sum, r) => 
        sum + r.all.filter(i => !i.passed && i.category === 'structure').length, 0
      ),
      pedagogy: results.reduce((sum, r) => 
        sum + r.all.filter(i => !i.passed && i.category === 'pedagogy').length, 0
      ),
      accessibility: results.reduce((sum, r) => 
        sum + r.all.filter(i => !i.passed && i.category === 'accessibility').length, 0
      )
    },
    autoFixableCount: results.reduce((sum, r) => 
      sum + r.all.filter(i => !i.passed && i.autoFix).length, 0
    )
  }
}

function generateAutoFixSuggestions(
  validationResult: ValidationResult
): AutoFixSuggestion[] {
  const suggestions: AutoFixSuggestion[] = []

  validationResult.all
    .filter(result => !result.passed && result.autoFix)
    .forEach(result => {
      suggestions.push({
        id: result.id,
        description: result.message,
        apply: result.autoFix!,
        category: result.category,
        severity: result.severity
      })
    })

  return suggestions
} 