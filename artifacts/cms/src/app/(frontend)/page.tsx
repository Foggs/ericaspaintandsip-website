import type { Metadata } from 'next'
import { Hero } from '@/components/layout/Hero'
import { FeaturedEvents } from '@/components/events/FeaturedEvents'
import { GalleryPreview } from '@/components/gallery/GalleryPreview'
import { NewsletterSignup } from '@/components/forms/NewsletterSignup'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: "Erica's Paint & Sip — Sterling Heights",
  description:
    'Paint nights, private parties, and team events in Sterling Heights, MI.',
  path: '/',
  absoluteTitle: true,
})

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedEvents />
      <GalleryPreview />
      <NewsletterSignup />
    </>
  )
}
