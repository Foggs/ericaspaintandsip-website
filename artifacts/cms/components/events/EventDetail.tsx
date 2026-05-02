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
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      {cover?.url && cover.width && cover.height ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <Image
            src={cover.url}
            alt={cover.alt ?? event.title}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : null}

      <h1 style={{ fontSize: '2.25rem', margin: '0 0 1rem 0' }}>{event.title}</h1>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          rowGap: '0.5rem',
          columnGap: '1rem',
          margin: '0 0 1.5rem 0',
          color: '#333',
        }}
      >
        <dt style={{ fontWeight: 600 }}>When</dt>
        <dd style={{ margin: 0 }}>{dateFormatter.format(new Date(event.date))}</dd>

        {typeof event.duration === 'number' ? (
          <>
            <dt style={{ fontWeight: 600 }}>Duration</dt>
            <dd style={{ margin: 0 }}>{event.duration} min</dd>
          </>
        ) : null}

        {event.location ? (
          <>
            <dt style={{ fontWeight: 600 }}>Location</dt>
            <dd style={{ margin: 0 }}>{event.location}</dd>
          </>
        ) : null}

        {typeof event.price === 'number' ? (
          <>
            <dt style={{ fontWeight: 600 }}>Price</dt>
            <dd style={{ margin: 0 }}>{priceFormatter.format(event.price)}</dd>
          </>
        ) : null}

        {typeof event.capacity === 'number' ? (
          <>
            <dt style={{ fontWeight: 600 }}>Capacity</dt>
            <dd style={{ margin: 0 }}>{event.capacity} seats</dd>
          </>
        ) : null}
      </dl>

      {event.description ? (
        <div style={{ lineHeight: 1.6, color: '#222' }}>
          <RichText data={event.description} />
        </div>
      ) : null}

      <RegistrationForm eventId={event.id} eventTitle={event.title} />
    </article>
  )
}
