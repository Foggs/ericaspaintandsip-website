import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  capturePayPalOrder,
  PayPalError,
  PayPalNotConfiguredError,
} from '@/lib/paypal'
import {
  bookingConfirmationAdminHtml,
  bookingConfirmationCustomerHtml,
  sendEmail,
} from '@/lib/email'

type RawBody = {
  orderID?: unknown
  eventId?: unknown
  seats?: unknown
  name?: unknown
  email?: unknown
  phone?: unknown
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeStyle: 'short',
})

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}
function asPositiveInt(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return null
  return n
}

function extractPayPalIssue(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const details = (body as { details?: unknown }).details
  if (!Array.isArray(details) || details.length === 0) return null
  const first = details[0] as { issue?: unknown } | null
  return typeof first?.issue === 'string' ? first.issue : null
}

export async function POST(request: Request) {
  let body: RawBody
  try {
    body = (await request.json()) as RawBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const orderID = asString(body.orderID)
  const eventId = asPositiveInt(body.eventId)
  const seats = asPositiveInt(body.seats)
  const name = asString(body.name)
  const email = asString(body.email)
  const phone = asString(body.phone)

  if (!orderID) return NextResponse.json({ error: 'orderID is required.' }, { status: 400 })
  if (!eventId) return NextResponse.json({ error: 'eventId is required.' }, { status: 400 })
  if (!seats || seats > 20) {
    return NextResponse.json(
      { error: 'Seats must be a whole number between 1 and 20.' },
      { status: 400 },
    )
  }
  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  if (!phone) return NextResponse.json({ error: 'Phone is required.' }, { status: 400 })

  const payload = await getPayloadClient()

  const existing = await payload.find({
    collection: 'bookings',
    where: { paypalOrderId: { equals: orderID } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    return NextResponse.json(
      { ok: true, bookingId: existing.docs[0].id, alreadyProcessed: true },
      { status: 200 },
    )
  }

  let event
  try {
    event = await payload.findByID({ collection: 'events', id: eventId, depth: 0 })
  } catch {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }
  if (!event.isPublished) {
    return NextResponse.json({ error: 'Event not available.' }, { status: 404 })
  }
  const price = Number(event.price)
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: 'Event is not open for online registration.' }, { status: 400 })
  }

  const capacity = Number(event.capacity)
  if (Number.isFinite(capacity) && capacity > 0) {
    const existing = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { event: { equals: eventId } },
          { status: { equals: 'paid' } },
        ],
      },
      limit: 1000,
      depth: 0,
    })
    const taken = existing.docs.reduce((sum, b) => sum + (Number(b.seats) || 0), 0)
    if (taken + seats > capacity) {
      return NextResponse.json(
        { error: `Only ${Math.max(0, capacity - taken)} seats remain.` },
        { status: 409 },
      )
    }
  }

  const expectedAmount = Math.round(price * seats * 100) / 100

  let capture
  try {
    capture = await capturePayPalOrder(orderID)
  } catch (err) {
    if (err instanceof PayPalNotConfiguredError) {
      return NextResponse.json({ error: 'Online registration is not configured.' }, { status: 503 })
    }
    if (err instanceof PayPalError) {
      const issue = extractPayPalIssue(err.body)
      if (issue === 'ORDER_ALREADY_CAPTURED') {
        const recheck = await payload.find({
          collection: 'bookings',
          where: { paypalOrderId: { equals: orderID } },
          limit: 1,
          depth: 0,
        })
        if (recheck.docs.length > 0) {
          return NextResponse.json(
            { ok: true, bookingId: recheck.docs[0].id, alreadyProcessed: true },
            { status: 200 },
          )
        }
        console.error('[capture-order] PayPal says order already captured but no booking found:', orderID)
        return NextResponse.json(
          { error: 'Payment was already processed. Please contact us with your PayPal order ID.' },
          { status: 409 },
        )
      }
      console.error('[capture-order] PayPal error:', err.status, err.body)
      return NextResponse.json({ error: 'Payment capture failed.' }, { status: 502 })
    }
    console.error('[capture-order] unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }

  if (capture.status !== 'COMPLETED') {
    console.error('[capture-order] non-completed status:', capture.status, capture.raw)
    return NextResponse.json({ error: 'Payment not completed.' }, { status: 402 })
  }
  if (capture.currency !== 'USD') {
    console.error('[capture-order] currency mismatch:', capture.currency)
    return NextResponse.json({ error: 'Currency mismatch.' }, { status: 400 })
  }
  const captured = Number(capture.amount)
  if (!Number.isFinite(captured) || Math.abs(captured - expectedAmount) > 0.01) {
    console.error('[capture-order] amount mismatch:', { captured, expectedAmount, raw: capture.raw })
    return NextResponse.json({ error: 'Amount mismatch.' }, { status: 400 })
  }

  let booking
  try {
    booking = await payload.create({
      collection: 'bookings',
      overrideAccess: true,
      data: {
        event: eventId,
        name,
        email,
        phone,
        seats,
        amountPaid: captured,
        paypalOrderId: orderID,
        status: 'paid',
      },
    })
  } catch (err) {
    const recheck = await payload.find({
      collection: 'bookings',
      where: { paypalOrderId: { equals: orderID } },
      limit: 1,
      depth: 0,
    })
    if (recheck.docs.length > 0) {
      return NextResponse.json(
        { ok: true, bookingId: recheck.docs[0].id, alreadyProcessed: true },
        { status: 200 },
      )
    }
    console.error('[capture-order] booking insert failed:', err)
    return NextResponse.json({ error: 'Failed to record booking.' }, { status: 500 })
  }

  const eventDate = dateFormatter.format(new Date(event.date))
  const adminEmail = process.env.ADMIN_EMAIL
  const tasks: Array<Promise<void>> = [
    sendEmail({
      to: email,
      subject: `Your booking for ${event.title}`,
      html: bookingConfirmationCustomerHtml({
        name,
        eventTitle: event.title,
        eventDate,
        eventLocation: event.location ?? undefined,
        seats,
        amountPaid: captured.toFixed(2),
      }),
    }),
  ]
  if (adminEmail) {
    tasks.push(
      sendEmail({
        to: adminEmail,
        subject: `New booking: ${event.title} (${name})`,
        html: bookingConfirmationAdminHtml({
          name,
          email,
          phone,
          eventTitle: event.title,
          eventDate,
          eventLocation: event.location ?? undefined,
          seats,
          amountPaid: captured.toFixed(2),
          paypalOrderId: orderID,
        }),
      }),
    )
  } else {
    console.warn('[capture-order] ADMIN_EMAIL not set — admin notification skipped.')
  }
  const settled = await Promise.allSettled(tasks)
  for (const r of settled) {
    if (r.status === 'rejected') console.error('[capture-order] email failed:', r.reason)
  }

  return NextResponse.json({ ok: true, bookingId: booking.id }, { status: 201 })
}
