import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  req: Request,
  { params }: { params: { questionId: string } }
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

    const body = await req.json()
    const answers = body.answers as Array<{
      answerText: string
      explanation: string
      isCorrect: boolean
      orderNumber: number
    }>

    // Insert all answers
    const { data: createdAnswers, error: answersError } = await supabase
      .from('answers')
      .insert(
        answers.map(answer => ({
          question_id: params.questionId,
          answer_text: answer.answerText,
          explanation: answer.explanation,
          is_correct: answer.isCorrect,
          order_number: answer.orderNumber,
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
    console.error('Error creating answers:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 