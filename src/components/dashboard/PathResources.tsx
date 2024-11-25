'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Video,
  Link as LinkIcon,
  Search,
  Filter
} from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Resource {
  id: string
  title: string
  type: 'document' | 'video' | 'link' | 'book'
  url: string
  format?: string
  size?: string
  duration?: string
  description?: string
  tags: string[]
}

interface PathResourcesProps {
  resources: Resource[]
  onResourceClick: (resource: Resource) => void
}

export function PathResources({ resources, onResourceClick }: PathResourcesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')

  const allTags = Array.from(
    new Set(resources.flatMap(resource => resource.tags))
  )

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesTag = selectedTag === 'all' || resource.tags.includes(selectedTag)
    
    return matchesSearch && matchesType && matchesTag
  })

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'link':
        return <LinkIcon className="h-5 w-5" />
      case 'book':
        return <BookOpen className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Learning Resources</h2>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Resource type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="link">Links</SelectItem>
              <SelectItem value="book">Books</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <Card
              key={resource.id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onResourceClick(resource)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium truncate">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {resource.format && (
                      <Badge variant="outline">{resource.format}</Badge>
                    )}
                    {resource.size && (
                      <Badge variant="outline">{resource.size}</Badge>
                    )}
                    {resource.duration && (
                      <Badge variant="outline">{resource.duration}</Badge>
                    )}
                    {resource.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  )
} 