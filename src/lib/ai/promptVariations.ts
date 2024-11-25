export type PromptStyle = 'standard' | 'analytical' | 'practical' | 'conceptual' | 'advanced' | 'beginner'
export type QuestionType = 'mcq' | 'true-false' | 'blanks'
export type EducationLevel = 'elementary' | 'middle' | 'high' | 'university' | 'professional'

interface PromptTemplate {
  prefix: string
  instruction: string
  format: string
  examples?: string
}

export const promptTemplates: Record<PromptStyle, Record<QuestionType, PromptTemplate>> = {
  standard: {
    mcq: {
      prefix: "Create standard multiple-choice questions that test fundamental knowledge.",
      instruction: "Generate clear, straightforward questions with one correct answer and three plausible distractors.",
      format: `Format as:
        Q1. [Question Text]
        A) [Option 1]
        B) [Option 2]
        C) [Option 3]
        D) [Option 4]
        Correct: [Letter]
        Explanation: [Why this is correct]`
    },
    'true-false': {
      prefix: "Create clear true/false statements testing basic concepts.",
      instruction: "Generate unambiguous statements that can be definitively marked as true or false.",
      format: `Format as:
        Q1. [Statement]
        Answer: [True/False]
        Explanation: [Reasoning]`
    },
    blanks: {
      prefix: "Create fill-in-the-blank questions testing key terminology.",
      instruction: "Generate sentences with crucial terms removed, marked with underscores.",
      format: `Format as:
        Q1. [Sentence with _____ ]
        Answer: [Term]
        Explanation: [Context]`
    }
  },
  analytical: {
    mcq: {
      prefix: "Create analytical multiple-choice questions that test critical thinking.",
      instruction: "Generate questions requiring analysis, evaluation, and problem-solving.",
      format: `Include:
        - Scenario or case study
        - Multiple steps to solution
        - Analysis-based options
        - Detailed explanation of thinking process`
    },
    'true-false': {
      prefix: "Create analytical true/false statements requiring careful evaluation.",
      instruction: "Generate complex statements that require analysis of multiple factors.",
      format: `Include:
        - Multiple conditions
        - Logical relationships
        - Detailed reasoning`
    },
    blanks: {
      prefix: "Create analytical fill-in-the-blank questions testing relationships.",
      instruction: "Generate complex sentences where missing terms reveal understanding of relationships.",
      format: `Include:
        - Context clues
        - Related concepts
        - Multiple possible correct answers`
    }
  },
  practical: {
    mcq: {
      prefix: "Create real-world application questions.",
      instruction: "Generate questions based on practical scenarios and real-world problems.",
      format: `Include:
        - Real-world scenario
        - Practical application
        - Industry-relevant context`
    },
    'true-false': {
      prefix: "Create practical true/false statements about real applications.",
      instruction: "Generate statements about real-world implementations and practices.",
      format: `Include:
        - Industry standards
        - Best practices
        - Common scenarios`
    },
    blanks: {
      prefix: "Create practical fill-in-the-blank questions about applications.",
      instruction: "Generate questions about real-world usage and implementation.",
      format: `Include:
        - Industry terminology
        - Practical contexts
        - Common usage scenarios`
    }
  },
  // Add more variations...
}

export function generatePrompt(
  style: PromptStyle,
  type: QuestionType,
  subject: string,
  level: EducationLevel,
  context: string,
  options: {
    includeExamples?: boolean
    focusOnMisconceptions?: boolean
    includeReferences?: boolean
  } = {}
): string {
  const template = promptTemplates[style][type]
  const basePrompt = `As an expert ${subject} educator for ${level} level:

${template.prefix}

Context: ${context}

${template.instruction}

Requirements:
1. Appropriate for ${level} level
2. Clear and unambiguous
3. ${options.focusOnMisconceptions ? 'Address common misconceptions' : ''}
4. ${options.includeReferences ? 'Include references to key concepts' : ''}
5. ${options.includeExamples ? 'Provide relevant examples' : ''}

${template.format}

${template.examples || ''}`

  return basePrompt
}

export function generateBatchPrompt(
  questions: number,
  style: PromptStyle,
  type: QuestionType,
  subject: string,
  level: EducationLevel,
  context: string
): string {
  return `Generate ${questions} questions following these guidelines:

${generatePrompt(style, type, subject, level, context)}

Ensure variety in:
1. Difficulty levels
2. Topic coverage
3. Cognitive skills tested
4. Question structures`
} 