import User from '../models/User.js'
import bcrypt from 'bcrypt'
import {
  generateAccessToken,
  generateRefreshToken,
} from '../services/generateToken.js'
import { verifyGoogleToken } from '../services/GoogleAuth.js'
import { sendVerificationEmail } from '../services/sendVerificationEmail.js'
import VerificationCode from '../models/Verify-user.js'

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already in use' })
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    })
    await newUser.save()
    return res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email or username already in use' })
    }
    return res.status(500).json({ error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    if (!user.password || !user.provider.includes('local')) {
      return res.status(400).json({ message: 'Login with Google' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const accessToken = generateAccessToken({ id: user._id })

    const refreshToken = generateRefreshToken({ id: user._id })

    await User.updateOne({ _id: user._id }, { $set: { refreshToken } })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
    })
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' })
  }
}

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body
    if (!idToken) {
      return res.status(400).json({ error: 'Google token required' })
    }

    const payload = await verifyGoogleToken(idToken)

    const { sub: googleId, email, name, email_verified } = payload

    if (!email_verified) {
      return res.status(400).json({ error: 'Google email not verified' })
    }

    let user = await User.findOne({ email })

    if (user) {
      if (!user.provider.includes('google')) {
        user.googleId = googleId
        user.provider.push('google')
        await user.save()
      }
    }

    if (!user) {
      user = await User.create({
        email,
        username: name.replace(/\s+/g, '').toLowerCase(),
        googleId,
        provider: ['google'],
      })
    }

    const accessToken = generateAccessToken({ id: user._id })

    const refreshToken = generateRefreshToken({ id: user._id })

    await User.updateOne({ _id: user._id }, { $set: { refreshToken } })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return res.status(200).json({
      message: 'Google authentication successful',
      accessToken,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Google authentication failed' })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken)
      return res.status(401).json({ error: 'Refresh token missing' })

    const tokenExists = await User.findOne({ refreshToken })
    if (!tokenExists)
      return res.status(403).json({ error: 'Invalid refresh token' })

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid refresh token' })

      const newAccessToken = generateAccessToken(user)
      res.json({ accessToken: newAccessToken })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token missing' })
    }
    await User.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } })
    res.clearCookie('refreshToken')
    res.json({ message: 'User logged out successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const passwordOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(409).json({ Message: 'Email is required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(401)
        .json({ Message: 'User not found, please register' })
    }
    const username = user.username
    console.log(username)

    res.status(201).json({
      Message: `Verification code sent to ${email}, check your inbox or spam folder`,
    })

    sendVerificationEmail(email, username)
  } catch (error) {
    return res.status(500).json({
      Message: `Error in forget password API ${error.message}`,
    })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, password, code } = req.body

    if (!email || !password || !code) {
      return res
        .status(400)
        .json({ message: 'Email, password, and code are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const verificationRecord = await VerificationCode.findOne({ email, code })
    if (!verificationRecord) {
      return res.status(400).json({ message: 'Invalid or expired code' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await User.updateOne({ email }, { $set: { password: hashedPassword } })

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return res.status(500).json({
      message: `Error from server: ${error.message}`,
    })
  }
}

export const passwordTokenVerification = async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ message: 'Code is required' })
    }

    const record = await VerificationCode.findOne({ code })

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired code' })
    }

    if (record.expiresAt < new Date()) {
      await VerificationCode.deleteOne({ _id: record._id })
      return res.status(400).json({ message: 'Code has expired' })
    }

    return res.status(200).json({ message: 'Code is valid' })
  } catch (error) {
    console.error('Error verifying code:', error)
    return res.status(500).json({
      message: `Error from server: ${error.message}`,
    })
  }
}
