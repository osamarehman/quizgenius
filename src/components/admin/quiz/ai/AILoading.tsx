'use client'

import { Loader2 } from 'lucide-react'
import { Card } from "@/components/ui/card"

interface AILoadingProps {
  message?: string
}

export function AILoading({ message = 'AI is thinking...' }: AILoadingProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </Card>
  )
} 