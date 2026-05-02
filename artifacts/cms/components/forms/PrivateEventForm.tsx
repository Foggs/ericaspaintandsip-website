'use client'

import { useState, type FormEvent } from 'react'

type FieldErrors = Partial<{
  name: string
  email: string
  phone: string
  preferredDate: string
  guestCount: string
  message: string
}>

type Status = 'idle' | 'submitting' | 'success'

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

export function PrivateEventForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [notSure, setNotSure] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  function validateLocal(): FieldErrors {
    const e: FieldErrors = {}
    if (!name.trim()) e.name = 'Name is required.'
    if (!email.trim()) e.email = 'Email is required.'
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Please enter a valid email address.'
    if (!phone.trim()) e.phone = 'Phone is required.'
    if (!message.trim()) e.message = 'Message is required.'
    if (!notSure && guestCount && !/^\d+$/.test(guestCount)) {
      e.guestCount = 'Guest count must be a whole number.'
    }
    return e
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    setSubmitError(null)

    const localErrors = validateLocal()
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors)
      return
    }
    setErrors({})
    setStatus('submitting')

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      preferredDate: preferredDate || undefined,
      guestCount: notSure ? 'Not sure yet' : guestCount || undefined,
    }

    try {
      const res = await fetch('/cms/api/private-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setStatus('success')
        return
      }
      const body = (await res.json().catch(() => ({}))) as {
        error?: string
        fieldErrors?: FieldErrors
      }
      if (body.fieldErrors) setErrors(body.fieldErrors)
      setSubmitError(body.error ?? 'Something went wrong. Please try again.')
      setStatus('idle')
    } catch {
      setSubmitError('Network error. Please try again.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        style={{
          padding: '1.5rem',
          border: '1px solid #cfe8d4',
          background: '#f0faf2',
          borderRadius: '8px',
          color: '#1f5132',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Thank you!</h2>
        <p style={{ margin: 0 }}>We&apos;ll be in touch within 24 hours.</p>
      </div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        padding: '1.5rem',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        background: '#fafafa',
      }}
    >
      <div style={fieldStyle}>
        <label htmlFor="pi-name" style={labelStyle}>
          First &amp; Last Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="pi-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'pi-name-err' : undefined}
        />
        {errors.name ? (
          <p id="pi-name-err" style={errorStyle}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pi-email" style={labelStyle}>
          Email Address <span aria-hidden="true">*</span>
        </label>
        <input
          id="pi-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'pi-email-err' : undefined}
        />
        {errors.email ? (
          <p id="pi-email-err" style={errorStyle}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pi-phone" style={labelStyle}>
          Phone Number <span aria-hidden="true">*</span>
        </label>
        <input
          id="pi-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'pi-phone-err' : undefined}
        />
        {errors.phone ? (
          <p id="pi-phone-err" style={errorStyle}>
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pi-date" style={labelStyle}>
          Preferred Date
        </label>
        <input
          id="pi-date"
          type="date"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          style={{ ...inputStyle, maxWidth: '14rem' }}
        />
        {errors.preferredDate ? <p style={errorStyle}>{errors.preferredDate}</p> : null}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pi-guests" style={labelStyle}>
          Number of Guests
        </label>
        <input
          id="pi-guests"
          type="number"
          min={1}
          value={guestCount}
          disabled={notSure}
          onChange={(e) => setGuestCount(e.target.value)}
          style={{ ...inputStyle, maxWidth: '8rem' }}
          aria-invalid={Boolean(errors.guestCount)}
        />
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: '1rem',
            fontSize: '0.95rem',
          }}
        >
          <input
            type="checkbox"
            checked={notSure}
            onChange={(e) => {
              setNotSure(e.target.checked)
              if (e.target.checked) setGuestCount('')
            }}
          />
          Not sure yet
        </label>
        {errors.guestCount ? <p style={errorStyle}>{errors.guestCount}</p> : null}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pi-message" style={labelStyle}>
          Event Details / Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="pi-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' as const }}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'pi-message-err' : undefined}
        />
        {errors.message ? (
          <p id="pi-message-err" style={errorStyle}>
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '0.75rem 1.5rem',
          background: submitting ? '#666' : '#222',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Sending…' : 'Send inquiry'}
      </button>

      {submitError ? (
        <p role="alert" style={{ ...errorStyle, marginTop: '1rem' }}>
          {submitError}
        </p>
      ) : null}
    </form>
  )
}
