import { NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { extractQuestions, generateSimilarQuestions } from '@/lib/ai/contentProcessor'

export async function POST(request: Request) {
  try {
    const { content, generateSimilar = false } = await request.json()
    const supabase = createClientComponentClient()

    // Extract questions from content
    const extractedQuestions = await extractQuestions(content)

    // Generate similar questions if requested
    let allQuestions = [...extractedQuestions]
    if (generateSimilar) {
      for (const question of extractedQuestions) {
        const similarQuestions = await generateSimilarQuestions(question)
        allQuestions = [...allQuestions, ...similarQuestions]
      }
    }

    // Save questions to database
    const { data: savedQuestions, error } = await supabase
      .from('questions')
      .insert(
        allQuestions.map(q => ({
          question_text: q.question,
          question_type: q.type,
          question_explanation: q.explanation,
          metadata: q.metadata,
          answers: q.answers,
          source: 'reddit',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )
      .select()

    if (error) throw error

    return NextResponse.json({ questions: savedQuestions })
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { message: 'Failed to extract questions' },
      { status: 500 }
    )
  }
} 