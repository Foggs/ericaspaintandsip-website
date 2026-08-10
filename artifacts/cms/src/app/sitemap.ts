import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/events'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/gallery'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/private-events'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  try {
    const payload = await getPayloadClient()

    const [{ docs: events }, { docs: posts }] = await Promise.all([
      payload.find({
        collection: 'events',
        where: { isPublished: { equals: true } },
        depth: 0,
        limit: 1000,
        pagination: false,
      }),
      payload.find({
        collection: 'posts',
        where: { isPublished: { equals: true } },
        depth: 0,
        limit: 1000,
        pagination: false,
      }),
    ])

    const eventEntries: MetadataRoute.Sitemap = events
      .filter((event) => typeof event.slug === 'string' && event.slug.length > 0)
      .map((event) => ({
        url: absoluteUrl(`/events/${event.slug}`),
        lastModified: new Date(event.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

    const postEntries: MetadataRoute.Sitemap = posts
      .filter((post) => typeof post.slug === 'string' && post.slug.length > 0)
      .map((post) => ({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))

    return [...staticEntries, ...eventEntries, ...postEntries]
  } catch {
    return staticEntries
  }
}
