'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAchievements } from "@/contexts/AchievementContext"
import {
  MessageSquare,
  Lightbulb,
  Search,
  BookOpen,
  Brain,
  Send,
  Sparkles,
  RotateCcw
} from 'lucide-react'

interface StudyCompanionProps {
  pathId: string
  currentStageId: string
  onAskQuestion: (question: string) => Promise<string>
  onGenerateSummary: (content: string) => Promise<string>
  onGenerateQuiz: () => Promise<void>
}

export function PathStudyCompanion({
  pathId,
  currentStageId,
  onAskQuestion,
  onGenerateSummary,
  onGenerateQuiz
}: StudyCompanionProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'ask' | 'summarize' | 'quiz'>('ask')
  const [content, setContent] = useState('')
  const { toast } = useToast()
  const { checkAchievement } = useAchievements()

  const handleAskQuestion = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    try {
      const response = await onAskQuestion(question)
      setAnswer(response)

      // Check for achievement
      await checkAchievement('AI_INTERACTION', {
        pathId,
        interactionType: 'question',
        questionCount: 1 // This would be cumulative in a real app
      })

      toast({
        title: "Question answered",
        description: "Your study companion has provided an answer.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get an answer",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const summary = await onGenerateSummary(content)
      setAnswer(summary)

      // Check for achievement
      await checkAchievement('AI_INTERACTION', {
        pathId,
        interactionType: 'summary',
        summaryCount: 1
      })

      toast({
        title: "Summary generated",
        description: "Your content has been summarized.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Study Companion</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === 'ask' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('ask')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask
            </Button>
            <Button
              variant={mode === 'summarize' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('summarize')}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Summarize
            </Button>
            <Button
              variant={mode === 'quiz' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('quiz')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Quiz Me
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {mode === 'ask' && (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question about the content..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={isLoading || !question.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Ask
                </Button>
              </div>
            </>
          )}

          {mode === 'summarize' && (
            <>
              <Textarea
                placeholder="Paste the content you want to summarize..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
              <Button
                className="w-full"
                onClick={handleGenerateSummary}
                disabled={isLoading || !content.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
            </>
          )}

          {mode === 'quiz' && (
            <div className="text-center py-8">
              <Button
                size="lg"
                onClick={onGenerateQuiz}
                disabled={isLoading}
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Practice Quiz
              </Button>
            </div>
          )}

          {answer && (
            <Card className="p-4 mt-4 bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Answer:</p>
                  <p className="text-sm whitespace-pre-wrap">{answer}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAnswer('')}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Card>
  )
} 