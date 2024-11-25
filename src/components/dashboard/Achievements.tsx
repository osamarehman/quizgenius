'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Target, Book, Clock, Brain, Award, Zap, Medal } from 'lucide-react'
import { cn } from "@/lib/utils"

// Achievement Categories with metadata
const ACHIEVEMENT_CATEGORIES = {
  learning: { 
    label: 'Learning Journey', 
    color: 'bg-blue-500',
    description: 'Progress through your learning path'
  },
  engagement: { 
    label: 'Engagement', 
    color: 'bg-green-500',
    description: 'Stay active and consistent'
  },
  mastery: { 
    label: 'Mastery', 
    color: 'bg-purple-500',
    description: 'Demonstrate subject expertise'
  },
  social: { 
    label: 'Community', 
    color: 'bg-yellow-500',
    description: 'Interact with other learners'
  },
  challenge: { 
    label: 'Challenges', 
    color: 'bg-red-500',
    description: 'Complete special challenges'
  }
} as const

// Achievement Types with rewards
const ACHIEVEMENT_TYPES = {
  QUIZ_STREAK: {
    description: 'Complete quizzes consecutively',
    rewards: { xp: 100, badge: 'Consistent Learner' }
  },
  PERFECT_SCORE: {
    description: 'Get 100% on quizzes',
    rewards: { xp: 200, badge: 'Perfect Score' }
  },
  SUBJECT_MASTERY: {
    description: 'Master specific subjects',
    rewards: { xp: 500, title: 'Subject Expert' }
  },
  QUICK_LEARNER: {
    description: 'Complete quizzes quickly',
    rewards: { xp: 150, badge: 'Speed Demon' }
  },
  DAILY_LOGIN: {
    description: 'Log in consistently',
    rewards: { xp: 50, badge: 'Dedicated Student' }
  },
  HELP_OTHERS: {
    description: 'Help other students',
    rewards: { xp: 300, title: 'Community Helper' }
  }
} as const

interface Achievement {
  id: string
  title: string
  description: string
  icon: keyof typeof icons
  progress: number
  total: number
  unlocked: boolean
  category: keyof typeof ACHIEVEMENT_CATEGORIES
  type: keyof typeof ACHIEVEMENT_TYPES
  reward: {
    type: 'xp' | 'badge' | 'title'
    value: string | number
  }
  unlockedAt?: string
}

interface AchievementsProps {
  achievements: Achievement[]
  onAchievementClick?: (achievement: Achievement) => void
}

const icons = {
  Trophy,
  Star,
  Target,
  Book,
  Clock,
  Brain,
  Award,
  Zap,
  Medal
}

export function Achievements({ achievements, onAchievementClick }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof ACHIEVEMENT_CATEGORIES | 'all'>('all')
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([])

  // Filter achievements by category
  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  )

  // Calculate achievement stats
  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    totalXP: achievements.reduce((sum, a) => 
      sum + (a.unlocked && a.reward.type === 'xp' ? Number(a.reward.value) : 0), 0
    )
  }

  // Animation for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked = achievements
      .filter(a => a.unlocked && a.unlockedAt && 
        new Date(a.unlockedAt).getTime() > Date.now() - 5000)
      .map(a => a.id)
    
    setRecentlyUnlocked(newlyUnlocked)
    
    const timer = setTimeout(() => {
      setRecentlyUnlocked([])
    }, 5000)

    return () => clearTimeout(timer)
  }, [achievements])

  return (
    <Card className="p-6 space-y-6">
      {/* Header with stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Achievements</h2>
          <p className="text-sm text-muted-foreground">
            {stats.unlocked} of {stats.total} unlocked • {stats.totalXP} XP earned
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Badge 
          variant="outline" 
          className={cn(
            "cursor-pointer hover:bg-accent",
            selectedCategory === 'all' && "bg-accent"
          )}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Badge>
        {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, { label, color }]) => (
          <Badge 
            key={key} 
            variant="outline" 
            className={cn(
              "gap-1 cursor-pointer hover:bg-accent",
              selectedCategory === key && "bg-accent"
            )}
            onClick={() => setSelectedCategory(key as keyof typeof ACHIEVEMENT_CATEGORIES)}
          >
            <div className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </Badge>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredAchievements.map((achievement) => {
            const Icon = icons[achievement.icon]
            const category = ACHIEVEMENT_CATEGORIES[achievement.category]
            const type = ACHIEVEMENT_TYPES[achievement.type]
            const progressPercentage = (achievement.progress / achievement.total) * 100
            const isRecentlyUnlocked = recentlyUnlocked.includes(achievement.id)

            return (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  ...(isRecentlyUnlocked && {
                    y: [0, -20, 0],
                    transition: { duration: 0.5 }
                  })
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onAchievementClick?.(achievement)}
                className="cursor-pointer"
              >
                <Card 
                  className={cn(
                    "p-4 transition-colors",
                    achievement.unlocked ? "bg-primary/5" : "bg-background",
                    isRecentlyUnlocked && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${category.color} bg-opacity-10`}>
                      <Icon className={cn(
                        "h-6 w-6",
                        achievement.unlocked ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.unlocked && (
                          <Badge variant="default" className="ml-2">
                            {achievement.reward.type === 'xp' ? 
                              `+${achievement.reward.value} XP` : 
                              achievement.reward.value}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Progress value={progressPercentage} />
                        <p className="text-xs text-muted-foreground text-right">
                          {achievement.progress} / {achievement.total}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Card>
  )
} 