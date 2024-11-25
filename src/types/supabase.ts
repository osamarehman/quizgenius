export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type QuestionType = 'mcq' | 'true-false' | 'blanks'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface Database {
  public: {
    Tables: {
      quizzes: {
        Row: {
          id: string
          title: string
          category: string
          sub_category: string | null
          description: string | null
          created_at: string
          updated_at: string
          created_by: string
          is_published: boolean
          time_limit: number | null
        }
        Insert: {
          id?: string
          title: string
          category: string
          sub_category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          is_published?: boolean
          time_limit?: number | null
        }
        Update: {
          id?: string
          title?: string
          category?: string
          sub_category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          is_published?: boolean
          time_limit?: number | null
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          question_type: QuestionType
          question_text: string
          question_explanation: string | null
          created_at: string
          updated_at: string
          order_number: number
        }
        Insert: {
          id?: string
          quiz_id: string
          question_type: QuestionType
          question_text: string
          question_explanation?: string | null
          created_at?: string
          updated_at?: string
          order_number: number
        }
        Update: {
          id?: string
          quiz_id?: string
          question_type?: QuestionType
          question_text?: string
          question_explanation?: string | null
          created_at?: string
          updated_at?: string
          order_number?: number
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          answer_text: string
          explanation: string | null
          is_correct: boolean
          created_at: string
          updated_at: string
          order_number: number
        }
        Insert: {
          id?: string
          question_id: string
          answer_text: string
          explanation?: string | null
          is_correct?: boolean
          created_at?: string
          updated_at?: string
          order_number: number
        }
        Update: {
          id?: string
          question_id?: string
          answer_text?: string
          explanation?: string | null
          is_correct?: boolean
          created_at?: string
          updated_at?: string
          order_number?: number
        }
      }
      bulk_upload_history: {
        Row: {
          id: string
          created_at: string
          created_by: string
          file_name: string
          questions_count: number
          status: string
          quiz_id: string | null
          quiz_name: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          created_by: string
          file_name: string
          questions_count: number
          status: string
          quiz_id?: string | null
          quiz_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          created_by?: string
          file_name?: string
          questions_count?: number
          status?: string
          quiz_id?: string | null
          quiz_name?: string | null
        }
      }
    }
  }
} 