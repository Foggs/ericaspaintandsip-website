'use client'

import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'

type FieldErrors = Partial<{
  name: string
  email: string
  phone: string
  preferredDate: string
  guestCount: string
  message: string
}>

type Status = 'idle' | 'submitting' | 'success'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const labelClass = 'mb-1 block font-semibold text-ink'
const inputClass =
  'w-full rounded-md border border-primary/20 bg-white px-3 py-2 text-base text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const fieldClass = 'mb-4'
const errorClass = 'mt-1 text-sm text-danger'

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
        className="rounded-lg border border-success-border bg-success-bg p-6 text-success"
      >
        <h2 className="mb-2 font-display text-2xl font-semibold text-success">Thank you!</h2>
        <p className="m-0">We&apos;ll be in touch within 24 hours.</p>
      </div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-primary/15 bg-white p-6 shadow-sm"
    >
      <div className={fieldClass}>
        <label htmlFor="pi-name" className={labelClass}>
          First &amp; Last Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="pi-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'pi-name-err' : undefined}
        />
        {errors.name ? (
          <p id="pi-name-err" className={errorClass}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className={fieldClass}>
        <label htmlFor="pi-email" className={labelClass}>
          Email Address <span aria-hidden="true">*</span>
        </label>
        <input
          id="pi-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'pi-email-err' : undefined}
        />
        {errors.email ? (
          <p id="pi-email-err" className={errorClass}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className={fieldClass}>
        <label htmlFor="pi-phone" className={labelClass}>
          Phone Number <span aria-hidden="true">*</span>
        </label>
        <input
          id="pi-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'pi-phone-err' : undefined}
        />
        {errors.phone ? (
          <p id="pi-phone-err" className={errorClass}>
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div className={fieldClass}>
        <label htmlFor="pi-date" className={labelClass}>
          Preferred Date
        </label>
        <input
          id="pi-date"
          type="date"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className={cn(inputClass, 'max-w-56')}
        />
        {errors.preferredDate ? <p className={errorClass}>{errors.preferredDate}</p> : null}
      </div>

      <div className={fieldClass}>
        <label htmlFor="pi-guests" className={labelClass}>
          Number of Guests
        </label>
        <input
          id="pi-guests"
          type="number"
          min={1}
          value={guestCount}
          disabled={notSure}
          onChange={(e) => setGuestCount(e.target.value)}
          className={cn(inputClass, 'max-w-32 disabled:opacity-60')}
          aria-invalid={Boolean(errors.guestCount)}
        />
        <label className="ml-4 inline-flex items-center gap-2 text-[0.95rem] text-ink">
          <input
            type="checkbox"
            checked={notSure}
            onChange={(e) => {
              setNotSure(e.target.checked)
              if (e.target.checked) setGuestCount('')
            }}
            className="accent-primary"
          />
          Not sure yet
        </label>
        {errors.guestCount ? <p className={errorClass}>{errors.guestCount}</p> : null}
      </div>

      <div className={fieldClass}>
        <label htmlFor="pi-message" className={labelClass}>
          Event Details / Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="pi-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(inputClass, 'resize-y')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'pi-message-err' : undefined}
        />
        {errors.message ? (
          <p id="pi-message-err" className={errorClass}>
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50 motion-reduce:transition-none"
      >
        {submitting ? 'Sending…' : 'Send inquiry'}
      </button>

      {submitError ? (
        <p role="alert" className={cn(errorClass, 'mt-4')}>
          {submitError}
        </p>
      ) : null}
    </form>
  )
}
