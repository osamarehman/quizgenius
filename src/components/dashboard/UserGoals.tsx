'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, Calendar, Clock, Brain } from 'lucide-react'
import { useUser } from '@/lib/stores/useUser'
import { useToast } from "@/hooks/use-toast"

interface UserGoals {
  weeklyQuizTarget: number
  studyTimeGoal: number // in minutes
  scoreTarget: number
  streakGoal: number
}

export function UserGoals() {
  const { profile, updateProfile } = useUser()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [goals, setGoals] = useState<UserGoals>({
    weeklyQuizTarget: profile?.weekly_quiz_target || 5,
    studyTimeGoal: profile?.study_time_goal || 120,
    scoreTarget: profile?.score_target || 80,
    streakGoal: profile?.streak_goal || 7
  })

  const handleSave = async () => {
    try {
      await updateProfile({
        weekly_quiz_target: goals.weeklyQuizTarget,
        study_time_goal: goals.studyTimeGoal,
        score_target: goals.scoreTarget,
        streak_goal: goals.streakGoal
      })

      toast({
        title: "Success",
        description: "Your goals have been updated",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update goals",
        variant: "destructive",
      })
    }
  }

  const goalItems = [
    {
      icon: Calendar,
      label: "Weekly Quizzes",
      value: goals.weeklyQuizTarget,
      unit: "quizzes",
      key: "weeklyQuizTarget" as const
    },
    {
      icon: Clock,
      label: "Study Time",
      value: goals.studyTimeGoal,
      unit: "minutes",
      key: "studyTimeGoal" as const
    },
    {
      icon: Target,
      label: "Score Target",
      value: goals.scoreTarget,
      unit: "%",
      key: "scoreTarget" as const
    },
    {
      icon: Brain,
      label: "Streak Goal",
      value: goals.streakGoal,
      unit: "days",
      key: "streakGoal" as const
    }
  ]

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Learning Goals</h2>
        <Button
          variant="outline"
          onClick={() => {
            if (isEditing) {
              handleSave()
            } else {
              setIsEditing(true)
            }
          }}
        >
          {isEditing ? 'Save Goals' : 'Edit Goals'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goalItems.map(({ icon: Icon, label, value, unit, key }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <Label>{label}</Label>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => setGoals(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value)
                    }))}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{unit}</span>
                </div>
              ) : (
                <p className="text-2xl font-bold">
                  {value}
                  <span className="text-sm text-muted-foreground ml-1">
                    {unit}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 