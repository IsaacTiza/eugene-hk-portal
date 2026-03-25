import sgMail from '@sendgrid/mail'
import AppError from './appError.js'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async ({ to, subject, html }) => {
    const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject,
        html
    }

    try {
        const response = await sgMail.send(msg)
        console.log(`Email Sent: `,response[0].statusCode)
    }
    catch (err) {
        console.log(`SendGrid Error`, err.response?.body || err.message)
        throw new AppError('There was an error sending the email. Please try again later.', 500)
    }
}