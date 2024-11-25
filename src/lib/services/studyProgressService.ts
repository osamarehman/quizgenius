import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface StudySession {
  id: string
  userId: string
  pathId: string
  stageId: string
  startTime: string
  endTime?: string
  duration: number
  focusScore: number
  completedContent: boolean
  notes?: string
}

interface StudyStats {
  totalTime: number
  averageFocusScore: number
  completedStages: number
  studyStreak: number
  lastStudied: string | null
  weeklyProgress: {
    date: string
    timeSpent: number
    stagesCompleted: number
  }[]
}

class StudyProgressService {
  private supabase = createClientComponentClient()

  async startStudySession(
    userId: string,
    pathId: string,
    stageId: string
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('study_sessions')
        .insert({
          user_id: userId,
          path_id: pathId,
          stage_id: stageId,
          start_time: new Date().toISOString(),
          focus_score: 100 // Initial focus score
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error starting study session:', error)
      throw error
    }
  }

  async updateStudySession(
    sessionId: string,
    updates: {
      focusScore?: number
      completedContent?: boolean
      notes?: string
    }
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('study_sessions')
        .update({
          focus_score: updates.focusScore,
          completed_content: updates.completedContent,
          notes: updates.notes
        })
        .eq('id', sessionId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating study session:', error)
      throw error
    }
  }

  async endStudySession(sessionId: string): Promise<void> {
    try {
      const endTime = new Date().toISOString()
      const { error } = await this.supabase
        .from('study_sessions')
        .update({
          end_time: endTime,
          duration: this.calculateDuration(sessionId, endTime)
        })
        .eq('id', sessionId)

      if (error) throw error
    } catch (error) {
      console.error('Error ending study session:', error)
      throw error
    }
  }

  async getStudyStats(userId: string): Promise<StudyStats> {
    try {
      const { data: sessions } = await this.supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })

      if (!sessions?.length) {
        return this.getEmptyStats()
      }

      const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
      const averageFocusScore = sessions.reduce((sum, session) => sum + session.focus_score, 0) / sessions.length
      const completedStages = new Set(sessions.filter(s => s.completed_content).map(s => s.stage_id)).size
      const studyStreak = this.calculateStudyStreak(sessions)
      const lastStudied = sessions[0]?.end_time || null
      const weeklyProgress = this.calculateWeeklyProgress(sessions)

      return {
        totalTime,
        averageFocusScore,
        completedStages,
        studyStreak,
        lastStudied,
        weeklyProgress
      }
    } catch (error) {
      console.error('Error getting study stats:', error)
      return this.getEmptyStats()
    }
  }

  async getStudyHeatmap(userId: string): Promise<{ date: string; count: number }[]> {
    try {
      const { data: sessions } = await this.supabase
        .from('study_sessions')
        .select('start_time, duration')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

      const heatmap = new Map<string, number>()
      
      sessions?.forEach(session => {
        const date = session.start_time.split('T')[0]
        heatmap.set(date, (heatmap.get(date) || 0) + (session.duration || 0))
      })

      return Array.from(heatmap.entries()).map(([date, count]) => ({
        date,
        count: Math.round(count / 60) // Convert to minutes
      }))
    } catch (error) {
      console.error('Error getting study heatmap:', error)
      return []
    }
  }

  private calculateDuration(sessionId: string, endTime: string): number {
    // Calculate duration in minutes
    return 0 // Implement actual calculation
  }

  private calculateStudyStreak(sessions: StudySession[]): number {
    let streak = 0
    let currentDate = new Date()
    
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].startTime)
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === streak) {
        streak++
        currentDate = sessionDate
      } else if (diffDays > streak) {
        break
      }
    }
    
    return streak
  }

  private calculateWeeklyProgress(sessions: StudySession[]): {
    date: string
    timeSpent: number
    stagesCompleted: number
  }[] {
    const weeklyData = new Map<string, {
      timeSpent: number
      stagesCompleted: number
    }>()

    sessions.forEach(session => {
      const date = new Date(session.startTime)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0]
      
      const current = weeklyData.get(weekStart) || { timeSpent: 0, stagesCompleted: 0 }
      weeklyData.set(weekStart, {
        timeSpent: current.timeSpent + (session.duration || 0),
        stagesCompleted: current.stagesCompleted + (session.completedContent ? 1 : 0)
      })
    })

    return Array.from(weeklyData.entries())
      .map(([date, stats]) => ({
        date,
        timeSpent: stats.timeSpent,
        stagesCompleted: stats.stagesCompleted
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private getEmptyStats(): StudyStats {
    return {
      totalTime: 0,
      averageFocusScore: 0,
      completedStages: 0,
      studyStreak: 0,
      lastStudied: null,
      weeklyProgress: []
    }
  }
}

export const studyProgressService = new StudyProgressService() 