export interface Quiz {
  id: string
  title: string
  description?: string
  category_id?: string
  education_system_id?: string
  created_at?: string
  updated_at?: string
}

export interface Question {
  id: string
  quiz_id: string
  text: string
  explanation?: string
  image_url?: string
  order?: number
}

export interface Answer {
  id: string
  question_id: string
  text: string
  is_correct: boolean
  explanation?: string
}

export interface Category {
  id: string
  name: string
  parent_id?: string
}

export interface EducationSystem {
  id: string
  name: string
  country?: string
}

export interface ValidationResult {
  questionIndex: number;
  errors: Array<{
    message: string;
    category: string;
  }>;
  warnings: Array<{
    message: string;
    category: string;
  }>;
  info: Array<{
    message: string;
    category: string;
  }>;
  all: Array<{
    passed: boolean;
    category: 'content' | 'structure' | 'pedagogy' | 'accessibility';
    message: string;
  }>;
}

export interface ValidationSummary {
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  categories: {
    content: number;
    structure: number;
    pedagogy: number;
    accessibility: number;
  };
}

export interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category_id: string
  is_published: boolean
  created_at: string
  updated_at: string
  estimated_hours: number
  rating?: number
  total_enrolled?: number
  category?: {
    name: string
  }
  stages?: {
    count: number
  }[]
  user_progress?: {
    completed_stages: number
    last_accessed: string
  }[]
}

export interface UserStats {
  user_id: string
  total_completed_paths: number
  average_score: number
  study_streak: number
  total_study_time: number
  preferred_categories: string[]
  skill_level: number
}

export interface LearningPathStage {
  id: string
  path_id: string
  title: string
  description?: string
  order: number
  content: StageContent[]
}

export interface StageContent {
  id: string
  stage_id: string
  type: 'quiz' | 'video' | 'text' | 'resource'
  content_id: string
  order: number
}

export interface UserProgress {
  user_id: string
  path_id?: string
  stage_id?: string
  quiz_id?: string
  progress: number
  completed_at?: string
  score?: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  type: 'badge' | 'title' | 'xp'
  value: number | string
  unlocked_at?: string
}

export interface UserProfile {
  id: string
  email: string
  username?: string
  avatar_url?: string
  xp: number
  level: number
  achievements: Achievement[]
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  score: number
  completed_at: string
  time_spent: number
  answers: AttemptAnswer[]
}

export interface AttemptAnswer {
  question_id: string
  answer_id: string
  is_correct: boolean
  time_spent?: number
}

export interface UploadResult {
  success: boolean
  message: string
  data?: Record<string, unknown>
  errors?: string[]
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
}
