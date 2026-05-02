'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GalleryLightbox, type LightboxPhoto } from './GalleryLightbox'

export type GalleryCategory = 'Events' | 'Behind the Scenes' | 'Paintings' | 'Other'

const CATEGORIES: GalleryCategory[] = ['Events', 'Behind the Scenes', 'Paintings', 'Other']

type Filter = 'All' | GalleryCategory

type Props = {
  photos: Array<LightboxPhoto & { category: GalleryCategory }>
}

export function GalleryGrid({ photos }: Props) {
  const [filter, setFilter] = useState<Filter>('All')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const counts = useMemo(() => {
    const map: Record<GalleryCategory, number> = {
      Events: 0,
      'Behind the Scenes': 0,
      Paintings: 0,
      Other: 0,
    }
    for (const p of photos) map[p.category] += 1
    return map
  }, [photos])

  const visible = useMemo(
    () => (filter === 'All' ? photos : photos.filter((p) => p.category === filter)),
    [photos, filter],
  )

  const buttons: Array<{ label: string; value: Filter; disabled: boolean }> = [
    { label: `All (${photos.length})`, value: 'All', disabled: photos.length === 0 },
    ...CATEGORIES.map((c) => ({
      label: `${c} (${counts[c]})`,
      value: c as Filter,
      disabled: counts[c] === 0,
    })),
  ]

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter by category"
        className="mb-6 flex flex-wrap gap-2"
      >
        {buttons.map((b) => {
          const active = filter === b.value
          return (
            <button
              key={b.value}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={b.disabled}
              onClick={() => setFilter(b.value)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none',
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/20 bg-white text-ink hover:border-primary/40 hover:bg-primary/5',
                b.disabled && 'cursor-not-allowed opacity-50 hover:border-primary/20 hover:bg-white',
              )}
            >
              {b.label}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted">No photos in this category yet.</p>
      ) : (
        <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((photo, i) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={() => setSelectedIndex(i)}
                aria-label={photo.caption ?? photo.alt}
                className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-md border border-primary/10 bg-cream-dark p-0 transition-all duration-200 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none"
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {selectedIndex !== null ? (
          <GalleryLightbox
            key="gallery-lightbox"
            photos={visible}
            index={Math.min(selectedIndex, visible.length - 1)}
            onClose={() => setSelectedIndex(null)}
            onNavigate={setSelectedIndex}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
