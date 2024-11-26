import { useState, useCallback, useMemo } from 'react'
import { Card } from "@/components/ui/card"
import { Steps } from "@/components/ui/steps"
import { MaterialUpload } from './steps/MaterialUpload'
import { QuizSetup } from './steps/QuizSetup'
import { QuestionGeneration } from './steps/QuestionGeneration'
import { QuestionPreview } from './steps/QuestionPreview'
import { ReviewQuiz } from './steps/ReviewQuiz'
import { PreviewLayouts } from './steps/PreviewLayouts'
import { Step } from '@/types/quiz';

export interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function AIQuizSteps(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = useMemo<Step[]>(() => [
    {
      id: 'material-upload',
      title: 'Upload Learning Material',
      description: 'Upload your learning material in various formats',
      component: MaterialUpload
    },
    {
      id: 'quiz-setup',
      title: 'Quiz Setup',
      description: 'Configure basic quiz settings',
      component: QuizSetup
    },
    {
      id: 'question-generation',
      title: 'Generate Questions',
      description: 'AI-powered question generation',
      component: QuestionGeneration
    },
    {
      id: 'question-preview',
      title: 'Preview Questions',
      description: 'Review and edit generated questions',
      component: QuestionPreview
    },
    {
      id: 'preview-layouts',
      title: 'Preview Layouts',
      description: 'Choose quiz layout and styling',
      component: PreviewLayouts
    },
    {
      id: 'review',
      title: 'Review & Publish',
      description: 'Final review before publishing',
      component: ReviewQuiz
    }
  ], [])

  const handleNext = useCallback((): void => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps.length])

  const handleBack = useCallback((): void => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const CurrentStepComponent = steps[currentStep].component

  return (
    <Card className="p-6">
      <Steps
        steps={steps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />
      <div className="mt-8">
        <CurrentStepComponent
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>
    </Card>
  )
}