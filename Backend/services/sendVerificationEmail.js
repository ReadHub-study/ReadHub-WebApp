import dotenv from 'dotenv'
dotenv.config()
import Brevo from '@getbrevo/brevo'
import VerificationCode from '../models/Verify-user.js'

const apiInstance = new Brevo.TransactionalEmailsApi()

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
)

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(email, fullName) {
  try {
    // Delete existing code
    await VerificationCode.findOneAndDelete({ email })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await VerificationCode.create({
      email,
      code,
      expiresAt,
    })

    const sendSmtpEmail = {
      sender: {
        email: process.env.EMAIL_FROM,
        name: 'ReadHub App',
      },
      to: [
        {
          email,
          name: fullName,
        },
      ],
      templateId: Number(process.env.BREVO_TEMPLATE_ID),
      params: {
        FIRSTNAME: fullName,
        CODE: code,
      },
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail)

    return { success: true }
  } catch (error) {
    console.error(
      'Error sending verification email:',
      error.response?.body || error.message,
    )
    return { success: false, error: error.message }
  }
}
