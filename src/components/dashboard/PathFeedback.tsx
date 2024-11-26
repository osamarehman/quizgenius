'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  content: string
  createdAt: string
  helpful: number
  notHelpful: number
  userReaction?: 'helpful' | 'not_helpful'
}

interface PathFeedbackProps {
  pathId: string
  reviews: Review[]
  userRating?: number
  onSubmitReview: (rating: number, content: string) => Promise<void>
  onReviewReaction: (reviewId: string, reaction: 'helpful' | 'not_helpful') => Promise<void>
  onReportReview: (reviewId: string, reason: string) => Promise<void>
}

export function PathFeedback({
  reviews,
  userRating,
  onSubmitReview,
  onReviewReaction,
  onReportReview
}: PathFeedbackProps) {
  const [rating, setRating] = useState(userRating || 0)
  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmitReview(rating, review)
      setReview('')
      toast({
        title: "Success",
        description: "Review submitted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  const ratingCounts = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Rating Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Reviews & Feedback</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i <= averageRating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Write Review</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with this learning path
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        i <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                      onClick={() => setRating(i)}
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Write your review..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                />
                <Button
                  className="w-full"
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                >
                  Submit Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-12 text-sm">{i} stars</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{
                    width: `${((ratingCounts[i] || 0) / reviews.length) * 100}%`
                  }}
                />
              </div>
              <span className="w-12 text-sm text-right">
                {ratingCounts[i] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReportReview(review.id, 'inappropriate')}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm">{review.content}</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReviewReaction(review.id, 'helpful')}
                    className={review.userReaction === 'helpful' ? 'text-primary' : ''}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {review.helpful}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReviewReaction(review.id, 'not_helpful')}
                    className={review.userReaction === 'not_helpful' ? 'text-primary' : ''}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    {review.notHelpful}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  )
} 