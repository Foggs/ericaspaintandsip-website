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

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export type BookingEmailInput = {
  name: string
  eventTitle: string
  eventDate: string
  eventLocation?: string
  seats: number
  amountPaid: string
}

export function bookingConfirmationCustomerHtml(input: BookingEmailInput): string {
  return `
    <h2>You're booked!</h2>
    <p>Hi ${escapeHtml(input.name)}, thanks for registering for <strong>${escapeHtml(input.eventTitle)}</strong>.</p>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:6px 12px;font-weight:600;">When</td><td style="padding:6px 12px;">${escapeHtml(input.eventDate)}</td></tr>
      ${input.eventLocation ? `<tr><td style="padding:6px 12px;font-weight:600;">Where</td><td style="padding:6px 12px;">${escapeHtml(input.eventLocation)}</td></tr>` : ''}
      <tr><td style="padding:6px 12px;font-weight:600;">Seats</td><td style="padding:6px 12px;">${input.seats}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:600;">Total paid</td><td style="padding:6px 12px;">$${escapeHtml(input.amountPaid)}</td></tr>
    </table>
    <p style="margin-top:1rem;">See you soon!</p>
    <p style="color:#555;font-size:13px;">— Erica's Paint &amp; Sip</p>
  `
}

export type BookingAdminEmailInput = BookingEmailInput & {
  email: string
  phone: string
  paypalOrderId: string
}

export function bookingConfirmationAdminHtml(input: BookingAdminEmailInput): string {
  const rows: Array<[string, string]> = [
    ['Event', input.eventTitle],
    ['Date', input.eventDate],
    ['Name', input.name],
    ['Email', input.email],
    ['Phone', input.phone],
    ['Seats', String(input.seats)],
    ['Amount paid', `$${input.amountPaid}`],
    ['PayPal order ID', input.paypalOrderId],
  ]
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 12px;">${escapeHtml(value)}</td></tr>`,
    )
    .join('')
  return `
    <h2>New booking</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">${body}</table>
  `
}
