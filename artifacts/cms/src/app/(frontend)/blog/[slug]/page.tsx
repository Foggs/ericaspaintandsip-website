import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostContent } from '@/components/blog/PostContent'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/seo'
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
  const title = post.title
  const description =
    post.excerpt ?? `Posted ${dateFormatter.format(new Date(post.publishedDate))}`
  const url = absoluteUrl(`/blog/${post.slug}`)
  const publishedTime = new Date(post.publishedDate).toISOString()
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime,
    },
    twitter: { title, description },
  }
}

export default async function PostDetailPage({ params }: Params) {
  const { slug } = await params
  const post = await findPost(slug)
  if (!post) notFound()
  return <PostContent post={post} />
}
