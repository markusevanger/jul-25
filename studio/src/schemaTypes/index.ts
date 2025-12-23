import {settings} from './singletons/settings'
import {blockContent} from './objects/blockContent'
import {question} from './objects/question'
import {answerOption} from './objects/answerOption'
import {quiz} from './documents/quiz'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  quiz,
  // Objects
  blockContent,
  question,
  answerOption,
]
