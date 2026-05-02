import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactInfo } from '@/components/layout/ContactInfo'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: "Get in touch with Erica's Paint & Sip in Sterling Heights, MI.",
  path: '/contact',
})

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="mb-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
        Contact
      </h1>
      <p className="mb-6 leading-relaxed text-muted">
        We&apos;d love to hear from you. Find us in Sterling Heights, MI — drop by, give us
        a call, or send a quick note.
      </p>

      <ContactInfo />

      <section className="mt-8 rounded-lg border border-accent/30 bg-accent-light p-6">
        <h2 className="mb-2 font-display text-2xl font-semibold text-accent-dark">
          Planning a private event?
        </h2>
        <p className="mb-4 leading-relaxed text-ink/80">
          Use our private events form so we can capture all the details and get back to you
          within 24 hours.
        </p>
        <Link
          href="/private-events"
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark motion-reduce:transition-none"
        >
          Plan a private event →
        </Link>
      </section>

      <p className="mt-6 leading-relaxed text-muted">
        For all other questions, email or call us — we typically reply within one business day.
      </p>
    </main>
  )
}
