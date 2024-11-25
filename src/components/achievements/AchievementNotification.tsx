'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'

interface AchievementNotificationProps {
  achievement: {
    id: string
    title: string
    description: string
    type: string
    reward: {
      type: 'xp' | 'badge' | 'title'
      value: string | number
    }
  } | null
  onClose: () => void
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for exit animation
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  if (!achievement) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="w-80 p-4 bg-gradient-to-r from-primary/10 to-background border-primary/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Trophy className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm">Achievement Unlocked!</h4>
                    <p className="text-sm font-medium">{achievement.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsVisible(false)
                      setTimeout(onClose, 300)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-medium">
                    {achievement.reward.type === 'xp' 
                      ? `+${achievement.reward.value} XP` 
                      : achievement.reward.value}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 