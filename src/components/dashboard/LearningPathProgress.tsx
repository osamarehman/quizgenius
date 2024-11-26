'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface LearningPathProgressProps {
  pathId: string
  userId: string
}

export function LearningPathProgress({ pathId, userId }: LearningPathProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const loadPathProgress = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: progressData, error: loadError } = await supabase
        .from('learning_path_progress')
        .select('progress')
        .eq('path_id', pathId)
        .eq('user_id', userId)
        .single()

      if (loadError) throw loadError

      setProgress(progressData?.progress || 0)
    } catch (loadError) {
      console.error('Failed to load path progress:', loadError)
      toast({
        title: "Error",
        description: "Failed to load learning path progress",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [pathId, userId, toast, supabase])

  useEffect(() => {
    loadPathProgress()
  }, [loadPathProgress])

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Progress</h3>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </Card>
  )
}