'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePromptTemplates } from '@/lib/ai/promptTemplates/store'
import { TemplateList } from './TemplateList'
import { TemplateEditor } from './TemplateEditor'
import { TemplateSharing } from './TemplateSharing'
import { TemplateAnalytics } from './TemplateAnalytics'
import { Plus } from 'lucide-react'

type TabValue = 'my-templates' | 'shared' | 'analytics'

export function TemplateManagement() {
  const [activeTab, setActiveTab] = useState<TabValue>('my-templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const { templates } = usePromptTemplates()

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Template Management</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-templates">My Templates</TabsTrigger>
            <TabsTrigger value="shared">Shared Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <TabsContent value="my-templates" className="mt-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <TemplateList
                  templates={templates}
                  searchQuery={searchQuery}
                  onSelect={setSelectedTemplateId}
                  selectedId={selectedTemplateId}
                />
              </div>
              <div className="col-span-2">
                {selectedTemplateId ? (
                  <TemplateEditor templateId={selectedTemplateId} />
                ) : (
                  <Card className="p-6 text-center text-muted-foreground">
                    Select a template to edit
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shared" className="mt-6">
            <TemplateSharing />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <TemplateAnalytics />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
} 