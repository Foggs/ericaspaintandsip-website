'use client'

import { useMemo, useState } from 'react'
import {
  PayPalScriptProvider,
  PayPalButtons,
  type ReactPayPalScriptOptions,
} from '@paypal/react-paypal-js'

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

const labelStyle = { display: 'block', fontWeight: 600, marginBottom: '0.25rem' }
const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
  boxSizing: 'border-box' as const,
}
const fieldStyle = { marginBottom: '1rem' }
const errorStyle = { color: '#b00020', fontSize: '0.875rem', marginTop: '0.25rem' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #cfe8d4',
          background: '#f0faf2',
          borderRadius: '8px',
          color: '#1f5132',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>You&apos;re booked!</h2>
        <p style={{ margin: 0 }}>
          A confirmation email is on the way to <strong>{email}</strong>.
        </p>
        {bookingId !== null ? (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#1f5132' }}>
            Booking reference: #{String(bookingId)}
          </p>
        ) : null}
      </div>
    )
  }

  if (!clientId) {
    return (
      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          background: '#fafafa',
          color: '#555',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
          Reserve your seats
        </h2>
        <p style={{ margin: 0 }}>
          Online registration is being set up. Check back soon, or call us to
          reserve your spot for <strong>{eventTitle}</strong>.
        </p>
      </div>
    )
  }

  const inPaying = phase === 'paying'

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        background: '#fafafa',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
        Reserve your seats
      </h2>

      <form onSubmit={handleContinue} noValidate>
        <fieldset disabled={inPaying} style={{ border: 0, padding: 0, margin: 0 }}>
          <div style={fieldStyle}>
            <label htmlFor="reg-name" style={labelStyle}>
              Name
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <p style={errorStyle}>{errors.name}</p> : null}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="reg-email" style={labelStyle}>
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <p style={errorStyle}>{errors.email}</p> : null}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="reg-phone" style={labelStyle}>
              Phone
            </label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone ? <p style={errorStyle}>{errors.phone}</p> : null}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="reg-seats" style={labelStyle}>
              Seats
            </label>
            <input
              id="reg-seats"
              type="number"
              min={1}
              max={20}
              value={seats}
              onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
              style={{ ...inputStyle, maxWidth: '8rem' }}
              aria-invalid={Boolean(errors.seats)}
            />
            {errors.seats ? <p style={errorStyle}>{errors.seats}</p> : null}
          </div>

          {!inPaying ? (
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Continue to payment
            </button>
          ) : null}
        </fieldset>
      </form>

      {inPaying && paypalOptions ? (
        <div style={{ marginTop: '1.5rem' }}>
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
                  setErrorMessage(body.error ?? 'Payment recorded but booking failed. Please contact us.')
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
            style={{
              marginTop: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#555',
              cursor: 'pointer',
              padding: '0.25rem 0',
              fontSize: '0.875rem',
            }}
          >
            ← Edit details
          </button>
        </div>
      ) : null}

      {phase === 'error' && errorMessage ? (
        <div
          role="alert"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            border: '1px solid #f5c2c7',
            background: '#fdecee',
            borderRadius: '4px',
            color: '#842029',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0' }}>{errorMessage}</p>
          <button
            type="button"
            onClick={backToForm}
            style={{
              padding: '0.5rem 1rem',
              background: '#842029',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  )
}
