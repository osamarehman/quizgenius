'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Pencil, RotateCcw } from 'lucide-react'

interface PromptStep {
  id: string
  title: string
  defaultPrompt: string
  description: string
}

const defaultPromptSteps: PromptStep[] = [
  {
    id: 'context',
    title: 'Context Analysis',
    defaultPrompt: `Analyze the following study material and identify key concepts, terms, and relationships that should be tested:

Context: {context}

Focus on:
1. Main concepts and theories
2. Important definitions
3. Key relationships between concepts
4. Critical facts and figures`,
    description: 'Initial analysis of the study material to identify testable content'
  },
  {
    id: 'question-generation',
    title: 'Question Generation',
    defaultPrompt: `Based on the identified concepts, generate multiple-choice questions that:
1. Test understanding rather than mere recall
2. Cover different cognitive levels (knowledge, comprehension, application)
3. Are clear and unambiguous
4. Have one definitively correct answer
5. Include plausible distractors based on common misconceptions`,
    description: 'Generation of question text and answer options'
  },
  {
    id: 'explanation',
    title: 'Explanation Generation',
    defaultPrompt: `For each question and its answers, provide:
1. Detailed explanation of the correct answer
2. Reasoning why each distractor is incorrect
3. References to relevant concepts from the material
4. Examples or analogies where appropriate
5. Common misconceptions addressed by the question`,
    description: 'Generation of explanations for questions and answers'
  }
]

interface PromptCustomizationProps {
  onPromptsChange: (prompts: Record<string, string>) => void
}

export function PromptCustomization({ onPromptsChange }: PromptCustomizationProps) {
  const [prompts, setPrompts] = useState<Record<string, string>>(
    defaultPromptSteps.reduce((acc, step) => ({
      ...acc,
      [step.id]: step.defaultPrompt
    }), {})
  )
  const [editingSteps, setEditingSteps] = useState<Record<string, boolean>>({})

  const handlePromptChange = (stepId: string, newPrompt: string) => {
    const updatedPrompts = { ...prompts, [stepId]: newPrompt }
    setPrompts(updatedPrompts)
    onPromptsChange(updatedPrompts)
  }

  const resetPrompt = (stepId: string) => {
    const step = defaultPromptSteps.find(s => s.id === stepId)
    if (step) {
      handlePromptChange(stepId, step.defaultPrompt)
    }
  }

  const toggleEditing = (stepId: string) => {
    setEditingSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }))
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-medium">Customize Generation Prompts</h3>
        <p className="text-sm text-muted-foreground">
          Customize the prompts used in each step of question generation
        </p>

        <Accordion type="single" collapsible className="w-full">
          {defaultPromptSteps.map((step) => (
            <AccordionItem key={step.id} value={step.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{step.title}</span>
                  {editingSteps[step.id] && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      Editing
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Prompt</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEditing(step.id)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          {editingSteps[step.id] ? 'Done' : 'Edit'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetPrompt(step.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </div>
                    
                    {editingSteps[step.id] ? (
                      <Textarea
                        value={prompts[step.id]}
                        onChange={(e) => handlePromptChange(step.id, e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    ) : (
                      <pre className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                        {prompts[step.id]}
                      </pre>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  )
} 