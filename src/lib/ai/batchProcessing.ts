import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import OpenAI from 'openai'
import { 
  Question, 
  BatchProcessingOptions, 
  BatchProcessingResult,
} from './types'
import { validateQuestionBatch } from './batchValidation'
import { generateSubjectPrompt } from './subjectPrompts'

const defaultOptions: BatchProcessingOptions = {
  batchSize: 5,
  maxRetries: 3,
  delayBetweenBatches: 1000,
  validateResults: true
}

export async function processBatchQuestions(
  questions: Question[],
  options: Partial<BatchProcessingOptions> = {}
): Promise<BatchProcessingResult<Question>[]> {
  const opts = { ...defaultOptions, ...options }
  const results: BatchProcessingResult<Question>[] = []
  const supabase = createClientComponentClient()

  // Process in batches
  for (let i = 0; i < questions.length; i += opts.batchSize) {
    const batch = questions.slice(i, Math.min(i + opts.batchSize, questions.length))
    
    // Process each question in batch
    for (const question of batch) {
      let retryCount = 0
      let success = false
      
      while (!success && retryCount < opts.maxRetries) {
        try {
          // Validate question
          if (opts.validateResults) {
            const validationResults = await validateQuestionBatch([question])
            if (!validationResults[0].isValid) {
              throw new Error('Question validation failed')
            }
          }

          // Save to database
          const { data, error } = await supabase
            .from('questions')
            .insert(question)
            .select()
            .single()

          if (error) throw error

          results.push({
            success: true,
            data: data,
            retryCount,
            timestamp: new Date().toISOString()
          })
          
          success = true
        } catch (error) {
          retryCount++
          if (retryCount === opts.maxRetries) {
            results.push({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              retryCount,
              timestamp: new Date().toISOString()
            })
          }
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
    
    // Delay between batches
    if (i + opts.batchSize < questions.length) {
      await new Promise(resolve => setTimeout(resolve, opts.delayBetweenBatches))
    }
  }
  
  return results
}

export async function generateQuestionsBatch(
  context: string,
  count: number,
  subject: string,
  educationSystem: string,
  level: string,
  openai: OpenAI,
  options: Partial<BatchProcessingOptions> = {}
): Promise<BatchProcessingResult<Question[]>> {
  try {
    const opts = { ...defaultOptions, ...options }
    const questions: Question[] = []
    
    // Generate questions in batches
    for (let i = 0; i < count; i += opts.batchSize) {
      const batchSize = Math.min(opts.batchSize, count - i)
      const prompt = generateSubjectPrompt(
        subject,
        'mcq',
        educationSystem,
        level,
        context
      )

      const assistant = await openai.beta.assistants.create({
        name: "Quiz Generator",
        instructions: prompt,
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview"
      })

      const thread = await openai.beta.threads.create()
      
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Generate ${batchSize} questions based on the provided context.`
      })

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id
      })

      // Poll for completion
      const response = await pollForCompletion(thread.id, run.id, openai)
      const batchQuestions = parseQuestions(response)
      questions.push(...batchQuestions)

      // Delay between batches
      if (i + opts.batchSize < count) {
        await new Promise(resolve => setTimeout(resolve, opts.delayBetweenBatches))
      }
    }

    return {
      success: true,
      data: questions,
      retryCount: 0,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      retryCount: options.maxRetries || defaultOptions.maxRetries,
      timestamp: new Date().toISOString()
    }
  }
}

async function pollForCompletion(
  threadId: string,
  runId: string,
  openai: OpenAI
): Promise<string> {
  while (true) {
    const status = await openai.beta.threads.runs.retrieve(threadId, runId)
    
    if (status.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId)
      const response = messages.data[0].content[0]
      
      if ('text' in response) {
        return response.text.value
      }
      throw new Error('Unexpected response format')
    }
    
    if (status.status === 'failed') {
      throw new Error('Failed to generate questions')
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

function parseQuestions(response: string): Question[] {
  try {
    const parsed = JSON.parse(response)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
} 