import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Achievement {
  id: string
  title: string
  description: string
  type: string
  category: string
  progress: number
  total: number
  unlocked: boolean
  reward: {
    type: 'xp' | 'badge' | 'title'
    value: string | number
  }
}

interface AchievementData {
  action: string
  data: {
    score?: number
    timeSpent?: number
    pathId?: string
    progress?: number
    metadata?: Record<string, unknown>
  }
}

interface AchievementResponse {
  achievement: Achievement | null
  progress?: {
    current: number
    target: number
  }
}

interface UserData {
  questionCount: number
  streakDays: number
  perfectScores: number
  [key: string]: number | boolean | string | Date | undefined
}

interface AchievementCondition {
  type: string
  value: number
  customCheck?: (userData: UserData) => boolean
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: AchievementCondition
  reward: {
    type: string
    value: number | string
  }
  progress: number
  earned: boolean
  earnedAt?: Date
}

interface AchievementProgress {
  userId: string
  achievementId: string
  progress: number
  completed: boolean
  completedAt?: Date
  metadata?: Record<string, unknown>
}

interface AchievementMetadata {
  type: string
  value: string | number
  timestamp: Date
  details?: Record<string, unknown>
}

interface AchievementEvent {
  type: string
  value: number | string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface QuizAttempt {
  score: number;
  quiz: {
    category: {
      name: string;
    };
  };
}

class AchievementService {
  private supabase = createClientComponentClient()

  async checkAchievements(userId: string, action: string, data: AchievementData): Promise<AchievementResponse | null> {
    const { data: currentAchievements } = await this.supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId)

    if (!currentAchievements) return null

    switch (action) {
      case 'COMPLETE_QUIZ':
        return this.checkQuizAchievements(userId, data.data, currentAchievements)
      case 'LOGIN_STREAK':
        return this.checkLoginStreakAchievements(userId, data.data, currentAchievements)
      case 'SUBJECT_MASTERY':
        return this.checkSubjectMasteryAchievements(userId, data.data, currentAchievements)
      case 'COMPLETE_PATH':
        return this.checkPathAchievements(userId, data.data, currentAchievements)
      case 'SPEED_COMPLETION':
        return this.checkSpeedAchievements(userId, data.data, currentAchievements)
      case 'CONSISTENCY':
        return this.checkConsistencyAchievements(userId, data.data, currentAchievements)
      case 'MILESTONE':
        return this.checkMilestoneAchievements(userId, data.data, currentAchievements)
      default:
        return null
    }
  }

  private async checkQuizAchievements(
    userId: string, 
    data: AchievementData['data'], 
    currentAchievements: { achievement_id: string }[]
  ): Promise<AchievementResponse | null> {
    const { score } = data

    if (score === 100) {
      const perfectScoreAchievement = await this.processAchievement('perfect-score', userId, currentAchievements)
      if (perfectScoreAchievement) {
        await this.grantXP(userId, 100)
        return { achievement: perfectScoreAchievement }
      }
    }

    if (score && score >= 90) {
      const highScoreAchievement = await this.processAchievement('high-score', userId, currentAchievements)
      if (highScoreAchievement) {
        await this.grantXP(userId, 50)
        return { achievement: highScoreAchievement }
      }
    }

    return null
  }

  private async grantXP(userId: string, amount: number): Promise<void> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('xp')
      .eq('id', userId)
      .single()

