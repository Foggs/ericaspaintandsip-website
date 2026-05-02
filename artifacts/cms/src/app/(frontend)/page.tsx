import type { Metadata } from 'next'
import { Hero } from '@/components/layout/Hero'
import { FeaturedEvents } from '@/components/events/FeaturedEvents'
import { GalleryPreview } from '@/components/gallery/GalleryPreview'
import { NewsletterSignup } from '@/components/forms/NewsletterSignup'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const title = "Erica's Paint & Sip — Sterling Heights"
const description =
  'Paint nights, private parties, and team events in Sterling Heights, MI.'
const url = absoluteUrl('/')

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
  },
  twitter: {
    title,
    description,
  },
}

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
