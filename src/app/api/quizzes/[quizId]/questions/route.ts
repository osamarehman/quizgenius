import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      questionType,
      questionText,
      questionExplanation,
      position,
    } = body

    // Create question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        quiz_id: params.quizId,
        question_type: questionType,
        question_text: questionText,
        question_explanation: questionExplanation,
        position,
      })
      .select()
      .single()

    if (questionError) {
      return Response.json(
        { error: questionError.message },
        { status: 500 }
      )
    }

    return Response.json({ question })
  } catch (err) {
    console.error('Error creating question:', err)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}