'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'text' | 'audio';
  content: string;
  duration?: number;
  notes?: string[];
}

interface ContentData {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  duration?: number;
}

interface PathContentViewerProps {
  content: ContentItem;
  onComplete: () => void
  onProgress: (progress: number) => void
  onSaveNote?: (note: string) => void;
  onBookmark?: (contentId: string) => void;
  previousNotes?: string[];
}

export function PathContentViewer({ 
  content, 
  onComplete, 
  onProgress
}: PathContentViewerProps) {
  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const videoRef = useRef<HTMLVideoElement>(null)

  const loadContent = useCallback(async () => {
    try {
      let data
      switch (content.type) {
        case 'quiz':
          const { data: quiz } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', content.id)
            .single()
          data = quiz
          break

        case 'video':
          const { data: video } = await supabase
            .from('videos')
            .select('*')
            .eq('id', content.id)
            .single()
          data = video
          break

        case 'text':
          const { data: text } = await supabase
            .from('text_content')
            .select('*')
            .eq('id', content.id)
            .single()
          data = text
          break

        case 'resource':
          const { data: resource } = await supabase
            .from('resources')
            .select('*')
            .eq('id', content.id)
            .single()
          data = resource
          break
      }

      if (data) {
        setContentData(data)
      }
    } catch (error) {
      console.error('Error loading content:', error)
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [content.id, content.type, supabase, toast])

  const updateProgress = useCallback(async (newProgress: number) => {
    try {
      await supabase
        .from('user_content_progress')
        .upsert({
          content_id: content.id,
          progress: newProgress,
          last_accessed: new Date().toISOString()
        })

      setProgress(newProgress)

      if (newProgress === 100) {
        onComplete()
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    }
  }, [content.id, onComplete, supabase, toast])

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time)
    const progress = (time / contentData?.duration) * 100
    onProgress(progress)

    if (progress >= 90 && progress < 100) {
      updateProgress(Math.round(progress))
    }
  }, [contentData, onProgress, updateProgress])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (content.type === 'video') {
        switch(e.key) {
          case ' ':
            e.preventDefault()
            setIsPlaying(!isPlaying)
            break
          case 'ArrowLeft':
            if (videoRef.current) {
              videoRef.current.currentTime -= 10
            }
            break
          case 'ArrowRight':
            if (videoRef.current) {
              videoRef.current.currentTime += 10
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, content.type])

  if (isLoading || !contentData) {
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
        {content.type === 'quiz' && (
          <div>
            <h3 className="text-lg font-medium">{contentData.title}</h3>
            <p className="text-sm text-muted-foreground">{contentData.description}</p>
            <Progress value={progress} className="mt-4" />
          </div>
        )}

        {content.type === 'video' && (
          <div>
            <h3 className="text-lg font-medium">{contentData.title}</h3>
            <video
              ref={videoRef}
              src={contentData.url}
              controls={false}
              className="w-full mt-4"
              onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
              playbackRate={playbackSpeed}
            />
            <div className="flex items-center gap-4 mt-4">
              <Button
                size="sm"
                variant="ghost"
                className="text-white"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1">
                <Progress value={(currentTime / contentData.duration) * 100} />
              </div>
              <Select
                value={playbackSpeed.toString()}
                onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(contentData.duration)}
              </div>
            </div>
          </div>
        )}

        {content.type === 'text' && (
          <div>
            <h3 className="text-lg font-medium">{contentData.title}</h3>
            <div 
              className="prose mt-4"
              dangerouslySetInnerHTML={{ __html: contentData.content }}
            />
            <Progress value={progress} className="mt-4" />
          </div>
        )}

        {content.type === 'resource' && (
          <div>
            <h3 className="text-lg font-medium">{contentData.title}</h3>
            <p className="text-sm text-muted-foreground">{contentData.description}</p>
            <a
              href={contentData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline mt-2 block"
              onClick={() => updateProgress(100)}
            >
              Open Resource
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}