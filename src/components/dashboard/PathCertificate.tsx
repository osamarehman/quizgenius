'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Award,
  Download,
  Share2,
  Calendar,
  Clock,
  Trophy
} from 'lucide-react'

interface PathCertificateProps {
  pathId: string
  completion: {
    completedAt: string
    timeSpent: number
    score: number
    level: number
  }
  onDownload: () => void
  onShare: () => void
}

export function PathCertificate({
  pathId,
  completion,
  onDownload,
  onShare
}: PathCertificateProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Certificate</h2>
          <Award className="h-6 w-6 text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Completed</span>
            </div>
            <p className="font-medium">
              {new Date(completion.completedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time Spent</span>
            </div>
            <p className="font-medium">{formatTime(completion.timeSpent)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Final Score</span>
            </div>
            <p className="font-medium">{completion.score}%</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>Level Achieved</span>
            </div>
            <p className="font-medium">{completion.level}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  )
} 