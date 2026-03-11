import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String },
    googleId: { type: String },
    provider: {
      type: [String],
      enum: ['local', 'google'],
      default: ['local'],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model('User', userSchema)

export default User
