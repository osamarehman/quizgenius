'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

const SUBJECTS = [
  { id: 1, name: 'Mathematics', icon: '📐' },
  { id: 2, name: 'Science', icon: '🔬' },
  { id: 3, name: 'History', icon: '📚' },
  { id: 4, name: 'Literature', icon: '📖' },
  { id: 5, name: 'Computer Science', icon: '💻' },
  { id: 6, name: 'Physics', icon: '⚡' },
  { id: 7, name: 'Chemistry', icon: '🧪' },
  { id: 8, name: 'Biology', icon: '🧬' },
  { id: 9, name: 'Geography', icon: '🌍' },
]

export function ProfileInterests() {
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSubjects = SUBJECTS.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredSubjects.map((subject) => (
          <Button
            key={subject.id}
            variant={selectedSubjects.includes(subject.id) ? "default" : "outline"}
            className="h-24 flex flex-col gap-2"
            onClick={() => toggleSubject(subject.id)}
          >
            <span className="text-2xl">{subject.icon}</span>
            <span className="text-sm">{subject.name}</span>
          </Button>
        ))}
      </div>

      {selectedSubjects.length === 0 && (
        <p className="text-center text-muted-foreground">
          Select at least one subject you're interested in
        </p>
      )}
    </div>
  )
} 