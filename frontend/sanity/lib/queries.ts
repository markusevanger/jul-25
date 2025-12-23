import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

// Quiz queries
export const allQuizzesQuery = defineQuery(`
  *[_type == "quiz"] | order(_createdAt desc) {
    _id,
    title,
    description,
    "questionCount": count(questions)
  }
`)

export const quizByIdQuery = defineQuery(`
  *[_type == "quiz" && _id == $quizId][0] {
    _id,
    title,
    description,
    wrongAnswerPenalty,
    questions[] {
      _key,
      questionText,
      questionType,
      media {
        type,
        image {
          asset->{
            _id,
            url,
            metadata { lqip, dimensions }
          },
          alt
        },
        videoSource,
        videoUrl,
        videoFile {
          asset->{
            _id,
            url
          }
        }
      },
      options[] {
        _key,
        text,
        isCorrect
      },
      correctAnswer
    }
  }
`)

// For player view - excludes correct answers (isCorrect and correctAnswer)
export const quizForPlayerQuery = defineQuery(`
  *[_type == "quiz" && _id == $quizId][0] {
    _id,
    title,
    description,
    wrongAnswerPenalty,
    "totalQuestions": count(questions),
    questions[] {
      _key,
      questionText,
      questionType,
      media {
        type,
        image {
          asset->{
            _id,
            url,
            metadata { lqip, dimensions }
          },
          alt
        },
        videoSource,
        videoUrl,
        videoFile {
          asset->{
            _id,
            url
          }
        }
      },
      options[] {
        _key,
        text
      }
    }
  }
`)
