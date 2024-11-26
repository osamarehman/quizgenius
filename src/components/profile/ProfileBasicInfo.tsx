'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImagePlus } from 'lucide-react'
import Image from 'next/image'

export function ProfileBasicInfo() {
  const [avatar, setAvatar] = useState<string | null>(null)

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              ) : (
                <ImagePlus className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div>
            <h3 className="font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="Enter your full name" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="Choose a username" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us a bit about yourself"
            className="resize-none"
            rows={4}
          />
        </div>
      </div>
    </div>
  )
} 