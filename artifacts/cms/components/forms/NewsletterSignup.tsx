'use client'

import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'

type NoticeKind = 'info' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const noticeClass: Record<NoticeKind, string> = {
  info: 'italic text-muted',
  success: 'font-semibold text-success',
  error: 'font-semibold text-danger',
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

  const inputClass =
    'min-w-0 flex-1 basis-48 rounded-md border border-primary/20 bg-white px-3 py-2.5 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60'

  return (
    <section className="bg-primary-light/40 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Stay in the loop
        </h2>
        <p className="mb-6 text-muted">Get monthly updates on new events and specials.</p>
        <form onSubmit={handleSubmit} className="flex flex-wrap justify-center gap-2">
          <label htmlFor="news-name" className="sr-only">
            Name
          </label>
          <input
            id="news-name"
            type="text"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className={inputClass}
          />

          <label htmlFor="news-email" className="sr-only">
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
            className={inputClass}
          />

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-accent/50 motion-reduce:transition-none"
          >
            {submitting ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
        {notice ? (
          <p role="status" className={cn('mt-4', noticeClass[noticeKind])}>
            {notice}
          </p>
        ) : null}
      </div>
    </section>
  )
}
