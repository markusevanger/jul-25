import { client } from '@/sanity/lib/client'
import { allQuizzesQuery } from '@/sanity/lib/queries'
import Button from '@/app/components/Button'
import { QuizSelector } from '@/app/components/game/QuizSelector'

export const revalidate = 60 // Revalidate every minute

export default async function CreatePage() {
  const quizzes = await client.fetch(allQuizzesQuery)

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl pt-8">
        <Button href="/" variant="ghost" className="mb-8 block text-center">
          ← Tilbake
        </Button>

        <h1 className="mb-2 text-center font-display text-3xl font-bold text-primary">
          Lag nytt spill
        </h1>
        <p className="mb-8 text-center text-text">
          Velg en quiz for a starte
        </p>

        {quizzes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-text">
            <p className="mb-2">Ingen quizer funnet.</p>
            <p className="text-sm text-muted">
              Opprett en quiz i Sanity Studio forst.
            </p>
          </div>
        ) : (
          <QuizSelector quizzes={quizzes} />
        )}
      </div>
    </div>
  )
}
