import type { Lobby, Player, LobbyStatus } from './supabase'
import type {
  QuizByIdQueryResult,
  QuizForPlayerQueryResult,
  AllQuizzesQueryResult,
} from '@/sanity.types'

// Use Sanity-generated types directly (NonNullable removes the null union from [0] query)
export type Quiz = NonNullable<QuizByIdQueryResult>
export type Question = Quiz['questions'][number]

// For player view - uses separate query that excludes correctAnswer
export type QuizForPlayer = NonNullable<QuizForPlayerQueryResult>
export type QuestionForPlayer = QuizForPlayer['questions'][number]

// Quiz list item (from allQuizzesQuery)
export type QuizListItem = AllQuizzesQueryResult[number]

// Combined game state for context
export interface GameState {
  lobby: Lobby | null
  players: Player[]
  currentPlayer: Player | null
  quiz: Quiz | null
}

// Leaderboard entry
export interface LeaderboardEntry {
  playerId: string
  displayName: string
  currentQuestion: number
  totalQuestions: number
  finishedAt: string | null
  isFinished: boolean
}

// Answer submission result
export interface AnswerResult {
  correct: boolean
  finished?: boolean
  penaltySeconds?: number
  error?: string
}

// Re-export for convenience
export type { Lobby, Player, LobbyStatus }
