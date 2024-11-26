'use client'

import { useState, useEffect, useCallback } from 'react'
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

  const loadPaths = useCallback(async () => {
    try {
      const { data: paths, error } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaths(paths);
    } catch (error) {
      console.error('Error loading paths:', error);
      toast.error('Failed to load learning paths');
    } finally {
      setIsLoading(false);
    }
  }, [setPaths, toast]);

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