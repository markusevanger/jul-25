'use client'

import { useState, useEffect } from 'react'

const christmasEmojis = [
  '🎅', '🎄', '🎁', '⭐', '❄️', '☃️', '🦌', '🔔',
  '🕯️', '🍪', '🥛', '🧦', '🎿', '⛷️', '🌟', '✨',
  '🍬', '🎀', '🪅', '🧣', '🧤', '❤️', '💚', '🤶'
]

function getRandomEmoji(exclude?: string): string {
  const filtered = christmasEmojis.filter(e => e !== exclude)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export default function AnimatedHeroText() {
  const [leftEmoji, setLeftEmoji] = useState('🎅')
  const [rightEmoji, setRightEmoji] = useState('🎄')
  const [leftAnimating, setLeftAnimating] = useState(false)
  const [rightAnimating, setRightAnimating] = useState(false)

  useEffect(() => {
    const swapEmoji = () => {
      const swapLeft = Math.random() > 0.5

      if (swapLeft) {
        setLeftAnimating(true)
        setTimeout(() => {
          setLeftEmoji(prev => getRandomEmoji(prev))
          setLeftAnimating(false)
        }, 150)
      } else {
        setRightAnimating(true)
        setTimeout(() => {
          setRightEmoji(prev => getRandomEmoji(prev))
          setRightAnimating(false)
        }, 150)
      }
    }

    const interval = setInterval(swapEmoji, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <h1 className="mb-20 font-display text-6xl font-bold text-primary">
      <span
        className={`inline-block transition-transform duration-150 ${
          leftAnimating ? 'scale-0' : 'scale-100'
        }`}
      >
        {leftEmoji}
      </span>
      Julequiz
      <span
        className={`inline-block transition-transform duration-150 ${
          rightAnimating ? 'scale-0' : 'scale-100'
        }`}
      >
        {rightEmoji}
      </span>
    </h1>
  )
}
