import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface PathStage {
  id: string;
  title: string;
  description: string;
  type: string;
  order_number: number;
  duration: number;
  content_url: string;
  requirements: string[];
  rewards: {
    xp: number;
    badges?: string[];
  };
}

interface UserProgressData extends DatabaseRecord {
  status: 'in_progress' | 'completed';
  xp_earned: number;
  progress: number;
  started_at: string;
  completed_at: string | null;
  stage: StageData;
}

interface PathAnalytics {
  totalUsers: number;
  averageProgress: number;
  completionRate: number;
  averageTimeSpent: number;
}

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: {
    notifications?: boolean;
    theme?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

interface PathProgress {
  userId: string;
  pathId: string;
  completedContent: string[];
  currentContent: string;
  score: number;
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
}

interface LeaderboardEntry {
  userId: string;
  score: number;
  completedStages: number;
  lastActive: string;
}

interface LeaderboardData extends DatabaseRecord {
  user_id: string;
  score: number;
  completed_stages: number;
  total_time: string;
  user?: {
    name: string;
  };
}

interface PathInsight {
  timeSpent: number;
  completedStages: number;
  averageScore: number;
  lastActivity: string;
  strengths: string[];
  weaknesses: string[];
}

interface StudyPlan {
  recommendedStages: string[];
  estimatedTime: number;
  focusAreas: string[];
  schedule: {
    date: string;
    content: string[];
  }[];
}

interface DatabaseRecord {
  id: string;
  created_at: string;
  [key: string]: unknown;
}

interface StageData extends DatabaseRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  order_number: number;
  duration: number;
  content_url: string;
  requirements: string[];
  rewards: {
    xp: number;
    badges?: string[];
  };
  status?: string;
  progress?: number;
  unlocked_at?: string;
  completed_at?: string | null;
}

interface PathData extends DatabaseRecord {
  id: string;
  title: string;
  description: string;
  stages: StageData[];
  category: {
    id: string;
    name: string;
  };
  difficulty: string;
  estimated_hours: number;
  enrolled_count: number;
  rating: number;
  user_progress?: Array<{
    status: string;
    last_accessed: string;
  }>;
}

interface PathInsightData extends DatabaseRecord {
  time_spent: number;
  completed_stages: number;
  average_score: number;
  last_activity: string;
  strengths: string[];
  weaknesses: string[];
}

interface StudyPlanData extends DatabaseRecord {
  recommended_stages: string[];
  estimated_time: number;
  focus_areas: string[];
  schedule: {
    date: string;
    content: string[];
  }[];
}

interface UserPathProgress {
  path_id: string;
  status: 'in_progress' | 'completed';
  progress: number;
  last_accessed: string;
}

interface CategoryData {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface StageProgressData {
  id: string;
  title: string;
  description: string;
  type: string;
  order_number: number;
  duration: number;
  content_url: string;
  requirements: string[];
  rewards: {
    xp: number;
    badges?: string[];
  };
  user_progress?: Array<{
    status: string;
    progress: number;
  }>;
}

interface UserPathProgressWithLearningPath extends UserPathProgress {
  learning_path: {
    category_id: string;
  };
  xp_earned: number;
}

interface ExtendedUserProgress extends UserPathProgress {
  xp_earned: number;
}

export class LearningPathService {
  private supabase = createClientComponentClient<Database>()

  private handleError(error: Error): DatabaseError {
    return {
      name: error.name,
      message: error.message,
      code: 'UNKNOWN_ERROR',
      stack: error.stack
    }
  }

