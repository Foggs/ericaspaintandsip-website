'use client'

import { useMemo, useState } from 'react'
import {
  PayPalScriptProvider,
  PayPalButtons,
  type ReactPayPalScriptOptions,
} from '@paypal/react-paypal-js'
import { cn } from '@/lib/utils'

type Props = {
  eventId: number
  eventTitle: string
}

type FieldErrors = Partial<{
  name: string
  email: string
  phone: string
  seats: string
}>

type Phase = 'form' | 'paying' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const labelClass = 'mb-1 block font-semibold text-ink'
const inputClass =
  'w-full rounded-md border border-primary/20 bg-white px-3 py-2 text-base text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const fieldClass = 'mb-4'
const errorClass = 'mt-1 text-sm text-danger'

export function RegistrationForm({ eventId, eventTitle }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [seats, setSeats] = useState(1)
  const [phase, setPhase] = useState<Phase>('form')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | number | null>(null)

  const paypalOptions = useMemo<ReactPayPalScriptOptions | null>(() => {
    if (!clientId) return null
    return { clientId, currency: 'USD', intent: 'capture' }
  }, [clientId])

  function validate(): FieldErrors {
    const e: FieldErrors = {}
    if (!name.trim()) e.name = 'Name is required.'
    if (!email.trim()) e.email = 'Email is required.'
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Please enter a valid email address.'
    if (!phone.trim()) e.phone = 'Phone is required.'
    if (!Number.isInteger(seats) || seats < 1 || seats > 20) {
      e.seats = 'Seats must be a whole number between 1 and 20.'
    }
    return e
  }

  function handleContinue(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) {
      setErrors(v)
      return
    }
    setErrors({})
    setErrorMessage(null)
    setPhase('paying')
  }

  function backToForm() {
    setPhase('form')
    setErrorMessage(null)
  }

  if (phase === 'success') {
    return (
      <div
        role="status"
        className="mt-8 rounded-lg border border-success-border bg-success-bg p-6 text-success"
      >
        <h2 className="mb-2 font-display text-2xl font-semibold text-success">
          You&apos;re booked!
        </h2>
        <p className="m-0">
          A confirmation email is on the way to <strong>{email}</strong>.
        </p>
        {bookingId !== null ? (
          <p className="mt-2 text-sm text-success">
            Booking reference: #{String(bookingId)}
          </p>
        ) : null}
      </div>
    )
  }

  if (!clientId) {
    return (
      <div className="mt-8 rounded-lg border border-primary/15 bg-white p-6 text-muted shadow-sm">
        <h2 className="mb-2 font-display text-xl font-semibold text-ink">
          Reserve your seats
        </h2>
        <p className="m-0">
          Online registration is being set up. Check back soon, or call us to reserve your
          spot for <strong>{eventTitle}</strong>.
        </p>
      </div>
    )
  }

  const inPaying = phase === 'paying'

  return (
    <div className="mt-8 rounded-lg border border-primary/15 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-xl font-semibold text-ink">
        Reserve your seats
      </h2>

      <form onSubmit={handleContinue} noValidate>
        <fieldset disabled={inPaying} className="m-0 border-0 p-0">
          <div className={fieldClass}>
            <label htmlFor="reg-name" className={labelClass}>
              Name
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <p className={errorClass}>{errors.name}</p> : null}
          </div>

          <div className={fieldClass}>
            <label htmlFor="reg-email" className={labelClass}>
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <p className={errorClass}>{errors.email}</p> : null}
          </div>

          <div className={fieldClass}>
            <label htmlFor="reg-phone" className={labelClass}>
              Phone
            </label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone ? <p className={errorClass}>{errors.phone}</p> : null}
          </div>

          <div className={fieldClass}>
            <label htmlFor="reg-seats" className={labelClass}>
              Seats
            </label>
            <input
              id="reg-seats"
              type="number"
              min={1}
              max={20}
              value={seats}
              onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
              className={cn(inputClass, 'max-w-32')}
              aria-invalid={Boolean(errors.seats)}
            />
            {errors.seats ? <p className={errorClass}>{errors.seats}</p> : null}
          </div>

          {!inPaying ? (
            <button
              type="submit"
              className="rounded-md bg-primary px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark motion-reduce:transition-none"
            >
              Continue to payment
            </button>
          ) : null}
        </fieldset>
      </form>

      {inPaying && paypalOptions ? (
        <div className="mt-6">
          <PayPalScriptProvider options={paypalOptions}>
            <PayPalButtons
              style={{ layout: 'vertical', label: 'pay' }}
              createOrder={async () => {
                setErrorMessage(null)
                const res = await fetch('/cms/api/paypal/create-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ eventId, seats }),
                })
                const data = (await res.json().catch(() => ({}))) as {
                  orderID?: string
                  error?: string
                }
                if (!res.ok || !data.orderID) {
                  setErrorMessage(data.error ?? 'Could not start payment.')
                  setPhase('error')
                  throw new Error(data.error ?? 'create-order failed')
                }
                return data.orderID
              }}
              onApprove={async (data) => {
                const res = await fetch('/cms/api/paypal/capture-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderID: data.orderID,
                    eventId,
                    seats,
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                  }),
                })
                const body = (await res.json().catch(() => ({}))) as {
                  ok?: boolean
                  bookingId?: string | number
                  error?: string
                }
                if (!res.ok || !body.ok) {
                  setErrorMessage(
                    body.error ?? 'Payment recorded but booking failed. Please contact us.',
                  )
                  setPhase('error')
                  return
                }
                setBookingId(body.bookingId ?? null)
                setPhase('success')
              }}
              onCancel={() => {
                setPhase('form')
                setErrorMessage(null)
              }}
              onError={(err) => {
                console.error('[paypal] sdk error', err)
                setErrorMessage('Payment could not be processed. Please try again.')
                setPhase('error')
              }}
            />
          </PayPalScriptProvider>

          <button
            type="button"
            onClick={backToForm}
            className="mt-2 cursor-pointer border-none bg-transparent px-0 py-1 text-sm text-muted hover:text-ink"
          >
            ← Edit details
          </button>
        </div>
      ) : null}

      {phase === 'error' && errorMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-md border border-danger-border bg-danger-bg p-4 text-danger"
        >
          <p className="mb-2 m-0">{errorMessage}</p>
          <button
            type="button"
            onClick={backToForm}
            className="rounded-md border-none bg-danger px-4 py-2 font-semibold text-white hover:bg-danger/90"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  )
}
