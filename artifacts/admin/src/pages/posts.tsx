import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  useListAdminPosts,
  useDeletePost,
  getListAdminPostsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PostsPage() {
  const { data: posts, isLoading } = useListAdminPosts({ limit: 50 });
  const deletePost = useDeletePost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      await deletePost.mutateAsync({ id: postToDelete });
      queryClient.invalidateQueries({ queryKey: getListAdminPostsQueryKey() });
      toast({ title: "Post deleted" });
    } catch (error) {
      toast({ title: "Failed to delete post", variant: "destructive" });
    } finally {
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your blog and news posts.</p>
        </div>
        <Button asChild>
          <Link href="/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[300px] hidden md:table-cell">Excerpt</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 float-right" /></TableCell>
                </TableRow>
              ))
            ) : posts?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                    <p>No posts found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              posts?.data?.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    {post.coverImageUrl ? (
                      <img 
                        src={post.coverImageUrl} 
                        alt={post.title} 
                        className="h-10 w-10 object-cover rounded-md border" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[300px]">
                    {post.excerpt || "No excerpt..."}
                  </TableCell>
                  <TableCell>
                    {post.publishedDate ? format(new Date(post.publishedDate), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    {post.isPublished ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href={`/posts/${post.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setPostToDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={postToDelete !== null} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              and remove it from your website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
