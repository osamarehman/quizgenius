'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  Trophy,
  Target,
  ChevronRight,
  Calendar
} from 'lucide-react'

interface PathStageProgress {
  id: string
  title: string
  type: 'video' | 'reading' | 'quiz'
  status: 'locked' | 'available' | 'completed'
  progress: number
  completedAt?: string
  timeSpent?: number
  score?: number
}

interface PathProgressTrackerProps {
  stages: PathStageProgress[]
  currentStageId: string
  onStageSelect: (stageId: string) => void
}

export function PathProgressTracker({
  stages,
  currentStageId,
  onStageSelect
}: PathProgressTrackerProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null)

  const getStageIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Clock className="h-4 w-4" />
      case 'quiz':
        return <Target className="h-4 w-4" />
      case 'reading':
        return <Calendar className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500'
      case 'available':
        return 'bg-blue-500/10 text-blue-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const totalProgress = stages.reduce((acc, stage) => acc + stage.progress, 0) / stages.length

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Overall Progress</h3>
            <span className="text-sm font-medium">{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} />
        </div>

        {/* Stages List */}
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={false}
              animate={{ height: expandedStage === stage.id ? 'auto' : '60px' }}
              className="overflow-hidden"
            >
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${
                  currentStageId === stage.id ? 'border-primary' : ''
                }`}
                onClick={() => {
                  if (stage.status !== 'locked') {
                    onStageSelect(stage.id)
                  }
                  setExpandedStage(expandedStage === stage.id ? null : stage.id)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(stage.status)}`}>
                      {stage.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        getStageIcon(stage.type)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Stage {index + 1}</span>
                        <Badge variant="outline">{stage.type}</Badge>
                      </div>
                      <h4 className="font-medium">{stage.title}</h4>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedStage === stage.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Expanded Content */}
                {expandedStage === stage.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <Progress value={stage.progress} className="mt-1" />
                      </div>
                      {stage.score && (
                        <div>
                          <p className="text-sm text-muted-foreground">Score</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{stage.score}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {stage.status === 'available' && (
                      <Button 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStageSelect(stage.id)
                        }}
                      >
                        {stage.progress > 0 ? 'Continue' : 'Start'} Stage
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
} 