'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/app/components/Button'
import { getLobbyWithPlayers, updateLobbyStatus } from '@/app/actions/lobby'
import { kickPlayer } from '@/app/actions/player'
import { browserClient } from '@/sanity/lib/browser-client'
import { quizByIdQuery } from '@/sanity/lib/queries'
import { useRealtimeLobby } from '@/hooks/useRealtimeLobby'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Leaderboard } from '@/app/components/game/Leaderboard'
import type { Lobby } from '@/types/supabase'
import type { Quiz } from '@/types/game'
import { EmojiLoader } from '@/app/components/EmojiLoader'

export default function AdminPage() {
  const router = useRouter()
  const params = useParams()
  const pin = params.pin as string

  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const lobbyResult = await getLobbyWithPlayers(pin)
      if (lobbyResult.error || !lobbyResult.data) {
        toast.error('Lobby ikke funnet')
        router.replace('/create')
        return
      }

      const { lobby: lobbyData } = lobbyResult.data
      setLobby(lobbyData)

      // Load quiz data
      const quizData = await browserClient.fetch(quizByIdQuery, {
        quizId: lobbyData.quiz_id,
      })
      setQuiz(quizData)
      setIsLoading(false)
    }

    loadData()
  }, [pin, router])

  // Real-time subscription
  const { players, lobbyStatus, isConnected, error } = useRealtimeLobby({
    lobbyId: lobby?.id ?? '',
    onStatusChange: (status) => {
      setLobby((prev) => (prev ? { ...prev, status } : null))
    },
  })

  const leaderboard = useLeaderboard(players, quiz?.questions?.length ?? 0)

  async function handleStatusChange(newStatus: 'playing' | 'paused' | 'finished') {
    if (!lobby) return
    setIsUpdating(true)
    const result = await updateLobbyStatus(lobby.id, newStatus)
    setIsUpdating(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (newStatus === 'finished') {
      router.push(`/results/${pin}`)
    }
  }

  async function handleKick(playerId: string) {
    const result = await kickPlayer(playerId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Spilleren ble kastet ut')
    }
  }

  if (isLoading || !lobby || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EmojiLoader />
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
            Last på nytt
          </button>
        </div>
      </div>
    )
  }

  const currentStatus = lobbyStatus

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl pt-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-display text-2xl font-bold text-primary">{quiz.title}</h1>
          <p className="mb-4 text-sm text-muted">Admin-panel</p>

          <div className="mb-4">
            <p className="mb-1 text-sm text-muted">PIN-kode</p>
            <p className="font-display text-4xl font-bold tracking-widest text-text">
              {pin}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-success' : 'bg-primary'
              }`}
            />
            <span className="text-sm text-muted">
              {isConnected ? 'Tilkoblet' : 'Kobler til...'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">Kontroller</h2>

          <div className="flex flex-wrap gap-3">
            {currentStatus === 'waiting' && (
              <button
                onClick={() => handleStatusChange('playing')}
                disabled={isUpdating || players.length === 0}
                className="rounded-lg bg-success px-6 py-3 font-semibold text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? 'Starter...' : 'Start spill'}
              </button>
            )}

            {currentStatus === 'playing' && (
              <>
                <button
                  onClick={() => handleStatusChange('paused')}
                  disabled={isUpdating}
                  className="rounded-lg border border-border bg-card px-6 py-3 font-semibold text-text transition-colors hover:bg-card-hover disabled:opacity-50"
                >
                  {isUpdating ? 'Pauser...' : 'Pause'}
                </button>
                <button
                  onClick={() => handleStatusChange('finished')}
                  disabled={isUpdating}
                  className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  Avslutt spill
                </button>
              </>
            )}

            {currentStatus === 'paused' && (
              <>
                <button
                  onClick={() => handleStatusChange('playing')}
                  disabled={isUpdating}
                  className="rounded-lg bg-success px-6 py-3 font-semibold text-white transition-colors hover:bg-success/90 disabled:opacity-50"
                >
                  {isUpdating ? 'Fortsetter...' : 'Fortsett'}
                </button>
                <button
                  onClick={() => handleStatusChange('finished')}
                  disabled={isUpdating}
                  className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  Avslutt spill
                </button>
              </>
            )}

            {currentStatus === 'finished' && (
              <Button href={`/results/${pin}`} variant="primary">
                Se resultater
              </Button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted">Status:</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                currentStatus === 'waiting'
                  ? 'bg-primary/10 text-primary'
                  : currentStatus === 'playing'
                    ? 'bg-success/10 text-success'
                    : currentStatus === 'paused'
                      ? 'bg-muted/20 text-muted'
                      : 'bg-text/10 text-text'
              }`}
            >
              {currentStatus === 'waiting'
                ? 'Venter'
                : currentStatus === 'playing'
                  ? 'Spiller'
                  : currentStatus === 'paused'
                    ? 'Pauset'
                    : 'Avsluttet'}
            </span>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">
              Spillere ({players.length})
            </h2>
          </div>

          <Leaderboard
            entries={leaderboard}
            onKick={handleKick}
            showKickButton={currentStatus === 'waiting'}
          />
        </div>

        <div className="mt-8 text-center">
          <Button href="/create" variant="ghost">
            ← Tilbake til quiz-valg
          </Button>
        </div>
      </div>
    </div>
  )
}
