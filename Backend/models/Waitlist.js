import mongoose from 'mongoose'

const WaitListSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const WaitList = mongoose.model('WaitList', waitListSchema)

export default WaitList
