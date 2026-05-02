const DEFAULT_SITE_URL = 'http://localhost:3001/cms'

function normalize(url: string): string {
  return url.replace(/\/+$/, '')
}

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!raw) return normalize(DEFAULT_SITE_URL)
  try {
    const parsed = new URL(raw)
    return normalize(parsed.toString())
  } catch {
    return normalize(DEFAULT_SITE_URL)
  }
}

export const SITE_URL = resolveSiteUrl()

export const SITE_NAME = "Erica's Paint & Sip"

export const DEFAULT_OG_IMAGE = '/opengraph.jpg'

export function absoluteUrl(path: string = '/'): string {
  if (!path.startsWith('/')) path = `/${path}`
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}
