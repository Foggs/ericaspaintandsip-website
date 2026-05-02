import type { Metadata } from 'next'
import type { GalleryPhoto, Media } from '@payload-types'
import { GalleryGrid, type GalleryCategory } from '@/components/gallery/GalleryGrid'
import type { LightboxPhoto } from '@/components/gallery/GalleryLightbox'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Gallery — Erica's Paint & Sip",
  description: 'Photos from our paint-and-sip events, paintings, and behind the scenes.',
}

function isMedia(value: GalleryPhoto['image']): value is Media {
  return typeof value === 'object' && value !== null
}

export default async function GalleryPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'gallery-photos',
    sort: 'sortOrder',
    depth: 1,
    limit: 500,
  })

  const photos: Array<LightboxPhoto & { category: GalleryCategory }> = []
  for (const doc of docs) {
    if (!isMedia(doc.image)) continue
    const { url, width, height, alt } = doc.image
    if (!url || !width || !height) continue
    photos.push({
      id: doc.id,
      url,
      alt: alt ?? doc.caption ?? 'Gallery photo',
      width,
      height,
      caption: doc.caption ?? null,
      category: doc.category,
    })
  }

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Gallery</h1>
      <p style={{ color: '#555', marginTop: 0, marginBottom: '1.5rem' }}>
        A look at our events, paintings, and the studio behind them.
      </p>
      {photos.length === 0 ? (
        <p style={{ color: '#666' }}>Photos coming soon — check back shortly.</p>
      ) : (
        <GalleryGrid photos={photos} />
      )}
    </main>
  )
}
