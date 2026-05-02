import Link from 'next/link'
import { EventCard } from '@/components/events/EventCard'
import { getPayloadClient } from '@/lib/payload'

export async function FeaturedEvents() {
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
    limit: 3,
  })

  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1rem' }}>
      <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: '0 0 1.5rem 0' }}>
        Upcoming Events
      </h2>

      {docs.length === 0 ? (
        <p style={{ color: '#666' }}>No upcoming events yet — check back soon.</p>
      ) : (
        <>
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
          <p style={{ marginTop: '1.5rem' }}>
            <Link href="/events" style={{ color: '#222', fontWeight: 600 }}>
              View all events →
            </Link>
          </p>
        </>
      )}
    </section>
  )
}
