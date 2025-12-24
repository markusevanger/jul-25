import { defineType, defineField, defineArrayMember } from 'sanity'
import { HelpCircleIcon, ImageIcon, PlayIcon, LinkIcon, DocumentVideoIcon, ControlsIcon } from '@sanity/icons'
import { RadioInputWithMeta } from '../../components/RadioInputWithMeta'

const questionTypeOptions = [
  {
    title: 'Flervalg',
    value: 'radio',
    icon: HelpCircleIcon,
    description: 'Spillere velger ett eller flere riktige svar fra en liste',
  },
  {
    title: 'Tekstsvar',
    value: 'text',
    icon: HelpCircleIcon,
    description: 'Spillere skriver inn svaret selv',
  },
]

const mediaTypeOptions = [
  {
    title: 'Bilde',
    value: 'image',
    icon: ImageIcon,
    description: 'Last opp et bilde fra enheten eller Unsplash',
  },
  {
    title: 'Video',
    value: 'video',
    icon: PlayIcon,
    description: 'Legg til video fra fil eller ekstern lenke',
  },
  {
    title: 'Lyd',
    value: 'audio',
    icon: ControlsIcon,
    description: 'Last opp lydfil (MP3, WAV, etc.)',
  },
]

const videoSourceOptions = [
  {
    title: 'Ekstern lenke',
    value: 'external',
    icon: LinkIcon,
    description: 'YouTube, Vimeo eller annen video-URL',
  },
  {
    title: 'Fil',
    value: 'file',
    icon: DocumentVideoIcon,
    description: 'Last opp videofil direkte til Sanity',
  },
]

export const question = defineType({
  name: 'question',
  title: 'Spørsmål',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'questionText',
      title: 'Spørsmål',
      type: 'string',
      validation: (rule) => rule.required().error('Spørsmål er påkrevd'),
    }),
    defineField({
      name: 'questionType',
      title: 'Spørsmålstype',
      type: 'string',
      components: {
        input: RadioInputWithMeta,
      },
      options: {
        list: questionTypeOptions.map(({ title, value }) => ({ title, value })),
        metaOptions: questionTypeOptions,
      } as never,
      initialValue: 'radio',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'media',
      title: 'Media (valgfritt)',
      type: 'object',
      options: {
        collapsible: true,
      },
      fields: [
        defineField({
          name: 'type',
          title: 'Medietype',
          type: 'string',
          components: {
            input: RadioInputWithMeta,
          },
          options: {
            list: mediaTypeOptions.map(({ title, value }) => ({ title, value })),
            metaOptions: mediaTypeOptions,
          } as never,
        }),
        defineField({
          name: 'image',
          title: 'Bilde',
          type: 'image',
          options: { hotspot: true },
          hidden: ({ parent }) => parent?.type !== 'image',
        }),
        defineField({
          name: 'videoSource',
          title: 'Videokilde',
          type: 'string',
          components: {
            input: RadioInputWithMeta,
          },
          options: {
            list: videoSourceOptions.map(({ title, value }) => ({ title, value })),
            metaOptions: videoSourceOptions,
          } as never,
          initialValue: 'external',
          hidden: ({ parent }) => parent?.type !== 'video',
        }),
        defineField({
          name: 'videoUrl',
          title: 'Video URL',
          type: 'url',
          description: 'YouTube, Vimeo eller annen video-URL',
          hidden: ({ parent }) => parent?.type !== 'video' || parent?.videoSource !== 'external',
        }),
        defineField({
          name: 'videoFile',
          title: 'Videofil',
          type: 'file',
          options: {
            accept: 'video/*',
          },
          hidden: ({ parent }) => parent?.type !== 'video' || parent?.videoSource !== 'file',
        }),
        defineField({
          name: 'audioFile',
          title: 'Lydfil',
          type: 'file',
          options: {
            accept: 'audio/*',
          },
          hidden: ({ parent }) => parent?.type !== 'audio',
        }),
      ],
    }),
    defineField({
      name: 'options',
      title: 'Svaralternativer',
      type: 'array',
      of: [defineArrayMember({ type: 'answerOption' })],
      hidden: ({ parent }) => parent?.questionType !== 'radio',
      validation: (rule) =>
        rule.custom((options, context) => {
          const parent = context.parent as { questionType?: string }
          if (parent?.questionType === 'radio') {
            if (!options || options.length < 2) {
              return 'Flervalg krever minst 2 alternativer'
            }
            const correctAnswers = (options as Array<{ isCorrect?: boolean }>).filter(
              (opt) => opt.isCorrect
            )
            if (correctAnswers.length === 0) {
              return 'Minst ett alternativ må være markert som riktig'
            }
          }
          return true
        }),
    }),
    defineField({
      name: 'correctAnswer',
      title: 'Riktig svar',
      type: 'string',
      description: 'Det eksakte svaret spilleren må skrive (ikke skille mellom store/små bokstaver)',
      hidden: ({ parent }) => parent?.questionType !== 'text',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { questionType?: string }
          if (parent?.questionType === 'text' && !value) {
            return 'Riktig svar er påkrevd for tekstspørsmål'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: { title: 'questionText', type: 'questionType', options: 'options' },
    prepare({ title, type, options }) {
      let subtitle = type === 'radio' ? 'Flervalg' : 'Tekstsvar'
      if (type === 'radio' && options?.length) {
        const correctCount = options.filter((opt: { isCorrect?: boolean }) => opt.isCorrect).length
        subtitle += ` • ${options.length} alternativer • ${correctCount} riktig${correctCount !== 1 ? 'e' : ''}`
      }
      return {
        title: title || 'Uten tittel',
        subtitle,
      }
    },
  },
})