    await this.supabase
      .from('profiles')
      .update({ xp: (profile?.xp || 0) + amount })
      .eq('id', userId)
  }

  private async processAchievement(
    achievementId: string,
    userId: string,
    currentAchievements: { achievement_id: string }[]
  ): Promise<Achievement | null> {
    if (currentAchievements.find(a => a.achievement_id === achievementId)) {
      return null
    }

    const { data: achievement } = await this.supabase
      .from('achievements')
      .select()
      .eq('id', achievementId)
      .single()

    if (achievement) {
      await this.supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        })

      return achievement
    }

    return null
  }

  private async checkLoginStreakAchievements(
    userId: string, 
    data: AchievementData['data'], 
    currentAchievements: { achievement_id: string }[]
  ): Promise<AchievementResponse | null> {
    const { streak } = data
    
    if (streak === 7) {
      return this.processAchievement('daily-scholar', userId, currentAchievements)
    }
    
    if (streak === 30) {
      return this.processAchievement('streak-master', userId, currentAchievements)
    }
    
    return null
  }

  private async checkSubjectMasteryAchievements(
    userId: string, 
    data: AchievementData['data'], 
    currentAchievements: { achievement_id: string }[]
  ): Promise<AchievementResponse | null> {
    const { subject } = data
    
    const { data: scores } = await this.supabase
      .from('quiz_attempts')
      .select('score')
      .eq('user_id', userId)
      .eq('subject', subject)
      .gte('score', 90)
      .order('created_at', { ascending: false })
      .limit(10)
      
    if (scores?.length >= 10) {
      return this.processAchievement('subject-expert', userId, currentAchievements)
    }
    
    return null
  }

  private async checkPathAchievements(
    userId: string, 
    data: AchievementData['data'], 
    currentAchievements: { achievement_id: string }[]
  ): Promise<AchievementResponse | null> {
    const { pathId, progress, completionTime } = data

    if (completionTime && completionTime < 600) { 
      const quickStageAchievement = await this.processAchievement('quick-stage', userId, currentAchievements)
      if (quickStageAchievement) return quickStageAchievement
    }

    if (progress === 100) {
      const { data: pathProgress } = await this.supabase
        .from('user_path_progress')
        .select('progress')
        .eq('path_id', pathId)
        .eq('user_id', userId)

      const allPerfect = pathProgress?.every(p => p.progress === 100)
      if (allPerfect) {
        const perfectPathAchievement = await this.processAchievement('perfect-path', userId, currentAchievements)
        if (perfectPathAchievement) return perfectPathAchievement
      }
    }

    const { data: completedPaths } = await this.supabase
      .from('user_path_progress')
      .select('path_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .distinct()

    if (completedPaths && completedPaths.length >= 3) {
      const pathMasteryAchievement = await this.processAchievement('path-mastery', userId, currentAchievements)
      if (pathMasteryAchievement) return pathMasteryAchievement
    }

    const { data: recentProgress } = await this.supabase
      .from('user_path_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(7)

    if (recentProgress && recentProgress.length >= 7) {
      const dates = recentProgress.map(p => new Date(p.completed_at).toDateString())
      const uniqueDates = new Set(dates)
      if (uniqueDates.size >= 7) {
        const weeklyProgressAchievement = await this.processAchievement('weekly-progress', userId, currentAchievements)
        if (weeklyProgressAchievement) return weeklyProgressAchievement
      }
    }

    return null
  }

  private async checkSpeedAchievements(
    userId: string, 
    data: AchievementData['data'], 
    currentAchievements: { achievement_id: string }[]
  ): Promise<AchievementResponse | null> {
    const { completionTime, score } = data

    if (completionTime < 300 && score >= 90) {
      const speedDemonAchievement = await this.processAchievement('speed-demon', userId, currentAchievements)
      if (speedDemonAchievement) return speedDemonAchievement
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: todayAttempts } = await this.supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', today)

    if (todayAttempts && todayAttempts.length >= 3) {
      return this.processAchievement('quick-learner', userId, currentAchievements)
    }

    return null
  }

  private async checkConsistencyAchievements(
    userId: string, 
    data: AchievementData['data'], 
    currentAchievements: { achievement_id: string }[]
  ): Promise<AchievementResponse | null> {
    const { streak } = data

    if (streak >= 7) {
      const weeklyWarriorAchievement = await this.processAchievement('weekly-warrior', userId, currentAchievements)
      if (weeklyWarriorAchievement) return weeklyWarriorAchievement
    }

    if (streak >= 30) {
      const monthlyMasterAchievement = await this.processAchievement('monthly-master', userId, currentAchievements)
      if (monthlyMasterAchievement) return monthlyMasterAchievement
    }

    const { data: recentScores } = await this.supabase
      .from('quiz_attempts')
      .select('score')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(3)

    if (recentScores && recentScores.length === 3) {
      const isImproving = recentScores[0].score > recentScores[1].score && 
                         recentScores[1].score > recentScores[2].score
      if (isImproving) {
        return this.processAchievement('improvement-streak', userId, currentAchievements)
      }
    }

    return null
  }

  private async checkMilestoneAchievements(
    userId: string, 
    data: AchievementData['data'], 
    currentAchievements: { achievement_id: string }[]
  ): Promise<AchievementResponse | null> {
    const { totalQuizzes, averageScore } = data

    if (totalQuizzes >= 100) {
      const centuryAchievement = await this.processAchievement('century-milestone', userId, currentAchievements)
      if (centuryAchievement) return centuryAchievement
    }

    if (totalQuizzes >= 20 && averageScore >= 90) {
      const highPerformerAchievement = await this.processAchievement('high-performer', userId, currentAchievements)
      if (highPerformerAchievement) return highPerformerAchievement
    }

    const { data: subjectScores } = await this.supabase
      .from('quiz_attempts')
      .select(`
        quiz:quizzes (
          category:categories(name)
        ),
        score
      `)
      .eq('user_id', userId)

    if (subjectScores) {
      const subjectStats: Record<string, { total: number, count: number }> = {}
      
      subjectScores.forEach((attempt: QuizAttempt) => {
        const subject = attempt.quiz.category.name
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, count: 0 }
        }
        subjectStats[subject].total += attempt.score
        subjectStats[subject].count++
      })

      for (const [subject, stats] of Object.entries(subjectStats)) {
        if (stats.count >= 10 && (stats.total / stats.count) >= 95) {
          const subjectMasteryAchievement = await this.processAchievement(
            `subject-mastery-${subject.toLowerCase()}`,
            userId,
            currentAchievements
          )
          if (subjectMasteryAchievement) return subjectMasteryAchievement
        }
      }
    }

    return null
  }

  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number,
    completed: boolean,
    metadata?: Record<string, unknown>
  ): Promise<AchievementProgress> {
    const { data: currentProgress } = await this.supabase
      .from('user_achievements')
      .select('progress, completed, completed_at')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single()

    if (currentProgress) {
      await this.supabase
        .from('user_achievements')
        .update({
          progress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          metadata: JSON.stringify(metadata)
        })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
    } else {
      await this.supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          progress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          metadata: JSON.stringify(metadata)
        })
    }

    return {
      userId,
      achievementId,
      progress,
      completed,
      completedAt: completed ? new Date() : undefined,
      metadata
    }
  }

  async updateAchievementMetadata(
    userId: string,
    achievementId: string,
    metadata: AchievementMetadata
  ): Promise<void> {
    await this.supabase
      .from('user_achievements')
      .update({
        metadata: JSON.stringify(metadata)
      })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
  }

  async processAchievementEvent(
    userId: string,
    event: AchievementEvent
  ): Promise<AchievementResponse | null> {
    const { type, value, metadata } = event
    const { data: achievements } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('type', type)
      .single()

    if (!achievements) return null

    const progress = typeof value === 'number' ? value / achievements.condition.value : 0
    if (progress >= 1) {
      await this.updateAchievementProgress(userId, achievements.id, progress, true, metadata)
      return {
        achievement: achievements,
        progress: {
          current: value as number,
          target: achievements.condition.value
        }
      }
    }

    return null
  }
}

export function checkAchievementProgress(achievement: Achievement, userData: UserData): number {
  switch (achievement.condition.type) {
    case 'questionCount':
      return userData.questionCount / achievement.condition.value
    case 'streakDays':
      return userData.streakDays / achievement.condition.value
    case 'perfectScore':
      return userData.perfectScores / achievement.condition.value
    case 'custom':
      return achievement.condition.customCheck ? achievement.condition.customCheck(userData) : 0
    default:
      return 0
  }
}

export const achievementService = new AchievementService()