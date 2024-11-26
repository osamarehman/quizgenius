'use client'

import { useState } from 'react'
import { Brain, Shuffle, Plus, ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from "@/hooks/use-toast"
import { useAchievements } from "@/contexts/AchievementContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: 'easy' | 'medium' | 'hard'
  lastReviewed?: string
  nextReview?: string
  repetitions: number
  interval: number
  easeFactor: number
}

interface PathFlashcardsProps {
  pathId: string
  stageId: string
  flashcards: Flashcard[]
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => Promise<void>
  onCreateCard: (card: Omit<Flashcard, 'id'>) => Promise<void>
}

export function PathFlashcards({
  pathId,
  flashcards,
  onUpdateCard,
}: PathFlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const { toast } = useToast()
  const { checkAchievement } = useAchievements()

  // Spaced repetition algorithm (SuperMemo 2)
  const calculateNextReview = (card: Flashcard, quality: number) => {
    let repetitions = card.repetitions
    let easeFactor = card.easeFactor
    let interval = card.interval

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      repetitions += 1
    } else {
      repetitions = 0
      interval = 1
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easeFactor = Math.max(1.3, easeFactor)

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    return { repetitions, easeFactor, interval, nextReview }
  }

  const handleError = (error: Error) => {
    console.error('Error updating flashcard:', error)
    toast({
      title: "Error",
      description: "Failed to update flashcard. Please try again.",
      variant: "destructive"
    })
  }

  const handleCardRating = async (quality: number) => {
    const card = flashcards[currentIndex]
    const updates = calculateNextReview(card, quality)

    try {
      await onUpdateCard(card.id, {
        ...updates,
        lastReviewed: new Date().toISOString()
      })

      // Check for flashcard achievements
      await checkAchievement('FLASHCARD_MASTERY', {
        pathId,
        cardsReviewed: flashcards.length,
        masteredCards: flashcards.filter(c => c.repetitions >= 3).length
      })

      toast({
        title: "Progress saved",
        description: "Card review recorded successfully",
      })

      goToNextCard()
    } catch (error) {
      handleError(error)
    }
  }

  const goToNextCard = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const goToPrevCard = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const shuffleCards = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    // Shuffle implementation would go here
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Flashcards</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shuffleCards}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Coming soon",
                  description: "This feature will be available soon.",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>

        {/* Flashcard Display */}
        <div className="relative h-[300px]">
          <AnimatePresence mode="wait">
            {flashcards.length > 0 ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0"
              >
                <Card
                  className="h-full cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className="relative h-full">
                    <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center">
                      <motion.div
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {isFlipped ? (
                          <div className="transform rotate-180">
                            {flashcards[currentIndex].back}
                          </div>
                        ) : (
                          <div>
                            {flashcards[currentIndex].front}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No flashcards available
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrevCard}
            disabled={flashcards.length <= 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant="outline"
                size="sm"
                onClick={() => handleCardRating(rating)}
              >
                <Star
                  className={`h-4 w-4 ${
                    rating <= (flashcards[currentIndex]?.repetitions || 0)
                      ? 'fill-yellow-500 text-yellow-500'
                      : ''
                  }`}
                />
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={goToNextCard}
            disabled={flashcards.length <= 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{currentIndex + 1} / {flashcards.length}</span>
          </div>
          <Progress
            value={(currentIndex + 1) / flashcards.length * 100}
          />
        </div>
      </div>
    </Card>
  )
}