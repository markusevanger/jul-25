'use client'

import type { Player } from '@/types/supabase'

interface PlayerListProps {
  players: Player[]
  currentPlayerId?: string
  showProgress?: boolean
  totalQuestions?: number
  onKick?: (playerId: string) => void
}

export function PlayerList({
  players,
  currentPlayerId,
  showProgress = false,
  totalQuestions = 0,
  onKick,
}: PlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="text-center text-sm text-muted">
        Ingen spillere enna
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {players.map((player) => {
        const isCurrentPlayer = player.id === currentPlayerId
        const isFinished = player.finished_at !== null
        const progress = totalQuestions > 0
          ? (player.current_question / totalQuestions) * 100
          : 0

        return (
          <li
            key={player.id}
            className={`flex items-center justify-between rounded-lg px-3 py-2 ${
              isCurrentPlayer
                ? 'bg-primary/10 ring-2 ring-primary/30'
                : 'bg-bg'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-text">
                  {player.display_name}
                  {isCurrentPlayer && (
                    <span className="ml-2 text-xs text-muted">(deg)</span>
                  )}
                </span>
                {isFinished && (
                  <span className="text-xs text-success">Ferdig!</span>
                )}
              </div>

              {showProgress && !isFinished && (
                <div className="mt-1">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full bg-success transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted">
                    {player.current_question} / {totalQuestions}
                  </span>
                </div>
              )}
            </div>

            {onKick && !isCurrentPlayer && (
              <button
                onClick={() => onKick(player.id)}
                className="ml-2 rounded bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
              >
                Kast ut
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
