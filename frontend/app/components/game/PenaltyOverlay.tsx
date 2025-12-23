'use client'

interface PenaltyOverlayProps {
  secondsRemaining: number
}

export function PenaltyOverlay({ secondsRemaining }: PenaltyOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90">
      <div className="text-center">
        <div className="mb-4 text-6xl">&#10060;</div>
        <h2 className="mb-2 font-display text-2xl font-bold text-white">Feil svar!</h2>
        <p className="mb-6 text-white/80">Vent litt for du kan prove igjen</p>
        <div className="font-display text-6xl font-bold text-white">
          {secondsRemaining}
        </div>
        <p className="mt-2 text-sm text-white/80">sekunder</p>
      </div>
    </div>
  )
}
