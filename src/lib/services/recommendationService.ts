import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { LearningPath } from '@/types/learning-path'

export interface RecommendationCriteria {
  userId: string
  currentPathId?: string
  difficulty?: string
  category?: string
  limit?: number
}

export interface RecommendedPath extends LearningPath {
  matchScore: number
  reason: string
}

export const recommendationService = {
  async getRecommendations(criteria: RecommendationCriteria): Promise<RecommendedPath[]> {
    const supabase = createClientComponentClient<Database>()
    const limit = criteria.limit || 5

    try {
      // Get user's completed paths and preferences
      const { data: userProgress } = await supabase
        .from('learning_path_progress')
        .select('path_id, progress')
        .eq('user_id', criteria.userId)
        .gte('progress', 80) // Consider paths with >80% progress as completed

      const completedPathIds = userProgress?.map(p => p.path_id) || []

      // Get available paths excluding completed ones
      let query = supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(name)
        `)
        .not('id', 'in', completedPathIds)

      if (criteria.currentPathId) {
        query = query.neq('id', criteria.currentPathId)
      }

      if (criteria.difficulty) {
        query = query.eq('difficulty', criteria.difficulty)
      }

      if (criteria.category) {
        query = query.eq('category', criteria.category)
      }

      const { data: paths, error } = await query.limit(limit)

      if (error) throw error

      // Transform and add recommendation context
      return (paths || []).map(path => ({
        ...path,
        matchScore: calculateMatchScore(path),
        reason: generateRecommendationReason(path)
      }))
    } catch (error) {
      console.error('Error getting recommendations:', error)
      throw error
    }
  }
}

function calculateMatchScore(path: LearningPath): number {
  // Implement scoring logic based on user preferences and path attributes
  let score = 50 // Start with a base score
  
  if (path.category?.name) {
    score += 20 // Add points for having a category
  }
  
  return Math.min(100, score)
}

function generateRecommendationReason(path: LearningPath): string {
  // Generate a human-readable reason for the recommendation
  return `Based on your interest in ${path.category?.name || 'this subject'}`
}