'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { usePromptTemplates } from '@/lib/ai/promptTemplates/store'
import { Save, Eye, RotateCcw } from 'lucide-react'

interface TemplateEditorProps {
  templateId: string
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const { templates, updateTemplate } = usePromptTemplates()
  const [isPreview, setIsPreview] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const template = templates.find(t => t.id === templateId)
  const [editedTemplate, setEditedTemplate] = useState(template)

  if (!template) return null

  const handleSave = async () => {
    try {
      await updateTemplate(templateId, editedTemplate)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Template updated successfully",
      })
    } catch (updateError) {
      console.error('Failed to update template:', updateError)
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setEditedTemplate(template)
    setIsEditing(false)
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          {isEditing ? (
            <Input
              value={editedTemplate.name}
              onChange={(e) => setEditedTemplate({
                ...editedTemplate,
                name: e.target.value
              })}
              className="font-medium text-lg"
            />
          ) : (
            <h3 className="font-medium text-lg">{template.name}</h3>
          )}
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          {template.isCustom && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Save' : 'Edit'}
              </Button>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isEditing && (
          <div>
            <Label>Description</Label>
            <Input
              value={editedTemplate.description}
              onChange={(e) => setEditedTemplate({
                ...editedTemplate,
                description: e.target.value
              })}
            />
          </div>
        )}

        <div>
          <Label>Template Content</Label>
          {isPreview ? (
            <pre className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
              {editedTemplate.template}
            </pre>
          ) : (
            <Textarea
              value={editedTemplate.template}
              onChange={(e) => setEditedTemplate({
                ...editedTemplate,
                template: e.target.value
              })}
              disabled={!isEditing}
              className="mt-2 font-mono min-h-[300px]"
            />
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
} 