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
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Blog</h1>
      {docs.length === 0 ? (
        <p style={{ color: '#666' }}>No posts yet — check back soon.</p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
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
