import type { Event, Media, Post } from '@payload-types'
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, SITE_NAME, SITE_URL } from './seo'

type LexicalRichText = {
  root: {
    children: Array<{ [k: string]: unknown }>
    [k: string]: unknown
  }
  [k: string]: unknown
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in (value as object)
}

function resolveImageUrl(image: Event['coverImage'] | Post['coverImage']): string {
  if (isMedia(image) && typeof image.url === 'string' && image.url.length > 0) {
    if (/^https?:\/\//i.test(image.url)) return image.url
    return absoluteUrl(image.url)
  }
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH)
}

function extractPlainText(richText: LexicalRichText | null | undefined, maxLength = 5000): string {
  if (!richText?.root?.children) return ''
  const parts: string[] = []
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const n = node as Record<string, unknown>
    if (typeof n.text === 'string') parts.push(n.text)
    if (Array.isArray(n.children)) {
      for (const child of n.children) walk(child)
    }
  }
  for (const child of richText.root.children) walk(child)
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim()
  return joined.length > maxLength ? `${joined.slice(0, maxLength - 1)}…` : joined
}

export function buildEventJsonLd(event: Event): Record<string, unknown> {
  const url = absoluteUrl(`/events/${event.slug ?? ''}`)
  const startDate = new Date(event.date)
  const endDate =
    typeof event.duration === 'number' && event.duration > 0
      ? new Date(startDate.getTime() + event.duration * 60_000)
      : null

  const description =
    extractPlainText(event.description as LexicalRichText | null | undefined, 500) ||
    `${event.title} hosted by ${SITE_NAME}.`

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: startDate.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description,
    url,
    image: [resolveImageUrl(event.coverImage)],
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }

  if (endDate) jsonLd.endDate = endDate.toISOString()

  jsonLd.location = event.location
    ? {
        '@type': 'Place',
        name: event.location,
        address: event.location,
      }
    : {
        '@type': 'Place',
        name: SITE_NAME,
      }

  jsonLd.offers = {
    '@type': 'Offer',
    price: (typeof event.price === 'number' ? event.price : 0).toFixed(2),
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url,
    validFrom: new Date(event.createdAt).toISOString(),
  }

  return jsonLd
}

export function buildPostJsonLd(post: Post): Record<string, unknown> {
  const url = absoluteUrl(`/blog/${post.slug ?? ''}`)
  const description =
    post.excerpt?.trim() ||
    extractPlainText(post.content as LexicalRichText | null | undefined, 300) ||
    post.title

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: new Date(post.publishedDate).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
      },
    },
    image: [resolveImageUrl(post.coverImage)],
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}

export function jsonLdScriptProps(data: Record<string, unknown>): {
  type: 'application/ld+json'
  dangerouslySetInnerHTML: { __html: string }
} {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    },
  }
}
