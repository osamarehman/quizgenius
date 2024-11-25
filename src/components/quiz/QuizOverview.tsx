import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Timer, Book, Brain } from "lucide-react"

interface QuizOverviewProps {
  title: string
  difficulty: string
  timeLimit: number
  questionCount: number
  questions: {
    id: string
    question_text: string
    answers: {
      id: string
      answer_text: string
    }[]
  }[]
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
  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return 'bg-gray-500'
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-3">
            <Timer className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Time Limit</p>
              <p className="text-sm text-muted-foreground">{timeLimit} minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Book className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Questions</p>
              <p className="text-sm text-muted-foreground">{questionCount} total</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Estimated Score</p>
              <p className="text-sm text-muted-foreground">70-85%</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg mb-8">
          <h3 className="font-semibold mb-2">Preparation Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Make sure you have a quiet environment</li>
            <li>• Read each question carefully before answering</li>
            <li>• Keep track of time using the timer</li>
            <li>• You can't return to previous questions once submitted</li>
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
      </Card>
    </div>
  )
}
