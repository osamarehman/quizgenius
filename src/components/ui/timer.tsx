"use client"

import { useEffect, useState } from 'react'

interface TimerProps {
  initialSeconds: number
  onTimeUp?: () => void
  className?: string
}

export function Timer({ initialSeconds, onTimeUp, className }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp?.()
      return
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeUp?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [seconds, onTimeUp])

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return (
    <div className={className}>
      {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
    </div>
  )
}
