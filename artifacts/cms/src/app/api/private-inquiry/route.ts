import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendEmail } from '@/lib/email'

type FieldErrors = Record<string, string>

type RawBody = {
  name?: unknown
  email?: unknown
  phone?: unknown
  preferredDate?: unknown
  guestCount?: unknown
  message?: unknown
}

type ValidatedInput = {
  name: string
  email: string
  phone: string
  message: string
  preferredDate?: string
  guestCount?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function validate(body: RawBody): { ok: true; data: ValidatedInput } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {}

  const name = asTrimmedString(body.name)
  const email = asTrimmedString(body.email)
  const phone = asTrimmedString(body.phone)
  const message = asTrimmedString(body.message)

  if (!name) errors.name = 'Name is required.'
  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'
  if (!phone) errors.phone = 'Phone is required.'
  if (!message) errors.message = 'Message is required.'

  let preferredDate: string | undefined
  if (body.preferredDate !== undefined && body.preferredDate !== null && body.preferredDate !== '') {
    const raw = asTrimmedString(body.preferredDate)
    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) {
      errors.preferredDate = 'Preferred date is not a valid date.'
    } else {
      preferredDate = parsed.toISOString()
    }
  }

  let guestCount: string | undefined
  if (body.guestCount !== undefined && body.guestCount !== null && body.guestCount !== '') {
    const raw =
      typeof body.guestCount === 'number'
        ? String(body.guestCount)
        : asTrimmedString(body.guestCount)
    if (raw === 'Not sure yet' || /^\d+$/.test(raw)) {
      guestCount = raw
    } else {
      errors.guestCount = 'Guest count must be a number or "Not sure yet".'
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    data: { name, email, phone, message, preferredDate, guestCount },
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function adminEmailHtml(data: ValidatedInput): string {
  const rows: Array<[string, string]> = [
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Preferred date', data.preferredDate ? new Date(data.preferredDate).toLocaleString('en-US') : '(not provided)'],
    ['Guest count', data.guestCount ?? '(not provided)'],
    ['Message', data.message],
  ]
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 12px;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`,
    )
    .join('')
  return `
    <h2>New private event inquiry</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">${body}</table>
  `
}

function autoReplyHtml(): string {
  return `
    <p>Thank you! We'll be in touch within 24 hours.</p>
    <p style="color:#555;font-size:13px;">— Erica's Paint &amp; Sip</p>
  `
}

export async function POST(request: Request) {
  let body: RawBody
  try {
    body = (await request.json()) as RawBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const result = validate(body)
  if (!result.ok) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors: result.errors },
      { status: 400 },
    )
  }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'private-inquiries',
    data: result.data,
  })

  const adminEmail = process.env.ADMIN_EMAIL
  const tasks: Array<Promise<void>> = []
  if (adminEmail) {
    tasks.push(
      sendEmail({
        to: adminEmail,
        subject: `Private event inquiry from ${result.data.name}`,
        html: adminEmailHtml(result.data),
      }),
    )
  } else {
    console.warn('[private-inquiry] ADMIN_EMAIL not set — admin notification skipped.')
  }
  tasks.push(
    sendEmail({
      to: result.data.email,
      subject: "Thanks for reaching out — Erica's Paint & Sip",
      html: autoReplyHtml(),
    }),
  )

  const settled = await Promise.allSettled(tasks)
  for (const r of settled) {
    if (r.status === 'rejected') {
      console.error('[private-inquiry] email send failed:', r.reason)
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
