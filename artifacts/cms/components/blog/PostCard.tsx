import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media } from '@payload-types'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
})

function isMedia(value: Post['coverImage']): value is Media {
  return typeof value === 'object' && value !== null
}

type Props = { post: Post }

export function PostCard({ post }: Props) {
  const cover = isMedia(post.coverImage) ? post.coverImage : null
  const slug = post.slug ?? String(post.id)

  return (
    <Link
      href={`/blog/${slug}`}
      style={{
        display: 'block',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        background: '#fff',
      }}
    >
      {cover?.url && cover.width && cover.height ? (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
          <Image
            src={cover.url}
            alt={cover.alt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : null}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{post.title}</h3>
        <p style={{ margin: '0 0 0.5rem 0', color: '#555', fontSize: '0.85rem' }}>
          {dateFormatter.format(new Date(post.publishedDate))}
        </p>
        {post.excerpt ? (
          <p style={{ margin: 0, color: '#333', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {post.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
