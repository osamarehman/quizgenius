'use client'

import { Flame, TrendingUp, Target, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function DashboardHeader() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, John!</h1>
          <p className="text-muted-foreground">Here&apos;s your learning progress</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
          <Flame className="h-5 w-5" />
          <span className="font-semibold">7 Day Streak!</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStatCard 
          title="Today's Progress"
          value="85%"
          trend="+5%"
          icon={TrendingUp}
          trendDirection="up"
        />
        <QuickStatCard 
          title="Weekly Goal"
          value="12/15"
          trend="3 to go"
          icon={Target}
          trendDirection="neutral"
        />
        <QuickStatCard 
          title="Study Time"
          value="2h 15m"
          trend="+45m"
          icon={Clock}
          trendDirection="up"
        />
      </div>
      <p className="text-sm text-muted-foreground">Let&apos;s continue your learning journey!</p>
    </div>
  )
}

interface QuickStatCardProps {
  title: string
  value: string
  trend: string
  icon: React.ElementType
  trendDirection: 'up' | 'down' | 'neutral'
}

function QuickStatCard({ title, value, trend, icon: Icon, trendDirection }: QuickStatCardProps) {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-blue-600'
  }[trendDirection]

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-sm ${trendColor}`}>{trend}</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
} 