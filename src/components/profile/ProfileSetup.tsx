'use client'

import { useState } from 'react'
import { ProfileBasicInfo } from './ProfileBasicInfo'
import { ProfileInterests } from './ProfileInterests'
import { ProfilePreferences } from './ProfilePreferences'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'

const STEPS = ['Basic Info', 'Interests', 'Preferences']

export function ProfileSetup() {
  const [currentStep, setCurrentStep] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // On final step completion
      toast({
        title: "Profile completed!",
        description: "Your profile has been successfully set up.",
      })
      router.push('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    toast({
      title: "Profile setup skipped",
      description: "You can complete your profile later from the dashboard.",
    })
    router.push('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="mt-8">
        {currentStep === 0 && <ProfileBasicInfo />}
        {currentStep === 1 && <ProfileInterests />}
        {currentStep === 2 && <ProfilePreferences />}
      </div>

      <div className="flex justify-between pt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button variant="ghost" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button onClick={handleNext}>
          {currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  )
} 