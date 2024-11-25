'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Brain
} from 'lucide-react'

interface Prerequisite {
  id: string
  title: string
  type: 'path' | 'skill' | 'knowledge'
  completed: boolean
  progress?: number
}

interface PathPrerequisitesProps {
  pathId: string
  prerequisites: Prerequisite[]
  requiredLevel: number
  userLevel: number
}

export function PathPrerequisites({
  pathId,
  prerequisites,
  requiredLevel,
  userLevel
}: PathPrerequisitesProps) {
  const isLevelMet = userLevel >= requiredLevel
  const prerequisitesMet = prerequisites.every(p => p.completed)
  const canStart = isLevelMet && prerequisitesMet

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Prerequisites</h2>
          {canStart ? (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Ready to Start
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-4 w-4" />
              Prerequisites Required
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {/* Level Requirement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span>Required Level</span>
              </div>
              {isLevelMet ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Your Level: {userLevel}</span>
              <span>Required: {requiredLevel}</span>
            </div>
            <Progress 
              value={(userLevel / requiredLevel) * 100} 
              className={isLevelMet ? "bg-green-500" : ""}
            />
          </div>

          {/* Prerequisites List */}
          <div className="space-y-3">
            {prerequisites.map((prerequisite) => (
              <div key={prerequisite.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{prerequisite.title}</span>
                  </div>
                  {prerequisite.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                {prerequisite.progress !== undefined && (
                  <>
                    <Progress 
                      value={prerequisite.progress} 
                      className={prerequisite.completed ? "bg-green-500" : ""}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {prerequisite.progress}% Complete
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
} 