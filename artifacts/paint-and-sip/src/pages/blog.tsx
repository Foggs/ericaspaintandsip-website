import { Layout } from "@/components/layout/Layout";
import { useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

export default function Blog() {
  const { data: postsResponse, isLoading } = useListPosts({ limit: 20 }, {
    query: { queryKey: getListPostsQueryKey({ limit: 20 }) }
  });

  const posts = postsResponse?.data || [];

  return (
    <Layout>
      <div className="bg-primary/5 pt-32 pb-16">
        <div className="container px-4 md:px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">Studio Blog</h1>
          <p className="text-lg text-muted-foreground">
            Tips, inspiration, and stories from the canvas. Dive into our world of color.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16 max-w-5xl mx-auto">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4 border border-border/50 p-4 rounded-2xl">
                <Skeleton className="w-full aspect-[16/9] rounded-xl" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 border border-border/50 rounded-3xl bg-card">
            <p className="text-muted-foreground text-lg">No posts yet. We're busy painting!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post, index) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col border border-border/50 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all"
              >
                <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                  <div className="aspect-[16/9] relative">
                    <img 
                      src={post.coverImageUrl || "/images/blog-1.png"} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sm text-primary mb-3 font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>{post.publishedDate ? format(new Date(post.publishedDate), "MMMM d, yyyy") : format(new Date(post.createdAt), "MMMM d, yyyy")}</span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold mb-3 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto justify-start text-primary group-hover:text-primary/80">
                    <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                      Read more <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
