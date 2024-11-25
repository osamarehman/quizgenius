'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QuizSetup } from './steps/QuizSetup'
import { MaterialUpload } from './steps/MaterialUpload'
import { QuestionGeneration } from './steps/QuestionGeneration'
import { ReviewQuiz } from './steps/ReviewQuiz'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Step = 'setup' | 'materials' | 'questions' | 'review'
type Mode = 'new' | 'existing'

interface AIQuizStepsProps {
  mode: Mode
}

interface QuizData {
  title: string
  description: string
  educationSystem: string
  category: string
  materials: {
    files: File[]
    text: string
  }
  questions?: any[]
}

const initialQuizData: QuizData = {
  title: '',
  description: '',
  educationSystem: '',
  category: '',
  materials: {
    files: [],
    text: ''
  }
}

export function AIQuizSteps({ mode }: AIQuizStepsProps) {
  const [currentStep, setCurrentStep] = useState<Step>('setup')
  const [quizData, setQuizData] = useState(initialQuizData)
  const { toast } = useToast()

  const steps: { id: Step; title: string }[] = [
    { id: 'setup', title: 'Quiz Setup' },
    { id: 'materials', title: 'Study Materials' },
    { id: 'questions', title: 'Generate Questions' },
    { id: 'review', title: 'Review & Save' }
  ]

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <QuizSetup
            mode={mode}
            data={quizData}
            onUpdate={setQuizData}
          />
        )
      case 'materials':
        return (
          <MaterialUpload
            materials={quizData.materials}
            onUpdate={(materials) => setQuizData({ ...quizData, materials })}
          />
        )
      case 'questions':
        return (
          <QuestionGeneration
            quizData={quizData}
            onUpdate={setQuizData}
          />
        )
      case 'review':
        return (
          <ReviewQuiz
            quizData={quizData}
            onUpdate={setQuizData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${
              index !== steps.length - 1 ? 'flex-1' : ''
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {index + 1}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{step.title}</p>
            </div>
            {index !== steps.length - 1 && (
              <div className="flex-1 h-px bg-muted mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 'setup'}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === 'review'}
        >
          {currentStep === 'review' ? 'Finish' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
} 