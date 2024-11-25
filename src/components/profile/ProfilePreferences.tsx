'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const STUDY_SCHEDULES = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
  { value: 'evening', label: 'Evening (6 PM - 12 AM)' },
  { value: 'flexible', label: 'Flexible' },
]

export function ProfilePreferences() {
  const [difficulty, setDifficulty] = useState(50)
  const [schedule, setSchedule] = useState('flexible')
  const [notifications, setNotifications] = useState({
    quiz: true,
    progress: true,
    reminders: false,
  })
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="space-y-8">
      {/* Difficulty Preference */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Difficulty Preference</Label>
          <p className="text-sm text-muted-foreground">
            Set your preferred difficulty level for quizzes
          </p>
        </div>
        <Slider
          value={[difficulty]}
          onValueChange={([value]) => setDifficulty(value)}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Easier</span>
          <span>Balanced</span>
          <span>Harder</span>
        </div>
      </div>

      {/* Study Schedule */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Preferred Study Time</Label>
          <p className="text-sm text-muted-foreground">
            When do you usually study?
          </p>
        </div>
        <Select value={schedule} onValueChange={setSchedule}>
          <SelectTrigger>
            <SelectValue placeholder="Select your preferred study time" />
          </SelectTrigger>
          <SelectContent>
            {STUDY_SCHEDULES.map((scheduleOption) => (
              <SelectItem key={scheduleOption.value} value={scheduleOption.value}>
                {scheduleOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Notification Preferences</Label>
          <p className="text-sm text-muted-foreground">
            Manage your notification settings
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quiz Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about new quizzes
              </p>
            </div>
            <Switch
              checked={notifications.quiz}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, quiz: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Progress Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about your learning progress
              </p>
            </div>
            <Switch
              checked={notifications.progress}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, progress: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Study Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive daily study reminders
              </p>
            </div>
            <Switch
              checked={notifications.reminders}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, reminders: checked }))
              }
            />
          </div>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Dark Mode</Label>
          <p className="text-sm text-muted-foreground">
            Toggle dark mode theme
          </p>
        </div>
        <Switch
          checked={darkMode}
          onCheckedChange={setDarkMode}
        />
      </div>
    </div>
  )
} 