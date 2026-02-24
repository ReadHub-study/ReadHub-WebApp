import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connection successful')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

export default connectDB
