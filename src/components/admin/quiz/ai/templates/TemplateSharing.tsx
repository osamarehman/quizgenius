'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Share2, Users, Globe, Link } from 'lucide-react'
import { shareTemplate, getSharedTemplates } from '@/lib/ai/promptTemplates/sharingManager'

interface TemplateSharingProps {
  templateId: string
  isPublic: boolean
  sharedWith: string[]
  onUpdate: () => void
}

export function TemplateSharing({
  templateId,
  isPublic,
  sharedWith,
  onUpdate
}: TemplateSharingProps) {
  const [isPublicEnabled, setIsPublicEnabled] = useState(isPublic)
  const [email, setEmail] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    try {
      setIsSharing(true)
      await shareTemplate({
        templateId,
        userIds: [...sharedWith, email],
        isPublic: isPublicEnabled
      })
      
      setEmail('')
      onUpdate()
      
      toast({
        title: "Success",
        description: "Template sharing settings updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handlePublicToggle = async (enabled: boolean) => {
    try {
      await shareTemplate({
        templateId,
        userIds: sharedWith,
        isPublic: enabled
      })
      
      setIsPublicEnabled(enabled)
      onUpdate()
      
      toast({
        title: "Success",
        description: `Template is now ${enabled ? 'public' : 'private'}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">Share Template</h3>
          <p className="text-sm text-muted-foreground">
            Manage who can access this template
          </p>
        </div>
        <Share2 className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Public/Private Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <Label>Make Public</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Anyone can use this template
          </p>
        </div>
        <Switch
          checked={isPublicEnabled}
          onCheckedChange={handlePublicToggle}
        />
      </div>

      {/* Share with Users */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <Label>Share with Users</Label>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            onClick={handleShare}
            disabled={!email || isSharing}
          >
            Share
          </Button>
        </div>

        {/* Shared Users List */}
        {sharedWith.length > 0 && (
          <div className="space-y-2">
            <Label>Shared with</Label>
            {sharedWith.map((userId) => (
              <Card key={userId} className="p-3 flex items-center justify-between">
                <span className="text-sm">{userId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Remove user from shared list
                    shareTemplate({
                      templateId,
                      userIds: sharedWith.filter(id => id !== userId),
                      isPublic: isPublicEnabled
                    }).then(onUpdate)
                  }}
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Share Link */}
      {isPublicEnabled && (
        <div className="space-y-2">
          <Label>Share Link</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/templates/${templateId}`}
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/templates/${templateId}`
                )
                toast({
                  title: "Copied",
                  description: "Link copied to clipboard",
                })
              }}
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
} 