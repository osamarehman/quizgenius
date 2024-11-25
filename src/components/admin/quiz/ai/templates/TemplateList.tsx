'use client'

import { Card } from "@/components/ui/card"
import { PromptTemplate } from '@/lib/ai/types'
import { formatDistanceToNow } from 'date-fns'

interface TemplateListProps {
  templates: PromptTemplate[]
  searchQuery: string
  onSelect: (id: string) => void
  selectedId: string | null
}

export function TemplateList({
  templates,
  searchQuery,
  onSelect,
  selectedId
}: TemplateListProps) {
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {filteredTemplates.map((template) => (
        <Card
          key={template.id}
          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
            selectedId === template.id ? 'border-primary' : ''
          }`}
          onClick={() => onSelect(template.id)}
        >
          <div className="space-y-1">
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Updated {formatDistanceToNow(new Date(template.updatedAt))} ago
              </span>
              {template.isCustom && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Custom
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}

      {filteredTemplates.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No templates found
        </div>
      )}
    </div>
  )
} 