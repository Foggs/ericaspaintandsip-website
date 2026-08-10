import { useState } from "react";
import {
  useListGalleryPhotos,
  useCreateGalleryPhoto,
  useUpdateGalleryPhoto,
  useDeleteGalleryPhoto,
  useRequestUploadUrl,
  getListGalleryPhotosQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Loader2, Trash2, Edit2, Check, X, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export function GalleryPage() {
  const { data: photos, isLoading } = useListGalleryPhotos({ limit: 50 });
  const createPhoto = useCreateGalleryPhoto();
  const updatePhoto = useUpdateGalleryPhoto();
  const deletePhoto = useDeleteGalleryPhoto();
  const { mutateAsync: requestUrl } = useRequestUploadUrl();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState("");

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
      
      await createPhoto.mutateAsync({
        data: {
          imageUrl: finalUrl,
          caption: file.name.split('.')[0] || "Gallery Photo",
        }
      });
      
      queryClient.invalidateQueries({ queryKey: getListGalleryPhotosQueryKey() });
      toast({ title: "Photo uploaded to gallery" });
    } catch (error) {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    } finally {
      setIsUploading(false);
      // clear the input
      e.target.value = '';
    }
  };

  const startEditing = (id: number, currentCaption: string) => {
    setEditingId(id);
    setEditCaption(currentCaption || "");
  };

  const saveEdit = async (id: number) => {
    try {
      const photo = photos?.data?.find(p => p.id === id);
      if (!photo) return;
      await updatePhoto.mutateAsync({
        id,
        data: { imageUrl: photo.imageUrl, caption: editCaption }
      });
      queryClient.invalidateQueries({ queryKey: getListGalleryPhotosQueryKey() });
      toast({ title: "Caption updated" });
    } catch (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    try {
      await deletePhoto.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListGalleryPhotosQueryKey() });
      toast({ title: "Photo deleted" });
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground mt-1">Manage your public photo gallery.</p>
        </div>
        <div className="relative">
          <input
            id="gallery-upload"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <Button disabled={isUploading} onClick={() => document.getElementById("gallery-upload")?.click()}>
            {isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Upload Photo</>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : photos?.data?.length === 0 ? (
        <div className="rounded-md border bg-card p-12 text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No photos yet</h3>
          <p className="mt-1 mb-4">Upload some photos to showcase your events.</p>
          <Button variant="outline" onClick={() => document.getElementById("gallery-upload")?.click()}>
            Upload First Photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos?.data?.map((photo) => (
            <div key={photo.id} className="group relative rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-muted relative">
                <img src={photo.imageUrl} alt={photo.caption || "Gallery image"} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0" onClick={() => startEditing(photo.id, photo.caption || "")}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(photo.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                {editingId === photo.id ? (
                  <div className="flex gap-2">
                    <Input 
                      value={editCaption} 
                      onChange={(e) => setEditCaption(e.target.value)} 
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(photo.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 shrink-0" onClick={() => saveEdit(photo.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground shrink-0" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm font-medium truncate" title={photo.caption || ""}>
                    {photo.caption || <span className="text-muted-foreground italic">No caption</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
