import { Question, AutoFixSuggestion } from './types'

interface FixRule {
  id: string
  name: string
  description: string
  test: (text: string) => boolean
  fix: (text: string) => string
  category: 'content' | 'structure' | 'pedagogy' | 'accessibility'
}

const mathFixRules: FixRule[] = [
  {
    id: 'math-exponents',
    name: 'Format Exponents',
    description: 'Convert basic exponents to LaTeX format',
    test: (text) => /\d+\^[0-9]/.test(text),
    fix: (text) => text.replace(/(\d+)\^(\d+)/g, '$$$1^{$2}$$'),
    category: 'content'
  },
  {
    id: 'math-fractions',
    name: 'Format Fractions',
    description: 'Convert fractions to LaTeX format',
    test: (text) => /\d+\/\d+/.test(text),
    fix: (text) => text.replace(/(\d+)\/(\d+)/g, '$$\\frac{$1}{$2}$$'),
    category: 'content'
  }
]

const scienceFixRules: FixRule[] = [
  {
    id: 'science-units',
    name: 'Format Units',
    description: 'Format scientific units correctly',
    test: (text) => /\d+\s*(m|kg|s|A|K|mol|cd)\b/.test(text),
    fix: (text) => text.replace(/(\d+)\s*(m|kg|s|A|K|mol|cd)\b/g, '$1 $2'),
    category: 'content'
  },
  {
    id: 'chemical-formulas',
    name: 'Format Chemical Formulas',
    description: 'Format chemical formulas with proper subscripts',
    test: (text) => /[A-Z][a-z]?\d+/.test(text),
    fix: (text) => text.replace(/([A-Z][a-z]?)(\d+)/g, '$1₍$2₎'),
    category: 'content'
  }
]

const generalFixRules: FixRule[] = [
  {
    id: 'question-mark',
    name: 'Add Question Mark',
    description: 'Ensure questions end with a question mark',
    test: (text) => !text.trim().endsWith('?'),
    fix: (text) => text.trim() + '?',
    category: 'structure'
  },
  {
    id: 'double-spaces',
    name: 'Fix Spacing',
    description: 'Remove double spaces',
    test: (text) => /\s{2,}/.test(text),
    fix: (text) => text.replace(/\s+/g, ' ').trim(),
    category: 'structure'
  }
]

export function getAutoFixSuggestions(
  question: Question,
  subject?: string
): AutoFixSuggestion[] {
  const suggestions: AutoFixSuggestion[] = []

  // Add subject-specific fixes
  const subjectRules = getSubjectRules(subject)
  for (const rule of subjectRules) {
    if (rule.test(question.text)) {
      suggestions.push({
        id: rule.id,
        description: rule.description,
        apply: rule.fix,
        category: rule.category,
        severity: 'warning'
      })
    }
  }

  // Add general fixes
  for (const rule of generalFixRules) {
    if (rule.test(question.text)) {
      suggestions.push({
        id: rule.id,
        description: rule.description,
        apply: rule.fix,
        category: rule.category,
        severity: 'info'
      })
    }
  }

  return suggestions
}

function getSubjectRules(subject?: string): FixRule[] {
  switch (subject?.toLowerCase()) {
    case 'mathematics':
      return mathFixRules
    case 'physics':
    case 'chemistry':
    case 'biology':
      return scienceFixRules
    default:
      return []
  }
}

export function applyAutoFix(
  question: Question,
  fixId: string,
  subject?: string
): Question {
  const allRules = [
    ...getSubjectRules(subject),
    ...generalFixRules
  ]

  const rule = allRules.find(r => r.id === fixId)
  if (!rule) return question

  return {
    ...question,
    text: rule.fix(question.text),
    answers: question.answers.map(answer => ({
      ...answer,
      text: rule.fix(answer.text)
    }))
  }
}

export function applyAllAutoFixes(
  question: Question,
  subject?: string
): Question {
  const allRules = [
    ...getSubjectRules(subject),
    ...generalFixRules
  ]

  let fixedQuestion = { ...question }

  for (const rule of allRules) {
    if (rule.test(fixedQuestion.text)) {
      fixedQuestion = applyAutoFix(fixedQuestion, rule.id, subject)
    }
  }

  return fixedQuestion
} 