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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { uploadQuestionImage } from '@/lib/image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Answer {
  text: string
  explanation: string
  isCorrect: boolean
}

export function QuestionModal({ onQuestionAdd }: {
  onQuestionAdd: (question: {
    type: 'mcq' | 'true-false' | 'blanks'
    text: string
    explanation: string
    image?: string
    answers: Answer[]
  }) => void
}) {
  const [open, setOpen] = useState(false)
  const [questionType, setQuestionType] = useState<'mcq' | 'true-false' | 'blanks'>('mcq')
  const [questionText, setQuestionText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [questionImage, setQuestionImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const [answers, setAnswers] = useState<Answer[]>([
    { text: '', explanation: '', isCorrect: false },
    { text: '', explanation: '', isCorrect: false },
  ])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const imageUrl = await uploadQuestionImage(file)
      setQuestionImage(imageUrl)
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
      setQuestionImage(null)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = async () => {
    // TODO: Implement image deletion from storage
    setQuestionImage(null)
    toast({
      title: "Image Removed",
      description: "Image has been removed from the question",
    })
  }

  const resetForm = () => {
    setQuestionType('mcq')
    setQuestionText('')
    setExplanation('')
    setQuestionImage(null)
    setAnswers([
      { text: '', explanation: '', isCorrect: false },
      { text: '', explanation: '', isCorrect: false },
    ])
  }

  const handleSubmit = () => {
    // Validate the form
    if (!questionText.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required",
        variant: "destructive",
      })
      return
    }

    if (!explanation.trim()) {
      toast({
        title: "Validation Error",
        description: "Question explanation is required",
        variant: "destructive",
      })
      return
    }

    if (!answers.some(a => a.isCorrect)) {
      toast({
        title: "Validation Error",
        description: "Please mark at least one answer as correct",
        variant: "destructive",
      })
      return
    }

    // Validate answers
    const emptyAnswers = answers.some(a => !a.text.trim())
    if (emptyAnswers) {
      toast({
        title: "Validation Error",
        description: "All answer fields must be filled",
        variant: "destructive",
      })
      return
    }

    try {
      onQuestionAdd({
        type: questionType,
        text: questionText,
        explanation,
        image: questionImage || undefined,
        answers,
      })

      toast({
        title: "Success",
        description: "Question added successfully",
      })

      // Reset form and close dialog
      resetForm()
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAnswerChange = (index: number, field: keyof Answer, value: string | boolean) => {
    const newAnswers = [...answers]
    newAnswers[index] = { ...newAnswers[index], [field]: value }
    
    // If setting isCorrect to true, set others to false
    if (field === 'isCorrect' && value === true) {
      newAnswers.forEach((answer, i) => {
        if (i !== index) answer.isCorrect = false
      })
    }
    
    setAnswers(newAnswers)
  }

  const addAnswer = () => {
    if (answers.length < 6) { // Maximum 6 answers
      setAnswers([...answers, { text: '', explanation: '', isCorrect: false }])
    }
  }

  const removeAnswer = (index: number) => {
    if (answers.length > 2) { // Minimum 2 answers
      const newAnswers = answers.filter((_, i) => i !== index)
      setAnswers(newAnswers)
    }
  }

  const renderAnswerFields = () => {
    switch (questionType) {
      case 'mcq':
        return (
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Input
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    placeholder={`Answer ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant={answer.isCorrect ? "default" : "outline"}
                    onClick={() => handleAnswerChange(index, 'isCorrect', true)}
                  >
                    Correct
                  </Button>
                  {answers.length > 2 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeAnswer(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <Textarea
                  value={answer.explanation}
                  onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                  placeholder="Explanation for this answer"
                />
              </div>
            ))}
            {answers.length < 6 && (
              <Button type="button" variant="outline" onClick={addAnswer}>
                Add Answer Option
              </Button>
            )}
          </div>
        )

      case 'true-false':
        return (
          <div className="space-y-4">
            {[
              { text: 'True', index: 0 },
              { text: 'False', index: 1 }
            ].map(({ text, index }) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{text}</span>
                  <Button
                    type="button"
                    variant={answers[index]?.isCorrect ? "default" : "outline"}
                    onClick={() => handleAnswerChange(index, 'isCorrect', true)}
                  >
                    Correct Answer
                  </Button>
                </div>
                <Textarea
                  value={answers[index]?.explanation}
                  onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                  placeholder={`Explanation for why this is ${text.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        )

      case 'blanks':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <Label>Correct Answer</Label>
              <Input
                value={answers[0]?.text}
                onChange={(e) => handleAnswerChange(0, 'text', e.target.value)}
                placeholder="Correct answer"
              />
              <Textarea
                className="mt-2"
                value={answers[0]?.explanation}
                onChange={(e) => handleAnswerChange(0, 'explanation', e.target.value)}
                placeholder="Explanation for the correct answer"
              />
            </div>
            {answers.slice(1).map((answer, index) => (
              <div key={index + 1} className="p-4 border rounded-lg">
                <Label>Wrong Answer {index + 1}</Label>
                <Input
                  value={answer.text}
                  onChange={(e) => handleAnswerChange(index + 1, 'text', e.target.value)}
                  placeholder={`Wrong answer ${index + 1}`}
                />
                <Textarea
                  className="mt-2"
                  value={answer.explanation}
                  onChange={(e) => handleAnswerChange(index + 1, 'explanation', e.target.value)}
                  placeholder="Explanation for why this answer is wrong"
                />
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Add Question</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Question Type</Label>
            <Select
              value={questionType}
              onValueChange={(value: 'mcq' | 'true-false' | 'blanks') => {
                setQuestionType(value)
                setAnswers([
                  { text: '', explanation: '', isCorrect: false },
                  { text: '', explanation: '', isCorrect: false },
                ])
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="blanks">Fill in the Blanks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Question Text</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question"
            />
          </div>

          <div>
            <Label>Question Image (Optional)</Label>
            <div className="mt-2">
              {questionImage ? (
                <div className="relative">
                  <img 
                    src={questionImage} 
                    alt="Question" 
                    className="max-h-48 rounded-lg object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-4">
                  <label className="flex flex-col items-center cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="mt-2 text-sm text-muted-foreground">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-2 text-sm text-muted-foreground">
                          Click to upload image (Max 5MB)
                        </span>
                        <span className="mt-1 text-xs text-muted-foreground">
                          Supported formats: JPEG, PNG, WebP
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Question Explanation</Label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain the concept behind this question"
            />
          </div>

          {renderAnswerFields()}

          <Button 
            onClick={handleSubmit}
            className="w-full mt-4"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Question'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 