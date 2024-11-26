import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
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
    const { title, category, subCategory, description, timeLimit } = body

    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        category,
        sub_category: subCategory,
        description,
        time_limit: timeLimit,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (quizError) {
      return NextResponse.json(
        { error: quizError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ quiz })
  } catch (err) {
    console.error('Error creating quiz:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 