  async getAvailablePaths(
    userId: string,
    filter?: PathFilter,
    sort?: PathSortOptions,
    pagination?: PathPaginationOptions
  ): Promise<DatabaseResponse<LearningPath[]>> {
    try {
      let query = this.supabase
        .from('learning_paths')
        .select('*')

      if (filter) {
        if (filter.subject?.length) {
          query = query.in('subject', filter.subject)
        }
        if (filter.difficulty?.length) {
          query = query.in('difficulty', filter.difficulty)
        }
        if (filter.type?.length) {
          query = query.in('type', filter.type)
        }
        if (filter.searchTerm) {
          query = query.ilike('title', `%${filter.searchTerm}%`)
        }
      }

      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' })
      }

      if (pagination) {
        const { page, limit } = pagination
        query = query
          .range((page - 1) * limit, page * limit - 1)
          .limit(limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error getting available paths:', error)
      return { 
        data: null,
        error: this.handleError(error instanceof Error ? error : new Error('Unknown error'))
      }
    }
  }

  async enrollInPath(userId: string, pathId: string): Promise<void> {
    try {
      const isAlreadyEnrolled = await this.isEnrolled(userId, pathId);
      if (isAlreadyEnrolled) {
        console.log('User already enrolled');
        return;
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('enrolled_paths')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch user profile');
      }

      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({
          enrolled_paths: [...(profile?.enrolled_paths || []), pathId],
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update profile');
      }

      await this.initializeStageProgress(userId, pathId);
      await this.incrementEnrollmentCount(pathId);
    } catch (error) {
      console.error('Error in enrollInPath:', error);
      throw error;
    }
  }

  private async initializeStageProgress(userId: string, pathId: string): Promise<void> {
    const { data: stages, error: stagesError } = await this.supabase
      .from('path_stages')
      .select('id, order_number')
      .eq('path_id', pathId)
      .order('order_number');

    if (stagesError) {
      throw new Error('Failed to fetch path stages');
    }

    const now = new Date().toISOString();
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
          last_accessed: stage.order_number === 1 ? now : null,
        });
    }
  }

  private async incrementEnrollmentCount(pathId: string): Promise<void> {
    await this.supabase.rpc('increment_enrolled_count', { p_path_id: pathId });
  }

