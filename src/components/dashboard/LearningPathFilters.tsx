'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export interface FilterState {
  search: string
  difficulty: string
  category: string
  sortBy: 'popular' | 'newest' | 'rating'
  duration?: 'short' | 'medium' | 'long'
  status?: 'not-started' | 'in-progress' | 'completed'
  level?: number
}

export interface LearningPathFiltersProps {
  onFilterChange: (filters: FilterState) => void
  categories: string[]
}

export function LearningPathFilters({ onFilterChange, categories }: LearningPathFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    difficulty: '',
    category: '',
    sortBy: 'popular'
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value } as FilterState
    setFilters(newFilters)
    onFilterChange(newFilters)

    // Update active filters
    const newActiveFilters = Object.entries(newFilters)
      .filter(([k, v]) => v && k !== 'search' && k !== 'sortBy')
      .map(([k, v]) => `${k}: ${v}`)

    setActiveFilters(newActiveFilters)
  }

  const clearFilter = (filter: string) => {
    const [key] = filter.split(':')
    handleFilterChange(key as keyof FilterState, '')
  }

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      search: '',
      difficulty: '',
      category: '',
      sortBy: 'popular'
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
    setActiveFilters([])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search learning paths..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Difficulty
            </label>
            <Select
              value={filters.difficulty}
              onValueChange={(value) => handleFilterChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Category
            </label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Duration
            </label>
            <Select
              value={filters.duration}
              onValueChange={(value) => handleFilterChange('duration', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (&lt; 2 hours)</SelectItem>
                <SelectItem value="medium">Medium (2-5 hours)</SelectItem>
                <SelectItem value="long">Long (&gt; 5 hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Level
            </label>
            <Select
              value={filters.level?.toString()}
              onValueChange={(value) => handleFilterChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1"
            >
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter(filter)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-sm"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
} 