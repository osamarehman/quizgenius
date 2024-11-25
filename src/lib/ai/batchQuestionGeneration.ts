import { Question, QuestionType, EducationLevel, BatchProcessingResult } from './types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import OpenAI from 'openai'

interface BatchGenerationOptions {
  subject: string
  educationSystem: string
  level: EducationLevel
  questionType: QuestionType
  batchSize: number
  maxRetries: number
  validateResults: boolean
}

export async function generateQuestionsBatch(
  context: string,
  count: number,
  options: BatchGenerationOptions,
  openai: OpenAI
): Promise<BatchProcessingResult<Question[]>> {
  try {
    const supabase = createClientComponentClient()
    const batches: Question[][] = []
    
    for (let i = 0; i < count; i += options.batchSize) {
      const batchSize = Math.min(options.batchSize, count - i)
      let retryCount = 0
      let success = false
      
      while (!success && retryCount < options.maxRetries) {
        try {
          const batch = await generateQuestionBatch(
            context,
            batchSize,
            options,
            openai
          )
          
          if (options.validateResults) {
            // Validate questions before accepting them
            const validQuestions = batch.filter(question => 
              validateGeneratedQuestion(question, options.subject, options.level)
            )
            
            if (validQuestions.length < batchSize) {
              throw new Error('Generated questions did not meet validation criteria')
            }
            
            batches.push(validQuestions)
          } else {
            batches.push(batch)
          }
          
          success = true
        } catch (error) {
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      }
      
      if (!success) {
        throw new Error(`Failed to generate batch after ${options.maxRetries} retries`)
      }
    }
    
    const allQuestions = batches.flat()
    
    return {
      success: true,
      data: allQuestions,
      retryCount: 0,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      retryCount: options.maxRetries,
      timestamp: new Date().toISOString()
    }
  }
}

async function generateQuestionBatch(
  context: string,
  batchSize: number,
  options: BatchGenerationOptions,
  openai: OpenAI
): Promise<Question[]> {
  const assistant = await openai.beta.assistants.create({
    name: "Quiz Generator",
    instructions: generateBatchPrompt(
      batchSize,
      options.subject,
      options.questionType,
      options.educationSystem,
      options.level,
      context
    ),
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-1106-preview"
  })

  const thread = await openai.beta.threads.create()
  
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "Generate questions based on the provided context and requirements."
  })

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id
  })

  // Poll for completion
  while (true) {
    const status = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    
    if (status.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id)
      const response = messages.data[0].content[0]
      
      if ('text' in response) {
        return parseQuestions(response.text.value)
      }
      throw new Error('Unexpected response format')
    }
    
    if (status.status === 'failed') {
      throw new Error('Failed to generate questions')
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

function validateGeneratedQuestion(
  question: Question,
  subject: string,
  level: EducationLevel
): boolean {
  // Basic validation
  if (!question.text || !question.answers || question.answers.length < 2) {
    return false
  }

  // Check for correct answer
  if (!question.answers.some(answer => answer.isCorrect)) {
    return false
  }

  // Subject-specific validation
  switch (subject) {
    case 'mathematics':
      return validateMathQuestion(question)
    case 'science':
      return validateScienceQuestion(question)
    default:
      return true
  }
}

function validateMathQuestion(question: Question): boolean {
  // Check for mathematical expressions
  return (
    question.text.includes('$') || // LaTeX formatting
    /[\d+\-*/()=]/.test(question.text) // Basic math operators
  )
}

function validateScienceQuestion(question: Question): boolean {
  // Check for scientific terms and units
  return (
    /[A-Z][a-z]*\d*/.test(question.text) || // Chemical formulas
    /\d+\s*[a-zA-Z]+/.test(question.text) // Units
  )
}

function parseQuestions(response: string): Question[] {
  try {
    const parsed = JSON.parse(response)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Fallback parsing for non-JSON format
    const questions: Question[] = []
    const questionBlocks = response.split(/Q\d+\./).filter(Boolean)
    
    questionBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n')
      questions.push({
        id: `gen-${index}`,
        text: lines[0].trim(),
        type: 'mcq',
        answers: parseAnswers(lines.slice(1)),
        created_at: new Date().toISOString()
      })
    })
    
    return questions
  }
}

function parseAnswers(lines: string[]): Question['answers'] {
  return lines
    .filter(line => /^[A-D]\)/.test(line))
    .map((line, index) => ({
      id: `ans-${index}`,
      text: line.replace(/^[A-D]\)\s*/, '').trim(),
      isCorrect: line.includes('(correct)'),
      explanation: ''
    }))
} 