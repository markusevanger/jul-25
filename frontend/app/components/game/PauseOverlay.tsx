'use client'

export function PauseOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/90">
      <div className="text-center">
        <div className="mb-4 text-6xl">&#9208;</div>
        <h2 className="mb-2 font-display text-2xl font-bold text-white">Spillet er pauset</h2>
        <p className="text-white/70">Venter pa at verten starter spillet igjen...</p>
      </div>
    </div>
  )
}
