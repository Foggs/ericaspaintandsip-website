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
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {cover?.url && cover.width && cover.height ? (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg shadow-sm">
          <Image
            src={cover.url}
            alt={cover.alt ?? post.title}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            priority
            className="object-cover"
          />
        </div>
      ) : null}

      <h1 className="mb-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        {post.title}
      </h1>
      <p className="mb-6 text-sm text-muted">
        {dateFormatter.format(new Date(post.publishedDate))}
      </p>

      {post.content ? (
        <div className="prose prose-lg max-w-none text-ink">
          <RichText data={post.content} />
        </div>
      ) : null}
    </article>
  )
}
