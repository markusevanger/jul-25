'use client'

import { useEffect } from 'react'

interface AnswerFeedbackProps {
  isCorrect: boolean
  onComplete: () => void
  duration?: number
}

export function AnswerFeedback({
  isCorrect,
  onComplete,
  duration = 1200,
}: AnswerFeedbackProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, duration)
    return () => clearTimeout(timer)
  }, [onComplete, duration])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isCorrect ? 'bg-success/95' : 'bg-primary/95'
      }`}
      style={{ viewTransitionName: 'answer-feedback' }}
    >
      <div className="answer-feedback-content text-center">
        <div className="mb-4 animate-bounce-in text-8xl">
          {isCorrect ? '✓' : '✗'}
        </div>
        <h2 className="animate-fade-in font-display text-4xl font-bold text-white">
          {isCorrect ? 'Riktig!' : 'Feil!'}
        </h2>
        {isCorrect && (
          <p className="animate-fade-in-delay mt-4 text-xl text-white/90">
            Neste spørsmål kommer...
          </p>
        )}
      </div>
    </div>
  )
}
