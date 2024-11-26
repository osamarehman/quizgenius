'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { usePromptTemplates, PromptTemplate } from '@/lib/ai/promptTemplates/store'
import { Plus, Save, Trash2, Eye } from 'lucide-react'

interface PromptTemplateManagerProps {
  category: PromptTemplate['category']
  context?: string
  onSelect: (template: string) => void
}

export function PromptTemplateManager({
  category,
  context = '',
  onSelect
}: PromptTemplateManagerProps) {
  const { addTemplate, updateTemplate, deleteTemplate, getTemplatesByCategory } = usePromptTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { toast } = useToast()

  const categoryTemplates = getTemplatesByCategory(category)

  const handleCreateTemplate = () => {
    const newTemplate = {
      name: 'New Template',
      description: 'Custom template',
      category,
      template: '',
      isCustom: true
    }
    addTemplate(newTemplate)
  }

  const handleSaveTemplate = (template: PromptTemplate) => {
    updateTemplate(template.id, template)
    setIsEditing(false)
    toast({
      title: "Success",
      description: "Template saved successfully",
    })
  }

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id)
    setSelectedTemplate(null)
    toast({
      title: "Success",
      description: "Template deleted successfully",
    })
  }

  const getPreviewContent = (template: string) => {
    return template.replace('{context}', context)
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Prompt Templates</h3>
          <Button onClick={handleCreateTemplate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Template List */}
          <div className="space-y-2">
            {categoryTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 ${
                  selectedTemplate?.id === template.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  {template.isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTemplate(template.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Template Editor/Preview */}
          {selectedTemplate && (
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  {isEditing ? (
                    <Input
                      value={selectedTemplate.name}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          name: e.target.value
                        })
                      }
                    />
                  ) : (
                    <h4 className="font-medium">{selectedTemplate.name}</h4>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                  {selectedTemplate.isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          handleSaveTemplate(selectedTemplate)
                        } else {
                          setIsEditing(true)
                        }
                      }}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  )}
                </div>
              </div>

              {previewMode ? (
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
                  {getPreviewContent(selectedTemplate.template)}
                </pre>
              ) : (
                <Textarea
                  value={selectedTemplate.template}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      template: e.target.value
                    })
                  }
                  disabled={!isEditing}
                  className="min-h-[200px] font-mono"
                />
              )}

              <Button
                className="w-full"
                onClick={() => onSelect(selectedTemplate.template)}
              >
                Use Template
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 