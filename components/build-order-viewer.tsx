'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

interface BuildOrderStep {
  id: string
  order: number
  timeMinutes: number
  timeSeconds: number
  villagerCount: number
  action: string
  description: string
  resources: any // Using any for Prisma's Json type
}

interface BuildOrderViewerProps {
  steps: BuildOrderStep[]
}

export function BuildOrderViewer({ steps }: BuildOrderViewerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [timerMode, setTimerMode] = useState(false)

  const step = steps[currentStep]

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimerMode(!timerMode)}
        >
          {timerMode ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Exit Timer Mode
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Timer Mode
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{step.action}</CardTitle>
            <div className="text-xl font-mono">
              {step.timeMinutes}:{step.timeSeconds.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="text-muted-foreground">
            Villagers: {step.villagerCount}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{step.description}</p>

          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Wood</div>
              <div className="text-2xl font-bold">{step.resources.wood}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Food</div>
              <div className="text-2xl font-bold">{step.resources.food}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Gold</div>
              <div className="text-2xl font-bold">{step.resources.gold}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Stone</div>
              <div className="text-2xl font-bold">{step.resources.stone}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">All Steps</h3>
        <div className="space-y-2">
          {steps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted ${
                index === currentStep ? 'border-primary bg-muted' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.action}</span>
                <span className="text-sm text-muted-foreground">
                  {s.timeMinutes}:{s.timeSeconds.toString().padStart(2, '0')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
