import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostContent } from '@/components/blog/PostContent'
import { getPayloadClient } from '@/lib/payload'
import { pageMetadata } from '@/lib/seo'
import type { Post } from '@payload-types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
})

async function findPost(slug: string): Promise<Post | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: slug } },
        { isPublished: { equals: true } },
      ],
    },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await findPost(slug)
  if (!post) return { title: 'Post not found' }
  const description =
    post.excerpt ?? `Posted ${dateFormatter.format(new Date(post.publishedDate))}`
  return pageMetadata({
    title: post.title,
    description,
    path: `/blog/${post.slug}`,
    ogType: 'article',
    publishedTime: new Date(post.publishedDate).toISOString(),
  })
}

export default async function PostDetailPage({ params }: Params) {
  const { slug } = await params
  const post = await findPost(slug)
  if (!post) notFound()
  return <PostContent post={post} />
}
