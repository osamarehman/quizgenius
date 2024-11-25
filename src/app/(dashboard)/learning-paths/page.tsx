'use client'

import { useState, useEffect } from 'react'
import { PathCard } from "@/components/dashboard/PathCard"
import { LearningPathFilters } from "@/components/dashboard/LearningPathFilters"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { LoadingSpinner } from '@/components/ui/loading'

interface LearningPath {
  id: string
  title: string
  description: string
}

const supabase = createClientComponentClient()

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadPaths = async () => {
    try {
      const { data } = await supabase.from('learning_paths').select('*')
      setPaths(data || [])
    } catch (err) {
      console.error('Error loading paths:', err)
      toast({
        title: "Error",
        description: "Failed to load learning paths",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPaths()
  }, [loadPaths])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Learning Paths</h1>
      </div>

      <LearningPathFilters
        onFilterChange={() => {}}
        categories={[]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => (
          <PathCard key={path.id} path={path} />
        ))}
      </div>
    </div>
  )
}