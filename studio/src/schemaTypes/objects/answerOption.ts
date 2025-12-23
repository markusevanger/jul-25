import { defineType, defineField } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'

export const answerOption = defineType({
  name: 'answerOption',
  title: 'Svaralternativ',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Svartekst',
      type: 'string',
      validation: (rule) => rule.required().error('Svartekst er påkrevd'),
    }),
    defineField({
      name: 'isCorrect',
      title: 'Riktig svar',
      type: 'boolean',
      description: 'Marker dette alternativet som riktig',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'text',
      isCorrect: 'isCorrect',
    },
    prepare({ title, isCorrect }) {
      return {
        title: title || 'Tomt alternativ',
        subtitle: isCorrect ? '✓ Riktig svar' : '',
        media: isCorrect ? CheckmarkCircleIcon : undefined,
      }
    },
  },
})
