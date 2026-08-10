import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  createPayPalOrder,
  PayPalError,
  PayPalNotConfiguredError,
} from '@/lib/paypal'

type RawBody = { eventId?: unknown; seats?: unknown }

function asPositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return null
  return n
}

export async function POST(request: Request) {
  let body: RawBody
  try {
    body = (await request.json()) as RawBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const eventId = asPositiveInt(body.eventId)
  const seats = asPositiveInt(body.seats)
  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required.' }, { status: 400 })
  }
  if (!seats || seats > 20) {
    return NextResponse.json(
      { error: 'Seats must be a whole number between 1 and 20.' },
      { status: 400 },
    )
  }

  const payload = await getPayloadClient()

  let event
  try {
    event = await payload.findByID({ collection: 'events', id: eventId, depth: 0 })
  } catch {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }
  if (!event.isPublished) {
    return NextResponse.json({ error: 'Event not available.' }, { status: 404 })
  }
  if (new Date(event.date).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Event has already passed.' }, { status: 404 })
  }
  const price = Number(event.price)
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { error: "This event isn't open for online registration." },
      { status: 400 },
    )
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
        { error: `Only ${Math.max(0, capacity - taken)} seats left.` },
        { status: 409 },
      )
    }
  }

  const totalAmount = (price * seats).toFixed(2)

  try {
    const order = await createPayPalOrder({
      amount: totalAmount,
      description: `${event.title} × ${seats}`,
      customId: `event:${eventId}|seats:${seats}`,
    })
    return NextResponse.json({ orderID: order.id, amount: totalAmount }, { status: 201 })
  } catch (err) {
    if (err instanceof PayPalNotConfiguredError) {
      console.error('[create-order] PayPal not configured')
      return NextResponse.json({ error: 'Online registration is not configured.' }, { status: 503 })
    }
    if (err instanceof PayPalError) {
      console.error('[create-order] PayPal error:', err.status, err.body)
      return NextResponse.json({ error: 'Could not create payment.' }, { status: 502 })
    }
    console.error('[create-order] unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
