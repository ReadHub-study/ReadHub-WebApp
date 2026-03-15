import mongoose from 'mongoose'

const readingSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    duration: {
      type: Number, // minutes
    },

    pagesRead: {
      type: Number,
      default: 0,
    },

    startPage: Number,

    endPage: Number,
  },
  { timestamps: true },
)

const ReadingSession = mongoose.model('ReadingSession', readingSessionSchema)

export default ReadingSession
