import type { Metadata } from 'next'
import { PrivateEventForm } from '@/components/forms/PrivateEventForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Private Events',
  description:
    'Host your private paint-and-sip event — birthdays, bridal showers, team events, and more.',
  path: '/private-events',
})

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
