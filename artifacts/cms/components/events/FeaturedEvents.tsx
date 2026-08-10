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
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <h2 className="mb-6 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Upcoming Events
      </h2>

      {docs.length === 0 ? (
        <p className="text-muted">No upcoming events yet — check back soon.</p>
      ) : (
        <>
          <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link
              href="/events"
              className="font-semibold text-primary hover:text-primary-dark hover:underline underline-offset-2"
            >
              View all events →
            </Link>
          </p>
        </>
      )}
    </section>
  )
}
