'use client'

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Clock,
  Target,
  Calendar,
  Brain,
  ArrowRight
} from 'lucide-react'

interface PathProgressSummaryProps {
  pathId: string
  progress: {
    completedStages: number
    totalStages: number
    timeSpent: number
    lastAccessed?: string
    currentStreak: number
    averageScore: number
  }
  onContinue: () => void
}

export function PathProgressSummary({
  progress,
  onContinue
}: PathProgressSummaryProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500'
    if (percentage >= 50) return 'text-yellow-500'
    return 'text-blue-500'
  }

  const progressPercentage = (progress.completedStages / progress.totalStages) * 100

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Progress</h2>
          <Trophy className={`h-5 w-5 ${getProgressColor(progressPercentage)}`} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">
              {progress.completedStages}/{progress.totalStages} stages
            </span>
          </div>
          <Progress value={progressPercentage} />
          <p className="text-xs text-muted-foreground text-right">
            {progressPercentage.toFixed(1)}% Complete
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Time Spent</span>
            </div>
            <p className="font-medium">{formatTime(progress.timeSpent)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>Avg. Score</span>
            </div>
            <p className="font-medium">{progress.averageScore}%</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Current Streak</span>
            </div>
            <p className="font-medium">{progress.currentStreak} days</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span>Last Studied</span>
            </div>
            <p className="font-medium">
              {progress.lastAccessed 
                ? new Date(progress.lastAccessed).toLocaleDateString()
                : 'Not started'}
            </p>
          </div>
        </div>

        {progress.completedStages < progress.totalStages && (
          <Button 
            className="w-full"
            onClick={onContinue}
          >
            Continue Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
} 