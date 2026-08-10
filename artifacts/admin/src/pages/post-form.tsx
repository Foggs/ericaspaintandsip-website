import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  useGetAdminPost,
  useCreatePost,
  useUpdatePost,
  useRequestUploadUrl,
  getListAdminPostsQueryKey,
  getGetPostQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  publishedDate: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function PostFormPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";
  const postId = isEditing ? Number(params.id) : 0;

  const { data: post, isLoading: isLoadingPost } = useGetAdminPost(postId, {
    query: { enabled: isEditing, queryKey: getGetPostQueryKey(postId) }
  });

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const { mutateAsync: requestUrl } = useRequestUploadUrl();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      publishedDate: "",
      excerpt: "",
      content: "",
      coverImageUrl: "",
      isPublished: false,
    },
  });

  useEffect(() => {
    if (post && isEditing) {
      let formattedDate = "";
      if (post.publishedDate) {
        const dateVal = new Date(post.publishedDate);
        const year = dateVal.getFullYear();
        const month = String(dateVal.getMonth() + 1).padStart(2, "0");
        const day = String(dateVal.getDate()).padStart(2, "0");
        formattedDate = `${year}-${month}-${day}`;
      }

      form.reset({
        title: post.title,
        publishedDate: formattedDate,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        coverImageUrl: post.coverImageUrl ?? "",
        isPublished: post.isPublished ?? false,
      });
    }
  }, [post, isEditing, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { uploadURL, objectPath } = await requestUrl({
        data: { name: file.name, size: file.size, contentType: file.type }
      });
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      const finalUrl = "/api/storage" + objectPath;
      form.setValue("coverImageUrl", finalUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let dateIso = null;
      if (values.publishedDate) {
        // Just storing as a simple date for display, or parsing to ISO:
        dateIso = new Date(values.publishedDate).toISOString();
      }

      if (isEditing) {
        await updatePost.mutateAsync({
          id: postId,
          data: { ...values, publishedDate: dateIso }
        });
        toast({ title: "Post updated successfully" });
      } else {
        await createPost.mutateAsync({
          data: { ...values, publishedDate: dateIso }
        });
        toast({ title: "Post created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getListAdminPostsQueryKey() });
      setLocation("/posts");
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  const coverImageUrl = form.watch("coverImageUrl");

  if (isEditing && isLoadingPost) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/posts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Post" : "New Post"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update your blog post." : "Write a new blog post."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            
            {/* Main Content Column */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 5 Tips for your first Paint & Sip" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A short summary of the post..." 
                        className="h-20 resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your post content here..." 
                        className="min-h-[400px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sidebar Settings Column */}
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-6 space-y-6">
                <h3 className="font-semibold">Publish Settings</h3>
                
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                        <FormDescription>
                          Make visible publicly
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publishedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-xl border bg-card p-6 space-y-6">
                <h3 className="font-semibold">Cover Image</h3>
                <FormItem>
                  <div className="mt-2 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-4 bg-muted/30">
                    {coverImageUrl ? (
                      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
                        <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById("post-image-upload")?.click()}>
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-muted p-3 rounded-full inline-block mx-auto">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    
                    {!coverImageUrl && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={isUploading}
                        onClick={() => document.getElementById("post-image-upload")?.click()}
                      >
                        {isUploading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                        ) : "Select Image"}
                      </Button>
                    )}
                    
                    <input
                      id="post-image-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </FormItem>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-4 border-t pt-6 mt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/posts">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createPost.isPending || updatePost.isPending || isUploading}>
              {(createPost.isPending || updatePost.isPending) ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                "Save Post"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
