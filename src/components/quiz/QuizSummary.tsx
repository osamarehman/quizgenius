'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Question } from '@/types'

interface QuizSummaryProps {
  questions: Question[];
  selectedAnswers: Record<string, string>;
  score: number;
}

export function QuizSummary({ questions, selectedAnswers, score }: QuizSummaryProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-4">
            Score: {score}%
          </div>
          <div className="space-y-4">
            {questions.map((question, qIndex) => {
              const selectedAnswerIndex = selectedAnswers[question.id];
              const selectedAnswer = question.answers[parseInt(selectedAnswerIndex)];
              const correctAnswer = question.answers.find(a => a.is_correct);

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="font-medium mb-2">
                    {qIndex + 1}. {question.question_text}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Your answer: </span>
                      <span className={selectedAnswer?.is_correct ? "text-green-600" : "text-red-600"}>
                        {selectedAnswer?.text || "No answer selected"}
                      </span>
                    </div>
                    {!selectedAnswer?.is_correct && (
                      <div>
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600">{correctAnswer?.text}</span>
                      </div>
                    )}
                    {(selectedAnswer?.explanation || correctAnswer?.explanation) && (
                      <div className="mt-2 text-gray-600">
                        <span className="font-medium">Explanation: </span>
                        {selectedAnswer?.is_correct ? selectedAnswer.explanation : correctAnswer?.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
