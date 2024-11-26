import { ChangeEvent, useCallback, useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { useToast } from '@/hooks/use-toast'

interface MaterialUploadProps {
  data: {
    materials: {
      text: string
      files: File[]
    }
  }
  onUpdate: (materials: { text: string; files: File[] }) => void
}

interface FileWithPreview extends File {
  preview?: string
}

interface FileList {
  length: number
  item(index: number): File | null
}

export function MaterialUpload({ data, onUpdate }: MaterialUploadProps) {
  const [text, setText] = useState(data.materials.text)
  const [files, setFiles] = useState<FileWithPreview[]>(data.materials.files)
  const { toast } = useToast()

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    onUpdate({ text: newText, files })
  }, [files, onUpdate])

  const handleFileUpload = useCallback((uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return

    const newFiles = Array.from(uploadedFiles).map((file) => {
      if (file && file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)
        return Object.assign(file, { preview })
      }
      return file
    })

    setFiles(prev => {
      const updated = [...prev, ...newFiles]
      onUpdate({ text, files: updated })
      return updated
    })

    toast({
      title: 'Success',
      description: `${uploadedFiles.length} file(s) uploaded successfully`,
    })
  }, [text, onUpdate, toast])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      onUpdate({ text, files: updated })
      return updated
    })
  }, [text, onUpdate])

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Study Materials</h2>
        <p className="text-sm text-muted-foreground">
          Upload files or paste text content to generate questions from
        </p>
      </div>

      <div className="space-y-4">
        <FileUpload
          accept=".txt,.pdf,.doc,.docx,image/*"
          onChange={e => handleFileUpload(e.target.files)}
          multiple
        />

        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Uploaded Files</h3>
            <div className="grid grid-cols-2 gap-4">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {file.preview && (
                      <Image
                        src={file.preview}
                        alt={file.name}
                        width={32}
                        height={32}
                        className="object-cover rounded"
                      />
                    )}
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Or paste text content directly:
          </label>
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Paste your study material text here..."
            className="min-h-[200px]"
          />
        </div>
      </div>
    </Card>
  )
}