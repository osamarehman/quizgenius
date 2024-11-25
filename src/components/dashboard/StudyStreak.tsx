'use client'

import { Card } from "@/components/ui/card"
import { format, eachDayOfInterval, subDays } from 'date-fns'

interface StudyStreakProps {
  studyDates: string[] // Array of dates when user studied
  currentStreak: number
  longestStreak: number
}

export function StudyStreak({ studyDates, currentStreak, longestStreak }: StudyStreakProps) {
  // Get last 30 days
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  })

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Study Streak</h2>
      
      <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{currentStreak}</p>
          <p className="text-sm text-muted-foreground">Current Streak</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{longestStreak}</p>
          <p className="text-sm text-muted-foreground">Longest Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {last30Days.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const hasStudied = studyDates.includes(dateStr)
          
          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-sm ${
                hasStudied 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
              title={`${format(date, 'MMM d')}: ${hasStudied ? 'Studied' : 'No study'}`}
            />
          )
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </Card>
  )
} 