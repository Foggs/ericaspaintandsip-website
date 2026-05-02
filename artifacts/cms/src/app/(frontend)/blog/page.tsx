import type { Metadata } from 'next'
import { PostCard } from '@/components/blog/PostCard'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Blog — Erica's Paint & Sip",
  description: 'News and updates from the studio.',
}

export default async function BlogPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { isPublished: { equals: true } },
    sort: '-publishedDate',
    depth: 1,
    limit: 100,
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="mb-6 font-display text-4xl font-semibold text-ink sm:text-5xl">
        Blog
      </h1>
      {docs.length === 0 ? (
        <p className="text-muted">No posts yet — check back soon.</p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
