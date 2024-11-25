import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

interface ProcessedQuestion {
  question: string
  type: 'mcq' | 'true-false' | 'blanks'
  explanation: string
  answers: {
    text: string
    isCorrect: boolean
    explanation: string
  }[]
  metadata: {
    subject?: string
    topic?: string
    difficulty?: string
    examBoard?: string
  }
}

export async function extractQuestions(content: string): Promise<ProcessedQuestion[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a quiz question extractor. Analyze the given content and extract multiple-choice questions. 
          Format each question with:
          - Clear question text
          - 4 answer options (1 correct, 3 incorrect)
          - Explanation for the correct answer
          - Explanations for why incorrect answers are wrong
          - Subject/topic classification
          - Difficulty level (easy/medium/hard)
          Return the questions in a structured JSON format.`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return result.questions || []
  } catch (error) {
    console.error('Error extracting questions:', error)
    throw error
  }
}

export async function generateSimilarQuestions(question: ProcessedQuestion): Promise<ProcessedQuestion[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Generate 3 similar but different questions based on the provided question. 
          Maintain the same topic and difficulty level, but vary the specific concepts tested.
          Return in JSON format.`
        },
        {
          role: "user",
          content: JSON.stringify(question)
        }
      ],
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return result.questions || []
  } catch (error) {
    console.error('Error generating similar questions:', error)
    throw error
  }
} 