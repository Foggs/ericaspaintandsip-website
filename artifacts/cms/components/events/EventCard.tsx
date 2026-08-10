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
      className="group block overflow-hidden rounded-lg border border-primary/10 bg-white text-ink no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {cover?.url && cover.width && cover.height ? (
        <div className="relative aspect-video w-full overflow-hidden bg-cream-dark">
          <Image
            src={cover.url}
            alt={cover.alt ?? event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      ) : null}
      <div className="p-4">
        <h3 className="mb-2 font-display text-xl font-semibold leading-tight text-ink">
          {event.title}
        </h3>
        <p className="m-0 text-sm text-muted">
          {dateFormatter.format(new Date(event.date))}
        </p>
        {event.location ? (
          <p className="mt-1 text-sm text-muted">{event.location}</p>
        ) : null}
        {typeof event.price === 'number' ? (
          <p className="mt-2 font-semibold text-primary">
            {priceFormatter.format(event.price)}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
