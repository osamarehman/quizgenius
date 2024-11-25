'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Trophy,
  Star,
  Medal,
  Crown,
  Activity,
  TrendingUp
} from 'lucide-react'

interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar?: string
  score: number
  completedStages: number
  totalTime: number
  rank: number
  badges: string[]
}

interface PathCommunityProps {
  pathId: string
  totalEnrolled: number
  averageCompletion: number
  leaderboard: LeaderboardEntry[]
  onViewProfile: (userId: string) => void
}

export function PathCommunity({
  pathId,
  totalEnrolled,
  averageCompletion,
  leaderboard,
  onViewProfile
}: PathCommunityProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="font-medium">#{rank}</span>
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="text-2xl font-bold">{totalEnrolled}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">{averageCompletion}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">
                  {leaderboard.filter(entry => entry.totalTime > 0).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <div className="flex gap-2">
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                This Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                This Month
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

          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <Card
                key={entry.userId}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onViewProfile(entry.userId)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankBadge(entry.rank)}
                  </div>
                  <Avatar>
                    <AvatarImage src={entry.userAvatar} />
                    <AvatarFallback>{entry.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium truncate">{entry.userName}</p>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{entry.score} points</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {entry.completedStages} stages
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(entry.totalTime / 60)}h spent
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={(entry.completedStages / 10) * 100} />
                    </div>
                    {entry.badges.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {entry.badges.map((badge, index) => (
                          <Badge key={index} variant="secondary">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
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