  async isEnrolled(userId: string, pathId: string): Promise<boolean> {
    try {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('enrolled_paths')
        .eq('id', userId)
        .single();

      return profile?.enrolled_paths?.includes(pathId) || false;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }

  async getEnrolledPaths(userId: string): Promise<LearningPath[]> {
    try {
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('enrolled_paths')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch enrolled paths');
      }

      if (!profile?.enrolled_paths?.length) {
        return [];
      }

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
            last_accessed,
            completed_at,
            xp_earned
          )
        `)
        .in('id', profile.enrolled_paths);

      if (pathsError) {
        throw new Error('Failed to fetch path details');
      }

      return paths || [];
    } catch (error) {
      console.error('Error getting enrolled paths:', error);
      return [];
    }
  }

  async getUserEnrolledPaths(userId: string): Promise<string[]> {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('enrolled_paths')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return profile?.enrolled_paths || [];
    } catch (error) {
      console.error('Error getting enrolled paths:', error);
      return [];
    }
  }

  async isUserEnrolled(userId: string, pathId: string): Promise<boolean> {
    try {
      const enrolledPaths = await this.getUserEnrolledPaths(userId);
      return enrolledPaths.includes(pathId);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }

  async getPathDetails(pathId: string): Promise<{
    path: LearningPath;
    stages: PathStage[];
    userProgress: UserProgressData[] | null;
  }> {
    try {
      console.log('Fetching path details:', pathId);

      const { data: { session } } = await this.supabase.auth.getSession();
      let userProfile: UserProfile | null = null;

      if (session?.user?.id) {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        userProfile = profile;
      }

      const { data: path, error: pathError } = await this.supabase
        .from('learning_paths')
        .select(`
          *,
          stages:path_stages(*),
          category:categories(*),
          user_progress:user_path_progress(*)
        `)
        .eq('id', pathId)
        .single();

      if (pathError) {
        console.error('Error fetching path:', pathError);
        throw pathError;
      }

      const pathData = path as PathData;
      const isEnrolled = userProfile?.enrolled_paths?.includes(pathId);

      return {
        path: {
          id: pathData.id,
          title: pathData.title,
          description: pathData.description,
          category: {
            id: pathData.category?.id,
            name: pathData.category?.name || 'Uncategorized',
          },
          difficulty: pathData.difficulty,
          estimatedHours: pathData.estimated_hours,
          totalStages: pathData.stages?.length || 0,
          enrolledCount: pathData.enrolled_count || 0,
          rating: pathData.rating,
          userProgress: isEnrolled
            ? {
                completedStages: pathData.user_progress?.filter(
                  (p) => p.status === 'completed'
                ).length || 0,
                lastAccessed: pathData.user_progress?.[0]?.last_accessed,
              }
            : undefined,
        },
        stages: pathData.stages || [],
        userProgress: isEnrolled ? pathData.user_progress : null,
      };
    } catch (error) {
      console.error('Error in getPathDetails:', error);
      throw error;
    }
  }

  async getUserProgress(userId: string, pathId: string): Promise<{
    currentLevel: number;
    totalXP: number;
    completedStages: number;
    stages: PathStage[];
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
        .order('stage.order_number', { ascending: true });

      if (progressError) throw progressError;

      const totalXP = progressData.reduce(
        (sum: number, p: UserProgressData) => sum + (p.xp_earned || 0),
        0
      );
      const completedStages = progressData.filter(
        (p: UserProgressData) => p.status === 'completed'
      ).length;

      return {
        currentLevel: Math.floor(totalXP / 1000) + 1,
        totalXP,
        completedStages,
        stages: progressData.map((p: UserProgressData) => ({
          ...p.stage,
          status: p.status,
          progress: p.progress,
          unlocked_at: p.started_at,
          completed_at: p.completed_at,
        })),
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
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
          last_accessed: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating stage progress:', error);
      throw error;
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
          comment,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error rating path:', error);
      throw error;
    }
  }

  async getRecommendedPaths(currentUser: string): Promise<LearningPath[]> {
    try {
      const { data: userProgress } = await this.supabase
        .from('user_path_progress')
        .select('path_id')
        .eq('user_id', currentUser);

      const completedPathIds = userProgress?.map((p: UserPathProgress) => p.path_id) || [];

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
        .limit(5);

      return paths || [];
    } catch (error) {
      console.error('Error fetching recommended paths:', error);
      return [];
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
        .limit(10);

      return paths || [];
    } catch (error) {
      console.error('Error fetching popular paths:', error);
      return [];
    }
  }

  async searchPaths(query: string, filters?: {
    difficulty?: string;
    category?: string;
    duration?: 'short' | 'medium' | 'long';
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
        .ilike('title', `%${query}%`);

      if (filters?.difficulty) {
        queryBuilder = queryBuilder.eq('difficulty', filters.difficulty);
      }

      if (filters?.category) {
        queryBuilder = queryBuilder.eq('category.name', filters.category);
      }

      if (filters?.duration) {
        switch (filters.duration) {
          case 'short':
            queryBuilder = queryBuilder.lte('estimated_hours', 5);
            break;
          case 'medium':
            queryBuilder = queryBuilder.and(`estimated_hours.gt.5,estimated_hours.lte.20`);
            break;
          case 'long':
            queryBuilder = queryBuilder.gt('estimated_hours', 20);
            break;
        }
      }

      const { data: paths } = await queryBuilder;

      return paths || [];
    } catch (error) {
      console.error('Error searching paths:', error);
      return [];
    }
  }

  async getPathStages(pathId: string): Promise<PathStage[]> {
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
        .order('order_number');

      if (error) throw error;

      return stages.map((stage: StageProgressData) => ({
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
        progress: stage.user_progress?.[0]?.progress || 0,
      }));
    } catch (error) {
      console.error('Error fetching path stages:', error);
      return [];
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
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking content complete:', error);
      throw error;
    }
  }

  async getPathProgress(pathId: string, userId: string): Promise<PathProgress[]> {
    try {
      const { data: progress, error } = await this.supabase
        .from('user_path_progress')
        .select('*')
        .eq('path_id', pathId)
        .eq('user_id', userId);

      if (error) throw error;

      return (progress || []).map((p: UserPathProgress) => ({
        status: p.status as ProgressStatus,
        progress: p.progress,
        lastUpdated: p.last_accessed,
      }));
    } catch (error) {
      console.error('Error getting path progress:', error);
      throw error;
    }
  }

  async getRecommendedPathsForUser(userId: string): Promise<LearningPath[]> {
    try {
      const { data: userProgress } = await this.supabase
        .from('user_path_progress')
        .select(`
          path_id,
          learning_path:learning_paths(
            category_id
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed');

      const completedPathIds = userProgress?.map((p: UserPathProgress) => p.path_id) || [];
      const categoryIds = userProgress?.map((p: UserPathProgressWithLearningPath) => p.learning_path.category_id).filter(Boolean) || [];

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
        .limit(5);

      return recommendedPaths || [];
    } catch (error) {
      console.error('Error getting recommended paths:', error);
      return [];
    }
  }

