import Image from 'next/image'
import Link from 'next/link'
import type { Event, Media } from '@payload-types'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
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

export function EventCard({ event }: Props) {
  const cover = isMedia(event.coverImage) ? event.coverImage : null
  const slug = event.slug ?? String(event.id)

  return (
    <Link
      href={`/events/${slug}`}
      style={{
        display: 'block',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        background: '#fff',
      }}
    >
      {cover?.url && cover.width && cover.height ? (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
          <Image
            src={cover.url}
            alt={cover.alt ?? event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : null}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{event.title}</h3>
        <p style={{ margin: '0 0 0.25rem 0', color: '#555', fontSize: '0.9rem' }}>
          {dateFormatter.format(new Date(event.date))}
        </p>
        {event.location ? (
          <p style={{ margin: '0 0 0.25rem 0', color: '#555', fontSize: '0.9rem' }}>
            {event.location}
          </p>
        ) : null}
        {typeof event.price === 'number' ? (
          <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>
            {priceFormatter.format(event.price)}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
