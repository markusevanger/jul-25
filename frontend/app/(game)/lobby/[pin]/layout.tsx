import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { client } from '@/sanity/lib/client'

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

  const quiz = await client.fetch<{ title: string } | null>(
    `*[_type == "quiz" && _id == $quizId][0]{ title }`,
    { quizId: lobby.quiz_id }
  )

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
