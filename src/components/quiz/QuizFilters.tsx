'use client'

import React from 'react';
import { Search } from 'lucide-react';
import { useQuizStore } from '@/lib/stores/quizStore';
import { useDebounce } from '@/hooks/useDebounce';

export function QuizFilters() {
  const { filters, setFilters } = useQuizStore();
  const [searchValue, setSearchValue] = React.useState(filters.search);
  const debouncedSearch = useDebounce(searchValue, 300);

  React.useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  return (
    <div className="flex gap-4 items-center mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search quizzes..."
          className="w-full pl-10 pr-4 py-2 border rounded-md"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      
      <select 
        value={filters.difficulty}
        onChange={(e) => setFilters({ difficulty: e.target.value })}
        className="px-4 py-2 border rounded-md"
      >
        <option value="all">All Difficulties</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      
      <select 
        value={filters.sort}
        onChange={(e) => setFilters({ sort: e.target.value })}
        className="px-4 py-2 border rounded-md"
      >
        <option value="newest">Newest First</option>
        <option value="popular">Most Popular</option>
        <option value="difficulty">Difficulty</option>
      </select>
    </div>
  );
} 