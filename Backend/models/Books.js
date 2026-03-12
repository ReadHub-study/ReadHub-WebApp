import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },

    coverImageUrl: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastPageRead: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['reading', 'completed', 'plan to read'],
      default: 'plan to read',
    },
  },
  { timestamps: true },
)

const Book = mongoose.model('Book', bookSchema)

export default Book
