import mongoose from 'mongoose'

const userStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },

    totalMinutesRead: {
      type: Number,
      default: 0,
    },

    todayReadingMinutes: {
      type: Number,
      default: 0,
    },

    dailyReadingGoal: {
      type: Number,
      default: 30,
    },

    currentStreak: {
      type: Number,
      default: 0,
    },

    bestStreak: {
      type: Number,
      default: 0,
    },

    lastReadingDate: Date,
  },
  { timestamps: true },
)

const UserStats = mongoose.model('UserStats', userStatsSchema)

export default UserStats
