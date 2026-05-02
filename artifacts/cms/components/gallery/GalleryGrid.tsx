'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
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
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.5rem',
        }}
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
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: active ? '#111' : '#d4d4d4',
                background: active ? '#111' : '#fff',
                color: active ? '#fff' : b.disabled ? '#aaa' : '#111',
                fontSize: '0.9rem',
                cursor: b.disabled ? 'not-allowed' : 'pointer',
                opacity: b.disabled ? 0.6 : 1,
              }}
            >
              {b.label}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p style={{ color: '#666' }}>No photos in this category yet.</p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {visible.map((photo, i) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={() => setSelectedIndex(i)}
                aria-label={photo.caption ?? photo.alt}
                style={{
                  display: 'block',
                  width: '100%',
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  padding: 0,
                  background: '#f5f5f5',
                  cursor: 'pointer',
                }}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedIndex !== null ? (
        <GalleryLightbox
          photos={visible}
          index={Math.min(selectedIndex, visible.length - 1)}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      ) : null}
    </>
  )
}
