'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { History, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { createTemplateVersion, getTemplateVersions } from '@/lib/ai/promptTemplates/versionManager'
import { formatDistanceToNow } from 'date-fns'
import { PromptTemplate } from '@/lib/ai/types'

interface TemplateVersioningProps {
  templateId: string
  onVersionSelect: (version: PromptTemplate) => void
}

interface VersionHistory {
  version: number
  changes: string
  createdAt: string
  createdBy: string
}

export function TemplateVersioning({ templateId, onVersionSelect }: TemplateVersioningProps) {
  const [versions, setVersions] = useState<PromptTemplate[]>([])
  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [changeNotes, setChangeNotes] = useState('')
  const [expandedVersions, setExpandedVersions] = useState(false)
  const { toast } = useToast()

  const loadVersions = async () => {
    try {
      const versionHistory = await getTemplateVersions(templateId)
      setVersions(versionHistory)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive",
      })
    }
  }

  const createNewVersion = async () => {
    try {
      setIsCreatingVersion(true)
      const newVersion = await createTemplateVersion(templateId, changeNotes)
      setVersions(prev => [...prev, newVersion])
      setChangeNotes('')
      toast({
        title: "Success",
        description: "New version created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive",
      })
    } finally {
      setIsCreatingVersion(false)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h3 className="font-medium">Version History</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedVersions(!expandedVersions)}
        >
          {expandedVersions ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {expandedVersions && (
        <div className="space-y-4">
          {/* Create New Version */}
          <div className="space-y-2">
            <Label>Change Notes</Label>
            <Textarea
              placeholder="Describe your changes..."
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
            />
            <Button
              onClick={createNewVersion}
              disabled={isCreatingVersion || !changeNotes.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save New Version
            </Button>
          </div>

          {/* Version List */}
          <div className="space-y-2">
            {versions.map((version, index) => {
              const metadata = version.metadata as { versionHistory: VersionHistory }
              const history = metadata?.versionHistory || []
              
              return (
                <Card
                  key={version.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => onVersionSelect(version)}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          Version {versions.length - index}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(version.created_at))} ago
                        </p>
                      </div>
                      {index === 0 && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    {history[0] && (
                      <p className="text-sm mt-2">
                        {history[0].changes}
                      </p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
} 