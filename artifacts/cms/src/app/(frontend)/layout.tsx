import React from 'react'
import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
} from '@/lib/seo'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const defaultDescription =
  'Paint nights, private parties, and team events in Sterling Heights, MI.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: defaultDescription,
  applicationName: SITE_NAME,
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: absoluteUrl('/'),
    title: SITE_NAME,
    description: defaultDescription,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: defaultDescription,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(fraunces.variable, inter.variable)}>
      <body className="bg-cream text-ink font-sans antialiased">{children}</body>
    </html>
  )
}
