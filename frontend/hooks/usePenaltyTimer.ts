'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePenaltyTimerOptions {
  penaltyUntil: string | null
  onPenaltyEnd?: () => void
}

interface UsePenaltyTimerReturn {
  isInPenalty: boolean
  secondsRemaining: number
}

export function usePenaltyTimer({
  penaltyUntil,
  onPenaltyEnd,
}: UsePenaltyTimerOptions): UsePenaltyTimerReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [isInPenalty, setIsInPenalty] = useState(false)

  const calculateRemaining = useCallback(() => {
    if (!penaltyUntil) return 0
    const endTime = new Date(penaltyUntil).getTime()
    const now = Date.now()
    return Math.max(0, Math.ceil((endTime - now) / 1000))
  }, [penaltyUntil])

  useEffect(() => {
    const remaining = calculateRemaining()
    setSecondsRemaining(remaining)
    setIsInPenalty(remaining > 0)

    if (remaining <= 0) return

    const interval = setInterval(() => {
      const newRemaining = calculateRemaining()
      setSecondsRemaining(newRemaining)

      if (newRemaining <= 0) {
        setIsInPenalty(false)
        clearInterval(interval)
        onPenaltyEnd?.()
      }
    }, 100) // Update frequently for smooth countdown

    return () => clearInterval(interval)
  }, [penaltyUntil, calculateRemaining, onPenaltyEnd])

  return { isInPenalty, secondsRemaining }
}
