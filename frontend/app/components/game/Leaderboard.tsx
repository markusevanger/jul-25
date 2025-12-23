'use client'

import type { LeaderboardEntry } from '@/types/game'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentPlayerId?: string
  onKick?: (playerId: string) => void
  showKickButton?: boolean
}

export function Leaderboard({
  entries,
  currentPlayerId,
  onKick,
  showKickButton = false,
}: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-muted">
        Ingen spillere enna
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry, index) => {
        const isCurrentPlayer = entry.playerId === currentPlayerId
        const progress =
          entry.totalQuestions > 0
            ? (entry.currentQuestion / entry.totalQuestions) * 100
            : 0

        return (
          <li
            key={entry.playerId}
            className={`rounded-lg px-4 py-3 ${
              isCurrentPlayer
                ? 'bg-primary/10 ring-2 ring-primary/30'
                : 'bg-bg'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  index === 0 && entry.isFinished
                    ? 'bg-success text-white'
                    : index === 1 && entry.isFinished
                      ? 'bg-muted text-white'
                      : index === 2 && entry.isFinished
                        ? 'bg-primary text-white'
                        : 'bg-border text-text'
                }`}
              >
                {index + 1}
              </div>

              {/* Name and progress */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">
                    {entry.displayName}
                  </span>
                  {isCurrentPlayer && (
                    <span className="text-xs text-muted">(deg)</span>
                  )}
                  {entry.isFinished && (
                    <span className="text-xs text-success">Ferdig!</span>
                  )}
                </div>

                {!entry.isFinished && (
                  <div className="mt-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-success transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Progress text */}
              <div className="text-right text-sm">
                {entry.isFinished ? (
                  <span className="text-success">
                    {entry.totalQuestions}/{entry.totalQuestions}
                  </span>
                ) : (
                  <span className="text-muted">
                    {entry.currentQuestion}/{entry.totalQuestions}
                  </span>
                )}
              </div>

              {/* Kick button */}
              {showKickButton && onKick && !isCurrentPlayer && (
                <button
                  onClick={() => onKick(entry.playerId)}
                  className="rounded bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
                >
                  Kast ut
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
