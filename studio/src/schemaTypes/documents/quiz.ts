import { defineType, defineField, defineArrayMember } from 'sanity'
import { PlayIcon } from '@sanity/icons'

export const quiz = defineType({
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (rule) => rule.required().error('Tittel er pakreved'),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'wrongAnswerPenalty',
      title: 'Straff for feil svar (sekunder)',
      type: 'number',
      description: 'Ventetid i sekunder ved feil svar',
      initialValue: 5,
      validation: (rule) =>
        rule
          .required()
          .min(0)
          .max(60)
          .error('Ma vaere mellom 0 og 60 sekunder'),
    }),
    defineField({
      name: 'questions',
      title: 'Sporsmal',
      type: 'array',
      of: [defineArrayMember({ type: 'question' })],
      validation: (rule) =>
        rule.required().min(1).error('Quizen ma ha minst ett sporsmal'),
    }),
  ],
  preview: {
    select: { title: 'title', questions: 'questions' },
    prepare({ title, questions }) {
      const count = questions?.length || 0
      return {
        title: title || 'Uten tittel',
        subtitle: `${count} ${count === 1 ? 'sporsmal' : 'sporsmal'}`,
      }
    },
  },
})
