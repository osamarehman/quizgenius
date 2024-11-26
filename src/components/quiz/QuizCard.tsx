import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, Users } from 'lucide-react'
import Link from 'next/link'

interface QuizCardProps {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  questionCount: number
  completionRate?: number
  participantCount?: number
  href?: string
}

export function QuizCard({
  id,
  title,
  description,
  difficulty,
  timeLimit,
  questionCount,
  completionRate,
  participantCount,
  href = `/quiz/${id}`
}: QuizCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>
            <Badge className={getDifficultyColor(difficulty)}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {timeLimit} min
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {participantCount || 0} participants
            </div>
            <div className="flex items-center">
              <span className="mr-1">•</span>
              {questionCount} questions
            </div>
          </div>

          {completionRate !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} />
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}