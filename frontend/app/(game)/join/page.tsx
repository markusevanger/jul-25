'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/app/components/Button'
import { joinLobby, getCurrentPlayer, clearPlayerSession } from '@/app/actions/player'
import { EmojiLoader } from '@/app/components/EmojiLoader'

export default function JoinPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      const result = await getCurrentPlayer()
      if (result.data && result.lobby && result.lobbyPin) {
        const status = result.lobby.status
        if (status === 'waiting') {
          router.replace(`/lobby/${result.lobbyPin}`)
        } else if (status === 'playing' || status === 'paused') {
          router.replace(`/play/${result.lobbyPin}`)
        } else if (status === 'finished') {
          // Game is finished, clear session so user can join a new game
          await clearPlayerSession()
        }
      }
      setIsCheckingSession(false)
    }
    checkSession()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin || !name.trim()) return

    setIsLoading(true)
    const result = await joinLobby(pin, name)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    router.push(`/lobby/${pin}`)
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EmojiLoader />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Button href="/" variant="ghost" className="mb-8 block text-center">
          ← Tilbake
        </Button>

        <h1 className="mb-8 text-center font-display text-3xl font-bold text-primary">
          Bli med i quiz
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin" className="mb-2 block text-sm text-text">
              PIN-kode
            </label>
            <input
              id="pin"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-text placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-text">
              Ditt navn
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Skriv inn navnet ditt"
              maxLength={20}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={!pin || pin.length !== 4 || !name.trim() || isLoading}
            variant="primary"
            className="w-full"
          >
            {isLoading ? 'Kobler til...' : 'Bli med'}
          </Button>
        </form>
      </div>
    </div>
  )
}
