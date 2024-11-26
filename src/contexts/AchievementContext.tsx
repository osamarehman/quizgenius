'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { Achievement, achievementService } from '@/lib/services/achievementService'
import { AchievementNotification } from '@/components/achievements/AchievementNotification'

export interface AchievementData {
  pathId: string
  interactionType: string
  summaryCount?: number
  quizCount?: number
  perfectScores?: number
  helpCount?: number
  loginStreak?: number
}

interface AchievementContextType {
  checkAchievement: (type: string, data: AchievementData) => Promise<void>
  achievements: Achievement[]
  loading: boolean
}

const AchievementContext = createContext<AchievementContextType>({
  checkAchievement: async () => {},
  achievements: [],
  loading: false
})

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(false)

  const checkAchievement = useCallback(async (type: string, data: AchievementData) => {
    const userId = 'current-user-id' // Get this from your auth context
    setLoading(true)
    try {
      const achievement = await achievementService.checkAchievements(userId, type, data)
      if (achievement) {
        setCurrentAchievement(achievement)
        setAchievements(prev => [...prev, achievement])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <AchievementContext.Provider value={{ checkAchievement, achievements, loading }}>
      {children}
      <AchievementNotification 
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />
    </AchievementContext.Provider>
  )
}

export const useAchievements = () => {
  const context = useContext(AchievementContext)
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider')
  }
  return context
} 