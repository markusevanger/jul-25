'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { getLobbyWithPlayers } from '@/app/actions/lobby'
import { getCurrentPlayer, clearPlayerSession } from '@/app/actions/player'
import { submitAnswer, getPlayerProgress } from '@/app/actions/game'
import { browserClient } from '@/sanity/lib/browser-client'
import { quizForPlayerQuery } from '@/sanity/lib/queries'
import { useRealtimeLobby } from '@/hooks/useRealtimeLobby'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { usePenaltyTimer } from '@/hooks/usePenaltyTimer'
import { QuestionCard } from '@/app/components/game/QuestionCard'
import { Leaderboard } from '@/app/components/game/Leaderboard'
import { PenaltyOverlay } from '@/app/components/game/PenaltyOverlay'
import { PauseOverlay } from '@/app/components/game/PauseOverlay'
import { AnswerFeedback } from '@/app/components/game/AnswerFeedback'
import type { Lobby, Player } from '@/types/supabase'
import type { QuizForPlayer } from '@/types/game'
import { EmojiLoader } from '@/app/components/EmojiLoader'

function startViewTransition(callback: () => void) {
  if (document.startViewTransition) {
    document.startViewTransition(callback)
  } else {
    callback()
  }
}

export default function PlayPage() {
  const router = useRouter()
  const params = useParams()
  const pin = params.pin as string

  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [quiz, setQuiz] = useState<QuizForPlayer | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [penaltyUntil, setPenaltyUntil] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [answerFeedback, setAnswerFeedback] = useState<{
    show: boolean
    isCorrect: boolean
    isLastQuestion: boolean
  }>({ show: false, isCorrect: false, isLastQuestion: false })

  // Load initial data
  useEffect(() => {
    async function loadData() {
      // Check if player has a valid session
      const playerResult = await getCurrentPlayer()
      if (!playerResult.data || playerResult.kicked) {
        toast.error('Du er ikke med i denne lobbyen')
        router.replace('/join')
        return
      }

      // Load lobby
      const lobbyResult = await getLobbyWithPlayers(pin)
      if (lobbyResult.error || !lobbyResult.data) {
        toast.error('Lobby ikke funnet')
        router.replace('/join')
        return
      }

      const { lobby: lobbyData } = lobbyResult.data

      // Check lobby status
      if (lobbyData.status === 'waiting') {
        router.replace(`/lobby/${pin}`)
        return
      }
      if (lobbyData.status === 'finished') {
        router.replace(`/results/${pin}`)
        return
      }

      setLobby(lobbyData)
      setCurrentPlayer(playerResult.data)
      setCurrentQuestionIndex(playerResult.data.current_question)
      setPenaltyUntil(playerResult.data.penalty_until)
      setIsFinished(playerResult.data.finished_at !== null)

      // Load quiz (without answers)
      const quizData = await browserClient.fetch(quizForPlayerQuery, {
        quizId: lobbyData.quiz_id,
      })
      setQuiz(quizData)
      setIsLoading(false)
    }

    loadData()
  }, [pin, router])

  // Real-time subscription
  const { players, lobbyStatus, error } = useRealtimeLobby({
    lobbyId: lobby?.id ?? '',
    onStatusChange: (status) => {
      if (status === 'finished') {
        router.push(`/results/${pin}`)
      }
    },
    onPlayerKicked: (playerId) => {
      if (playerId === currentPlayer?.id) {
        toast.error('Du ble kastet ut av spillet')
        clearPlayerSession()
        router.replace('/join')
      }
    },
    onPlayerUpdate: (player) => {
      if (player.id === currentPlayer?.id) {
        setCurrentQuestionIndex(player.current_question)
        setPenaltyUntil(player.penalty_until)
        if (player.finished_at) {
          setIsFinished(true)
        }
      }
    },
  })

  const leaderboard = useLeaderboard(players, quiz?.totalQuestions ?? 0)

  // Penalty timer
  const { isInPenalty, secondsRemaining } = usePenaltyTimer({
    penaltyUntil,
    onPenaltyEnd: () => setPenaltyUntil(null),
  })

  // Handle feedback complete - transition to next question
  const handleFeedbackComplete = useCallback(() => {
    if (answerFeedback.isLastQuestion) {
      setIsFinished(true)
    }
    startViewTransition(() => {
      setAnswerFeedback({ show: false, isCorrect: false, isLastQuestion: false })
      if (!answerFeedback.isLastQuestion) {
        setCurrentQuestionIndex((prev) => prev + 1)
      }
    })
  }, [answerFeedback.isLastQuestion])

  // Handle answer submission
  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!quiz || !currentPlayer || isSubmitting || isInPenalty) return

      setIsSubmitting(true)
      const result = await submitAnswer(
        currentPlayer.id,
        currentQuestionIndex,
        answer,
        quiz._id
      )
      setIsSubmitting(false)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.correct) {
        // Show correct answer feedback with view transition
        setAnswerFeedback({
          show: true,
          isCorrect: true,
          isLastQuestion: result.finished ?? false,
        })
      } else {
        // Show wrong answer feedback briefly, then penalty overlay takes over
        setAnswerFeedback({
          show: true,
          isCorrect: false,
          isLastQuestion: false,
        })
        // After brief feedback, start penalty timer
        const penaltySeconds = result.penaltySeconds ?? 0
        if (penaltySeconds > 0) {
          setTimeout(() => {
            setAnswerFeedback({ show: false, isCorrect: false, isLastQuestion: false })
            setPenaltyUntil(
              new Date(Date.now() + penaltySeconds * 1000).toISOString()
            )
          }, 800)
        }
      }
    },
    [quiz, currentPlayer, currentQuestionIndex, isSubmitting, isInPenalty]
  )

  if (isLoading || !lobby || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EmojiLoader text="Laster spill..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center text-text">
          <p className="mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-border bg-card px-4 py-2 hover:bg-card-hover"
          >
            Last pa nytt
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isPaused = lobbyStatus === 'paused'

  return (
    <div className="min-h-screen p-4">
      {/* Answer feedback overlay */}
      {answerFeedback.show && (
        <AnswerFeedback
          isCorrect={answerFeedback.isCorrect}
          onComplete={handleFeedbackComplete}
          duration={answerFeedback.isCorrect ? 1200 : 800}
        />
      )}

      {/* Pause overlay */}
      {isPaused && <PauseOverlay />}

      {/* Penalty overlay */}
      {isInPenalty && <PenaltyOverlay secondsRemaining={secondsRemaining} />}

      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {/* Main game area */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-primary">{quiz.title}</h1>
            <span className="text-sm text-muted">
              Sporsmal {currentQuestionIndex + 1} av {quiz.totalQuestions}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-success transition-all"
              style={{
                width: `${(currentQuestionIndex / quiz.totalQuestions) * 100}%`,
              }}
            />
          </div>

          {isFinished ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold text-success">
                Du er ferdig!
              </h2>
              <p className="text-text">
                Venter pa at de andre spillerne skal bli ferdige...
              </p>
            </div>
          ) : currentQuestion ? (
            <QuestionCard
              key={currentQuestion._key}
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              onAnswer={handleAnswer}
              disabled={isSubmitting || isInPenalty || isPaused || answerFeedback.show}
              isSubmitting={isSubmitting}
            />
          ) : null}
        </div>

        {/* Leaderboard sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-4">
            <h2 className="mb-4 text-lg font-semibold text-text">
              Ledertavle
            </h2>
            <Leaderboard
              entries={leaderboard}
              currentPlayerId={currentPlayer?.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
