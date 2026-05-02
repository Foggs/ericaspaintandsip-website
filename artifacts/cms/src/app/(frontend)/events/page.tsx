import type { Metadata } from 'next'
import { EventCard } from '@/components/events/EventCard'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Events — Erica's Paint & Sip",
  description: 'Upcoming paint and sip events.',
}

export default async function EventsPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [
        { isPublished: { equals: true } },
        { date: { greater_than_equal: new Date().toISOString() } },
      ],
    },
    sort: 'date',
    depth: 1,
    limit: 100,
  })

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Upcoming Events</h1>
      {docs.length === 0 ? (
        <p style={{ color: '#666' }}>No upcoming events yet — check back soon.</p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {docs.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
