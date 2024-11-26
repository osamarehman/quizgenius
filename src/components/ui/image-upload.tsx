'use client'

import React from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from './button'

interface ImageUploadProps {
  value?: string
  onUpload: (file: File) => Promise<void>
  disabled?: boolean
  preview?: React.ReactNode
}

export function ImageUpload({ value, onUpload, disabled, preview }: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onUpload(file)
    }
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
        disabled={disabled}
      />

      {value && preview ? (
        <div className="relative">
          {preview}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2"
            onClick={() => onUpload(new File([], ''))}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full py-8 space-y-2"
          onClick={handleClick}
          disabled={disabled}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="text-muted-foreground">
            Click to upload an image
          </div>
        </Button>
      )}
    </div>
  )
}