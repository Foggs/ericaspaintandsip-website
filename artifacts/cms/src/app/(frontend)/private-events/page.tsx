import type { Metadata } from 'next'
import { PrivateEventForm } from '@/components/forms/PrivateEventForm'
import { absoluteUrl } from '@/lib/seo'

const title = 'Private Events'
const description =
  'Host your private paint-and-sip event — birthdays, bridal showers, team events, and more.'
const url = absoluteUrl('/private-events')

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: 'website' },
  twitter: { title, description },
}

export default function PrivateEventsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="mb-2 font-display text-4xl font-semibold text-ink sm:text-5xl">
        Private Events
      </h1>
      <p className="mb-6 leading-relaxed text-muted">
        Hosting a birthday, bridal shower, or team event? Tell us a bit about what you have
        in mind and we&apos;ll be in touch to plan the details.
      </p>
      <PrivateEventForm />
    </main>
  )
}
