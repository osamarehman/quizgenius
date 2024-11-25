'use client'

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from 'framer-motion'
import { learningPathService, type PathStage } from '@/lib/services/learningPathService'
import { useUser } from '@/lib/stores/useUser'
import {
  Trophy,
  Star,
  Target,
  Book,
  Clock,
  Lock,
  Check,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface LearningPathProgressProps {
  pathId: string
}

export function LearningPathProgress({ pathId }: LearningPathProgressProps) {
  const [pathData, setPathData] = useState<{
    currentLevel: number
    totalXP: number
    completedStages: number
    stages: PathStage[]
  } | null>(null)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const { profile } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (profile) {
      loadPathProgress()
    }
  }, [profile, pathId])

  const loadPathProgress = async () => {
    try {
      const progress = await learningPathService.getUserProgress(profile!.id, pathId)
      setPathData(progress)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load learning path progress",
        variant: "destructive",
      })
    }
  }

  if (!pathData) {
    return <div>Loading...</div>
  }

  const { currentLevel, totalXP, stages } = pathData

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Level {currentLevel}</h2>
            <p className="text-sm text-muted-foreground">
              {totalXP % 1000} / 1000 XP to next level
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold">{totalXP} XP</span>
          </div>
        </div>
        <Progress value={(totalXP % 1000) / 10} />
      </Card>

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "p-4 transition-colors",
                stage.status === 'locked' ? 'opacity-50' : '',
                stage.status === 'completed' ? 'bg-primary/5' : ''
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  stage.status === 'completed' ? 'bg-green-500/10' : 'bg-primary/10'
                )}>
                  {stage.status === 'completed' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : stage.status === 'locked' ? (
                    <Lock className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Star className="h-5 w-5 text-primary" />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedStage(
                        expandedStage === stage.id ? null : stage.id
                      )}
                    >
                      {expandedStage === stage.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {expandedStage === stage.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4">
                          {/* Requirements */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">Requirements</h4>
                            <div className="space-y-2">
                              {stage.requirements.map((req, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span className="text-sm">
                                    {req.type}: {req.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Rewards */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">Rewards</h4>
                            <div className="space-y-2">
                              {stage.rewards.map((reward, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm">
                                    {reward.value} {reward.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {stage.status === 'available' && (
                            <Button className="w-full mt-4">
                              Start {stage.type}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {stage.status !== 'locked' && (
                    <Progress value={stage.progress} />
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 