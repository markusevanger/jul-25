'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sanityFetch } from '@/sanity/lib/client'
import { quizByIdQuery } from '@/sanity/lib/queries'
import type { QuizByIdQueryResult } from '@/sanity.types'
import type { LobbyStatus } from '@/types/supabase'

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function createLobby(quizId: string) {
  const supabase = await createServerSupabaseClient()

  // Verify quiz exists in Sanity
  const quiz = await sanityFetch<QuizByIdQueryResult>({
    query: quizByIdQuery,
    params: { quizId },
    tags: ['quiz', quizId],
  })
  if (!quiz) {
    return { error: 'Quiz ikke funnet' }
  }

  // Generate unique PIN (retry if collision)
  let pin = generatePin()
  let attempts = 0

  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('lobbies')
      .select('id')
      .eq('pin', pin)
      .in('status', ['waiting', 'playing', 'paused'])
      .single()

    if (!existing) break
    pin = generatePin()
    attempts++
  }

  if (attempts >= 10) {
    return { error: 'Kunne ikke generere unik PIN. Prov igjen.' }
  }

  const { data, error } = await supabase
    .from('lobbies')
    .insert({ pin, quiz_id: quizId })
    .select()
    .single()

  if (error) {
    console.error('Create lobby error:', error)
    return { error: 'Kunne ikke opprette lobby' }
  }

  return { data }
}

export async function getLobbyByPin(pin: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('pin', pin)
    .single()

  if (error || !data) {
    return { error: 'Lobby ikke funnet. Sjekk PIN-koden.' }
  }

  return { data }
}

export async function getLobbyWithPlayers(pin: string) {
  const supabase = await createServerSupabaseClient()

  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .select('*')
    .eq('pin', pin)
    .single()

  if (lobbyError || !lobby) {
    return { error: 'Lobby ikke funnet' }
  }

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('lobby_id', lobby.id)
    .eq('kicked', false)
    .order('joined_at', { ascending: true })

  return { data: { lobby, players: players || [] } }
}

export async function updateLobbyStatus(lobbyId: string, status: LobbyStatus) {
  const supabase = await createServerSupabaseClient()

  const updates: Record<string, unknown> = { status }

  if (status === 'playing') {
    updates.started_at = new Date().toISOString()
    updates.paused_at = null
  } else if (status === 'paused') {
    updates.paused_at = new Date().toISOString()
  } else if (status === 'finished') {
    updates.paused_at = null
  }

  const { error } = await supabase
    .from('lobbies')
    .update(updates)
    .eq('id', lobbyId)

  if (error) {
    console.error('Update lobby status error:', error)
    return { error: 'Kunne ikke oppdatere lobby-status' }
  }

  return { success: true }
}
