import type { Metadata } from 'next'

const DEFAULT_SITE_ORIGIN = 'http://localhost:3001'

export const BASE_PATH = '/cms'

export const SITE_NAME = "Erica's Paint & Sip"

export const DEFAULT_OG_IMAGE_PATH = '/opengraph.jpg'

function normalize(url: string): string {
  return url.replace(/\/+$/, '')
}

function resolveSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!raw) return normalize(DEFAULT_SITE_ORIGIN)
  try {
    const parsed = new URL(raw)
    return normalize(`${parsed.protocol}//${parsed.host}`)
  } catch {
    return normalize(DEFAULT_SITE_ORIGIN)
  }
}

export const SITE_ORIGIN = resolveSiteOrigin()

export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`

export function absoluteUrl(path: string = '/'): string {
  if (!path.startsWith('/')) path = `/${path}`
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}

type PageMetaInput = {
  title: string
  description: string
  path: string
  ogType?: 'website' | 'article'
  publishedTime?: string
  absoluteTitle?: boolean
}

export function pageMetadata({
  title,
  description,
  path,
  ogType = 'website',
  publishedTime,
  absoluteTitle = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path)
  const ogImageUrl = absoluteUrl(DEFAULT_OG_IMAGE_PATH)
  const images = [{ url: ogImageUrl, width: 1200, height: 630, alt: SITE_NAME }]
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: ogType,
      siteName: SITE_NAME,
      locale: 'en_US',
      images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}
