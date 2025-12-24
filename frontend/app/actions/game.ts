'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sanityFetch } from '@/sanity/lib/client'
import { quizAnswersQuery } from '@/sanity/lib/queries'
import type { QuizAnswersQueryResult } from '@/sanity.types'
import type { AnswerResult } from '@/types/game'

export async function submitAnswer(
  playerId: string,
  questionIndex: number,
  answer: string,
  quizId: string
): Promise<AnswerResult> {
  const supabase = await createServerSupabaseClient()

  // Get quiz answer data (minimal query - no media, just answer validation fields)
  const quiz = await sanityFetch<QuizAnswersQueryResult>({
    query: quizAnswersQuery,
    params: { quizId },
    tags: ['quiz', quizId],
  })
  const question = quiz?.questions?.[questionIndex]
  if (!quiz || !question) {
    return { correct: false, error: 'Ugyldig sporsmal' }
  }
  const playerAnswer = answer.toLowerCase().trim()

  // Check if answer is correct based on question type
  let isCorrect = false
  if (question.questionType === 'text' && question.correctAnswer) {
    // Text question: compare against correctAnswer field
    isCorrect = question.correctAnswer.toLowerCase().trim() === playerAnswer
  } else if (question.questionType === 'radio' && question.options) {
    // Radio question: check if selected option is marked as correct
    const selectedOption = question.options.find(
      (opt) => opt.text?.toLowerCase().trim() === playerAnswer
    )
    isCorrect = selectedOption?.isCorrect === true
  }

  // Check if player already answered this question correctly
  const { data: existingAnswer } = await supabase
    .from('answers')
    .select('is_correct')
    .eq('player_id', playerId)
    .eq('question_index', questionIndex)
    .single()

  // If they already answered correctly, don't allow re-answering
  if (existingAnswer?.is_correct) {
    return { correct: false, error: 'Du har allerede svart riktig pa dette sporsmalet' }
  }

  // Record or update answer (upsert allows re-answering after wrong answer)
  const { error: answerError } = await supabase.from('answers').upsert(
    {
      player_id: playerId,
      question_index: questionIndex,
      answer: answer.trim(),
      is_correct: isCorrect,
    },
    { onConflict: 'player_id,question_index' }
  )

  if (answerError) {
    console.error('Submit answer error:', answerError)
    return { correct: false, error: 'Kunne ikke sende inn svaret' }
  }

  if (isCorrect) {
    // Move to next question
    const nextQuestion = questionIndex + 1
    const isFinished = nextQuestion >= (quiz.questions?.length ?? 0)

    const { error: updateError } = await supabase
      .from('players')
      .update({
        current_question: nextQuestion,
        finished_at: isFinished ? new Date().toISOString() : null,
        penalty_until: null, // Clear any existing penalty
      })
      .eq('id', playerId)

    if (updateError) {
      console.error('Update player progress error:', updateError)
    }

    return { correct: true, finished: isFinished }
  } else {
    // Apply penalty
    const penaltySeconds = quiz.wrongAnswerPenalty || 5
    const penaltyUntil = new Date(Date.now() + penaltySeconds * 1000).toISOString()

    const { error: penaltyError } = await supabase
      .from('players')
      .update({ penalty_until: penaltyUntil })
      .eq('id', playerId)

    if (penaltyError) {
      console.error('Apply penalty error:', penaltyError)
    }

    return { correct: false, penaltySeconds }
  }
}

export async function getPlayerProgress(playerId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: player, error } = await supabase
    .from('players')
    .select('current_question, finished_at, penalty_until')
    .eq('id', playerId)
    .single()

  if (error || !player) {
    return { error: 'Kunne ikke hente spillerdata' }
  }

  return { data: player }
}

export async function clearPenalty(playerId: string) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('players')
    .update({ penalty_until: null })
    .eq('id', playerId)

  if (error) {
    console.error('Clear penalty error:', error)
    return { error: 'Kunne ikke fjerne straff' }
  }

  return { success: true }
}
