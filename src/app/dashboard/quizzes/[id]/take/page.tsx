import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TakeQuizClient } from './TakeQuizClient'
import { LoadingSpinner } from '@/components/ui/loading'
import { Card } from '@/components/ui/card'

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  
  try {
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:questions(
          id,
          quiz_id,
          question_text,
          question_type,
          question_explanation,
          answers,
          order_number
        )
      `)
      .eq('id', await Promise.resolve(params.id))
      .single()

    if (error) {
      throw error
    }

    if (!quiz) {
      return (
        <Card className="p-6">
          <p>Quiz not found</p>
        </Card>
      )
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <TakeQuizClient quiz={quiz} />
      </Suspense>
    )
  } catch (error) {
    console.error('Error loading quiz:', error)
    return (
      <Card className="p-6">
        <p>Error loading quiz. Please try again later.</p>
      </Card>
    )
  }
}