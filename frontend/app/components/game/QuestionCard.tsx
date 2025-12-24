'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { QuestionForPlayer } from '@/types/game'

interface QuestionCardProps {
  question: QuestionForPlayer
  questionNumber: number
  onAnswer: (answer: string) => void
  disabled?: boolean
  isSubmitting?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  onAnswer,
  disabled = false,
  isSubmitting = false,
}: QuestionCardProps) {
  const [textAnswer, setTextAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  function handleSubmitText(e: React.FormEvent) {
    e.preventDefault()
    if (textAnswer.trim() && !disabled) {
      onAnswer(textAnswer)
      setTextAnswer('')
    }
  }

  function handleSelectOption(option: string) {
    if (disabled) return
    setSelectedOption(option)
    onAnswer(option)
  }

  return (
    <div
      className="animate-slide-in rounded-xl border border-border bg-card p-6"
      style={{ viewTransitionName: 'question-card' }}
    >
      {/* Media */}
      {question.media?.type === 'image' && question.media.image?.asset?.url && (
        <div className="mb-6 overflow-hidden rounded-lg">
          <Image
            src={question.media.image.asset.url}
            alt={question.media.image.alt || 'Sporsmalsbilde'}
            width={800}
            height={450}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {question.media?.type === 'video' && (
        <div className="mb-6 aspect-video overflow-hidden rounded-lg">
          {question.media.videoSource === 'file' && question.media.videoFile?.asset?.url ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={question.media.videoFile.asset.url}
              controls
              autoPlay
              muted
              className="h-full w-full"
            />
          ) : question.media.videoUrl ? (
            <iframe
              src={getEmbedUrl(question.media.videoUrl)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          ) : null}
        </div>
      )}

      {question.media?.type === 'audio' && question.media.audioFile?.asset?.url && (
        <div className="mb-6 aspect-video flex items-center justify-center overflow-hidden rounded-lg bg-bg p-4">
          <audio
            src={question.media.audioFile.asset.url}
            controls
            autoPlay
            className="w-full"
          >
            <track kind="captions" />
          </audio>
        </div>
      )}

      {/* Question text */}
      <h2 className="mb-6 font-display text-2xl font-bold text-text">
        {question.questionText}
      </h2>

      {/* Answer input */}
      {question.questionType === 'text' ? (
        <form onSubmit={handleSubmitText} className="space-y-4">
          <input
            type="text"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Skriv svaret ditt..."
            disabled={disabled}
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !textAnswer.trim()}
            className="w-full rounded-lg bg-success py-3 font-semibold text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Sjekker...' : 'Svar'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <button
              type="button"
              key={option._key}
              onClick={() => handleSelectOption(option.text)}
              disabled={disabled}
              className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors ${
                selectedOption === option.text
                  ? 'bg-primary/20 ring-2 ring-primary'
                  : 'bg-bg hover:bg-card-hover'
              } text-text disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-border text-sm">
                {String.fromCharCode(65 + index)}
              </span>
              {option.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getEmbedUrl(url: string): string {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
  )
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1`
  }

  return url
}
