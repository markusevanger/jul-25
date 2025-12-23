'use client'

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react'
import type { Quiz, Question } from '@/types/game'
import type { Lobby, Player } from '@/types/supabase'

// State
interface GameState {
  lobby: Lobby | null
  players: Player[]
  currentPlayer: Player | null
  quiz: Quiz | null
}

// Actions
type GameAction =
  | { type: 'SET_LOBBY'; payload: Lobby }
  | { type: 'SET_QUIZ'; payload: Quiz }
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'UPDATE_PLAYER'; payload: Partial<Player> }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_LOBBY_STATUS'; payload: Lobby['status'] }
  | { type: 'RESET' }

// Context value
interface GameContextValue extends GameState {
  dispatch: Dispatch<GameAction>
  currentQuestion: Question | null
  totalQuestions: number
  isFinished: boolean
  progress: number
}

const initialState: GameState = {
  lobby: null,
  players: [],
  currentPlayer: null,
  quiz: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOBBY':
      return { ...state, lobby: action.payload }

    case 'SET_QUIZ':
      return { ...state, quiz: action.payload }

    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload }

    case 'UPDATE_PLAYER':
      return {
        ...state,
        currentPlayer: state.currentPlayer
          ? { ...state.currentPlayer, ...action.payload }
          : null,
      }

    case 'SET_PLAYERS':
      return { ...state, players: action.payload }

    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload],
      }

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload),
      }

    case 'UPDATE_LOBBY_STATUS':
      return {
        ...state,
        lobby: state.lobby ? { ...state.lobby, status: action.payload } : null,
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Derived state
  const totalQuestions = state.quiz?.questions.length ?? 0
  const currentQuestionIndex = state.currentPlayer?.current_question ?? 0

  const currentQuestion =
    state.quiz && currentQuestionIndex < totalQuestions
      ? state.quiz.questions[currentQuestionIndex]
      : null

  const isFinished = state.currentPlayer?.finished_at !== null

  const progress =
    totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0

  return (
    <GameContext.Provider
      value={{
        ...state,
        dispatch,
        currentQuestion,
        totalQuestions,
        isFinished,
        progress,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
