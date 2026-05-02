import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactInfo } from '@/components/layout/ContactInfo'

export const metadata: Metadata = {
  title: "Contact — Erica's Paint & Sip",
  description: "Get in touch with Erica's Paint & Sip in Sterling Heights, MI.",
}

export default function ContactPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', margin: '0 0 0.75rem 0' }}>
        Contact
      </h1>
      <p style={{ color: '#555', margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>
        We&apos;d love to hear from you. Find us in Sterling Heights, MI — drop by, give us
        a call, or send a quick note.
      </p>

      <ContactInfo />

      <section
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #cfe8d4',
          background: '#f0faf2',
          borderRadius: '8px',
          color: '#1f5132',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
          Planning a private event?
        </h2>
        <p style={{ margin: '0 0 1rem 0', lineHeight: 1.6, color: '#1f5132' }}>
          Use our private events form so we can capture all the details and get back to
          you within 24 hours.
        </p>
        <Link
          href="/private-events"
          style={{
            display: 'inline-block',
            padding: '0.65rem 1.25rem',
            background: '#1f5132',
            color: '#fff',
            borderRadius: '4px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Plan a private event →
        </Link>
      </section>

      <p style={{ marginTop: '1.5rem', color: '#666', lineHeight: 1.6 }}>
        For all other questions, email or call us — we typically reply within one business
        day.
      </p>
    </main>
  )
}
