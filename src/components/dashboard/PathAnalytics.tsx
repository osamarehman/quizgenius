'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAchievements } from "@/contexts/AchievementContext"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Calendar,
  Clock,
  Brain,
  Target,
  TrendingUp,
  BarChart2,
  Activity
} from 'lucide-react'

interface StudySession {
  date: string
  duration: number
  score?: number
  focusScore: number
  comprehensionScore: number
  topics: string[]
}

interface PathAnalyticsProps {
  pathId: string
  studySessions: StudySession[]
  onUpdateGoals: (goals: any) => Promise<void>
}

export function PathAnalytics({
  pathId,
  studySessions,
  onUpdateGoals
}: PathAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [metricType, setMetricType] = useState<'performance' | 'time' | 'focus'>('performance')
  const { toast } = useToast()
  const { checkAchievement } = useAchievements()

  const calculateMetrics = () => {
    const metrics = {
      totalTime: 0,
      averageScore: 0,
      averageFocus: 0,
      topPerformingTopics: new Map<string, number>(),
      improvementRate: 0
    }

    if (studySessions.length === 0) return metrics

    studySessions.forEach(session => {
      metrics.totalTime += session.duration
      if (session.score) metrics.averageScore += session.score
      metrics.averageFocus += session.focusScore
      
      session.topics.forEach(topic => {
        const current = metrics.topPerformingTopics.get(topic) || 0
        metrics.topPerformingTopics.set(topic, current + session.comprehensionScore)
      })
    })

    metrics.averageScore /= studySessions.length
    metrics.averageFocus /= studySessions.length

    // Calculate improvement rate
    const recentSessions = studySessions.slice(-5)
    if (recentSessions.length >= 2) {
      const firstScores = recentSessions.slice(0, 2).map(s => s.score || 0)
      const lastScores = recentSessions.slice(-2).map(s => s.score || 0)
      metrics.improvementRate = 
        (lastScores.reduce((a, b) => a + b, 0) / 2) -
        (firstScores.reduce((a, b) => a + b, 0) / 2)
    }

    return metrics
  }

  const metrics = calculateMetrics()

  useEffect(() => {
    // Check for achievements based on metrics
    const checkAnalyticsAchievements = async () => {
      if (metrics.averageScore > 90) {
        await checkAchievement('HIGH_PERFORMANCE', {
          pathId,
          averageScore: metrics.averageScore
        })
      }

      if (metrics.averageFocus > 85) {
        await checkAchievement('FOCUSED_LEARNER', {
          pathId,
          focusScore: metrics.averageFocus
        })
      }

      if (metrics.improvementRate > 20) {
        await checkAchievement('RAPID_IMPROVEMENT', {
          pathId,
          improvementRate: metrics.improvementRate
        })
      }
    }

    checkAnalyticsAchievements()
  }, [metrics, pathId, checkAchievement])

  const getFilteredData = () => {
    const now = new Date()
    return studySessions.filter(session => {
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
  }

  const chartData = getFilteredData()

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Learning Analytics</h2>
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
              variant={timeRange === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('year')}
            >
              Year
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Study Time</p>
                <p className="text-lg font-bold">{Math.round(metrics.totalTime / 60)}h</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-lg font-bold">{metrics.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Focus Score</p>
                <p className="text-lg font-bold">{metrics.averageFocus.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-lg font-bold">
                  {metrics.improvementRate > 0 ? '+' : ''}
                  {metrics.improvementRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={metricType === 'performance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricType('performance')}
              >
                Performance
              </Button>
              <Button
                variant={metricType === 'time' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricType('time')}
              >
                Study Time
              </Button>
              <Button
                variant={metricType === 'focus' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMetricType('focus')}
              >
                Focus Level
              </Button>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {metricType === 'performance' ? (
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
              ) : (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey={metricType === 'time' ? 'duration' : 'focusScore'}
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
} 