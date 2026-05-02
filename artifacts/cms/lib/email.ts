import nodemailer, { type Transporter } from 'nodemailer'

let cached: Transporter | null = null

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null
  if (!cached) {
    cached = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return cached
}

export type SendEmailInput = { to: string; subject: string; html: string }

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const transporter = getTransporter()
  const from =
    process.env.EMAIL_FROM ??
    process.env.SMTP_USER ??
    'no-reply@ericaspaintandsip.com'
  if (!transporter) {
    console.warn('[email] SMTP not configured — would have sent:', {
      from,
      to: input.to,
      subject: input.subject,
    })
    console.warn('[email] HTML body:\n' + input.html)
    return
  }
  await transporter.sendMail({ from, ...input })
}
