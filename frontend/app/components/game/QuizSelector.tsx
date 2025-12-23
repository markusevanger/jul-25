'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createLobby } from '@/app/actions/lobby'
import type { QuizListItem } from '@/types/game'

interface QuizSelectorProps {
  quizzes: QuizListItem[]
}

export function QuizSelector({ quizzes }: QuizSelectorProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState<string | null>(null)

  async function handleSelect(quizId: string) {
    setIsCreating(quizId)
    const result = await createLobby(quizId)

    if (result.error) {
      toast.error(result.error)
      setIsCreating(null)
      return
    }

    if (result.data) {
      router.push(`/admin/${result.data.pin}`)
    }
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <button
          key={quiz._id}
          onClick={() => handleSelect(quiz._id)}
          disabled={isCreating !== null}
          className="w-full rounded-xl border border-border bg-card p-6 text-left transition-colors hover:bg-card-hover disabled:cursor-wait disabled:opacity-50"
        >
          <h2 className="font-display text-xl font-semibold text-text">{quiz.title}</h2>
          {quiz.description && (
            <p className="mt-1 text-sm text-muted">{quiz.description}</p>
          )}
          <p className="mt-2 text-sm text-muted">
            {quiz.questionCount} sporsmal
          </p>
          {isCreating === quiz._id && (
            <p className="mt-2 text-sm text-success">Oppretter spill...</p>
          )}
        </button>
      ))}
    </div>
  )
}
