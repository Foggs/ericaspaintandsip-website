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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="mb-6 font-display text-4xl font-semibold text-ink sm:text-5xl">
        Upcoming Events
      </h1>
      {docs.length === 0 ? (
        <p className="text-muted">No upcoming events yet — check back soon.</p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
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
