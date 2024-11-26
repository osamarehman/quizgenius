import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  context: { params: { quizId: string; questionId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const answers = body.answers as Array<{
      answerText: string
      explanation: string
      isCorrect: boolean
      position: number
    }>

    // Insert all answers
    const { data: createdAnswers, error: answersError } = await supabase
      .from('answers')
      .insert(
        answers.map(answer => ({
          question_id: context.params.questionId,
          answer_text: answer.answerText,
          explanation: answer.explanation,
          is_correct: answer.isCorrect,
          position: answer.position,
        }))
      )
      .select()

    if (answersError) {
      return NextResponse.json(
        { error: answersError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ answers: createdAnswers })
  } catch (err) {
    console.error('Error creating answers:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

