import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface LearningPath {
  id: string
  title: string
  description: string
  category: {
    id: string
    name: string
  }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
  totalStages: number
  enrolledCount: number
  rating?: number
  userProgress?: {
    completedStages: number
    lastAccessed?: string
  }
}

export interface PathStage {
  id: string
  title: string
  description: string
  type: string
  status: 'locked' | 'available' | 'completed'
  progress: number
  requirements: Array<{ type: string; value: string }>
  rewards: Array<{ type: string; value: string }>
}

interface PathStageDetails {
  id: string
  title: string
  description: string
  type: 'video' | 'reading' | 'quiz' | 'challenge' | 'practice'
  orderNumber: number
  duration: number
  contentUrl: string | null
  requirements: Array<{ type: string; value: number }>
  rewards: Array<{ type: string; value: number }>
  status: 'locked' | 'available' | 'completed'
  progress: number
}

interface PathProgress {
  completedStages: number
  totalStages: number
  currentStage?: PathStage
  nextStage?: PathStage
  lastAccessed?: string
  totalXP: number
}

class LearningPathService {
  private supabase = createClientComponentClient()

  async getAvailablePaths(): Promise<LearningPath[]> {
    try {
      console.log('Fetching available paths...')
      
      // Get current user's profile
      const { data: { session } } = await this.supabase.auth.getSession()
      let enrolledPaths: string[] = []

      if (session?.user?.id) {
        // Get enrolled paths from profile
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('enrolled_paths')
          .eq('id', session.user.id)
          .single()

        enrolledPaths = profile?.enrolled_paths || []
        console.log('User enrolled paths:', enrolledPaths)
      }

      // Get all published paths with their relationships
      const { data: paths, error } = await this.supabase
        .from('learning_paths')
        .select(`
          id,
          title,
          description,
          difficulty,
          estimated_hours,
          enrolled_count,
          rating,
          category:categories (
            id,
            name
          ),
          stages:path_stages (count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching paths:', error)
        throw error
      }

      console.log('Fetched paths:', paths)

      // Transform the paths data
      return paths.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description,
        category: {
          id: path.category?.id,
          name: path.category?.name || 'Uncategorized'
        },
        difficulty: path.difficulty,
        estimatedHours: path.estimated_hours,
        totalStages: path.stages?.[0]?.count || 0,
        enrolledCount: path.enrolled_count || 0,
        rating: path.rating,
        // Add user progress if enrolled
        userProgress: enrolledPaths.includes(path.id) ? {
          completedStages: 0, // You can fetch actual progress if needed
          lastAccessed: null
        } : undefined
      }))
    } catch (error) {
      console.error('Error in getAvailablePaths:', error)
      return []
    }
  }

  private getMockPaths(): LearningPath[] {
    return [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript',
        category: { id: '1', name: 'JavaScript' },
        difficulty: 'beginner',
        estimatedHours: 20,
        totalStages: 10,
        enrolledCount: 150,
        rating: 4.5
      },
      // ... other mock paths
    ]
  }

  async enrollInPath(userId: string, pathId: string): Promise<void> {
    try {
      console.log('Starting enrollment process...', { userId, pathId })

      // Check if already enrolled using profiles
      const isAlreadyEnrolled = await this.isEnrolled(userId, pathId)
      if (isAlreadyEnrolled) {
        console.log('User already enrolled')
        return
      }

      // Get user's profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('enrolled_paths')
        .eq('id', userId)
        .single()

      if (profileError) {
        throw new Error('Failed to fetch user profile')
      }

      // Update enrolled_paths in profile
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({
          enrolled_paths: [...(profile?.enrolled_paths || []), pathId]
        })
        .eq('id', userId)

      if (updateError) {
        throw new Error('Failed to update profile')
      }

      // Get path stages
      const { data: stages, error: stagesError } = await this.supabase
        .from('path_stages')
        .select('id, order_number')
        .eq('path_id', pathId)
        .order('order_number')

      if (stagesError) {
        throw new Error('Failed to fetch path stages')
      }

      // Create initial progress entries
      const now = new Date().toISOString()
      for (const stage of stages || []) {
        await this.supabase
          .from('user_path_progress')
          .insert({
            user_id: userId,
            path_id: pathId,
            stage_id: stage.id,
            status: stage.order_number === 1 ? 'available' : 'locked',
            progress: 0,
            started_at: stage.order_number === 1 ? now : null,
            last_accessed: stage.order_number === 1 ? now : null
          })
      }

      // Increment enrolled count
      await this.supabase.rpc('increment_enrolled_count', { p_path_id: pathId })

      console.log('Successfully enrolled user')
    } catch (error) {
      console.error('Error in enrollInPath:', error)
      throw error
    }
  }

  async getEnrolledPaths(userId: string): Promise<LearningPath[]> {
    try {
      // Get enrolled paths from profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('enrolled_paths')
        .eq('id', userId)
        .single()

      if (profileError) {
        throw new Error('Failed to fetch enrolled paths')
      }

      if (!profile?.enrolled_paths?.length) {
        return []
      }

      // Get path details for enrolled paths
      const { data: paths, error: pathsError } = await this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(
            id,
            name
          ),
          stages:path_stages(count),
          user_progress:user_path_progress(
            status,
            progress,
            last_accessed
          )
        `)
        .in('id', profile.enrolled_paths)

      if (pathsError) {
        throw new Error('Failed to fetch path details')
      }

      return this.transformPaths(paths || [])
    } catch (error) {
      console.error('Error getting enrolled paths:', error)
      return []
    }
  }

