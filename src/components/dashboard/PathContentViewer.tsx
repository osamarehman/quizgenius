'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from "@/hooks/use-toast"
import { learningPathService } from '@/lib/services/learningPathService'
import {
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Timer,
  Bookmark
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface PathContentViewerProps {
  content: {
    id: string
    type: 'video' | 'reading' | 'quiz'
    title: string
    description: string
    duration: number
    content_url: string
    completed: boolean
    progress: number
  }
  onComplete: () => void
  onProgress: (progress: number) => void
  onSaveNote?: (note: string) => void
  onBookmark?: () => void
  previousNotes?: string[]
}

export function PathContentViewer({ 
  content, 
  onComplete, 
  onProgress,
  onSaveNote,
  onBookmark,
  previousNotes = []
}: PathContentViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const { toast } = useToast()
  const [currentNote, setCurrentNote] = useState('')
  const [showPreviousNotes, setShowPreviousNotes] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
    const progress = (time / content.duration) * 100
    onProgress(progress)

    if (progress >= 90 && !content.completed) {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      await learningPathService.markContentComplete(content.id)
      onComplete()
      toast({
        title: "Success",
        description: "Content completed successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark content as complete",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

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
  }, [isPlaying])

  const [qualities] = useState(['1080p', '720p', '480p', '360p'])
  const [currentQuality, setCurrentQuality] = useState('720p')

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {content.type === 'video' && <Video className="h-5 w-5 text-primary" />}
            {content.type === 'reading' && <FileText className="h-5 w-5 text-primary" />}
            {content.type === 'quiz' && <BookOpen className="h-5 w-5 text-primary" />}
            <h2 className="text-xl font-semibold">{content.title}</h2>
          </div>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
        {content.completed && (
          <CheckCircle className="h-6 w-6 text-green-500" />
        )}
      </div>

      {/* Content Viewer */}
      <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden">
        {content.type === 'video' && (
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              src={content.content_url}
              className="w-full h-full object-cover"
              onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
              onEnded={handleComplete}
              playbackRate={playbackSpeed}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <Progress value={(currentTime / content.duration) * 100} />
                  </div>
                  <div className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(content.duration)}
                  </div>
                </div>

                {/* Video Controls */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    {/* Playback Speed */}
                    <Select
                      value={playbackSpeed.toString()}
                      onValueChange={(value) => handleSpeedChange(parseFloat(value))}
                    >
                      <SelectTrigger className="w-[100px] bg-black/20 border-0">
                        <SelectValue placeholder="Speed" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <SelectItem key={speed} value={speed.toString()}>
                            {speed}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Quality Selection */}
                    <Select
                      value={currentQuality}
                      onValueChange={setCurrentQuality}
                    >
                      <SelectTrigger className="w-[100px] bg-black/20 border-0">
                        <SelectValue placeholder="Quality" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualities.map((quality) => (
                          <SelectItem key={quality} value={quality}>
                            {quality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white"
                      onClick={onBookmark}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white"
                      onClick={() => setShowNotes(!showNotes)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {content.type === 'reading' && (
          <div className="p-6">
            <iframe
              src={content.content_url}
              className="w-full h-full border-0"
              onLoad={() => handleTimeUpdate(content.duration)}
            />
          </div>
        )}
      </div>

      {/* Notes Section */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Notes</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviousNotes(!showPreviousNotes)}
                >
                  {showPreviousNotes ? 'Hide Previous' : 'Show Previous'}
                </Button>
              </div>

              {showPreviousNotes && previousNotes.length > 0 && (
                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Previous Notes</h4>
                  {previousNotes.map((note, index) => (
                    <Card key={index} className="p-2 bg-muted">
                      <p className="text-sm">{note}</p>
                    </Card>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="w-full h-32 p-2 border rounded-md"
                  placeholder="Take notes here..."
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (currentNote.trim() && onSaveNote) {
                      onSaveNote(currentNote)
                      setCurrentNote('')
                      toast({
                        title: "Success",
                        description: "Note saved successfully",
                      })
                    }
                  }}
                >
                  Save Note
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {formatTime(content.duration)} remaining
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeUpdate(0)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
          {!content.completed && (
            <Button
              size="sm"
              onClick={handleComplete}
            >
              Mark as Complete
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
} 