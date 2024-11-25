'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layout, List, Grid } from 'lucide-react'

interface PreviewProps {
  question: any
  layout?: 'card' | 'list' | 'grid'
}

export function QuestionPreview({ question, layout = 'card' }: PreviewProps) {
  const [selectedLayout, setSelectedLayout] = useState(layout)

  const layouts = {
    card: (
      <Card className="p-6 space-y-4">
        <h3 className="font-medium">{question.text}</h3>
        <div className="space-y-2">
          {question.answers.map((answer: any, i: number) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                answer.isCorrect ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <p>{answer.text}</p>
              {answer.explanation && (
                <p className="text-sm text-muted-foreground mt-2">
                  {answer.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
        {question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium">Explanation</p>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </Card>
    ),

    list: (
      <div className="space-y-2">
        <p className="font-medium">{question.text}</p>
        <ol className="list-decimal list-inside space-y-2">
          {question.answers.map((answer: any, i: number) => (
            <li
              key={i}
              className={`pl-2 ${answer.isCorrect ? 'text-green-600' : ''}`}
            >
              {answer.text}
              {answer.explanation && (
                <p className="text-sm text-muted-foreground ml-6">
                  {answer.explanation}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    ),

    grid: (
      <div className="space-y-4">
        <p className="font-medium">{question.text}</p>
        <div className="grid grid-cols-2 gap-4">
          {question.answers.map((answer: any, i: number) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50'
              }`}
            >
              <p>{answer.text}</p>
              {answer.explanation && (
                <p className="text-sm text-muted-foreground mt-2">
                  {answer.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedLayout('card')}
        >
          <Layout className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedLayout('list')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedLayout('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
      </div>
      {layouts[selectedLayout]}
    </div>
  )
} 