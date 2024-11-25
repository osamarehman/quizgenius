'use client'

import { QuizMetadata, QuizDifficulty } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings, Clock, Tag } from 'lucide-react'

interface QuizSettingsProps {
  metadata: QuizMetadata
  onMetadataChange: (metadata: QuizMetadata) => void
}

export function QuizSettings({ metadata, onMetadataChange }: QuizSettingsProps) {
  const handleChange = (
    field: keyof QuizMetadata,
    value: string | string[] | number | boolean
  ) => {
    onMetadataChange({
      ...metadata,
      [field]: value,
    })
  }

  return (
    <div className="w-80 border-l bg-muted/10">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Quiz Settings
        </h2>
      </div>

      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-4 space-y-6">
          {/* Time Limit */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Time Limit (minutes)
            </label>
            <Input
              type="number"
              value={metadata.timeLimit}
              onChange={(e) => handleChange('timeLimit', parseInt(e.target.value))}
              min={1}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select
              value={metadata.difficulty}
              onValueChange={(value: QuizDifficulty) => handleChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Publication Status */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Publish Quiz</label>
            <Switch
              checked={metadata.isPublished}
              onCheckedChange={(checked) => handleChange('isPublished', checked)}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button className="w-full">Save Draft</Button>
            <Button variant="outline" className="w-full">Preview</Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 