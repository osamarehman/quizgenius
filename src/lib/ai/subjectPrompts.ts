import { QuestionType, EducationLevel } from './types'

interface SubjectPromptConfig {
  keyTerms: string[]
  concepts: string[]
  commonMisconceptions: string[]
  exampleFormat: string
}

const subjectConfigs: Record<string, SubjectPromptConfig> = {
  mathematics: {
    keyTerms: ['equation', 'function', 'variable', 'theorem', 'proof'],
    concepts: ['algebra', 'geometry', 'calculus', 'statistics'],
    commonMisconceptions: [
      'multiplication always makes numbers bigger',
      'division always makes numbers smaller'
    ],
    exampleFormat: 'Use LaTeX formatting for mathematical expressions: $x^2 + y^2 = z^2$'
  },
  physics: {
    keyTerms: ['force', 'energy', 'momentum', 'velocity', 'acceleration'],
    concepts: ['mechanics', 'thermodynamics', 'electromagnetism', 'quantum'],
    commonMisconceptions: [
      'heavier objects fall faster',
      'heat and temperature are the same'
    ],
    exampleFormat: 'Include units in SI format: 9.81 m/s²'
  },
  chemistry: {
    keyTerms: ['reaction', 'molecule', 'element', 'compound', 'bond'],
    concepts: ['organic', 'inorganic', 'physical', 'analytical'],
    commonMisconceptions: [
      'atoms are visible under microscope',
      'chemical bonds are physical connections'
    ],
    exampleFormat: 'Use proper chemical notation: H₂O, CH₃COOH'
  }
}

const educationSystemPrompts: Record<string, Record<EducationLevel, string>> = {
  'o-levels': {
    elementary: 'Focus on basic understanding and recall',
    middle: 'Include application of concepts',
    high: 'Test analytical and problem-solving skills',
    university: 'Not applicable',
    professional: 'Not applicable'
  },
  'a-levels': {
    elementary: 'Not applicable',
    middle: 'Not applicable',
    high: 'Focus on deep understanding and analysis',
    university: 'Include research and theoretical aspects',
    professional: 'Not applicable'
  },
  'mcat': {
    elementary: 'Not applicable',
    middle: 'Not applicable',
    high: 'Focus on medical science foundations',
    university: 'Include clinical applications',
    professional: 'Test professional medical knowledge'
  }
}

export function generateSubjectPrompt(
  subject: string,
  questionType: QuestionType,
  educationSystem: string,
  level: EducationLevel,
  context: string
): string {
  const config = subjectConfigs[subject]
  const systemPrompt = educationSystemPrompts[educationSystem]?.[level]

  if (!config || !systemPrompt) {
    return generateDefaultPrompt(questionType, context)
  }

  return `As an expert ${subject} educator for ${level} level in the ${educationSystem} system:

Context: ${context}

Key Requirements:
1. ${systemPrompt}
2. Focus on these key terms: ${config.keyTerms.join(', ')}
3. Cover these core concepts: ${config.concepts.join(', ')}
4. Address these common misconceptions: ${config.commonMisconceptions.join(', ')}
5. ${config.exampleFormat}

Question Format:
${getQuestionFormat(questionType)}

Ensure:
1. Appropriate difficulty for ${level} level
2. Clear and unambiguous language
3. Subject-specific terminology
4. Proper notation and formatting
5. Educational system alignment`
}

function getQuestionFormat(type: QuestionType): string {
  switch (type) {
    case 'mcq':
      return `Q. [Question]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Correct: [Letter]
Explanation: [Detailed explanation]`
    
    case 'true-false':
      return `Statement: [Statement]
Answer: [True/False]
Explanation: [Detailed explanation]`
    
    case 'blanks':
      return `Sentence: [Text with _____ ]
Answer: [Correct term]
Explanation: [Context and reasoning]`
  }
}

function generateDefaultPrompt(type: QuestionType, context: string): string {
  return `Create a ${type} question based on: ${context}

Follow standard format and ensure:
1. Clear language
2. Appropriate difficulty
3. Proper explanation
4. Correct formatting`
}

export function generateBatchPrompt(
  count: number,
  subject: string,
  questionType: QuestionType,
  educationSystem: string,
  level: EducationLevel,
  context: string
): string {
  return `Generate ${count} questions following this template:

${generateSubjectPrompt(subject, questionType, educationSystem, level, context)}

Additional Requirements:
1. Ensure variety in difficulty
2. Cover different aspects of the topic
3. Progressive complexity
4. Varied cognitive skills
5. Different question structures`
} 