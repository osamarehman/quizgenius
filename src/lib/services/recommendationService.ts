import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { learningPathService } from './learningPathService'

interface RecommendationCriteria {
  difficulty?: string
  preferredTopics?: string[]
  studyTime?: number // minutes per day
  learningStyle?: 'visual' | 'practical' | 'theoretical'
}

class RecommendationService {
  private supabase = createClientComponentClient()

  async getPersonalizedRecommendations(userId: string, criteria?: RecommendationCriteria) {
    try {
      // Get user's study history and preferences
      const { data: userHistory } = await this.supabase
        .from('user_path_progress')
        .select(`
          path_id,
          status,
          completed_at,
          learning_path:learning_paths(
            category_id,
            difficulty
          )
        `)
        .eq('user_id', userId)

      // Get user's strengths and preferences
      const completedPaths = userHistory?.filter(h => h.status === 'completed') || []
      const preferredCategories = completedPaths
        .map(p => p.learning_path.category_id)
        .filter((v, i, a) => a.indexOf(v) === i)

      // Build recommendation query
      let query = this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(name),
          stages:path_stages(count),
          rating,
          user_progress:user_path_progress(
            completed_stages,
            last_accessed
          )
        `)
        .eq('is_published', true)
        .not('id', 'in', `(${completedPaths.map(p => p.path_id).join(',')})`)

      if (criteria?.difficulty) {
        query = query.eq('difficulty', criteria.difficulty)
      }

      if (preferredCategories.length > 0) {
        query = query.in('category_id', preferredCategories)
      }

      const { data: recommendations } = await query
        .order('rating', { ascending: false })
        .limit(5)

      return recommendations || []
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return []
    }
  }

  async getNextBestPath(userId: string) {
    try {
      // Get user's current skill level and progress
      const { data: userStats } = await this.supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Get appropriate difficulty level
      const recommendedDifficulty = this.calculateRecommendedDifficulty(userStats)

      // Get paths matching the recommended difficulty
      const { data: paths } = await this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(name),
          prerequisites:path_prerequisites(
            required_path_id
          )
        `)
        .eq('difficulty', recommendedDifficulty)
        .eq('is_published', true)

      // Filter paths based on completed prerequisites
      const eligiblePaths = await this.filterEligiblePaths(paths || [], userId)

      return eligiblePaths[0] || null
    } catch (error) {
      console.error('Error getting next best path:', error)
      return null
    }
  }

  private calculateRecommendedDifficulty(userStats: any) {
    const averageScore = userStats?.average_score || 0
    const completedPaths = userStats?.completed_paths || 0

    if (averageScore > 85 && completedPaths > 5) {
      return 'advanced'
    } else if (averageScore > 70 && completedPaths > 2) {
      return 'intermediate'
    }
    return 'beginner'
  }

  private async filterEligiblePaths(paths: any[], userId: string) {
    // Get user's completed paths
    const { data: completedPaths } = await this.supabase
      .from('user_path_progress')
      .select('path_id')
      .eq('user_id', userId)
      .eq('status', 'completed')

    const completedPathIds = new Set(completedPaths?.map(p => p.path_id) || [])

    // Filter paths where all prerequisites are completed
    return paths.filter(path => {
      const prerequisites = path.prerequisites.map((p: any) => p.required_path_id)
      return prerequisites.every(preReqId => completedPathIds.has(preReqId))
    })
  }
}

export const recommendationService = new RecommendationService() 