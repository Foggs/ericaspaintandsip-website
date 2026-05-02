import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Post, Media } from '@payload-types'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
})

function isMedia(value: Post['coverImage']): value is Media {
  return typeof value === 'object' && value !== null
}

type Props = { post: Post }

export function PostContent({ post }: Props) {
  const cover = isMedia(post.coverImage) ? post.coverImage : null

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      {cover?.url && cover.width && cover.height ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <Image
            src={cover.url}
            alt={cover.alt ?? post.title}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : null}

      <h1 style={{ fontSize: '2.25rem', margin: '0 0 0.5rem 0' }}>{post.title}</h1>
      <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: '0.95rem' }}>
        {dateFormatter.format(new Date(post.publishedDate))}
      </p>

      {post.content ? (
        <div style={{ lineHeight: 1.6, color: '#222' }}>
          <RichText data={post.content} />
        </div>
      ) : null}
    </article>
  )
}
