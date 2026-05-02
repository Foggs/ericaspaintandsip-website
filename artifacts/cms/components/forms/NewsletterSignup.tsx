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

type NoticeKind = 'info' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const noticeColor: Record<NoticeKind, string> = {
  info: '#555',
  success: '#1f5132',
  error: '#b00020',
}

export function NewsletterSignup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeKind, setNoticeKind] = useState<NoticeKind>('info')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !EMAIL_RE.test(trimmedEmail)) {
      setNoticeKind('error')
      setNotice('Please enter your name and a valid email.')
      return
    }

    setSubmitting(true)
    setNotice(null)
    try {
      const res = await fetch('/cms/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      })
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        message?: string
        error?: string
      }
      if (res.ok) {
        setNoticeKind('success')
        setNotice(body.message ?? 'Thanks for subscribing!')
        setName('')
        setEmail('')
      } else {
        setNoticeKind('error')
        setNotice(body.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setNoticeKind('error')
      setNotice('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
            disabled={submitting}
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
            disabled={submitting}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.65rem 1.25rem',
              background: submitting ? '#666' : '#222',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
        {notice ? (
          <p
            role="status"
            style={{
              marginTop: '1rem',
              color: noticeColor[noticeKind],
              fontStyle: noticeKind === 'info' ? 'italic' : 'normal',
              fontWeight: noticeKind === 'info' ? 400 : 600,
            }}
          >
            {notice}
          </p>
        ) : null}
      </div>
    </section>
  )
}
