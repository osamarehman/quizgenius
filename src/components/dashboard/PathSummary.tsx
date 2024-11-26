'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAchievements } from "@/contexts/AchievementContext"
import {
  BookOpen,
  Clock,
  Trophy,
  Brain,
  TrendingUp,
  Calendar,
  CheckCircle2
} from 'lucide-react'

interface StudyMetrics {
  totalTime: number
  completedStages: number
  totalStages: number
  averageScore: number
  lastStudied: string
  streak: number
  masteredTopics: string[]
  upcomingReviews: number
}

interface PathSummaryProps {
  pathId: string
  title: string
  metrics: StudyMetrics
  onStartStudy: () => void
  onReviewContent: () => void
}

export function PathSummary({
  pathId,
  title,
  metrics,
  onStartStudy,
  onReviewContent
}: PathSummaryProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const { checkAchievement } = useAchievements()
  const { toast } = useToast()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleStartStudy = async () => {
    try {
      await onStartStudy()
      
      // Check for study streak achievements
      if (metrics.streak > 0) {
        await checkAchievement('STUDY_STREAK', {
          pathId,
          streakDays: metrics.streak,
          totalStudyTime: metrics.totalTime
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start study session",
        variant: "destructive",
      })
    }
  }

  const getMetricColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-500'
    if (value >= threshold * 0.7) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground">
              Learning Path Progress Summary
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onReviewContent}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Review
            </Button>
            <Button onClick={handleStartStudy}>
              <Brain className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">
              {metrics.completedStages} / {metrics.totalStages} stages
            </span>
          </div>
          <Progress 
            value={(metrics.completedStages / metrics.totalStages) * 100} 
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className={`p-4 cursor-pointer transition-colors ${
              selectedMetric === 'time' ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedMetric('time')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-lg font-bold">{formatTime(metrics.totalTime)}</p>
              </div>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-colors ${
              selectedMetric === 'score' ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedMetric('score')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className={`text-lg font-bold ${getMetricColor(metrics.averageScore, 80)}`}>
                  {metrics.averageScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-colors ${
              selectedMetric === 'streak' ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedMetric('streak')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-lg font-bold">{metrics.streak} days</p>
              </div>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-colors ${
              selectedMetric === 'mastery' ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedMetric('mastery')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mastered Topics</p>
                <p className="text-lg font-bold">{metrics.masteredTopics.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Selected Metric Details */}
        {selectedMetric && (
          <Card className="p-4 bg-muted/50">
            {selectedMetric === 'time' && (
              <div className="space-y-4">
                <h3 className="font-medium">Study Time Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Study Session</p>
                    <p className="font-medium">{new Date(metrics.lastStudied).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Session Length</p>
                    <p className="font-medium">{formatTime(metrics.totalTime / metrics.completedStages)}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'mastery' && (
              <div className="space-y-4">
                <h3 className="font-medium">Mastered Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {metrics.masteredTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add more metric details as needed */}
          </Card>
        )}

        {/* Upcoming Reviews */}
        {metrics.upcomingReviews > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>
                {metrics.upcomingReviews} topics due for review
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onReviewContent}>
              Start Review
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
} 