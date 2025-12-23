'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const PLAYER_COOKIE = 'quiz_player_id'
const LOBBY_COOKIE = 'quiz_lobby_pin'

export async function joinLobby(pin: string, displayName: string) {
  const supabase = await createServerSupabaseClient()

  // Find lobby
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .select('id, status')
    .eq('pin', pin)
    .single()

  if (lobbyError || !lobby) {
    return { error: 'Lobby ikke funnet. Sjekk PIN-koden.' }
  }

  if (lobby.status !== 'waiting') {
    return { error: 'Dette spillet har allerede startet.' }
  }

  const trimmedName = displayName.trim()
  if (!trimmedName || trimmedName.length < 1) {
    return { error: 'Du ma oppgi et navn.' }
  }

  if (trimmedName.length > 20) {
    return { error: 'Navnet kan ikke vaere lengre enn 20 tegn.' }
  }

  // Create player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      lobby_id: lobby.id,
      display_name: trimmedName,
    })
    .select()
    .single()

  if (playerError) {
    if (playerError.code === '23505') {
      return { error: 'Dette navnet er allerede tatt i denne lobbyen.' }
    }
    console.error('Create player error:', playerError)
    return { error: 'Kunne ikke bli med i lobbyen.' }
  }

  // Store player ID and lobby PIN in cookies for reconnection
  const cookieStore = await cookies()
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24 hours
  }

  cookieStore.set(PLAYER_COOKIE, player.id, cookieOptions)
  cookieStore.set(LOBBY_COOKIE, pin, cookieOptions)

  return { data: player }
}

export async function getCurrentPlayer() {
  const cookieStore = await cookies()
  const playerId = cookieStore.get(PLAYER_COOKIE)?.value
  const lobbyPin = cookieStore.get(LOBBY_COOKIE)?.value

  if (!playerId) {
    return { data: null }
  }

  const supabase = await createServerSupabaseClient()

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

  if (error || !player) {
    // Clear invalid cookies
    cookieStore.delete(PLAYER_COOKIE)
    cookieStore.delete(LOBBY_COOKIE)
    return { data: null }
  }

  // Check if player was kicked
  if (player.kicked) {
    cookieStore.delete(PLAYER_COOKIE)
    cookieStore.delete(LOBBY_COOKIE)
    return { data: null, kicked: true }
  }

  // Get lobby info
  const { data: lobby } = await supabase
    .from('lobbies')
    .select('*')
    .eq('id', player.lobby_id)
    .single()

  return {
    data: player,
    lobby,
    lobbyPin,
  }
}

export async function kickPlayer(playerId: string) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('players')
    .update({ kicked: true })
    .eq('id', playerId)

  if (error) {
    console.error('Kick player error:', error)
    return { error: 'Kunne ikke sparke spilleren.' }
  }

  return { success: true }
}

export async function clearPlayerSession() {
  const cookieStore = await cookies()
  cookieStore.delete(PLAYER_COOKIE)
  cookieStore.delete(LOBBY_COOKIE)
  return { success: true }
}
