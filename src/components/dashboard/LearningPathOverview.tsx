'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { learningPathService } from '@/lib/services/learningPathService'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Trophy,
  Clock,
  Star,
  ChevronRight,
  Users,
  BarChart
} from 'lucide-react'

interface LearningPathOverviewProps {
  userId: string
}

export function LearningPathOverview({ userId }: LearningPathOverviewProps) {
  const [paths, setPaths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadPaths()
  }, [userId])

  const loadPaths = async () => {
    try {
      const availablePaths = await learningPathService.getAvailablePaths()
      setPaths(availablePaths)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load learning paths",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500'
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-500'
      case 'advanced':
        return 'bg-purple-500/10 text-purple-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Featured Paths */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.filter(path => path.featured).map((path) => (
            <motion.div
              key={path.id}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => router.push(`/learning-paths/${path.id}`)}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty.toUpperCase()}
                    </Badge>
                    <h3 className="text-lg font-semibold mt-2">{path.title}</h3>
                    <p className="text-sm text-muted-foreground">{path.category.name}</p>
                  </div>
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>

                <div className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {path.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{path.stages.count} stages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{path._count?.enrolled || 0} enrolled</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {path.user_progress?.completed_stages || 0}/{path.stages.count}
                      </span>
                    </div>
                    <Progress 
                      value={((path.user_progress?.completed_stages || 0) / path.stages.count) * 100} 
                    />
                  </div>
                </div>

                <Button className="w-full mt-4">
                  {path.user_progress ? 'Continue Learning' : 'Start Learning'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Paths */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">All Learning Paths</h2>
          <div className="flex gap-2">
            {/* Add filters here */}
          </div>
        </div>

        <div className="space-y-4">
          {paths.map((path) => (
            <motion.div
              key={path.id}
              whileHover={{ scale: 1.01 }}
              className="cursor-pointer"
              onClick={() => router.push(`/learning-paths/${path.id}`)}
            >
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{path.category.name}</Badge>
                    </div>

                    <h3 className="text-lg font-semibold">{path.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {path.description}
                    </p>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm">{path.stages.count} stages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{path.estimated_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">
                          {path._count?.enrolled || 0} enrolled
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">
                          {path.rating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {path.user_progress && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <BarChart className="h-4 w-4" />
                          <span>
                            {path.user_progress.completed_stages}/{path.stages.count} completed
                          </span>
                        </div>
                        <Progress 
                          value={
                            (path.user_progress.completed_stages / path.stages.count) * 100
                          } 
                          className="w-32"
                        />
                      </div>
                    )}
                    <Button>
                      {path.user_progress ? 'Continue Learning' : 'Start Learning'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 