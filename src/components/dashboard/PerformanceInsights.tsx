'use client'

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SubjectPerformance {
  subject: string
  score: number
  trend: 'up' | 'down' | 'stable'
  improvement: number
}

interface PerformanceInsightsProps {
  subjects: SubjectPerformance[]
}

export function PerformanceInsights({ subjects }: PerformanceInsightsProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Performance Insights</h2>
      
      <div className="space-y-4">
        {subjects.map((subject) => (
          <div key={subject.subject} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{subject.subject}</p>
                <div className="flex items-center gap-2">
                  {getTrendIcon(subject.trend)}
                  <span className="text-sm text-muted-foreground">
                    {subject.improvement > 0 && '+'}
                    {subject.improvement}% from last week
                  </span>
                </div>
              </div>
              <span className="font-medium">{subject.score}%</span>
            </div>
            <Progress value={subject.score} />
          </div>
        ))}
      </div>
    </Card>
  )
} 