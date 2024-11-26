import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Timer, Book } from "lucide-react"

interface Question {
  id: string
  question_text: string
  answers: Answer[]
  explanation?: string
}

interface Answer {
  id: string
  answer_text: string
  is_correct: boolean
}

interface QuizOverviewProps {
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  questionCount: number
  questions: Question[]
  selectedAnswers: Record<string, string>
  onAnswerSelect: (questionId: string, answerId: string) => void
  onStart: () => void
}

export function QuizOverview({
  title,
  difficulty,
  timeLimit,
  questionCount,
  questions,
  selectedAnswers,
  onAnswerSelect,
  onStart
}: QuizOverviewProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <div className="flex items-center gap-4">
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Timer className="w-4 h-4 mr-1" />
            {timeLimit} minutes
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Book className="w-4 h-4 mr-1" />
            {questionCount} questions
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Overview</h2>
          <p className="text-muted-foreground mb-6">
            Let&apos;s test your knowledge! Take this quiz to improve your understanding.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-8">
            <h3 className="font-semibold mb-2">Preparation Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>&bull; Make sure you have a quiet environment</li>
              <li>&bull; Read each question carefully before answering</li>
              <li>&bull; Keep track of time using the timer</li>
              <li>&bull; You can&apos;t return to previous questions once submitted</li>
            </ul>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="p-6 bg-card border rounded-lg">
                <h3 className="text-lg font-medium mb-4">
                  {index + 1}. {question.question_text}
                </h3>
                <div className="space-y-3">
                  {question.answers.map((answer) => (
                    <button
                      key={answer.id}
                      onClick={() => onAnswerSelect(question.id, answer.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedAnswers[question.id] === answer.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {answer.answer_text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={onStart}>
              Start Quiz
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
