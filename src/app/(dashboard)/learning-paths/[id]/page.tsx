'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { learningPathService } from '@/lib/services/learningPathService'
import { LearningPathProgress } from '@/components/dashboard/LearningPathProgress'
import { useUser } from '@/lib/stores/useUser'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  BookOpen,
  Trophy,
  Clock,
  Users,
  ArrowLeft,
  Star,
  Target
} from 'lucide-react'

interface PathDetails {
  id: string
  title: string
  description: string
  category: {
    name: string
  }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
  totalStages: number
  enrolledCount: number
  rating?: number
  userProgress?: {
    completedStages: number
    lastAccessed?: string
  }
  stages: Array<{
    id: string
    title: string
    type: 'video' | 'reading' | 'quiz'
    status: 'locked' | 'available' | 'completed'
    progress: number
  }>
}

export default function PathDetailsPage() {
  const params = useParams()
  const pathId = params?.id as string
  const [pathData, setPathData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { profile } = useUser()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (pathId) {
      loadPathDetails()
    }
  }, [pathId])

  const loadPathDetails = async () => {
    try {
      const details = await learningPathService.getPathDetails(pathId)
      setPathData(details)
    } catch (error: any) {
      console.error('Error loading path details:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load path details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnrollment = async () => {
    if (!profile) {
      router.push('/auth')
      return
    }

    try {
      await learningPathService.enrollInPath(profile.id, pathId)
      toast({
        title: "Success",
        description: "Successfully enrolled in learning path",
      })
      loadPathDetails()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enroll in path",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!pathData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Path not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Learning Paths
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">
                    {pathData.category.name}
                  </Badge>
                  <Badge className={
                    pathData.difficulty === 'beginner' ? 'bg-green-500/10 text-green-500' :
                    pathData.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-purple-500/10 text-purple-500'
                  }>
                    {pathData.difficulty.toUpperCase()}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{pathData.title}</h1>
                <p className="text-muted-foreground">{pathData.description}</p>
              </div>
              {pathData.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{pathData.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">{pathData.estimatedHours}h</span>
                </div>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">{pathData.totalStages}</span>
                </div>
                <p className="text-sm text-muted-foreground">Stages</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">{pathData.enrolledCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
              </div>
            </div>

            {!pathData.userProgress && (
              <Button 
                className="w-full mt-4"
                onClick={handleEnrollment}
              >
                Start Learning Path
              </Button>
            )}
          </Card>

          {pathData.userProgress && (
            <LearningPathProgress pathId={pathId} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add sidebar components here */}
        </div>
      </div>
    </div>
  )
}