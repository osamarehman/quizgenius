'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { Achievement, achievementService } from '@/lib/services/achievementService'
import { AchievementNotification } from '@/components/achievements/AchievementNotification'

interface AchievementContextType {
  checkAchievement: (action: string, data: any) => Promise<void>
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)

  const checkAchievement = useCallback(async (action: string, data: any) => {
    const userId = 'current-user-id' // Get this from your auth context
    const achievement = await achievementService.checkAchievements(userId, action, data)
    if (achievement) {
      setCurrentAchievement(achievement)
    }
  }, [])

  return (
    <AchievementContext.Provider value={{ checkAchievement }}>
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