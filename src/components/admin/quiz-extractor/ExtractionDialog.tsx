'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Download, Loader2 } from 'lucide-react'
import { RedditPost } from '@/types/reddit'

interface ExtractionDialogProps {
  post: RedditPost
  onComplete: () => void
}

export function ExtractionDialog({ post, onComplete }: ExtractionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [generateSimilar, setGenerateSimilar] = useState(false)
  const { toast } = useToast()

  const handleExtract = async () => {
    try {
      setIsExtracting(true)

      const response = await fetch('/api/reddit/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: post.selftext,
          generateSimilar
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      toast({
        title: "Success",
        description: `Extracted ${data.questions.length} questions successfully`,
      })

      setIsOpen(false)
      onComplete()
    } catch (error) {
      console.error('Extraction error:', error)
      toast({
        title: "Error",
        description: "Failed to extract questions",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Download className="h-4 w-4 mr-2" />
          Extract
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extract Questions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="generate-similar">Generate Similar Questions</Label>
              <Switch
                id="generate-similar"
                checked={generateSimilar}
                onCheckedChange={setGenerateSimilar}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              AI will generate additional similar questions based on the extracted content
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Content Preview</h3>
            <p className="text-sm text-muted-foreground">
              {post.selftext.substring(0, 200)}...
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleExtract}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Start Extraction
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 