  // Add method to get user's enrolled paths from profile
  async getUserEnrolledPaths(userId: string): Promise<string[]> {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('enrolled_paths')
        .eq('id', userId)
        .single()

      if (error) throw error
      return profile?.enrolled_paths || []
    } catch (error) {
      console.error('Error getting enrolled paths:', error)
      return []
    }
  }

  // Add method to check if user is enrolled in a path
  async isUserEnrolled(userId: string, pathId: string): Promise<boolean> {
    try {
      const enrolledPaths = await this.getUserEnrolledPaths(userId)
      return enrolledPaths.includes(pathId)
    } catch (error) {
      console.error('Error checking enrollment:', error)
      return false
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  async getPathDetails(pathId: string): Promise<{
    path: LearningPath;
    stages: PathStage[];
    userProgress: any;
  }> {
    try {
      console.log('Fetching path details:', pathId)

      // Get current user's profile
      const { data: { session } } = await this.supabase.auth.getSession()
      let userProfile = null

      if (session?.user?.id) {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        userProfile = profile
      }

      // Get path details with all relationships
      const { data: path, error: pathError } = await this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(
            id,
            name
          ),
          stages:path_stages(
            id,
            title,
            description,
            type,
            order_number,
            duration,
            content_url,
            requirements,
            rewards
          ),
          user_progress:user_path_progress(
            status,
            progress,
            last_accessed,
            completed_at,
            xp_earned
          )
        `)
        .eq('id', pathId)
        .single()

      if (pathError) {
        console.error('Error fetching path:', pathError)
        throw pathError
      }

      // Check if user is enrolled using profiles
      const isEnrolled = userProfile?.enrolled_paths?.includes(pathId)

      return {
        path: {
          id: path.id,
          title: path.title,
          description: path.description,
          category: {
            id: path.category?.id,
            name: path.category?.name || 'Uncategorized'
          },
          difficulty: path.difficulty,
          estimatedHours: path.estimated_hours,
          totalStages: path.stages?.length || 0,
          enrolledCount: path.enrolled_count || 0,
          rating: path.rating,
          userProgress: isEnrolled ? {
            completedStages: path.user_progress?.filter(p => p.status === 'completed').length || 0,
            lastAccessed: path.user_progress?.[0]?.last_accessed
          } : undefined
        },
        stages: path.stages || [],
        userProgress: isEnrolled ? path.user_progress : null
      }
    } catch (error) {
      console.error('Error in getPathDetails:', error)
      throw error
    }
  }

  async getUserProgress(userId: string, pathId: string): Promise<{
    currentLevel: number
    totalXP: number
    completedStages: number
    stages: PathStage[]
  }> {
    try {
      const { data: progressData, error: progressError } = await this.supabase
        .from('user_path_progress')
        .select(`
          *,
          stage:path_stages(*)
        `)
        .eq('user_id', userId)
        .eq('path_id', pathId)
        .order('stage.order_number', { ascending: true })

      if (progressError) throw progressError

      const totalXP = progressData.reduce((sum, p) => sum + (p.xp_earned || 0), 0)
      const completedStages = progressData.filter(p => p.status === 'completed').length

      return {
        currentLevel: Math.floor(totalXP / 1000) + 1,
        totalXP,
        completedStages,
        stages: progressData.map(p => ({
          ...p.stage,
          status: p.status,
          progress: p.progress,
          unlocked_at: p.started_at,
          completed_at: p.completed_at
        }))
      }
    } catch (error) {
      console.error('Error fetching user progress:', error)
      throw error
    }
  }

  async updateStageProgress(
    userId: string,
    pathId: string,
    stageId: string,
    progress: number,
    xpEarned: number = 0,
    status: 'in_progress' | 'completed' = progress === 100 ? 'completed' : 'in_progress'
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_path_progress')
        .upsert({
          user_id: userId,
          path_id: pathId,
          stage_id: stageId,
          progress,
          xp_earned: xpEarned,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          last_accessed: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating stage progress:', error)
      throw error
    }
  }

  async ratePath(
    userId: string,
    pathId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('path_ratings')
        .upsert({
          user_id: userId,
          path_id: pathId,
          rating,
          comment
        })

      if (error) throw error
    } catch (error) {
      console.error('Error rating path:', error)
      throw error
    }
  }

  async getRecommendedPaths(userId: string): Promise<LearningPath[]> {
    try {
      const { data: userProgress } = await this.supabase
        .from('user_path_progress')
        .select('path_id')
        .eq('user_id', userId)

      const completedPathIds = userProgress?.map(p => p.path_id) || []

      const { data: paths } = await this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(name),
          stages:path_stages(count),
          rating:path_ratings(avg)
        `)
        .eq('is_published', true)
        .not('id', 'in', `(${completedPathIds.join(',')})`)
        .order('rating', { ascending: false })
        .limit(5)

      return this.transformPaths(paths || [])
    } catch (error) {
      console.error('Error fetching recommended paths:', error)
      return []
    }
  }

  async getPopularPaths(): Promise<LearningPath[]> {
    try {
      const { data: paths } = await this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(name),
          stages:path_stages(count),
          enrolled_users:user_path_progress(count)
        `)
        .eq('is_published', true)
        .order('enrolled_count', { ascending: false })
        .limit(10)

      return this.transformPaths(paths || [])
    } catch (error) {
      console.error('Error fetching popular paths:', error)
      return []
    }
  }

  async searchPaths(query: string, filters?: {
    difficulty?: string
    category?: string
    duration?: 'short' | 'medium' | 'long'
  }): Promise<LearningPath[]> {
    try {
      let queryBuilder = this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(name),
          stages:path_stages(count)
        `)
        .eq('is_published', true)
        .ilike('title', `%${query}%`)

      if (filters?.difficulty) {
        queryBuilder = queryBuilder.eq('difficulty', filters.difficulty)
      }

      if (filters?.category) {
        queryBuilder = queryBuilder.eq('category.name', filters.category)
      }

      if (filters?.duration) {
        switch (filters.duration) {
          case 'short':
            queryBuilder = queryBuilder.lte('estimated_hours', 5)
            break
          case 'medium':
            queryBuilder = queryBuilder.and(`estimated_hours.gt.5,estimated_hours.lte.20`)
            break
          case 'long':
            queryBuilder = queryBuilder.gt('estimated_hours', 20)
            break
        }
      }

      const { data: paths } = await queryBuilder

      return this.transformPaths(paths || [])
    } catch (error) {
      console.error('Error searching paths:', error)
      return []
    }
  }

  async getPathStages(pathId: string, userId: string): Promise<PathStage[]> {
    try {
      const { data: stages, error } = await this.supabase
        .from('path_stages')
        .select(`
          *,
          user_progress:user_path_progress(
            status,
            progress,
            completed_at
          )
        `)
        .eq('path_id', pathId)
        .order('order_number')

      if (error) throw error

      return stages.map(stage => ({
        id: stage.id,
        title: stage.title,
        description: stage.description,
        type: stage.type,
        orderNumber: stage.order_number,
        duration: stage.duration,
        contentUrl: stage.content_url,
        requirements: stage.requirements,
        rewards: stage.rewards,
        status: stage.user_progress?.[0]?.status || 'locked',
        progress: stage.user_progress?.[0]?.progress || 0
      }))
    } catch (error) {
      console.error('Error fetching path stages:', error)
      return []
    }
  }

  async markContentComplete(contentId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_path_progress')
        .upsert({
          user_id: userId,
          stage_id: contentId,
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error marking content complete:', error)
      throw error
    }
  }

  private transformPaths(paths: any[]): LearningPath[] {
    return paths.map(path => ({
      id: path.id,
      title: path.title,
      description: path.description,
      category: {
        name: path.category?.[0]?.name || 'Uncategorized'
      },
      difficulty: path.difficulty,
      estimatedHours: path.estimated_hours,
      totalStages: path.stages?.[0]?.count || 0,
      enrolledCount: path.enrolled_count || 0,
      rating: path.rating,
      userProgress: path.user_progress?.[0] || null
    }))
  }

  async getRecommendedPathsForUser(userId: string): Promise<LearningPath[]> {
    try {
      // Get user's completed paths and preferred categories
      const { data: userProgress } = await this.supabase
        .from('user_path_progress')
        .select(`
          path_id,
          learning_path:learning_paths(
            category_id
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')

      const completedPathIds = userProgress?.map(p => p.path_id) || []
      const categoryIds = userProgress?.map(p => p.learning_path.category_id).filter(Boolean) || []

      // Get paths in similar categories that user hasn't completed
      const { data: recommendedPaths } = await this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(name),
          stages:path_stages(count),
          rating
        `)
        .eq('is_published', true)
        .in('category_id', categoryIds)
        .not('id', 'in', `(${completedPathIds.join(',')})`)
        .order('rating', { ascending: false })
        .limit(5)

      return this.transformPaths(recommendedPaths || [])
    } catch (error) {
      console.error('Error getting recommended paths:', error)
      return []
    }
  }

  async getPathProgress(userId: string, pathId: string): Promise<PathProgress> {
    try {
      const { data: progress } = await this.supabase
        .from('user_path_progress')
        .select(`
          *,
          stage:path_stages(*)
        `)
        .eq('user_id', userId)
        .eq('path_id', pathId)
        .order('stage.order_number')

      const completedStages = progress?.filter(p => p.status === 'completed').length || 0
      const totalStages = progress?.length || 0
      const currentStage = progress?.find(p => p.status === 'in_progress')?.stage
      const nextStage = progress?.find(p => p.status === 'locked')?.stage
      const lastAccessed = progress?.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0]?.updated_at

      const totalXP = progress?.reduce((sum, p) => sum + (p.xp_earned || 0), 0) || 0

      return {
        completedStages,
        totalStages,
        currentStage,
        nextStage,
        lastAccessed,
        totalXP
      }
    } catch (error) {
      console.error('Error getting path progress:', error)
      throw error
    }
  }

  async getPathStats(pathId: string): Promise<{
    enrolledCount: number
    averageRating: number
    completionRate: number
    averageTimeToComplete: number
  }> {
    try {
      const { data: stats } = await this.supabase
        .rpc('get_path_stats', { path_id: pathId })

      return {
        enrolledCount: stats?.enrolled_count || 0,
        averageRating: stats?.average_rating || 0,
        completionRate: stats?.completion_rate || 0,
        averageTimeToComplete: stats?.average_time_to_complete || 0
      }
    } catch (error) {
      console.error('Error getting path stats:', error)
      throw error
    }
  }

  async getPathAnalytics(pathId: string): Promise<{
    dailyEnrollments: { date: string; count: number }[]
    completionTrends: { date: string; count: number }[]
    averageTimePerStage: { stageId: string; avgTime: number }[]
    userFeedback: { rating: number; count: number }[]
  }> {
    try {
      const { data: analytics } = await this.supabase
        .rpc('get_path_analytics', { path_id: pathId })

      return analytics || {
        dailyEnrollments: [],
        completionTrends: [],
        averageTimePerStage: [],
        userFeedback: []
      }
    } catch (error) {
      console.error('Error getting path analytics:', error)
      throw error
    }
  }

  async getLeaderboard(pathId: string, timeRange: 'week' | 'month' | 'all' = 'week'): Promise<{
    userId: string
    userName: string
    score: number
    completedStages: number
    totalTime: number
  }[]> {
    try {
      const { data: leaderboard } = await this.supabase
        .rpc('get_path_leaderboard', { 
          path_id: pathId,
          time_range: timeRange
        })

      return leaderboard || []
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      throw error
    }
  }

  async getUserPathInsights(userId: string, pathId: string): Promise<{
    strengths: string[]
    weaknesses: string[]
    recommendedStages: string[]
    estimatedCompletion: string
  }> {
    try {
      const { data: insights } = await this.supabase
        .rpc('get_user_path_insights', {
          user_id: userId,
          path_id: pathId
        })

      return insights || {
        strengths: [],
        weaknesses: [],
        recommendedStages: [],
        estimatedCompletion: ''
      }
    } catch (error) {
      console.error('Error getting user insights:', error)
      throw error
    }
  }

  async generateStudyPlan(userId: string, pathId: string, preferences: {
    availableHours: number
    daysPerWeek: number
    preferredTime: 'morning' | 'afternoon' | 'evening'
  }): Promise<{
    schedule: {
      day: string
      stages: string[]
      duration: number
    }[]
    estimatedCompletion: string
    weeklyGoals: string[]
  }> {
    try {
      const { data: plan } = await this.supabase
        .rpc('generate_study_plan', {
          user_id: userId,
          path_id: pathId,
          preferences: preferences
        })

      return plan || {
        schedule: [],
        estimatedCompletion: '',
        weeklyGoals: []
      }
    } catch (error) {
      console.error('Error generating study plan:', error)
      throw error
    }
  }

  async getPathWithStages(pathId: string, userId: string): Promise<{
    path: LearningPath
    stages: PathStageDetails[]
    userProgress: {
      completedStages: number
      totalXP: number
      currentLevel: number
      lastAccessed?: string
    } | null
  }> {
    try {
      // Get path details with stages
      const { data: path, error: pathError } = await this.supabase
        .from('learning_paths')
        .select(`
          *,
          category:categories(name),
          stages:path_stages(
            id,
            title,
            description,
            type,
            order_number,
            duration,
            content_url,
            requirements,
            rewards
          ),
          user_progress:user_path_progress(
            stage_id,
            status,
            progress,
            xp_earned,
            last_accessed
          )
        `)
        .eq('id', pathId)
        .single()

      if (pathError) throw pathError

      // Transform stages data
      const stages = path.stages.map((stage: any) => ({
        id: stage.id,
        title: stage.title,
        description: stage.description,
        type: stage.type,
        orderNumber: stage.order_number,
        duration: stage.duration,
        contentUrl: stage.content_url,
        requirements: stage.requirements,
        rewards: stage.rewards,
        status: this.calculateStageStatus(stage, path.user_progress),
        progress: this.calculateStageProgress(stage, path.user_progress)
      }))

      // Calculate user progress
      const userProgress = path.user_progress?.length ? {
        completedStages: path.user_progress.filter((p: any) => p.status === 'completed').length,
        totalXP: path.user_progress.reduce((sum: number, p: any) => sum + (p.xp_earned || 0), 0),
        currentLevel: Math.floor(path.user_progress.reduce((sum: number, p: any) => sum + (p.xp_earned || 0), 0) / 1000) + 1,
        lastAccessed: path.user_progress.sort((a: any, b: any) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0]?.updated_at
      } : null

      return {
        path: this.transformPath(path),
        stages,
        userProgress
      }
    } catch (error) {
      console.error('Error fetching path with stages:', error)
      throw error
    }
  }

  private calculateStageStatus(
    stage: any,
    userProgress: any[]
  ): 'locked' | 'available' | 'completed' {
    const stageProgress = userProgress?.find((p: any) => p.stage_id === stage.id)
    if (!stageProgress) return 'locked'
    return stageProgress.status
  }

  private calculateStageProgress(stage: any, userProgress: any[]): number {
    const stageProgress = userProgress?.find((p: any) => p.stage_id === stage.id)
    return stageProgress?.progress || 0
  }

  async createLearningPath(data: {
    title: string
    description: string
    categoryId: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedHours: number
  }): Promise<string> {
    try {
      const { data: path, error } = await this.supabase
        .from('learning_paths')
        .insert({
          title: data.title,
          description: data.description,
          category_id: data.categoryId,
          difficulty: data.difficulty,
          estimated_hours: data.estimatedHours,
          is_published: true
        })
        .select('id')
        .single()

      if (error) throw error
      return path.id
    } catch (error) {
      console.error('Error creating learning path:', error)
      throw error
    }
  }

  async getCategories(): Promise<{ id: string; name: string }[]> {
    try {
      const { data: categories, error } = await this.supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) throw error
      return categories
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  async isEnrolled(userId: string, pathId: string): Promise<boolean> {
    try {
      // Check enrollment from profiles
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('enrolled_paths')
        .eq('id', userId)
        .single()

      return profile?.enrolled_paths?.includes(pathId) || false
    } catch (error) {
      console.error('Error checking enrollment:', error)
      return false
    }
  }
}

export const learningPathService = new LearningPathService() 