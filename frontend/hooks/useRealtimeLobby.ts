'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lobby, Player, LobbyStatus } from '@/types/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeLobbyOptions {
  lobbyId: string
  onStatusChange?: (status: LobbyStatus) => void
  onPlayerJoin?: (player: Player) => void
  onPlayerUpdate?: (player: Player) => void
  onPlayerKicked?: (playerId: string) => void
}

interface UseRealtimeLobbyReturn {
  players: Player[]
  lobbyStatus: LobbyStatus
  isConnected: boolean
  error: string | null
}

export function useRealtimeLobby({
  lobbyId,
  onStatusChange,
  onPlayerJoin,
  onPlayerUpdate,
  onPlayerKicked,
}: UseRealtimeLobbyOptions): UseRealtimeLobbyReturn {
  const [players, setPlayers] = useState<Player[]>([])
  const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus>('waiting')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use refs for callbacks to avoid re-subscribing on every render
  const callbacksRef = useRef({ onStatusChange, onPlayerJoin, onPlayerUpdate, onPlayerKicked })
  callbacksRef.current = { onStatusChange, onPlayerJoin, onPlayerUpdate, onPlayerKicked }

  useEffect(() => {
    // Don't setup if lobbyId is empty
    if (!lobbyId) {
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    async function setup() {
      try {
        // Initial fetch of players
        const { data: initialPlayers, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('lobby_id', lobbyId)
          .eq('kicked', false)
          .order('joined_at', { ascending: true })

        if (playersError) throw playersError
        if (initialPlayers) setPlayers(initialPlayers)

        // Initial fetch of lobby status
        const { data: lobby, error: lobbyError } = await supabase
          .from('lobbies')
          .select('status')
          .eq('id', lobbyId)
          .single()

        if (lobbyError) throw lobbyError
        if (lobby) setLobbyStatus(lobby.status as LobbyStatus)

        // Subscribe to changes
        channel = supabase
          .channel(`lobby:${lobbyId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'lobbies',
              filter: `id=eq.${lobbyId}`,
            },
            (payload) => {
              const newLobby = payload.new as Lobby
              setLobbyStatus(newLobby.status)
              callbacksRef.current.onStatusChange?.(newLobby.status)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'players',
              filter: `lobby_id=eq.${lobbyId}`,
            },
            (payload) => {
              const newPlayer = payload.new as Player
              if (!newPlayer.kicked) {
                setPlayers((prev) => [...prev, newPlayer])
                callbacksRef.current.onPlayerJoin?.(newPlayer)
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'players',
              filter: `lobby_id=eq.${lobbyId}`,
            },
            (payload) => {
              const updatedPlayer = payload.new as Player

              if (updatedPlayer.kicked) {
                setPlayers((prev) => prev.filter((p) => p.id !== updatedPlayer.id))
                callbacksRef.current.onPlayerKicked?.(updatedPlayer.id)
              } else {
                setPlayers((prev) =>
                  prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
                )
                callbacksRef.current.onPlayerUpdate?.(updatedPlayer)
              }
            }
          )
          .subscribe((status) => {
            setIsConnected(status === 'SUBSCRIBED')
            if (status === 'CHANNEL_ERROR') {
              setError('Tilkoblingsfeil. Prov a laste siden pa nytt.')
            }
          })
      } catch (err) {
        console.error('Realtime setup error:', err)
        setError('Kunne ikke koble til. Prov a laste siden pa nytt.')
      }
    }

    setup()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [lobbyId])

  return { players, lobbyStatus, isConnected, error }
}
