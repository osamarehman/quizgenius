'use client'

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Clock } from 'lucide-react'

interface StudyProgressProps {
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  studyTimeThisWeek: number // in minutes
  weeklyGoal: number // in minutes
}

export function StudyProgress({
  totalQuizzes,
  completedQuizzes,
  averageScore,
  studyTimeThisWeek,
  weeklyGoal
}: StudyProgressProps) {
  const completionRate = (completedQuizzes / totalQuizzes) * 100
  const studyProgress = (studyTimeThisWeek / weeklyGoal) * 100

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Study Progress</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Quiz Completion</span>
            <span className="text-sm font-medium">{completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={completionRate} />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Average Score</span>
            <span className="text-sm font-medium">{averageScore.toFixed(1)}%</span>
          </div>
          <Progress value={averageScore} className="bg-primary/20" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Weekly Study Goal</span>
            <span className="text-sm font-medium">{studyTimeThisWeek}/{weeklyGoal} mins</span>
          </div>
          <Progress value={studyProgress} className="bg-primary/20" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">{completedQuizzes}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <Target className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">{totalQuizzes - completedQuizzes}</p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
        <div className="text-center">
          <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">{studyTimeThisWeek}</p>
          <p className="text-xs text-muted-foreground">Minutes</p>
        </div>
      </div>
    </Card>
  )
} 