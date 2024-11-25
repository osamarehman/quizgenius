import { QuestionType, EducationLevel, EducationSystem } from './types'

interface SubjectTemplate {
  keyTerms: string[]
  concepts: string[]
  commonMisconceptions: string[]
  questionTypes: {
    [K in QuestionType]: {
      structure: string
      examples: string[]
      tips: string[]
    }
  }
}

export const subjectTemplates: Record<string, SubjectTemplate> = {
  mathematics: {
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
      'negative numbers cannot have square roots',
      'correlation implies causation'
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
    }
  },
  physics: {
    keyTerms: [
      'force', 'energy', 'momentum', 'velocity', 'acceleration',
      'mass', 'charge', 'field', 'wave', 'particle'
    ],
    concepts: [
      'mechanics', 'thermodynamics', 'electromagnetism', 'quantum mechanics',
      'relativity', 'optics', 'nuclear physics'
    ],
    commonMisconceptions: [
      'heavier objects fall faster',
      'heat and temperature are the same',
      'electricity flows like water',
      'vacuum pulls things'
    ],
    questionTypes: {
      mcq: {
        structure: 'Present physical scenarios with numerical or conceptual solutions',
        examples: [
          'Calculate the force needed to accelerate a 2kg mass at 5 m/s²',
          'Determine the wavelength of light given its frequency'
        ],
        tips: [
          'Include unit analysis',
          'Use real-world applications',
          'Test both calculation and concept understanding'
        ]
      },
      'true-false': {
        structure: 'Present physics principles and their applications',
        examples: [
          'Energy can be created or destroyed in nuclear reactions',
          'The speed of light is constant in all reference frames'
        ],
        tips: [
          'Focus on fundamental laws',
          'Include practical applications',
          'Address common misconceptions'
        ]
      },
      blanks: {
        structure: 'Create physics equations or statements with missing values',
        examples: [
          'F = m × _____',
          'The SI unit of force is _____'
        ],
        tips: [
          'Include units',
          'Focus on fundamental equations',
          'Use standard notation'
        ]
      }
    }
  }
}

export function generateSubjectPrompt(
  subject: string,
  questionType: QuestionType,
  educationSystem: EducationSystem,
  level: EducationLevel,
  context: string
): string {
  const template = subjectTemplates[subject]
  if (!template) return ''

  const questionTypeTemplate = template.questionTypes[questionType]

  return `As an expert ${subject} educator for ${level} level in the ${educationSystem} system:

Context: ${context}

Key Terms to Consider:
${template.keyTerms.join(', ')}

Core Concepts:
${template.concepts.join(', ')}

Common Misconceptions to Address:
${template.commonMisconceptions.join('\n')}

Question Structure:
${questionTypeTemplate.structure}

Examples:
${questionTypeTemplate.examples.join('\n')}

Tips:
${questionTypeTemplate.tips.join('\n')}

Generate questions that:
1. Are appropriate for ${level} level
2. Follow ${educationSystem} standards
3. Use proper notation and formatting
4. Include detailed explanations
5. Address common misconceptions`
} 