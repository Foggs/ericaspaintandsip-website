import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

type RawBody = {
  name?: unknown
  email?: unknown
}

type FieldErrors = Partial<{ name: string; email: string }>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function looksLikeUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as {
    name?: unknown
    code?: unknown
    message?: unknown
    data?: unknown
  }
  if (e.code === '23505') return true
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : ''
  if (
    message.includes('unique') ||
    message.includes('duplicate') ||
    message.includes('already exists')
  ) {
    return true
  }
  if (e.name === 'ValidationError' && Array.isArray(e.data)) {
    for (const entry of e.data) {
      if (
        entry &&
        typeof entry === 'object' &&
        'field' in entry &&
        (entry as { field?: unknown }).field === 'email'
      ) {
        return true
      }
    }
  }
  return false
}

export async function POST(request: Request) {
  let body: RawBody
  try {
    body = (await request.json()) as RawBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const name = asTrimmedString(body.name)
  const rawEmail = asTrimmedString(body.email)
  const email = rawEmail.toLowerCase()

  const fieldErrors: FieldErrors = {}
  if (!name) fieldErrors.name = 'Name is required.'
  if (!email) fieldErrors.email = 'Email is required.'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Please enter a valid email address.'

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors },
      { status: 400 },
    )
  }

  const payload = await getPayloadClient()

  const existing = await payload.find({
    collection: 'newsletter-subscribers',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    return NextResponse.json(
      { ok: true, alreadySubscribed: true, message: "You're already subscribed — thanks!" },
      { status: 200 },
    )
  }

  try {
    await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        name,
        email,
        subscribedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    if (looksLikeUniqueViolation(err)) {
      return NextResponse.json(
        { ok: true, alreadySubscribed: true, message: "You're already subscribed — thanks!" },
        { status: 200 },
      )
    }
    console.error('[newsletter] create failed:', err)
    return NextResponse.json(
      { error: 'Could not subscribe right now. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { ok: true, alreadySubscribed: false, message: 'Thanks for subscribing!' },
    { status: 201 },
  )
}
