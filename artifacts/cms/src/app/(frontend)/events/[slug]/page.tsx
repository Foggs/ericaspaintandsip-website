import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventDetail } from '@/components/events/EventDetail'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/seo'
import type { Event } from '@payload-types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeStyle: 'short',
})

async function findEvent(slug: string): Promise<Event | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [
        { slug: { equals: slug } },
        { isPublished: { equals: true } },
      ],
    },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const event = await findEvent(slug)
  if (!event) return { title: 'Event not found' }
  const when = dateFormatter.format(new Date(event.date))
  const title = event.title
  const description = `${event.title} on ${when}${event.location ? ` at ${event.location}` : ''}.`
  const url = absoluteUrl(`/events/${event.slug}`)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
    twitter: { title, description },
  }
}

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params
  const event = await findEvent(slug)
  if (!event) notFound()
  return <EventDetail event={event} />
}
