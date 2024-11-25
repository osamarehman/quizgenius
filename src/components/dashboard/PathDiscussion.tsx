'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  MoreVertical,
  Flag
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  likes: number
  hasLiked?: boolean
  replies?: Comment[]
}

interface PathDiscussionProps {
  pathId: string
  comments: Comment[]
  onAddComment: (content: string, parentId?: string) => Promise<void>
  onLikeComment: (commentId: string) => Promise<void>
  onReportComment: (commentId: string, reason: string) => Promise<void>
}

export function PathDiscussion({
  pathId,
  comments,
  onAddComment,
  onLikeComment,
  onReportComment
}: PathDiscussionProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const { toast } = useToast()

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      await onAddComment(newComment)
      setNewComment('')
      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    try {
      await onAddComment(replyContent, parentId)
      setReplyContent('')
      setReplyingTo(null)
      toast({
        title: "Success",
        description: "Reply added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      })
    }
  }

  const CommentComponent = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <div className={`space-y-4 ${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src={comment.userAvatar} />
          <AvatarFallback>{comment.userName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{comment.userName}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReportComment(comment.id, 'inappropriate')}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p>{comment.content}</p>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLikeComment(comment.id)}
              className={comment.hasLiked ? 'text-primary' : ''}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {comment.likes}
            </Button>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            )}
          </div>
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="ml-12 space-y-4">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmitReply(comment.id)}
            >
              Reply
            </Button>
          </div>
        </div>
      )}

      {comment.replies?.map((reply) => (
        <CommentComponent key={reply.id} comment={reply} isReply />
      ))}
    </div>
  )

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Discussion</h2>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            {comments.length} Comments
          </Button>
        </div>

        {/* New Comment Input */}
        <div className="space-y-4">
          <Textarea
            placeholder="Start a discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitComment}>
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </Card>
  )
} 