'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface BlankAnswer {
  text: string
  explanation: string
}

export function QuestionBlanks() {
  const [questionText, setQuestionText] = useState('')
  const [questionExplanation, setQuestionExplanation] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [correctAnswers, setCorrectAnswers] = useState<BlankAnswer[]>([])
  const [wrongAnswers, setWrongAnswers] = useState<BlankAnswer[]>([
    { text: '', explanation: '' },
    { text: '', explanation: '' },
    { text: '', explanation: '' },
  ])

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      // Add to correct answers if not already present
      if (!correctAnswers.some(answer => answer.text === selection.toString().trim())) {
        setCorrectAnswers([...correctAnswers, { text: selection.toString().trim(), explanation: '' }])
      }
    }
  }

  const handleSubmit = () => {
    // TODO: Implement submission
    console.log({
      type: 'blanks',
      questionText,
      questionExplanation,
      correctAnswers,
      wrongAnswers,
    })
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <div className="relative">
          <Textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onMouseUp={handleTextSelection}
            placeholder="Enter your question text and select words to make them blanks"
            className="min-h-[100px]"
          />
          {selectedText && (
            <div className="absolute bottom-2 right-2">
              <Button
                size="sm"
                onClick={() => setSelectedText('')}
              >
                Make Blank
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Question Explanation</Label>
        <Textarea
          value={questionExplanation}
          onChange={(e) => setQuestionExplanation(e.target.value)}
          placeholder="Explain the concept behind this question"
        />
      </div>

      {/* Correct Answers */}
      <div className="space-y-4">
        <Label>Correct Answers</Label>
        {correctAnswers.map((answer, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                value={answer.text}
                onChange={(e) => {
                  const newAnswers = [...correctAnswers]
                  newAnswers[index].text = e.target.value
                  setCorrectAnswers(newAnswers)
                }}
                placeholder="Correct answer"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setCorrectAnswers(correctAnswers.filter((_, i) => i !== index))
                }}
              >
                Remove
              </Button>
            </div>
            <Textarea
              value={answer.explanation}
              onChange={(e) => {
                const newAnswers = [...correctAnswers]
                newAnswers[index].explanation = e.target.value
                setCorrectAnswers(newAnswers)
              }}
              placeholder="Explanation for this answer"
            />
          </div>
        ))}
      </div>

      {/* Wrong Answers */}
      <div className="space-y-4">
        <Label>Wrong Answers</Label>
        {wrongAnswers.map((answer, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <Input
              value={answer.text}
              onChange={(e) => {
                const newAnswers = [...wrongAnswers]
                newAnswers[index].text = e.target.value
                setWrongAnswers(newAnswers)
              }}
              placeholder={`Wrong answer ${index + 1}`}
            />
            <Textarea
              value={answer.explanation}
              onChange={(e) => {
                const newAnswers = [...wrongAnswers]
                newAnswers[index].explanation = e.target.value
                setWrongAnswers(newAnswers)
              }}
              placeholder={`Explanation for why this answer is wrong`}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Save Question
      </Button>
    </div>
  )
} 