  async getPathStats(pathId: string): Promise<PathAnalytics> {
    try {
      const { data: stats, error } = await this.supabase
        .from('path_stats')
        .select('*')
        .eq('path_id', pathId)
        .single();

      if (error) throw error;

      return {
        enrolledCount: stats.enrolled_count || 0,
        averageRating: stats.average_rating || 0,
        completionRate: stats.completion_rate || 0,
        averageTimeToComplete: stats.average_time_to_complete || 0,
      };
    } catch (error) {
      console.error('Error fetching path stats:', error);
      return {
        enrolledCount: 0,
        averageRating: 0,
        completionRate: 0,
        averageTimeToComplete: 0,
      };
    }
  }

  async getPathAnalytics(pathId: string): Promise<PathAnalytics> {
    try {
      const { data: analytics, error } = await this.supabase
        .from('path_analytics')
        .select('*')
        .eq('path_id', pathId)
        .single();

      if (error) throw error;

      return {
        dailyEnrollments: analytics.daily_enrollments || [],
        completionTrends: analytics.completion_trends || [],
        averageTimePerStage: analytics.average_time_per_stage || [],
        userFeedback: analytics.user_feedback || [],
      };
    } catch (error) {
      console.error('Error fetching path analytics:', error);
      return {
        dailyEnrollments: [],
        completionTrends: [],
        averageTimePerStage: [],
        userFeedback: [],
      };
    }
  }

