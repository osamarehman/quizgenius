import { ValidationRule, Question, EducationSystem } from './types'

// Subject-specific validation rules
export const subjectValidationRules: Record<string, ValidationRule[]> = {
  mathematics: [
    {
      id: 'math-latex',
      test: (q: Question) => /\$.*\$/.test(q.text),
      message: 'Mathematical expressions should use LaTeX formatting (e.g., $x^2$)',
      severity: 'warning',
      category: 'content',
      autoFix: (text: string) => {
        // Convert basic math expressions to LaTeX
        return text.replace(/(\d+)(\^)(\d+)/g, '$$$1^$3$')
      }
    },
    {
      id: 'math-units',
      test: (q: Question) => !q.text.includes('=') || /\d+\s*[A-Za-z]+/.test(q.text),
      message: 'Include units with numerical values',
      severity: 'warning',
      category: 'content'
    }
  ],
  physics: [
    {
      id: 'physics-units',
      test: (q: Question) => /\d+\s*(m\/s|N|J|W|Hz|V|Ω)/.test(q.text),
      message: 'Use SI units with proper formatting',
      severity: 'error',
      category: 'content',
      autoFix: (text: string) => {
        // Format common physics units
        return text
          .replace(/meters\/second/g, 'm/s')
          .replace(/newtons/g, 'N')
          .replace(/joules/g, 'J')
      }
    }
  ],
  chemistry: [
    {
      id: 'chemical-formulas',
      test: (q: Question) => /[A-Z][a-z]?\d*/.test(q.text),
      message: 'Use proper chemical formula notation',
      severity: 'error',
      category: 'content',
      autoFix: (text: string) => {
        // Format chemical formulas
        return text
          .replace(/H2O/g, 'H₂O')
          .replace(/CO2/g, 'CO₂')
      }
    }
  ],
  biology: [
    {
      id: 'scientific-names',
      test: (q: Question) => /[A-Z][a-z]+ [a-z]+/.test(q.text),
      message: 'Scientific names should be properly formatted',
      severity: 'warning',
      category: 'content',
      autoFix: (text: string) => {
        // Italicize scientific names
        return text.replace(/([A-Z][a-z]+) ([a-z]+)/, '_$1 $2_')
      }
    }
  ]
}

// Education system-specific validation rules
export const educationSystemRules: Record<EducationSystem, ValidationRule[]> = {
  'o-levels': [
    {
      id: 'o-level-complexity',
      test: (q: Question) => {
        const words = q.text.split(' ')
        return words.every(word => word.length <= 12)
      },
      message: 'Use appropriate vocabulary for O Level students',
      severity: 'warning',
      category: 'accessibility'
    }
  ],
  'a-levels': [
    {
      id: 'a-level-depth',
      test: (q: Question) => q.explanation?.length >= 50,
      message: 'Provide detailed explanations for A Level concepts',
      severity: 'warning',
      category: 'pedagogy'
    }
  ],
  'mcat': [
    {
      id: 'mcat-format',
      test: (q: Question) => {
        return q.answers.length >= 4 && q.explanation?.includes('AAMC format')
      },
      message: 'Follow MCAT question format guidelines',
      severity: 'error',
      category: 'structure'
    }
  ],
  'sat': [
    {
      id: 'sat-timing',
      test: (q: Question) => q.text.length <= 150,
      message: 'Keep questions concise for SAT timing constraints',
      severity: 'warning',
      category: 'structure'
    }
  ],
  'custom': []
}

// Auto-fix suggestions
export interface FixSuggestion {
  id: string
  description: string
  apply: (text: string) => string
}

export const autoFixSuggestions: Record<string, FixSuggestion[]> = {
  mathematics: [
    {
      id: 'format-exponents',
      description: 'Format exponents using LaTeX',
      apply: (text: string) => text.replace(/(\d+)(\^)(\d+)/g, '$$$1^$3$')
    }
  ],
  physics: [
    {
      id: 'format-units',
      description: 'Format physics units',
      apply: (text: string) => text.replace(/(\d+)\s*(meter|second|newton)/gi, '$1 $2')
    }
  ]
}

export function getFixSuggestions(question: Question, subject: string): FixSuggestion[] {
  const suggestions: FixSuggestion[] = []
  const subjectRules = subjectValidationRules[subject] || []

  for (const rule of subjectRules) {
    if (!rule.test(question) && rule.autoFix) {
      suggestions.push({
        id: rule.id,
        description: rule.message,
        apply: rule.autoFix
      })
    }
  }

  return suggestions
}

export function applyFix(question: Question, fixId: string): Question {
  const fix = Object.values(autoFixSuggestions)
    .flat()
    .find(f => f.id === fixId)

  if (!fix) return question

  return {
    ...question,
    text: fix.apply(question.text),
    answers: question.answers.map(answer => ({
      ...answer,
      text: fix.apply(answer.text)
    }))
  }
} 