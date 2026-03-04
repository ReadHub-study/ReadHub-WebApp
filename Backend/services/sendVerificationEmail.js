import dotenv from 'dotenv'
dotenv.config()

import VerificationCode from '../models/Verify-user.js'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(email, fullName) {
  try {
    await VerificationCode.findOneAndDelete({ email })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await VerificationCode.create({
      email,
      code,
      expiresAt,
    })

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          email: process.env.EMAIL_FROM,
          name: 'ReadHub App',
        },
        to: [{ email, name: fullName }],
        templateId: Number(process.env.BREVO_TEMPLATE_ID),
        params: {
          FIRSTNAME: fullName,
          CODE: code,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(JSON.stringify(errorData))
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error.message)
    return { success: false, error: error.message }
  }
}
