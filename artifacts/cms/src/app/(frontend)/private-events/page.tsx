import type { Metadata } from 'next'
import { PrivateEventForm } from '@/components/forms/PrivateEventForm'

export const metadata: Metadata = {
  title: "Private Events — Erica's Paint & Sip",
  description:
    'Host your private paint and sip event — birthdays, bridal showers, team events, and more.',
}

export default function PrivateEventsPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Private Events</h1>
      <p style={{ color: '#555', marginTop: 0, marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Hosting a birthday, bridal shower, or team event? Tell us a bit about
        what you have in mind and we&apos;ll be in touch to plan the details.
      </p>
      <PrivateEventForm />
    </main>
  )
}
