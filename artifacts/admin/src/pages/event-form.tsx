import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  useGetAdminEvent,
  useCreateEvent,
  useUpdateEvent,
  useRequestUploadUrl,
  getListAdminEventsQueryKey,
  getGetEventQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
  date: z.string().min(1, "Date is required"),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  location: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function EventFormPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";
  const eventId = isEditing ? Number(params.id) : 0;

  const { data: event, isLoading: isLoadingEvent } = useGetAdminEvent(eventId, {
    query: { enabled: isEditing, queryKey: getGetEventQueryKey(eventId) }
  });

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const { mutateAsync: requestUrl } = useRequestUploadUrl();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      durationMinutes: 120,
      location: "Studio",
      price: 35,
      capacity: 20,
      description: "",
      coverImageUrl: "",
      isPublished: false,
    },
  });

  useEffect(() => {
    if (event && isEditing) {
      // Format ISO date to YYYY-MM-DDTHH:mm for datetime-local input
      const dateVal = new Date(event.date);
      // We need to output local time components:
      const year = dateVal.getFullYear();
      const month = String(dateVal.getMonth() + 1).padStart(2, "0");
      const day = String(dateVal.getDate()).padStart(2, "0");
      const hours = String(dateVal.getHours()).padStart(2, "0");
      const mins = String(dateVal.getMinutes()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}T${hours}:${mins}`;

      form.reset({
        title: event.title,
        date: formattedDate,
        durationMinutes: event.durationMinutes ?? 120,
        location: event.location ?? "",
        price: event.price ?? 35,
        capacity: event.capacity ?? 20,
        description: event.description ?? "",
        coverImageUrl: event.coverImageUrl ?? "",
        isPublished: event.isPublished ?? false,
      });
    }
  }, [event, isEditing, form]);

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
      // Need to convert local datetime back to ISO string for backend
      const dateIso = new Date(values.date).toISOString();

      if (isEditing) {
        await updateEvent.mutateAsync({
          id: eventId,
          data: { ...values, date: dateIso }
        });
        toast({ title: "Event updated successfully" });
      } else {
        await createEvent.mutateAsync({
          data: { ...values, date: dateIso }
        });
        toast({ title: "Event created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getListAdminEventsQueryKey() });
      setLocation("/events");
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  const coverImageUrl = form.watch("coverImageUrl");

  if (isEditing && isLoadingEvent) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Event" : "New Event"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update your event details." : "Create a new paint & sip session."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Starry Night Paint & Sip" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (min)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published</FormLabel>
                      <FormDescription>
                        Make this event visible on the public website.
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
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell attendees what to expect..." 
                        className="h-32 resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <div className="mt-2 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 bg-muted/30">
                  {coverImageUrl ? (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
                      <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="secondary" onClick={() => document.getElementById("image-upload")?.click()}>
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-muted p-4 rounded-full inline-block mx-auto">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload a high-quality cover image for this event.
                      </p>
                    </div>
                  )}
                  
                  {!coverImageUrl && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={isUploading}
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      {isUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                      ) : "Select File"}
                    </Button>
                  )}
                  
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </FormItem>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6 mt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/events">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending || isUploading}>
              {(createEvent.isPending || updateEvent.isPending) ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                "Save Event"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
