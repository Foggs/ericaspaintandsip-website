import { Layout } from "@/components/layout/Layout";
import { useGetPostBySlug, getGetPostBySlugQueryKey } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const { data: post, isLoading } = useGetPostBySlug(slug, {
    query: { enabled: !!slug, queryKey: getGetPostBySlugQueryKey(slug) }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 md:px-6 py-24 max-w-3xl mx-auto space-y-8">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-32 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const date = post.publishedDate ? new Date(post.publishedDate) : new Date(post.createdAt);

  return (
    <Layout>
      <article className="pb-24">
        {/* Header */}
        <div className="bg-primary/5 pt-24 pb-16">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <Button asChild variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
              <Link href="/blog" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to all posts
              </Link>
            </Button>
            
            <div className="flex items-center gap-2 text-primary font-medium mb-4">
              <Calendar className="w-5 h-5" />
              <span>{format(date, "MMMM d, yyyy")}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Hero Image */}
        <div className="container px-4 md:px-6 max-w-5xl mx-auto -mt-8 relative z-10">
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card">
            <img 
              src={post.coverImageUrl || "/images/blog-1.png"} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="container px-4 md:px-6 max-w-3xl mx-auto pt-16">
          <div 
            className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 max-w-none prose-img:rounded-xl prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </div>
      </article>
    </Layout>
  );
}
