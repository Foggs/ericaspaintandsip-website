'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

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
  const reduce = useReducedMotion()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (hasMultiple && e.key === 'ArrowLeft')
        onNavigate((index - 1 + photos.length) % photos.length)
      else if (hasMultiple && e.key === 'ArrowRight')
        onNavigate((index + 1) % photos.length)
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

  const fadeDuration = reduce ? 0 : 0.2
  const scaleInitial = reduce ? 1 : 0.96

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption ?? photo.alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeDuration }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-white/15 text-2xl leading-none text-white transition-colors hover:bg-white/25 motion-reduce:transition-none"
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
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-white/15 text-2xl leading-none text-white transition-colors hover:bg-white/25 motion-reduce:transition-none"
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
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-white/15 text-2xl leading-none text-white transition-colors hover:bg-white/25 motion-reduce:transition-none"
        >
          ›
        </button>
      ) : null}

      <motion.figure
        key={photo.id}
        initial={{ opacity: 0, scale: scaleInitial }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: scaleInitial }}
        transition={{ duration: fadeDuration }}
        className="m-0 flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-3"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className={`h-auto w-auto rounded object-contain max-w-[90vw] ${photo.caption ? 'max-h-[78vh]' : 'max-h-[85vh]'}`}
        />
        {photo.caption ? (
          <figcaption className="max-w-[60ch] text-center text-[0.95rem] text-white">
            {photo.caption}
          </figcaption>
        ) : null}
      </motion.figure>
    </motion.div>
  )
}
