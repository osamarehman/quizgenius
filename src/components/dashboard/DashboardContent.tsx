'use client'

import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PerformanceGraph } from './PerformanceGraph'

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className={`p-2 rounded-full ${activity.iconBg} transition-colors group-hover:bg-primary/20`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {UPCOMING_QUIZZES.map((quiz, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{quiz.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.time}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  Start Quiz
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Graph */}
      <PerformanceGraph />
    </div>
  )
}

const RECENT_ACTIVITIES = [
  {
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    iconBg: 'bg-green-500/10',
    title: 'Completed "Advanced Mathematics" quiz',
    time: '2 hours ago'
  },
  {
    icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    iconBg: 'bg-yellow-500/10',
    title: 'Missed daily goal',
    time: '5 hours ago'
  },
  {
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    iconBg: 'bg-green-500/10',
    title: 'Completed daily challenge',
    time: 'Yesterday'
  }
]

const UPCOMING_QUIZZES = [
  {
    title: 'Physics Fundamentals',
    time: 'Today, 3:00 PM'
  },
  {
    title: 'World History',
    time: 'Tomorrow, 11:00 AM'
  },
  {
    title: 'Literature Analysis',
    time: 'In 2 days'
  }
] 