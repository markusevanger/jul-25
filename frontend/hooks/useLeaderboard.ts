'use client'

import { useMemo } from 'react'
import type { Player } from '@/types/supabase'
import type { LeaderboardEntry } from '@/types/game'

export function useLeaderboard(
  players: Player[],
  totalQuestions: number
): LeaderboardEntry[] {
  return useMemo(() => {
    return players
      .map((player) => ({
        playerId: player.id,
        displayName: player.display_name,
        currentQuestion: player.current_question,
        totalQuestions,
        finishedAt: player.finished_at,
        isFinished: player.finished_at !== null,
      }))
      .sort((a, b) => {
        // Finished players first, sorted by finish time (earliest wins)
        if (a.isFinished && b.isFinished) {
          return (
            new Date(a.finishedAt!).getTime() - new Date(b.finishedAt!).getTime()
          )
        }
        if (a.isFinished) return -1
        if (b.isFinished) return 1

        // Then by progress (more questions answered = higher rank)
        return b.currentQuestion - a.currentQuestion
      })
  }, [players, totalQuestions])
}
