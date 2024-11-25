'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function QuestionTrueFalse() {
  const [question, setQuestion] = useState('')
  const [questionExplanation, setQuestionExplanation] = useState('')
  const [answers, setAnswers] = useState([
    { text: 'True', explanation: '' },
    { text: 'False', explanation: '' },
  ])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  const handleSubmit = () => {
    // TODO: Implement submission
    console.log({
      type: 'true-false',
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
          placeholder="Enter your true/false statement"
        />
      </div>

      <div className="space-y-2">
        <Label>Question Explanation</Label>
        <Textarea
          value={questionExplanation}
          onChange={(e) => setQuestionExplanation(e.target.value)}
          placeholder="Explain the concept behind this statement"
        />
      </div>

      <div className="space-y-4">
        {answers.map((answer, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium w-20">{answer.text}</span>
              <Button
                variant={correctAnswer === index ? "default" : "outline"}
                onClick={() => setCorrectAnswer(index)}
                className="w-32"
              >
                {correctAnswer === index ? 'Correct' : 'Set Correct'}
              </Button>
            </div>
            <Textarea
              value={answer.explanation}
              onChange={(e) => {
                const newAnswers = [...answers]
                newAnswers[index].explanation = e.target.value
                setAnswers(newAnswers)
              }}
              placeholder={`Explanation for why this is ${answer.text.toLowerCase()}`}
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