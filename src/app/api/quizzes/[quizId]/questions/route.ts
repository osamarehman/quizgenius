import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  req: Request,
  { params }: { params: { quizId: string } }
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
    const { 
      questionType,
      questionText,
      questionExplanation,
      orderNumber,
    } = body

    // Create question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        quiz_id: params.quizId,
        question_type: questionType,
        question_text: questionText,
        question_explanation: questionExplanation,
        order_number: orderNumber,
      })
      .select()
      .single()

    if (questionError) {
      return NextResponse.json(
        { error: questionError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ question })
  } catch (err) {
    console.error('Error creating question:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 