  async getLeaderboard(
    pathId: string,
    timeRange: 'week' | 'month' | 'all' = 'week'
  ): Promise<LeaderboardEntry[]> {
    try {
      const { data: leaderboard, error } = await this.supabase
        .from('path_leaderboard')
        .select(`
          user_id,
          user:profiles(name),
          score,
          completed_stages,
          total_time
        `)
        .eq('path_id', pathId)
        .eq('time_range', timeRange)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (leaderboard || []).map((entry: LeaderboardData) => ({
        userId: entry.user_id,
        score: entry.score,
        completedStages: entry.completed_stages,
        lastActive: entry.total_time,
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async getUserPathInsights(userId: string, pathId: string): Promise<PathInsight> {
    try {
      const { data: insights, error } = await this.supabase
        .from('user_path_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('path_id', pathId)
        .single();

      if (error) throw error;

      const data = insights as PathInsightData;
      return {
        timeSpent: data.time_spent || 0,
        completedStages: data.completed_stages || 0,
        averageScore: data.average_score || 0,
        lastActivity: data.last_activity || '',
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
      };
    } catch (error) {
      console.error('Error fetching user path insights:', error);
      return {
        timeSpent: 0,
        completedStages: 0,
        averageScore: 0,
        lastActivity: '',
        strengths: [],
        weaknesses: [],
      };
    }
  }

  async generateStudyPlan(
    userId: string,
    pathId: string,
  ): Promise<StudyPlan> {
    try {
      const { data: plan, error } = await this.supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('path_id', pathId)
        .single();

      if (error) throw error;

      const data = plan as StudyPlanData;
      return {
        recommendedStages: data.recommended_stages || [],
        estimatedTime: data.estimated_time || 0,
        focusAreas: data.focus_areas || [],
        schedule: data.schedule || [],
      };
    } catch (error) {
      console.error('Error generating study plan:', error);
      return {
        recommendedStages: [],
        estimatedTime: 0,
        focusAreas: [],
        schedule: [],
      };
    }
  }

  async getPathWithStages(pathId: string): Promise<{
    path: LearningPath;
    stages: PathStage[];
    userProgress: UserProgressData[] | null;
  }> {
    try {
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
        .single();

      if (pathError) throw pathError;

      const transformedStages = (path.stages || []).map((stage: StageProgressData) => ({
        id: stage.id,
        title: stage.title,
        description: stage.description,
        type: stage.type,
        orderNumber: stage.order_number,
        duration: stage.duration,
        contentUrl: stage.content_url,
        requirements: stage.requirements,
        rewards: stage.rewards,
        status: this.calculateStageStatus(stage, path.user_progress || []),
        progress: this.calculateStageProgress(stage, path.user_progress || []),
      }));

      const userProgress = path.user_progress?.length
        ? {
            completedStages: path.user_progress.filter(
              (p: ExtendedUserProgress) => p.status === 'completed'
            ).length || 0,
            totalXP: path.user_progress.reduce(
              (sum: number, p: ExtendedUserProgress) => sum + (p.xp_earned || 0),
              0
            ),
            currentLevel: Math.floor(
              path.user_progress.reduce(
                (sum: number, p: ExtendedUserProgress) => sum + (p.xp_earned || 0),
                0
              ) / 1000
            ) + 1,
            lastAccessed: path.user_progress.sort(
              (a: ExtendedUserProgress, b: ExtendedUserProgress) =>
                new Date(b.last_accessed || 0).getTime() -
                new Date(a.last_accessed || 0).getTime()
            )[0]?.last_accessed,
          }
        : null;

      return {
        path: {
          id: path.id,
          title: path.title,
          description: path.description,
          category: {
            id: path.category?.id,
            name: path.category?.name || 'Uncategorized',
          },
          difficulty: path.difficulty,
          estimatedHours: path.estimated_hours,
          totalStages: path.stages?.length || 0,
          enrolledCount: path.enrolled_count || 0,
          rating: path.rating,
          userProgress: userProgress,
        },
        stages: transformedStages,
        userProgress,
      };
    } catch (error) {
      console.error('Error in getPathWithStages:', error);
      throw error;
    }
  }

  private calculateStageStatus(stage: StageProgressData, userProgress: UserProgressData[]): 'locked' | 'available' | 'completed' {
    const stageProgress = userProgress.find((p: UserProgressData) => p.stage_id === stage.id);
    if (!stageProgress) return 'locked';
    return stageProgress.status;
  }

  private calculateStageProgress(stage: StageProgressData, userProgress: UserProgressData[]): number {
    const stageProgress = userProgress.find((p: UserProgressData) => p.stage_id === stage.id);
    return stageProgress?.progress || 0;
  }

  async createLearningPath(data: {
    title: string;
    description: string;
    difficulty: string;
    category_id: string;
    estimated_duration: number;
    prerequisites?: string[];
    learning_objectives?: string[];
    stages: Omit<PathStage, 'id'>[];
  }): Promise<string> {
    try {
      const { data: path, error } = await this.supabase
        .from('learning_paths')
        .insert({
          title: data.title,
          description: data.description,
          category_id: data.category_id,
          difficulty: data.difficulty,
          estimated_hours: data.estimated_duration,
          is_published: true,
        })
        .select('id')
        .single();

      if (error) throw error;
      return path.id;
    } catch (error) {
      console.error('Error creating learning path:', error);
      throw error;
    }
  }

  async getCategories(): Promise<CategoryData[]> {
    try {
      const { data: categories, error } = await this.supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getPathStudyPlan(pathId: string, currentUser: string): Promise<StudyPlanData> {
    try {
      const { data: plan, error } = await this.supabase
        .from('study_plans')
        .select('*')
        .eq('path_id', pathId)
        .eq('user_id', currentUser)
        .single();

      if (error) throw error;

      return {
        schedule: plan.schedule || [],
        estimatedCompletion: plan.estimated_completion || 'Unknown',
        weeklyGoals: plan.weekly_goals || [],
      };
    } catch (error) {
      console.error('Error getting study plan:', error);
      return {
        schedule: [],
        estimatedCompletion: 'Unknown',
        weeklyGoals: [],
      };
    }
  }

  async getPathAnalytics(pathId: string): Promise<PathAnalytics> {
    try {
      const { data: progressData, error } = await this.supabase
        .from('learning_path_progress')
        .select('*')
        .eq('path_id', pathId);

      if (error) throw error;

      const analytics: PathAnalytics = {
        totalUsers: progressData?.length || 0,
        averageProgress: 0,
        completionRate: 0,
        averageTimeSpent: 0,
      };

      return analytics;
    } catch (error) {
      console.error('Error getting path analytics:', error);
      throw error;
    }
  }
}

export const learningPathService = new LearningPathService();