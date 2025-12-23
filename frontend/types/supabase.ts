export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type LobbyStatus = 'waiting' | 'playing' | 'paused' | 'finished'

export type Database = {
  public: {
    Tables: {
      lobbies: {
        Row: {
          id: string
          pin: string
          quiz_id: string
          status: LobbyStatus
          created_at: string
          started_at: string | null
          paused_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          pin: string
          quiz_id: string
          status?: LobbyStatus
          created_at?: string
          started_at?: string | null
          paused_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          pin?: string
          quiz_id?: string
          status?: LobbyStatus
          created_at?: string
          started_at?: string | null
          paused_at?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          lobby_id: string
          display_name: string
          current_question: number
          finished_at: string | null
          joined_at: string
          kicked: boolean
          penalty_until: string | null
        }
        Insert: {
          id?: string
          lobby_id: string
          display_name: string
          current_question?: number
          finished_at?: string | null
          joined_at?: string
          kicked?: boolean
          penalty_until?: string | null
        }
        Update: {
          id?: string
          lobby_id?: string
          display_name?: string
          current_question?: number
          finished_at?: string | null
          joined_at?: string
          kicked?: boolean
          penalty_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'players_lobby_id_fkey'
            columns: ['lobby_id']
            isOneToOne: false
            referencedRelation: 'lobbies'
            referencedColumns: ['id']
          }
        ]
      }
      answers: {
        Row: {
          id: string
          player_id: string
          question_index: number
          answer: string
          is_correct: boolean
          answered_at: string
        }
        Insert: {
          id?: string
          player_id: string
          question_index: number
          answer: string
          is_correct: boolean
          answered_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          question_index?: number
          answer?: string
          is_correct?: boolean
          answered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'answers_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'players'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Lobby = Database['public']['Tables']['lobbies']['Row']
export type LobbyInsert = Database['public']['Tables']['lobbies']['Insert']
export type Player = Database['public']['Tables']['players']['Row']
export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type Answer = Database['public']['Tables']['answers']['Row']
export type AnswerInsert = Database['public']['Tables']['answers']['Insert']
