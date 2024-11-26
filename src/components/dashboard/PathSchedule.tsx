'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { useAchievements } from "@/contexts/AchievementContext"
import {
  CalendarDays,
  Clock,
  Bell,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StudySession {
  id: string
  date: Date
  startTime: string
  duration: number
  topic: string
  completed: boolean
  reminder: boolean
}

interface PathScheduleProps {
  pathId: string
  sessions: StudySession[]
  onAddSession: (session: Omit<StudySession, 'id'>) => Promise<void>
  onUpdateSession: (id: string, updates: Partial<StudySession>) => Promise<void>
  onDeleteSession: (id: string) => Promise<void>
}

export function PathSchedule({
  pathId,
  sessions,
  onAddSession,
  onUpdateSession,
  onDeleteSession
}: PathScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isAddingSession, setIsAddingSession] = useState(false)
  const [newSession, setNewSession] = useState({
    startTime: '09:00',
    duration: 30,
    topic: '',
    reminder: true
  })
  const { toast } = useToast()
  const { checkAchievement } = useAchievements()

  const handleAddSession = async () => {
    if (!selectedDate) return

    try {
      await onAddSession({
        date: selectedDate,
        startTime: newSession.startTime,
        duration: newSession.duration,
        topic: newSession.topic,
        reminder: newSession.reminder,
        completed: false
      })

      // Check for scheduling achievements
      await checkAchievement('SCHEDULE_CREATED', {
        pathId,
        sessionsCount: sessions.length + 1
      })

      toast({
        title: "Success",
        description: "Study session scheduled successfully",
      })
      setIsAddingSession(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule session",
        variant: "destructive",
      })
    }
  }

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await onUpdateSession(sessionId, { completed: true })

      // Check for completion achievements
      await checkAchievement('SESSION_COMPLETED', {
        pathId,
        completedSessions: sessions.filter(s => s.completed).length + 1
      })

      toast({
        title: "Success",
        description: "Session marked as completed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update session",
        variant: "destructive",
      })
    }
  }

  const getDayContent = (day: Date) => {
    const daySessions = sessions.filter(
      session => session.date.toDateString() === day.toDateString()
    )
    return daySessions.length > 0 ? (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-2 h-2 bg-primary rounded-full">
          {daySessions.length > 1 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/30 rounded-full animate-ping" />
          )}
        </div>
      </div>
    ) : null
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Study Schedule</h2>
          </div>
          <Dialog open={isAddingSession} onOpenChange={setIsAddingSession}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Study Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
                    <input
                      type="time"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession(prev => ({
                        ...prev,
                        startTime: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (min)</label>
                    <Select
                      value={newSession.duration.toString()}
                      onValueChange={(value) => setNewSession(prev => ({
                        ...prev,
                        duration: parseInt(value)
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {[15, 30, 45, 60, 90, 120].map((duration) => (
                          <SelectItem key={duration} value={duration.toString()}>
                            {duration} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <input
                    type="text"
                    value={newSession.topic}
                    onChange={(e) => setNewSession(prev => ({
                      ...prev,
                      topic: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="What will you study?"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSession.reminder}
                    onChange={(e) => setNewSession(prev => ({
                      ...prev,
                      reminder: e.target.checked
                    }))}
                    id="reminder"
                  />
                  <label htmlFor="reminder" className="text-sm">
                    Set reminder
                  </label>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddSession}
                >
                  Schedule Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => getDayContent(date)
            }}
          />

          <div className="space-y-4">
            <h3 className="font-medium">
              {selectedDate ? (
                `Sessions for ${selectedDate.toLocaleDateString()}`
              ) : (
                'Select a date'
              )}
            </h3>
            {selectedDate && sessions
              .filter(session => 
                session.date.toDateString() === selectedDate.toDateString()
              )
              .map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{session.topic}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.startTime}
                        </div>
                        <div>{session.duration} min</div>
                        {session.reminder && (
                          <div className="flex items-center gap-1">
                            <Bell className="h-4 w-4" />
                            Reminder set
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!session.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteSession(session.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </Card>
  )
} 