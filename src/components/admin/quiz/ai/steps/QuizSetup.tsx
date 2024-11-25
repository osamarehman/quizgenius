'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface QuizSetupProps {
  mode: 'new' | 'existing'
  data: {
    title: string
    description: string
    educationSystem: string
    category: string
    quizId?: string
    difficulty?: string
  }
  onUpdate: (data: any) => void
}

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

export function QuizSetup({ mode, data, onUpdate }: QuizSetupProps) {
  const [existingQuizzes, setExistingQuizzes] = useState<any[]>([])
  const [educationSystems, setEducationSystems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (mode === 'existing') {
      fetchExistingQuizzes()
    }
    fetchEducationSystems()
  }, [mode])

  useEffect(() => {
    if (data.educationSystem) {
      fetchCategories(data.educationSystem)
    }
  }, [data.educationSystem])

  const fetchExistingQuizzes = async () => {
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
    setExistingQuizzes(quizzes || [])
  }

  const fetchEducationSystems = async () => {
    const { data: systems } = await supabase
      .from('education_systems')
      .select('*')
      .order('name')
    setEducationSystems(systems || [])
    setIsLoading(false)
  }

  const fetchCategories = async (systemId: string) => {
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('education_system_id', systemId)
      .order('name')
    setCategories(cats || [])
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {mode === 'existing' ? (
          <div>
            <Label>Select Quiz</Label>
            <Select
              value={data.quizId}
              onValueChange={(value) => onUpdate({ ...data, quizId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a quiz" />
              </SelectTrigger>
              <SelectContent>
                {existingQuizzes.map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div>
              <Label>Quiz Title</Label>
              <Input
                value={data.title}
                onChange={(e) => onUpdate({ ...data, title: e.target.value })}
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <Label>Education System</Label>
              <Select
                value={data.educationSystem}
                onValueChange={(value) => onUpdate({ 
                  ...data, 
                  educationSystem: value,
                  category: '' 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education system" />
                </SelectTrigger>
                <SelectContent>
                  {educationSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {data.educationSystem && (
              <div>
                <Label>Category</Label>
                <Select
                  value={data.category}
                  onValueChange={(value) => onUpdate({ ...data, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Description</Label>
              <Textarea
                value={data.description}
                onChange={(e) => onUpdate({ ...data, description: e.target.value })}
                placeholder="Enter quiz description"
              />
            </div>

            <div>
              <Label>Difficulty Level</Label>
              <Select
                value={data.difficulty}
                onValueChange={(value) => onUpdate({ ...data, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a difficulty level that matches the complexity of your questions
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  )
} 