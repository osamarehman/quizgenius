import { Question, Answer, ValidationRule, ValidationResult } from './types'

// Subject-specific validation rules
const subjectValidationRules: Record<string, ValidationRule[]> = {
  mathematics: [
    {
      id: 'math-symbols',
      test: (q: Question) => !q.text.includes('×') && !q.text.includes('÷'),
      message: 'Use proper mathematical operators (* and / instead of × and ÷)',
      severity: 'warning',
      category: 'content'
    },
    {
      id: 'math-formatting',
      test: (q: Question) => /\$.*\$/.test(q.text), // Check for LaTeX formatting
      message: 'Mathematical expressions should be formatted in LaTeX',
      severity: 'warning',
      category: 'accessibility'
    }
  ],
  science: [
    {
      id: 'unit-format',
      test: (q: Question) => /\d\s*[A-Za-z]+/.test(q.text), // Check for units after numbers
      message: 'Include units with numerical values',
      severity: 'warning',
      category: 'content'
    },
    {
      id: 'chemical-formula',
      test: (q: Question) => !/[A-Z][a-z]?\d*/.test(q.text) || /\{.*\}/.test(q.text),
      message: 'Chemical formulas should be properly formatted',
      severity: 'warning',
      category: 'content'
    }
  ]
}

// Education level specific validation rules
const levelValidationRules: Record<string, ValidationRule[]> = {
  elementary: [
    {
      id: 'simple-language',
      test: (q: Question) => {
        const words = q.text.split(' ')
        return words.every(word => word.length <= 10)
      },
      message: 'Use simpler words appropriate for elementary level',
      severity: 'warning',
      category: 'accessibility'
    }
  ],
  advanced: [
    {
      id: 'complexity',
      test: (q: Question) => q.text.length > 50,
      message: 'Questions should be more detailed and complex',
      severity: 'info',
      category: 'content'
    }
  ]
}

export function validateQuestionBatch(
  questions: Question[],
  subject?: string,
  level?: string
): ValidationResult[] {
  return questions.map(question => {
    const baseRules = questionValidationRules
    const subjectRules = subject ? subjectValidationRules[subject] || [] : []
    const levelRules = level ? levelValidationRules[level] || [] : []

    const allRules = [...baseRules, ...subjectRules, ...levelRules]
    
    const results = allRules.map(rule => ({
      id: rule.id,
      passed: rule.test(question),
      message: rule.message,
      severity: rule.severity,
      category: rule.category
    }))

    return {
      isValid: results.every(r => r.passed || r.severity !== 'error'),
      errors: results.filter(r => !r.passed && r.severity === 'error'),
      warnings: results.filter(r => !r.passed && r.severity === 'warning'),
      info: results.filter(r => !r.passed && r.severity === 'info'),
      all: results
    }
  })
}

export function getBatchValidationSummary(results: ValidationResult[]) {
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
    }
  }
}

export function getQuestionImprovementSuggestions(
  validationResult: ValidationResult,
  subject?: string,
  level?: string
): string[] {
  const suggestions: string[] = []

  // Add subject-specific suggestions
  if (subject && validationResult.warnings.length > 0) {
    switch (subject) {
      case 'mathematics':
        suggestions.push('Consider using LaTeX formatting for mathematical expressions')
        suggestions.push('Ensure all variables are properly formatted')
        break
      case 'science':
        suggestions.push('Include units with all measurements')
        suggestions.push('Use proper notation for chemical formulas')
        break
    }
  }

  // Add level-specific suggestions
  if (level) {
    switch (level) {
      case 'elementary':
        suggestions.push('Use simpler vocabulary')
        suggestions.push('Keep sentences short and clear')
        break
      case 'advanced':
        suggestions.push('Include more complex scenarios')
        suggestions.push('Add analytical components to questions')
        break
    }
  }

  return suggestions
} 