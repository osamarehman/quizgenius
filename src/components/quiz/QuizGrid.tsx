'use client'

import React, { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QuizCard } from './QuizCard';
import { Loader2 } from 'lucide-react';

interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
  category_id?: string
  sub_category_id?: string
}

export function QuizGrid() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchQuizzes = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })
      setQuizzes(data || [])
    } catch (err) {
      console.error('Error fetching quizzes:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No quizzes found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} {...quiz} />
      ))}
    </div>
  );
}