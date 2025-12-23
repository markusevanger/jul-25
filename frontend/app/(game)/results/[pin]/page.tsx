'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ConfettiBoom from 'react-confetti-boom'
import Button from '@/app/components/Button'
import { toast } from 'sonner'
import { getLobbyWithPlayers } from '@/app/actions/lobby'
import { clearPlayerSession, getCurrentPlayer } from '@/app/actions/player'
import { browserClient } from '@/sanity/lib/browser-client'
import { quizByIdQuery } from '@/sanity/lib/queries'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Leaderboard } from '@/app/components/game/Leaderboard'
import type { Lobby, Player } from '@/types/supabase'
import type { Quiz } from '@/types/game'
import { EmojiLoader } from '@/app/components/EmojiLoader'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const pin = params.pin as string

  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [burstConfetti, setBurstConfetti] = useState(false)
  const [showFallConfetti, setShowFallConfetti] = useState(true)

  useEffect(() => {
    async function loadData() {
      // Get current player BEFORE clearing session
      const currentPlayerResult = await getCurrentPlayer()
      if (currentPlayerResult.data) {
        setCurrentPlayerId(currentPlayerResult.data.id)
      }

      const lobbyResult = await getLobbyWithPlayers(pin)
      if (lobbyResult.error || !lobbyResult.data) {
        toast.error('Kunne ikke laste resultater')
        router.replace('/')
        return
      }

      const { lobby: lobbyData, players: playersData } = lobbyResult.data
      setLobby(lobbyData)
      setPlayers(playersData)

      // Load quiz for total question count
      const quizData = await browserClient.fetch(quizByIdQuery, {
        quizId: lobbyData.quiz_id,
      })
      setQuiz(quizData)
      setIsLoading(false)

      // Clear session automatically - game is finished, user can join new games
      await clearPlayerSession()
    }

    loadData()
  }, [pin, router])

  const leaderboard = useLeaderboard(players, quiz?.questions.length ?? 0)
  const winner = leaderboard.find((entry) => entry.isFinished)
  const isCurrentUserWinner = winner && currentPlayerId === winner.playerId

  const handleTrophyClick = useCallback(() => {
    setShowFallConfetti(false)
    setBurstConfetti(false)
    setTimeout(() => setBurstConfetti(true), 0)
  }, [])

  async function handlePlayAgain() {
    await clearPlayerSession()
    router.push('/join')
  }

  if (isLoading || !lobby) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EmojiLoader text="Laster resultater..." emojis={['🏆', '🥇', '🥈', '🥉', '🎖️', '🏅']} />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {isCurrentUserWinner && showFallConfetti && (
        <ConfettiBoom mode="fall" particleCount={50} />
      )}
      <div className="mx-auto max-w-2xl pt-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-display text-3xl font-bold text-primary">
            {quiz?.title || 'Quiz'}
          </h1>
          <p className="text-xl text-text">Resultater</p>
        </div>

        {/* Winner announcement */}
        {winner && (
          <div className="mb-8 rounded-xl border-2 border-success bg-success/10 p-8 text-center">
            <button
              type="button"
              onClick={handleTrophyClick}
              className="mb-2 text-4xl transition-transform hover:scale-110 active:scale-95"
            >
              &#127942;
            </button>
            {burstConfetti && (
              <ConfettiBoom
                mode="boom"
                particleCount={100}
                colors={['#D12923', '#ff6b6b', '#ee5a5a']}
              />
            )}
            <h2 className="mb-2 font-display text-2xl font-bold text-success">
              Gratulerer!
            </h2>
            <p className="font-display text-3xl font-bold text-text">{winner.displayName}</p>
            <p className="mt-2 text-muted">vant quizen!</p>
          </div>
        )}

        {/* Full leaderboard */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">
            Ledertavle
          </h2>
          <Leaderboard entries={leaderboard} />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={handlePlayAgain} type="button" variant="primary">
            Spill igjen
          </Button>
          <Button href="/" variant="outline">
            Til forsiden
          </Button>
        </div>
      </div>
    </div>
  )
}
