'use client'

import React, { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { learningPathService } from '@/lib/services/learningPathService'
import { useUser } from '@/lib/stores/useUser'
import {
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronRight,
  Loader2
} from 'lucide-react'

interface PathCardProps {
  path: {
    id: string
    title: string
    description: string
    category: {
      name: string
    }
    difficulty: string
    estimatedHours: number
    totalStages: number
    enrolledCount: number
    rating?: number
    userProgress?: {
      completedStages: number
      lastAccessed?: string
    }
  }
}

export function PathCard({ path }: PathCardProps) {
  const router = useRouter()
  const { profile } = useUser()
  const { toast } = useToast()
  const [isEnrolling, setIsEnrolling] = useState(false)

  const handleStartLearning = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!profile) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to start learning",
        variant: "destructive",
      })
      router.push('/auth')
      return
    }

    try {
      setIsEnrolling(true)

      // Check if already enrolled using profiles
      const isEnrolled = await learningPathService.isEnrolled(profile.id, path.id)

      if (isEnrolled) {
        // If already enrolled, just navigate
        router.push(`/dashboard/learning-paths/${path.id}`)
        return
      }

      // Otherwise, enroll first
      await learningPathService.enrollInPath(profile.id, path.id)
      
      toast({
        title: "Success",
        description: "Successfully enrolled in learning path",
      })

      // Use replace to prevent going back to enrollment state
      router.replace(`/dashboard/learning-paths/${path.id}`)
    } catch (error: any) {
      console.error('Error enrolling in path:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in path",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <div className="flex gap-2 mb-2">
            <Badge variant="outline">
              {path.category.name}
            </Badge>
            <Badge className={
              path.difficulty === 'beginner' ? 'bg-green-500/10 text-green-500' :
              path.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-500' :
              'bg-purple-500/10 text-purple-500'
            }>
              {path.difficulty.toUpperCase()}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold">{path.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {path.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {path.estimatedHours}h
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {path.totalStages} stages
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {path.enrolledCount}
          </div>
        </div>

        {path.userProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                {path.userProgress.completedStages}/{path.totalStages} stages
              </span>
            </div>
            <Progress 
              value={(path.userProgress.completedStages / path.totalStages) * 100} 
            />
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{path.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <Button 
            onClick={handleStartLearning}
            disabled={isEnrolling}
          >
            {isEnrolling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {path.userProgress ? 'Opening...' : 'Enrolling...'}
              </>
            ) : (
              <>
                {path.userProgress ? 'Continue Learning' : 'Start Learning'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
} 