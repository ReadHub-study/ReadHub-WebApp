import cloudinary from '../config/cloudinary.js'
import User from '../models/User.js'

export const generatePictureSignature = async (req, res) => {
  try {
    if (!req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const timestamp = Math.round(Date.now() / 1000)

    const paramsToSign = {
      timestamp,
      folder: 'profile_pictures',
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET,
    )

    return res.json({
      ...paramsToSign,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate signature',
      error: error.message,
    })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { username, email, profilePicture } = req.body

    const updateUser = {}

    if (username) updateUser.username = username
    if (email) updateUser.email = email

    if (profilePicture) {
      if (
        !profilePicture.includes(
          `res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`,
        )
      ) {
        return res.status(400).json({ error: 'Invalid image source' })
      }

      updateUser.profilePicture = profilePicture
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateUser },
      { new: true, runValidators: true },
    ).select('-password -refreshToken')

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({ updatedUser })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).select('-password -refreshToken')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ message: 'User profile deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
