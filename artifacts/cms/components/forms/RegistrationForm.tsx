'use client'

import { useState, type FormEvent } from 'react'

type Props = {
  eventId: number
  eventTitle: string
}

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

export function RegistrationForm({ eventId, eventTitle }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [seats, setSeats] = useState(1)
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNotice('Booking is coming soon — check back shortly.')
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-event-id={eventId}
      aria-label={`Reserve seats for ${eventTitle}`}
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

      <div style={fieldStyle}>
        <label htmlFor="reg-name" style={labelStyle}>
          Name
        </label>
        <input
          id="reg-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="reg-email" style={labelStyle}>
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="reg-phone" style={labelStyle}>
          Phone
        </label>
        <input
          id="reg-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />
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
          required
          value={seats}
          onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
          style={{ ...inputStyle, maxWidth: '8rem' }}
        />
      </div>

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
        Reserve seats
      </button>

      {notice ? (
        <p
          role="status"
          style={{ marginTop: '1rem', color: '#555', fontStyle: 'italic' }}
        >
          {notice}
        </p>
      ) : null}
    </form>
  )
}
