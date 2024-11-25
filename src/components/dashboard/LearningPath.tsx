'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, Star, Lock, Check, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PathStage {
  id: string
  title: string
  description: string
  type: 'quiz' | 'lesson' | 'challenge'
  status: 'locked' | 'available' | 'completed'
  progress: number
  requirements: {
    type: string
    value: number
  }[]
  rewards: {
    type: string
    value: number
    icon: string
  }[]
}

interface LearningPathProps {
  stages: PathStage[]
  currentLevel: number
  totalXP: number
}

export function LearningPath({ stages, currentLevel, totalXP }: LearningPathProps) {
  const router = useRouter()

  const getStageIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <BookOpen className="h-5 w-5" />
      case 'challenge':
        return <Trophy className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'available':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Learning Path</h2>
          <p className="text-sm text-muted-foreground">Level {currentLevel}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{totalXP} XP</p>
          <Progress value={(totalXP % 1000) / 10} className="w-32" />
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`relative p-4 border rounded-lg ${
              stage.status === 'locked' ? 'opacity-50' : ''
            }`}
          >
            {/* Connection Line */}
            {index < stages.length - 1 && (
              <div className="absolute left-7 bottom-0 w-0.5 h-4 bg-border -mb-4 z-0" />
            )}

            <div className="flex items-start gap-4 relative z-10">
              <div className={`p-2 rounded-lg ${getStatusColor(stage.status)} bg-opacity-10`}>
                {stage.status === 'completed' ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : stage.status === 'locked' ? (
                  <Lock className="h-5 w-5 text-gray-500" />
                ) : (
                  getStageIcon(stage.type)
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {stage.type.toUpperCase()}
                  </Badge>
                </div>

                {stage.status !== 'locked' && (
                  <>
                    <Progress value={stage.progress} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="space-x-2">
                        {stage.requirements.map((req, i) => (
                          <span key={i}>
                            {req.type}: {req.value}
                          </span>
                        ))}
                      </div>
                      <div className="space-x-2">
                        {stage.rewards.map((reward, i) => (
                          <span key={i}>
                            +{reward.value} {reward.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {stage.status === 'available' && (
                  <Button
                    className="mt-2"
                    onClick={() => {
                      if (stage.type === 'quiz') {
                        router.push(`/quizzes/${stage.id}`)
                      } else {
                        router.push(`/lessons/${stage.id}`)
                      }
                    }}
                  >
                    Start {stage.type}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 