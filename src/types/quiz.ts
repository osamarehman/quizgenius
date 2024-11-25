export type ViewType = 'grid' | 'list'

export interface QuizCategory {
  id: string
  name: string
  icon: string
  description: string
  totalQuizzes: number
  difficulty: {
    easy: number
    medium: number
    hard: number
  }
  progress?: number
}

export interface SortOption {
  label: string
  value: 'popular' | 'recent' | 'name'
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'
export type QuizDifficulty = 'easy' | 'medium' | 'hard'

export interface QuizMetadata {
  title: string
  category: string
  description: string
  timeLimit: number
  difficulty: QuizDifficulty
  tags: string[]
  isPublished: boolean
}

export interface Question {
  id: string
  type: QuestionType
  content: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  media?: {
    type: 'image' | 'video'
    url: string
  }
} 