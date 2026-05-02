'use client'

import { useState, type FormEvent } from 'react'

const inputStyle = {
  padding: '0.65rem 0.85rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
  flex: '1 1 12rem',
  minWidth: 0,
  boxSizing: 'border-box' as const,
}

export function NewsletterSignup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNotice('Newsletter signup is coming soon.')
  }

  return (
    <section
      style={{
        background: '#fafafa',
        padding: '3rem 1rem',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: '0 0 0.5rem 0' }}>
          Stay in the loop
        </h2>
        <p style={{ color: '#555', margin: '0 0 1.5rem 0' }}>
          Get monthly updates on new events and specials.
        </p>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
        >
          <label htmlFor="news-name" style={{ position: 'absolute', left: '-10000px' }}>
            Name
          </label>
          <input
            id="news-name"
            type="text"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <label htmlFor="news-email" style={{ position: 'absolute', left: '-10000px' }}>
            Email
          </label>
          <input
            id="news-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              padding: '0.65rem 1.25rem',
              background: '#222',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Subscribe
          </button>
        </form>
        {notice ? (
          <p
            role="status"
            style={{ marginTop: '1rem', color: '#555', fontStyle: 'italic' }}
          >
            {notice}
          </p>
        ) : null}
      </div>
    </section>
  )
}
