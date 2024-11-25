'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Clock,
  Calendar,
  Brain,
  Target,
  TrendingUp,
  BarChart2
} from 'lucide-react'

interface StudySession {
  date: string
  duration: number
  score?: number
  stageId: string
  stageName: string
}

interface PathStudyStatsProps {
  pathId: string
  studySessions: StudySession[]
  totalTime: number
  averageScore: number
  completedStages: number
  totalStages: number
}

export function PathStudyStats({
  pathId,
  studySessions,
  totalTime,
  averageScore,
  completedStages,
  totalStages
}: PathStudyStatsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')
  const [chartType, setChartType] = useState<'time' | 'score'>('time')

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getFilteredData = () => {
    const now = new Date()
    const filtered = studySessions.filter(session => {
      const sessionDate = new Date(session.date)
      switch (timeRange) {
        case 'week':
          return now.getTime() - sessionDate.getTime() <= 7 * 24 * 60 * 60 * 1000
        case 'month':
          return now.getTime() - sessionDate.getTime() <= 30 * 24 * 60 * 60 * 1000
        default:
          return true
      }
    })

    return filtered.map(session => ({
      ...session,
      duration: session.duration / 60, // Convert to hours
    }))
  }

  const chartData = getFilteredData()

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Study Statistics</h2>
          <div className="flex gap-2">
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All Time
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-lg font-bold">{formatTime(totalTime)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-lg font-bold">{averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-lg font-bold">
                  {completedStages}/{totalStages} stages
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-lg font-bold">{studySessions.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={chartType === 'time' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('time')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Study Time
              </Button>
              <Button
                variant={chartType === 'score' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('score')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Scores
              </Button>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'time' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="duration" fill="var(--primary)" />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress by Stage */}
        <div>
          <h3 className="font-medium mb-4">Progress by Stage</h3>
          <div className="space-y-4">
            {Object.entries(
              chartData.reduce((acc, session) => {
                if (!acc[session.stageName]) {
                  acc[session.stageName] = {
                    time: 0,
                    score: session.score || 0,
                    sessions: 0
                  }
                }
                acc[session.stageName].time += session.duration
                acc[session.stageName].sessions++
                return acc
              }, {} as Record<string, { time: number, score: number, sessions: number }>)
            ).map(([stage, stats]) => (
              <div key={stage}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{stage}</span>
                  <span>{formatTime(stats.time * 60)}</span>
                </div>
                <Progress value={(stats.time / totalTime) * 100} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
} 