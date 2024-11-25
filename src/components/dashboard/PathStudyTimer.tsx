'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAchievements } from "@/contexts/AchievementContext"
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  BellOff,
  Timer as TimerIcon
} from 'lucide-react'

interface PathStudyTimerProps {
  pathId: string
  onTimeUpdate: (seconds: number) => void
  suggestedDuration?: number // in minutes
}

export function PathStudyTimer({
  pathId,
  onTimeUpdate,
  suggestedDuration = 25
}: PathStudyTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { toast } = useToast()
  const { checkAchievement } = useAchievements()

  const totalTime = suggestedDuration * 60 // convert to seconds
  const progress = (timeElapsed / totalTime) * 100

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const checkStudyAchievements = useCallback(async () => {
    // Check for study time achievements
    await checkAchievement('STUDY_TIME', {
      pathId,
      timeSpent: timeElapsed,
      totalStudyTime: timeElapsed // This would be cumulative in a real app
    })

    // Check for focus achievements (no breaks)
    if (timeElapsed >= 25 * 60) { // 25 minutes
      await checkAchievement('FOCUSED_STUDY', {
        pathId,
        focusTime: timeElapsed
      })
    }
  }, [checkAchievement, pathId, timeElapsed])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1
          onTimeUpdate(newTime)
          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, onTimeUpdate])

  useEffect(() => {
    if (timeElapsed >= totalTime && notificationsEnabled) {
      toast({
        title: "Time's up!",
        description: `You've completed ${suggestedDuration} minutes of study.`,
      })
      setIsRunning(false)
      checkStudyAchievements()
    }
  }, [timeElapsed, totalTime, notificationsEnabled, suggestedDuration, toast, checkStudyAchievements])

  const handleReset = () => {
    setIsRunning(false)
    setTimeElapsed(0)
    onTimeUpdate(0)
  }

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setNotificationsEnabled(true)
            toast({
              title: "Notifications enabled",
              description: "You'll be notified when your study session ends.",
            })
          }
        })
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TimerIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Study Timer</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleNotifications}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold mb-4">
            {formatTime(timeElapsed)}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            Target: {suggestedDuration} minutes
          </div>
          <Progress value={progress} className="mb-4" />
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={timeElapsed === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>

        {timeElapsed > 0 && !isRunning && (
          <div className="text-center text-sm text-muted-foreground">
            Session paused at {formatTime(timeElapsed)}
          </div>
        )}
      </div>
    </Card>
  )
} 