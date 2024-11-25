'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function QuestionMCQ() {
  const [numAnswers, setNumAnswers] = useState('4')
  const [question, setQuestion] = useState('')
  const [questionExplanation, setQuestionExplanation] = useState('')
  const [answers, setAnswers] = useState<Array<{ text: string; explanation: string }>>([
    { text: '', explanation: '' },
    { text: '', explanation: '' },
    { text: '', explanation: '' },
    { text: '', explanation: '' },
  ])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  const handleNumAnswersChange = (value: string) => {
    setNumAnswers(value)
    const num = parseInt(value)
    setAnswers(prev => {
      if (num > prev.length) {
        return [...prev, ...Array(num - prev.length).fill({ text: '', explanation: '' })]
      }
      return prev.slice(0, num)
    })
  }

  const handleSubmit = () => {
    // TODO: Implement submission
    console.log({
      type: 'mcq',
      question,
      questionExplanation,
      answers,
      correctAnswer,
    })
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
        />
      </div>

      <div className="space-y-2">
        <Label>Question Explanation</Label>
        <Textarea
          value={questionExplanation}
          onChange={(e) => setQuestionExplanation(e.target.value)}
          placeholder="Explain the concept behind this question"
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Answers</Label>
        <Select value={numAnswers} onValueChange={handleNumAnswersChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select number of answers" />
          </SelectTrigger>
          <SelectContent>
            {['2', '3', '4', '5', '6'].map((num) => (
              <SelectItem key={num} value={num}>
                {num} Answers
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {answers.map((answer, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                value={answer.text}
                onChange={(e) => {
                  const newAnswers = [...answers]
                  newAnswers[index].text = e.target.value
                  setAnswers(newAnswers)
                }}
                placeholder={`Answer ${index + 1}`}
              />
              <Button
                variant={correctAnswer === index ? "default" : "outline"}
                onClick={() => setCorrectAnswer(index)}
              >
                Correct
              </Button>
            </div>
            <Textarea
              value={answer.explanation}
              onChange={(e) => {
                const newAnswers = [...answers]
                newAnswers[index].explanation = e.target.value
                setAnswers(newAnswers)
              }}
              placeholder={`Explanation for Answer ${index + 1}`}
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