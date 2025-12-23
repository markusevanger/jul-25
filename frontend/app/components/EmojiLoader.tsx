'use client'

import { useEffect, useState } from 'react'

const DEFAULT_EMOJIS = ['☃️', '🎅', '🎄', '🎁', '⛄', '🦌', '❄️', '🔔']

function getRandomEmoji(emojis: string[], lastEmoji: string | null): string {
  const available = lastEmoji ? emojis.filter((e) => e !== lastEmoji) : emojis
  return available[Math.floor(Math.random() * available.length)]
}

interface EmojiLoaderProps {
  text?: string
  emojis?: string[]
}

export function EmojiLoader({ text, emojis = DEFAULT_EMOJIS }: EmojiLoaderProps) {
  const [position, setPosition] = useState(0)
  const [emoji, setEmoji] = useState<string | null>(null)

  useEffect(() => {
    // Initialize with random emoji on client only
    const initialEmoji = getRandomEmoji(emojis, null)
    setEmoji(initialEmoji)

    const interval = setInterval(() => {
      setPosition((prev) => (prev + 1) % 3)
      // Pick a new random emoji different from the current one
      setEmoji((currentEmoji) => getRandomEmoji(emojis, currentEmoji))
    }, 250)

    return () => clearInterval(interval)
  }, [emojis])

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="inline-flex min-w-14 items-end justify-center gap-1 text-xl">
        {[0, 1, 2].map((i) => {
          const isActive = i === position
          const content = isActive && emoji ? emoji : '•'
          return (
            <span
              key={i}
              className={`inline-block transition-transform duration-200 ease-out ${
                isActive ? '-translate-y-2' : 'translate-y-0'
              }`}
            >
              {content}
            </span>
          )
        })}
      </span>
      {text && <span className="text-text">{text}</span>}
    </div>
  )
}
