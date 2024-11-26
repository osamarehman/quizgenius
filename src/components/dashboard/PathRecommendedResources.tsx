'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  Clock
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  type: 'video' | 'article' | 'documentation'
  duration: number
  url: string
  tags: string[]
}

interface PathRecommendedResourcesProps {
  pathId: string
  resources: Resource[]
  onResourceClick: (resource: Resource) => void
}

export function PathRecommendedResources({
  resources,
  onResourceClick
}: PathRecommendedResourcesProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'documentation':
        return <BookOpen className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recommended Resources</h2>

        <div className="space-y-4">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onResourceClick(resource)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div>
                      <h3 className="font-medium line-clamp-2">{resource.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{resource.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  )
} 