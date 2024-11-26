'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface StudySession {
  id: string
  date: Date
  startTime: string
  duration: number
  completed: boolean
  reminder: boolean
  topic: string
}

interface PathStudyScheduleProps {
  pathId: string
  sessions: StudySession[]
  onAddSession: (session: Omit<StudySession, 'id'>) => Promise<void>
  onToggleReminder: (sessionId: string) => Promise<void>
  onMarkComplete: (sessionId: string) => Promise<void>
}

export function PathStudySchedule({
  sessions,
  onToggleReminder,
  onMarkComplete
}: PathStudyScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  const getDayContent = (day: Date) => {
    const dayHasSessions = sessions.some(
      session => session.date.toDateString() === day.toDateString()
    )
    if (!dayHasSessions) return null

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="h-2 w-2 bg-primary rounded-full" />
      </div>
    )
  }

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(
      session => session.date.toDateString() === date.toDateString()
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Study Schedule</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </Button>
        </div>

        {showCalendar && (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => getDayContent(date)
            }}
          />
        )}

        <div className="space-y-4">
          {selectedDate && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <Button size="sm">Add Session</Button>
              </div>

              {getSessionsForDate(selectedDate).map((session) => (
                <Card
                  key={session.id}
                  className={cn(
                    "p-4",
                    session.completed ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {session.startTime}
                        </Badge>
                        <Badge variant="outline">
                          {session.duration} min
                        </Badge>
                      </div>
                      <p className="mt-2 font-medium">{session.topic}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleReminder(session.id)}
                      >
                        {session.reminder ? (
                          <Bell className="h-4 w-4 text-primary" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </Button>
                      {!session.completed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkComplete(session.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {getSessionsForDate(selectedDate).length === 0 && (
                <div className="text-center py-6">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No study sessions scheduled for this day
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
} 