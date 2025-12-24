import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sanityFetch } from '@/sanity/lib/client'

type Props = {
  params: Promise<{ pin: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pin } = await params

  const supabase = await createServerSupabaseClient()
  const { data: lobby } = await supabase
    .from('lobbies')
    .select('quiz_id')
    .eq('pin', pin)
    .single()

  if (!lobby) {
    return { title: 'Lobby' }
  }

  const quiz = await sanityFetch<{ title: string } | null>({
    query: `*[_type == "quiz" && _id == $quizId][0]{ title }`,
    params: { quizId: lobby.quiz_id },
    tags: ['quiz', lobby.quiz_id],
  })

  return {
    title: quiz?.title || 'Lobby',
  }
}

export default function LobbyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
