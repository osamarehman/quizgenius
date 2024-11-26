'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layout, List, Grid, Columns, Rows, Table } from 'lucide-react'

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  answers: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

interface LayoutProps {
  question: Question;
  layout?: string;
  onLayoutChange?: (layout: string) => void;
}

export function PreviewLayouts({ question, layout = 'card', onLayoutChange }: LayoutProps) {
  const [selectedLayout, setSelectedLayout] = useState<string>(layout)

  const handleLayoutChange = (newLayout: string) => {
    setSelectedLayout(newLayout)
    onLayoutChange?.(newLayout)
  }

  const layouts = {
    card: (
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-medium">{question.text}</h3>
        <div className="space-y-3">
          {question.answers.map((answer, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
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
        {question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium">Explanation</p>
            <p className="text-sm mt-1">{question.explanation}</p>
          </div>
        )}
      </Card>
    ),

    list: (
      <div className="space-y-4">
        <p className="font-medium">{question.text}</p>
        <ol className="list-decimal list-inside space-y-2">
          {question.answers.map((answer, i) => (
            <li key={i} className={answer.isCorrect ? 'text-green-600' : ''}>
              <span>{answer.text}</span>
              {answer.explanation && (
                <p className="ml-6 text-sm text-muted-foreground">
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
          {question.answers.map((answer, i) => (
            <Card key={i} className={`p-4 ${answer.isCorrect ? 'border-green-200' : ''}`}>
              <p>{answer.text}</p>
              {answer.explanation && (
                <p className="text-sm text-muted-foreground mt-2">
                  {answer.explanation}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    ),

    compact: (
      <div className="border rounded-lg p-4">
        <p className="font-medium mb-2">{question.text}</p>
        <div className="flex flex-wrap gap-2">
          {question.answers.map((answer, i) => (
            <div
              key={i}
              className={`px-3 py-1 rounded-full text-sm ${
                answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100'
              }`}
            >
              {answer.text}
            </div>
          ))}
        </div>
      </div>
    ),

    table: (
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Answer</th>
              <th className="px-4 py-2 text-left">Correct</th>
              <th className="px-4 py-2 text-left">Explanation</th>
            </tr>
          </thead>
          <tbody>
            {question.answers.map((answer, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{answer.text}</td>
                <td className="px-4 py-2">
                  {answer.isCorrect ? '✓' : '✗'}
                </td>
                <td className="px-4 py-2 text-sm text-muted-foreground">
                  {answer.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),

    detailed: (
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{question.text}</h3>
            {question.explanation && (
              <p className="text-sm text-muted-foreground mt-2">
                {question.explanation}
              </p>
            )}
          </div>
          <div className="space-y-4">
            {question.answers.map((answer, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{answer.text}</p>
                    {answer.explanation && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {answer.explanation}
                      </p>
                    )}
                  </div>
                  {answer.isCorrect && (
                    <span className="text-green-600">Correct</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {Object.keys(layouts).map((layoutType) => (
          <Button
            key={layoutType}
            variant={selectedLayout === layoutType ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLayoutChange(layoutType)}
          >
            {layoutType === 'card' && <Layout className="h-4 w-4" />}
            {layoutType === 'list' && <List className="h-4 w-4" />}
            {layoutType === 'grid' && <Grid className="h-4 w-4" />}
            {layoutType === 'compact' && <Rows className="h-4 w-4" />}
            {layoutType === 'table' && <Table className="h-4 w-4" />}
            {layoutType === 'detailed' && <Columns className="h-4 w-4" />}
          </Button>
        ))}
      </div>
      {layouts[selectedLayout]}
    </div>
  )
} 