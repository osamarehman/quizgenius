import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Achievement {
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

class AchievementService {
  private supabase = createClientComponentClient()

  async checkAchievements(userId: string, action: string, data: any): Promise<Achievement | null> {
    // Fetch user's current achievements
    const { data: userAchievements } = await this.supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)

    // Check for new achievements based on action
    switch (action) {
      case 'COMPLETE_QUIZ':
        return this.checkQuizAchievements(userId, data, userAchievements)
      case 'LOGIN_STREAK':
        return this.checkLoginStreakAchievements(userId, data, userAchievements)
      case 'SUBJECT_MASTERY':
        return this.checkSubjectMasteryAchievements(userId, data, userAchievements)
      case 'PATH_ACHIEVEMENT':
        return this.checkPathAchievements(userId, data, userAchievements)
      case 'SPEED_CHECK':
        return this.checkSpeedAchievements(userId, data, userAchievements || [])
      case 'CONSISTENCY_CHECK':
        return this.checkConsistencyAchievements(userId, data, userAchievements || [])
      case 'MILESTONE_CHECK':
        return this.checkMilestoneAchievements(userId, data, userAchievements || [])
      default:
        return null
    }
  }

  private async checkQuizAchievements(userId: string, data: any, currentAchievements: any[]): Promise<Achievement | null> {
    const { score, timeSpent } = data

    // Perfect Score Achievement
    if (score === 100) {
      const perfectScoreAchievement = {
        id: 'perfect-score',
        title: 'Perfect Score',
        description: 'Get 100% on a quiz',
        type: 'PERFECT_SCORE',
        category: 'mastery',
        progress: 1,
        total: 1,
        unlocked: true,
        reward: {
          type: 'xp',
          value: 200
        }
      }

      // Check if already unlocked
      if (!currentAchievements.find(a => a.achievement_id === 'perfect-score')) {
        await this.unlockAchievement(userId, perfectScoreAchievement)
        return perfectScoreAchievement
      }
    }

    // Add more achievement checks here
    return null
  }

  private async unlockAchievement(userId: string, achievement: Achievement) {
    // Record the achievement
    await this.supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievement.id,
        unlocked_at: new Date().toISOString()
      })

    // Grant rewards
    if (achievement.reward.type === 'xp') {
      await this.grantXP(userId, achievement.reward.value as number)
    }
  }

  private async grantXP(userId: string, amount: number) {
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

  private async checkLoginStreakAchievements(userId: string, data: any, currentAchievements: any[]): Promise<Achievement | null> {
    const { streak } = data
    
    // Daily Scholar Achievement (7-day streak)
    if (streak === 7) {
      return this.processAchievement('daily-scholar', userId, currentAchievements)
    }
    
    // Streak Master Achievement (30-day streak)
    if (streak === 30) {
      return this.processAchievement('streak-master', userId, currentAchievements)
    }
    
    return null
  }

  private async checkSubjectMasteryAchievements(userId: string, data: any, currentAchievements: any[]): Promise<Achievement | null> {
    const { subject, score } = data
    
    // Get high scores in this subject
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

  private async processAchievement(achievementId: string, userId: string, currentAchievements: any[]): Promise<Achievement | null> {
    // Check if already unlocked
    if (currentAchievements.find(a => a.achievement_id === achievementId)) {
      return null
    }
    
    // Get achievement details
    const { data: achievement } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single()
      
    if (achievement) {
      await this.unlockAchievement(userId, achievement)
      return achievement
    }
    
    return null
  }

  private async checkPathAchievements(userId: string, data: any, currentAchievements: any[]): Promise<Achievement | null> {
    const { pathId, stageId, progress, completionTime } = data

    // Quick Stage completion achievement
    if (completionTime && completionTime < 600) { // 10 minutes in seconds
      const quickStageAchievement = await this.processAchievement('quick-stage', userId, currentAchievements)
      if (quickStageAchievement) return quickStageAchievement
    }

    // Perfect Path achievement (all stages with 100% score)
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

    // Path Mastery achievement (complete 3 paths)
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

    // Daily Progress achievement (complete stages on consecutive days)
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

  private async checkSpeedAchievements(userId: string, data: any, currentAchievements: any[]): Promise<Achievement | null> {
    const { completionTime, score } = data

    // Speed Demon achievement (complete quiz under 5 minutes with 90%+ score)
    if (completionTime < 300 && score >= 90) {
      const speedDemonAchievement = await this.processAchievement('speed-demon', userId, currentAchievements)
      if (speedDemonAchievement) return speedDemonAchievement
    }

    // Quick Learner achievement (complete 3 quizzes in a day)
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

  private async checkConsistencyAchievements(userId: string, data: any, currentAchievements: any[]): Promise<Achievement | null> {
    const { streak } = data

    // Weekly Warrior achievement (7-day streak)
    if (streak >= 7) {
      const weeklyWarriorAchievement = await this.processAchievement('weekly-warrior', userId, currentAchievements)
      if (weeklyWarriorAchievement) return weeklyWarriorAchievement
    }

    // Monthly Master achievement (30-day streak)
    if (streak >= 30) {
      const monthlyMasterAchievement = await this.processAchievement('monthly-master', userId, currentAchievements)
      if (monthlyMasterAchievement) return monthlyMasterAchievement
    }

    // Check for improvement streak
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

  private async checkMilestoneAchievements(userId: string, data: any, currentAchievements: any[]): Promise<Achievement | null> {
    const { totalQuizzes, averageScore } = data

    // Quiz Milestone achievements
    if (totalQuizzes >= 100) {
      const centuryAchievement = await this.processAchievement('century-milestone', userId, currentAchievements)
      if (centuryAchievement) return centuryAchievement
    }

    // High Performance achievement (maintain 90%+ average over 20 quizzes)
    if (totalQuizzes >= 20 && averageScore >= 90) {
      const highPerformerAchievement = await this.processAchievement('high-performer', userId, currentAchievements)
      if (highPerformerAchievement) return highPerformerAchievement
    }

    // Subject Mastery achievements
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
      
      subjectScores.forEach((attempt: any) => {
        const subject = attempt.quiz.category.name
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, count: 0 }
        }
        subjectStats[subject].total += attempt.score
        subjectStats[subject].count++
      })

      // Check for subject mastery (95%+ average in a subject with at least 10 attempts)
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
}

export const achievementService = new AchievementService() 