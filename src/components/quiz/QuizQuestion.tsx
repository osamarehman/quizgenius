'use client'

import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { type Question } from '@/types'

interface QuizQuestionProps {
  question: Question;
  selectedAnswer?: string;
  onAnswerSelect: (answerId: string) => void;
  showCorrectAnswer?: boolean;
}

export function QuizQuestion({ question, selectedAnswer, onAnswerSelect, showCorrectAnswer }: QuizQuestionProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="font-medium text-lg">{question.question_text}</div>
          {question.question_explanation && (
            <div className="text-sm text-muted-foreground">{question.question_explanation}</div>
          )}
          <RadioGroup
            value={selectedAnswer}
            onValueChange={onAnswerSelect}
            className="space-y-2"
          >
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswer === String(index);
              const isCorrect = answer.is_correct;
              let className = "flex items-center space-x-2 p-4 rounded-lg border";
              
              if (showCorrectAnswer) {
                if (isCorrect) {
                  className += " bg-green-50 border-green-200";
                } else if (isSelected && !isCorrect) {
                  className += " bg-red-50 border-red-200";
                }
              } else if (isSelected) {
                className += " bg-primary/5 border-primary/20";
              }

              return (
                <div key={index} className={className}>
                  <RadioGroupItem value={String(index)} id={`answer-${index}`} />
                  <Label
                    htmlFor={`answer-${index}`}
                    className="flex-grow cursor-pointer"
                  >
                    {answer.text}
                  </Label>
                  {showCorrectAnswer && answer.explanation && (
                    <div className="text-sm text-muted-foreground mt-2 pl-6">
                      {answer.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
