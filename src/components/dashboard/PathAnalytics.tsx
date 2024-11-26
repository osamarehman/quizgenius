'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAchievements } from "@/contexts/AchievementContext"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Clock,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react'

interface StudySession {
  date: string
  duration: number
  score?: number
  focusScore: number
  comprehensionScore: number
  topics: string[]
}

interface LearningGoals {
  dailyStudyTime: number
  targetScore: number
  focusTarget: number
}

interface PathAnalyticsProps {
  pathId: string
  studySessions: StudySession[]
  onUpdateGoals: (goals: LearningGoals) => Promise<void>
}

export function PathAnalytics({
  pathId,
  studySessions,
  onUpdateGoals
}: PathAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [metricType, setMetricType] = useState<'performance' | 'time' | 'focus'>('performance')
  const [goals, setGoals] = useState<LearningGoals>({
    dailyStudyTime: 120,
    targetScore: 85,
    focusTarget: 90
  })
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

  const handleGoalUpdate = async (newGoals: LearningGoals) => {
    try {
      await onUpdateGoals(newGoals)
      setGoals(newGoals)
      toast({
        title: "Goals Updated",
        description: "Your learning goals have been successfully updated.",
      })
    } catch (updateError) {
      console.error('Failed to update goals:', updateError)
      toast({
        title: "Error",
        description: "Failed to update goals. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Learning Analytics</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('week')}
              className={timeRange === 'week' ? 'bg-primary text-white' : ''}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('month')}
              className={timeRange === 'month' ? 'bg-primary text-white' : ''}
            >
              Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('year')}
              className={timeRange === 'year' ? 'bg-primary text-white' : ''}
            >
              Year
            </Button>
          </div>
        </div>

        {/* Goals Section */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Study Time</p>
                <h3 className="text-2xl font-bold">{goals.dailyStudyTime}min</h3>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleGoalUpdate({
                ...goals,
                dailyStudyTime: goals.dailyStudyTime + 15
              })}
            >
              Increase Goal
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Target Score</p>
                <h3 className="text-2xl font-bold">{goals.targetScore}%</h3>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleGoalUpdate({
                ...goals,
                targetScore: Math.min(goals.targetScore + 5, 100)
              })}
            >
              Increase Goal
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Focus Target</p>
                <h3 className="text-2xl font-bold">{goals.focusTarget}%</h3>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleGoalUpdate({
                ...goals,
                focusTarget: Math.min(goals.focusTarget + 5, 100)
              })}
            >
              Increase Goal
            </Button>
          </Card>
        </div>

        {/* Analytics Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Performance Trends</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMetricType('performance')}
                className={metricType === 'performance' ? 'bg-primary text-white' : ''}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMetricType('time')}
                className={metricType === 'time' ? 'bg-primary text-white' : ''}
              >
                <Clock className="h-4 w-4 mr-2" />
                Study Time
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMetricType('focus')}
                className={metricType === 'focus' ? 'bg-primary text-white' : ''}
              >
                <Brain className="h-4 w-4 mr-2" />
                Focus
              </Button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0091ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0091ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0091ff"
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
} 