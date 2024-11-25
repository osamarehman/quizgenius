import { SubjectTemplate } from '../types'

export const mathTemplates: SubjectTemplate = {
  keyTerms: [
    'equation', 'function', 'variable', 'theorem', 'proof',
    'derivative', 'integral', 'matrix', 'vector', 'polynomial'
  ],
  concepts: [
    'algebra', 'geometry', 'calculus', 'statistics',
    'trigonometry', 'linear algebra', 'number theory'
  ],
  commonMisconceptions: [
    'multiplication always makes numbers bigger',
    'division always makes numbers smaller',
    'negative numbers cannot have square roots'
  ],
  questionTypes: {
    mcq: {
      structure: 'Present a mathematical problem with step-by-step solution options',
      examples: [
        'Calculate the derivative of f(x) = x² + 3x + 2',
        'Solve the equation 2x + 5 = 13'
      ],
      tips: [
        'Include common calculation errors as distractors',
        'Show intermediate steps in answer options',
        'Use LaTeX formatting for equations'
      ]
    },
    'true-false': {
      structure: 'Present mathematical statements that test conceptual understanding',
      examples: [
        'The square root of a negative number is undefined in real numbers',
        'All prime numbers are odd numbers'
      ],
      tips: [
        'Focus on fundamental concepts',
        'Include edge cases',
        'Test common misconceptions'
      ]
    },
    blanks: {
      structure: 'Create equations or statements with missing terms',
      examples: [
        'The derivative of x² is _____',
        'If f(x) = x², then f\'(3) = _____'
      ],
      tips: [
        'Ensure only one possible correct answer',
        'Include units where applicable',
        'Focus on key mathematical terms'
      ]
    }
  },
  validationRules: {
    content: [
      'Uses correct mathematical notation',
      'Equations are properly formatted in LaTeX',
      'Units are included where necessary'
    ],
    structure: [
      'Question follows logical progression',
      'Steps are clearly defined',
      'Answer options are mathematically valid'
    ],
    pedagogy: [
      'Appropriate for target education level',
      'Tests understanding rather than memorization',
      'Includes relevant problem-solving steps'
    ]
  }
} 