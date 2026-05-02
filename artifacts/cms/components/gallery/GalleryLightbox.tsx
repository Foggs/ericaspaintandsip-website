'use client'

import { useEffect } from 'react'

export type LightboxPhoto = {
  id: number
  url: string
  alt: string
  width: number
  height: number
  caption?: string | null
}

type Props = {
  photos: LightboxPhoto[]
  index: number
  onClose: () => void
  onNavigate: (next: number) => void
}

export function GalleryLightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = photos[index]
  const hasMultiple = photos.length > 1

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (hasMultiple && e.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length)
      else if (hasMultiple && e.key === 'ArrowRight') onNavigate((index + 1) % photos.length)
    }
    window.addEventListener('keydown', handler)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = prevOverflow
    }
  }, [index, photos.length, hasMultiple, onClose, onNavigate])

  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption ?? photo.alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          width: '2.5rem',
          height: '2.5rem',
          fontSize: '1.5rem',
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        ×
      </button>

      {hasMultiple ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate((index - 1 + photos.length) % photos.length)
          }}
          aria-label="Previous photo"
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            width: '2.5rem',
            height: '2.5rem',
            fontSize: '1.5rem',
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          ‹
        </button>
      ) : null}

      {hasMultiple ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate((index + 1) % photos.length)
          }}
          aria-label="Next photo"
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            width: '2.5rem',
            height: '2.5rem',
            fontSize: '1.5rem',
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          ›
        </button>
      ) : null}

      <figure
        style={{
          margin: 0,
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          style={{
            maxWidth: '90vw',
            maxHeight: photo.caption ? '78vh' : '85vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '4px',
          }}
        />
        {photo.caption ? (
          <figcaption
            style={{
              color: '#fff',
              fontSize: '0.95rem',
              textAlign: 'center',
              maxWidth: '60ch',
            }}
          >
            {photo.caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  )
}
