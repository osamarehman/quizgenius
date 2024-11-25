'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Brain,
  Lightbulb,
  ArrowRight,
  Clock,
  Star,
  TrendingUp,
  ChevronRight
} from 'lucide-react'

interface StudyResource {
  id: string
  title: string
  type: 'video' | 'article' | 'quiz'
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  relevance: number
  description: string
  tags: string[]
  url: string
}

interface PathRecommendationsProps {
  pathId: string
  currentStageId: string
  userLevel: number
  recommendations: StudyResource[]
  onResourceSelect: (resourceId: string) => void
}

export function PathRecommendations({
  pathId,
  currentStageId,
  userLevel,
  recommendations,
  onResourceSelect
}: PathRecommendationsProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [expandedResource, setExpandedResource] = useState<string | null>(null)

  const filteredResources = recommendations.filter(
    resource => selectedType === 'all' || resource.type === selectedType
  )

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <BookOpen className="h-5 w-5" />
      case 'article':
        return <Brain className="h-5 w-5" />
      case 'quiz':
        return <Star className="h-5 w-5" />
      default:
        return null
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
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recommended Resources</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All
            </Button>
            <Button
              variant={selectedType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('video')}
            >
              Videos
            </Button>
            <Button
              variant={selectedType === 'article' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('article')}
            >
              Articles
            </Button>
            <Button
              variant={selectedType === 'quiz' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('quiz')}
            >
              Practice
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setExpandedResource(
                  expandedResource === resource.id ? null : resource.id
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getDifficultyColor(resource.difficulty)}`}>
                        {getResourceIcon(resource.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{resource.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{resource.duration} min</span>
                          <TrendingUp className="h-4 w-4 ml-2" />
                          <span>{resource.relevance}% relevant</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform ${
                        expandedResource === resource.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  <AnimatePresence>
                    {expandedResource === resource.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {resource.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              onResourceSelect(resource.id)
                            }}
                          >
                            Start Learning
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No {selectedType === 'all' ? '' : selectedType} resources found
          </div>
        )}
      </div>
    </Card>
  )
} 