import { GameProvider } from '@/contexts/GameContext'
import { Toaster } from 'sonner'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GameProvider>
      <div className="min-h-screen bg-bg">
        {children}
        <Toaster position="top-center" richColors />
      </div>
    </GameProvider>
  )
}
