import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Event, Media } from '@payload-types'
import { RegistrationForm } from '@/components/forms/RegistrationForm'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full',
  timeStyle: 'short',
})

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function isMedia(value: Event['coverImage']): value is Media {
  return typeof value === 'object' && value !== null
}

type Props = { event: Event }

export function EventDetail({ event }: Props) {
  const cover = isMedia(event.coverImage) ? event.coverImage : null

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {cover?.url && cover.width && cover.height ? (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg shadow-sm">
          <Image
            src={cover.url}
            alt={cover.alt ?? event.title}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            priority
            className="object-cover"
          />
        </div>
      ) : null}

      <h1 className="mb-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        {event.title}
      </h1>

      <dl className="mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-ink">
        <dt className="font-semibold text-muted">When</dt>
        <dd className="m-0">{dateFormatter.format(new Date(event.date))}</dd>

        {typeof event.duration === 'number' ? (
          <>
            <dt className="font-semibold text-muted">Duration</dt>
            <dd className="m-0">{event.duration} min</dd>
          </>
        ) : null}

        {event.location ? (
          <>
            <dt className="font-semibold text-muted">Location</dt>
            <dd className="m-0">{event.location}</dd>
          </>
        ) : null}

        {typeof event.price === 'number' ? (
          <>
            <dt className="font-semibold text-muted">Price</dt>
            <dd className="m-0 font-semibold text-primary">
              {priceFormatter.format(event.price)}
            </dd>
          </>
        ) : null}

        {typeof event.capacity === 'number' ? (
          <>
            <dt className="font-semibold text-muted">Capacity</dt>
            <dd className="m-0">{event.capacity} seats</dd>
          </>
        ) : null}
      </dl>

      {event.description ? (
        <div className="prose prose-lg max-w-none text-ink">
          <RichText data={event.description} />
        </div>
      ) : null}

      <RegistrationForm eventId={event.id} eventTitle={event.title} />
    </article>
  )
}
