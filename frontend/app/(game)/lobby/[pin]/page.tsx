'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/app/components/Button'
import { getLobbyWithPlayers } from '@/app/actions/lobby'
import { getCurrentPlayer, clearPlayerSession } from '@/app/actions/player'
import { useRealtimeLobby } from '@/hooks/useRealtimeLobby'
import { PlayerList } from '@/app/components/game/PlayerList'
import type { Lobby, Player } from '@/types/supabase'
import { EmojiLoader } from '@/app/components/EmojiLoader'

export default function LobbyPage() {
  const router = useRouter()
  const params = useParams()
  const pin = params.pin as string

  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

      // Load lobby and players
      const lobbyResult = await getLobbyWithPlayers(pin)
      if (lobbyResult.error || !lobbyResult.data) {
        toast.error('Lobby ikke funnet')
        router.replace('/join')
        return
      }

      const { lobby: lobbyData } = lobbyResult.data

      // Check if game already started
      if (lobbyData.status === 'playing' || lobbyData.status === 'paused') {
        router.replace(`/play/${pin}`)
        return
      }
      if (lobbyData.status === 'finished') {
        router.replace(`/results/${pin}`)
        return
      }

      setLobby(lobbyData)
      setCurrentPlayer(playerResult.data)
      setIsLoading(false)
    }

    loadData()
  }, [pin, router])

  // Real-time subscription
  const { players, lobbyStatus, isConnected, error } = useRealtimeLobby({
    lobbyId: lobby?.id ?? '',
    onStatusChange: (status) => {
      if (status === 'playing') {
        router.push(`/play/${pin}`)
      } else if (status === 'finished') {
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
  })

  if (isLoading || !lobby) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EmojiLoader text="Laster lobby..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center text-text">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-border bg-card px-4 py-2 hover:bg-card-hover"
          >
            Last pa nytt
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm text-muted">PIN-kode</p>
          <p className="font-display text-5xl font-bold tracking-widest text-primary">{pin}</p>
        </div>

        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Spillere</h2>
            <span className="text-sm text-muted">
              {players.length} {players.length === 1 ? 'spiller' : 'spillere'}
            </span>
          </div>

          <PlayerList
            players={players}
            currentPlayerId={currentPlayer?.id}
          />
        </div>

        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-success' : 'bg-primary'
              }`}
            />
            <span className="text-sm text-muted">
              {isConnected ? 'Tilkoblet' : 'Kobler til...'}
            </span>
          </div>
          <p className="text-text">Venter pa at spillet starter...</p>
        </div>

        <div className="mt-8 text-center">
          <Button
            href="/join"
            onClick={() => clearPlayerSession()}
            variant="ghost"
          >
            Forlat lobby
          </Button>
        </div>
      </div>
    </div>
  )
}
