import { ValidationRule, Question } from '../types'

export const baseValidationRules: ValidationRule[] = [
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
  },
  {
    id: 'question-length',
    test: (q: Question) => (q.text?.length ?? 0) >= 10 && (q.text?.length ?? 0) <= 500,
    message: 'Question text should be between 10 and 500 characters',
    severity: 'warning',
    category: 'structure'
  },
  {
    id: 'explanation',
    test: (q: Question) => Boolean(q.explanation?.trim()),
    message: 'Question should have an explanation',
    severity: 'warning',
    category: 'pedagogy'
  },
  {
    id: 'answer-explanations',
    test: (q: Question) => q.answers.every(a => Boolean(a.explanation?.trim())),
    message: 'All answers should have explanations',
    severity: 'warning',
    category: 'pedagogy'
  },
  {
    id: 'answer-length-consistency',
    test: (q: Question) => {
      const lengths = q.answers.map(a => a.text.length)
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
      return lengths.every(l => Math.abs(l - avg) < avg * 0.5)
    },
    message: 'Answer lengths should be relatively consistent',
    severity: 'info',
    category: 'accessibility'
  }
]

export const mathValidationRules: ValidationRule[] = [
  {
    id: 'math-latex',
    test: (q: Question) => /\$.*\$/.test(q.text),
    message: 'Mathematical expressions should use LaTeX formatting',
    severity: 'warning',
    category: 'content'
  },
  {
    id: 'math-units',
    test: (q: Question) => !q.text.includes('=') || /\d+\s*[A-Za-z]+/.test(q.text),
    message: 'Include units with numerical values',
    severity: 'warning',
    category: 'content'
  }
]

export const scienceValidationRules: ValidationRule[] = [
  {
    id: 'science-units',
    test: (q: Question) => /\d+\s*(m\/s|N|J|W|Hz|V|Ω)/.test(q.text),
    message: 'Use SI units with proper formatting',
    severity: 'error',
    category: 'content'
  },
  {
    id: 'chemical-formulas',
    test: (q: Question) => /[A-Z][a-z]?\d*/.test(q.text),
    message: 'Use proper chemical formula notation',
    severity: 'error',
    category: 'content'
  }
]

export function getValidationRules(subject?: string): ValidationRule[] {
  const rules = [...baseValidationRules]

  if (subject) {
    switch (subject.toLowerCase()) {
      case 'mathematics':
        rules.push(...mathValidationRules)
        break
      case 'physics':
      case 'chemistry':
      case 'biology':
        rules.push(...scienceValidationRules)
        break
    }
  }

  return rules
} 