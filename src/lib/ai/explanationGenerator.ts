import OpenAI from 'openai'
import { ExplanationStyle } from './types'

interface ExplanationOptions {
  style: ExplanationStyle
  subject: string
  level: string
  includeExamples: boolean
  includeReferences: boolean
}

interface ExplanationResult {
  questionExplanation: string
  answerExplanations: string[]
  references?: string[]
  relatedConcepts?: string[]
}

export async function generateExplanations(
  question: {
    text: string
    type: string
    answers: Array<{ text: string; isCorrect: boolean }>
  },
  options: ExplanationOptions,
  openai: OpenAI
): Promise<ExplanationResult> {
  const assistant = await openai.beta.assistants.create({
    name: "Explanation Generator",
    instructions: generateExplanationPrompt(question, options),
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-1106-preview"
  })

  const thread = await openai.beta.threads.create()

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: `Generate explanations for this ${options.subject} question at ${options.level} level.`
  })

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id
  })

  const response = await pollForCompletion(thread.id, run.id, openai)
  return parseExplanationResponse(response)
}

function generateExplanationPrompt(
  question: { text: string; type: string; answers: Array<{ text: string; isCorrect: boolean }> },
  options: ExplanationOptions
): string {
  const stylePrompts = {
    basic: "Provide clear, straightforward explanations",
    detailed: "Provide comprehensive explanations with examples",
    conceptual: "Focus on underlying concepts and principles",
    practical: "Use real-world applications and examples",
    step_by_step: "Break down explanations into clear steps"
  }

  return `As an expert ${options.subject} educator for ${options.level} level:

1. Explain this ${question.type} question: "${question.text}"
2. ${stylePrompts[options.style]}
3. ${options.includeExamples ? 'Include relevant examples' : ''}
4. ${options.includeReferences ? 'Include references to key concepts' : ''}
5. For each answer option:
   - Explain why it's correct or incorrect
   - Identify common misconceptions
   - Link to related concepts
6. Format the response as JSON with:
   - questionExplanation
   - answerExplanations (array)
   - references (if requested)
   - relatedConcepts (array of related topics)
`
}

async function pollForCompletion(
  threadId: string,
  runId: string,
  openai: OpenAI
): Promise<string> {
  while (true) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId)

    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId)
      const response = messages.data[0].content[0]
      
      if ('text' in response) {
        return response.text.value
      }
      throw new Error('Unexpected response format')
    }

    if (runStatus.status === 'failed') {
      throw new Error('Failed to generate explanation')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

function parseExplanationResponse(response: string): ExplanationResult {
  try {
    const parsed = JSON.parse(response)
    return {
      questionExplanation: parsed.questionExplanation || '',
      answerExplanations: parsed.answerExplanations || [],
      references: parsed.references,
      relatedConcepts: parsed.relatedConcepts
    }
  } catch (error) {
    console.error('Error parsing explanation response:', error)
    return {
      questionExplanation: 'Failed to parse explanation',
      answerExplanations: []
    }
  }
}

export async function generateBatchExplanations(
  questions: Array<{
    text: string
    type: string
    answers: Array<{ text: string; isCorrect: boolean }>
  }>,
  options: ExplanationOptions,
  openai: OpenAI
): Promise<ExplanationResult[]> {
  const results: ExplanationResult[] = []
  const batchSize = 5

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(question => generateExplanations(question, options, openai))
    )
    results.push(...batchResults)
  }

  return results
} 