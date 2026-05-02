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
      className="group block overflow-hidden rounded-lg border border-primary/10 bg-white text-ink no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {cover?.url && cover.width && cover.height ? (
        <div className="relative aspect-video w-full overflow-hidden bg-cream-dark">
          <Image
            src={cover.url}
            alt={cover.alt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      ) : null}
      <div className="p-4">
        <h3 className="mb-2 font-display text-xl font-semibold leading-tight text-ink">
          {post.title}
        </h3>
        <p className="m-0 mb-2 text-sm text-muted">
          {dateFormatter.format(new Date(post.publishedDate))}
        </p>
        {post.excerpt ? (
          <p className="m-0 text-[0.95rem] leading-relaxed text-ink/80">{post.excerpt}</p>
        ) : null}
      </div>
    </Link>
  )
}
