import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface QuizData {
  title: string
  category: string
  subCategory?: string
  description: string
  timeLimit: number
  difficulty: QuizDifficulty
  questions: Array<{
    type: 'mcq' | 'true-false' | 'blanks'
    text: string
    explanation?: string
    image?: string
    answers: Array<{
      text: string
      explanation?: string
      isCorrect: boolean
    }>
  }>
}

export async function createFullQuiz(quizData: QuizData) {
  const supabase = createClientComponentClient()
  
  try {
    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) throw authError
    if (!session) throw new Error('Not authenticated')

    // Start a Supabase transaction
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: quizData.title,
        category: quizData.category,
        sub_category: quizData.subCategory,
        description: quizData.description,
        time_limit: quizData.timeLimit,
        difficulty: quizData.difficulty,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (quizError) throw quizError
    if (!quiz) throw new Error('Failed to create quiz')

    // Add questions and answers
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i]
      
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          quiz_id: quiz.id,
          question_type: question.type,
          question_text: question.text,
          question_explanation: question.explanation,
          order_number: i + 1,
        })
        .select()
        .single()

      if (questionError) throw questionError
      if (!questionData) throw new Error('Failed to create question')

      // Add answers for the question
      const answersToInsert = question.answers.map((answer, index) => ({
        question_id: questionData.id,
        answer_text: answer.text,
        explanation: answer.explanation,
        is_correct: answer.isCorrect,
        order_number: index + 1,
      }))

      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToInsert)

      if (answersError) throw answersError
    }

    return { success: true, quizId: quiz.id }
  } catch (error) {
    console.error('Error creating quiz:', error)
    return { success: false, error }
  }
} 