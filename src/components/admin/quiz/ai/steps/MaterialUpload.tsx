'use client'

import { useState, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { FileUp, X, FileText, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { extractTextFromFile } from '@/lib/ai/fileProcessing'

interface MaterialUploadProps {
  materials: {
    files: File[]
    text: string
  }
  onUpdate: (materials: { files: File[], text: string }) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

export function MaterialUpload({ materials, onUpdate }: MaterialUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedText, setProcessedText] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsProcessing(true)

      // Validate each file
      const validFiles = acceptedFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive",
          })
          return false
        }

        if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type`,
            variant: "destructive",
          })
          return false
        }

        return true
      })

      // Process valid files
      const newProcessedText: Record<string, string> = {}
      for (const file of validFiles) {
        try {
          const text = await extractTextFromFile(file)
          newProcessedText[file.name] = text
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}`,
            variant: "destructive",
          })
        }
      }

      setProcessedText(prev => ({ ...prev, ...newProcessedText }))
      onUpdate({ 
        files: [...materials.files, ...validFiles],
        text: materials.text 
      })

      if (validFiles.length > 0) {
        toast({
          title: "Files added",
          description: `Successfully added ${validFiles.length} file(s)`,
        })
      }
    } catch (error) {
      console.error('Error processing files:', error)
      toast({
        title: "Error",
        description: "Failed to process files",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [materials, onUpdate, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
  })

  const removeFile = (index: number) => {
    const newFiles = materials.files.filter((_, i) => i !== index)
    const removedFile = materials.files[index]
    if (removedFile) {
      const newProcessedText = { ...processedText }
      delete newProcessedText[removedFile.name]
      setProcessedText(newProcessedText)
    }
    onUpdate({ files: newFiles, text: materials.text })
  }

  const handleTextChange = (text: string) => {
    onUpdate({ files: materials.files, text })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="text">Enter Text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card className="p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted'}
                hover:border-primary hover:bg-primary/5
                transition-colors cursor-pointer
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <FileUp className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? "Drop the files here"
                      : "Drag & drop files here, or click to select files"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, TXT, DOCX (Max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* File List */}
            {materials.files.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-medium">Uploaded Materials</h3>
                <div className="space-y-2">
                  {materials.files.map((file, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="text">
          <Card className="p-6">
            <Textarea
              placeholder="Enter or paste your study material here..."
              className="min-h-[300px]"
              value={materials.text}
              onChange={(e) => handleTextChange(e.target.value)}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {isProcessing && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Processing files...</span>
        </div>
      )}
    </div>
  )
} 