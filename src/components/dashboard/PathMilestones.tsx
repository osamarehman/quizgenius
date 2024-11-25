'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from 'framer-motion'
import { useAchievements } from "@/contexts/AchievementContext"
import {
  Trophy,
  Medal,
  Star,
  Gift,
  Clock,
  Target,
  CheckCircle,
  Lock
} from 'lucide-react'

interface Milestone {
  id: string
  title: string
  description: string
  type: 'achievement' | 'reward' | 'challenge'
  requirement: {
    type: 'score' | 'time' | 'completion'
    value: number
  }
  reward: {
    type: 'xp' | 'badge' | 'unlock'
    value: string | number
  }
  progress: number
  completed: boolean
  unlockedAt?: string
}

interface PathMilestonesProps {
  pathId: string
  milestones: Milestone[]
  onClaimReward: (milestoneId: string) => Promise<void>
}

export function PathMilestones({
  pathId,
  milestones,
  onClaimReward
}: PathMilestonesProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const { checkAchievement } = useAchievements()

  const handleClaimReward = async (milestone: Milestone) => {
    try {
      await onClaimReward(milestone.id)
      
      // Trigger achievement check
      await checkAchievement('MILESTONE_COMPLETION', {
        pathId,
        milestoneId: milestone.id,
        milestoneType: milestone.type,
        rewardType: milestone.reward.type,
        rewardValue: milestone.reward.value
      })
    } catch (error) {
      console.error('Error claiming reward:', error)
    }
  }

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5" />
      case 'reward':
        return <Gift className="h-5 w-5" />
      case 'challenge':
        return <Target className="h-5 w-5" />
      default:
        return null
    }
  }

  const filteredMilestones = milestones.filter(
    milestone => selectedType === 'all' || milestone.type === selectedType
  )

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Path Milestones</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All
            </Button>
            <Button
              variant={selectedType === 'achievement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('achievement')}
            >
              Achievements
            </Button>
            <Button
              variant={selectedType === 'reward' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('reward')}
            >
              Rewards
            </Button>
            <Button
              variant={selectedType === 'challenge' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('challenge')}
            >
              Challenges
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredMilestones.map((milestone) => (
            <motion.div
              key={milestone.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`p-4 ${milestone.completed ? 'bg-primary/5' : ''}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        milestone.completed ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          getMilestoneIcon(milestone.type)
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    {milestone.completed && !milestone.unlockedAt && (
                      <Button
                        size="sm"
                        onClick={() => handleClaimReward(milestone)}
                      >
                        Claim Reward
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>
                        {milestone.progress}%
                      </span>
                    </div>
                    <Progress value={milestone.progress} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {milestone.requirement.type}: {milestone.requirement.value}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {milestone.completed ? (
                        <Badge variant="default">
                          <Star className="h-4 w-4 mr-1" />
                          {milestone.reward.type === 'xp' ? `+${milestone.reward.value} XP` : milestone.reward.value}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Lock className="h-4 w-4 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
} 