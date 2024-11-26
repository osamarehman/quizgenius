'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Save,
  Search,
  Tag,
  FolderOpen,
  Edit,
  Trash,
  Share2
} from 'lucide-react'

interface StudyNote {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  stageId?: string
  stageName?: string
}

interface PathStudyNotesProps {
  pathId: string
  currentStageId?: string
  notes: StudyNote[]
  onSaveNote: (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onDeleteNote: (noteId: string) => Promise<void>
  onShareNote: (noteId: string) => Promise<void>
}

export function PathStudyNotes({
  currentStageId,
  notes,
  onSaveNote,
  onDeleteNote,
  onShareNote
}: PathStudyNotesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentNote, setCurrentNote] = useState<Partial<StudyNote>>({
    title: '',
    content: '',
    tags: [],
    stageId: currentStageId
  })
  const { toast } = useToast()

  const handleSave = async () => {
    if (!currentNote.title || !currentNote.content) {
      toast({
        title: "Error",
        description: "Please provide both title and content",
        variant: "destructive",
      })
      return
    }

    try {
      await onSaveNote({
        title: currentNote.title,
        content: currentNote.content,
        tags: currentNote.tags || [],
        stageId: currentNote.stageId
      })

      setIsEditing(false)
      setCurrentNote({
        title: '',
        content: '',
        tags: [],
        stageId: currentStageId
      })

      toast({
        title: "Success",
        description: "Note saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save note",
        variant: "destructive",
      })
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.some(tag => note.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Study Notes</h2>
          </div>
          <Button onClick={() => setIsEditing(true)}>
            New Note
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )
                }}
              >
                <Tag className="h-4 w-4 mr-2" />
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Note Editor */}
        {isEditing && (
          <Card className="p-4 border-2 border-primary">
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={currentNote.title}
                onChange={(e) => setCurrentNote(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
              />
              <Textarea
                placeholder="Write your note..."
                value={currentNote.content}
                onChange={(e) => setCurrentNote(prev => ({
                  ...prev,
                  content: e.target.value
                }))}
                rows={6}
              />
              <Input
                placeholder="Add tags (comma separated)..."
                value={currentNote.tags?.join(', ')}
                onChange={(e) => setCurrentNote(prev => ({
                  ...prev,
                  tags: e.target.value.split(',').map(tag => tag.trim())
                }))}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setCurrentNote({
                      title: '',
                      content: '',
                      tags: [],
                      stageId: currentStageId
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{note.title}</h3>
                    {note.stageName && (
                      <p className="text-sm text-muted-foreground">
                        <FolderOpen className="h-4 w-4 inline mr-1" />
                        {note.stageName}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentNote(note)
                        setIsEditing(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShareNote(note.id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteNote(note.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="flex gap-2">
                  {note.tags.map(tag => (
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