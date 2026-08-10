import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  useListAdminEvents,
  useDeleteEvent,
  getListAdminEventsQueryKey
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
import { Edit, Trash2, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function EventsPage() {
  const { data: events, isLoading } = useListAdminEvents({ limit: 50 });
  const deleteEvent = useDeleteEvent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent.mutateAsync({ id: eventToDelete });
      queryClient.invalidateQueries({ queryKey: getListAdminEventsQueryKey() });
      toast({ title: "Event deleted" });
    } catch (error) {
      toast({ title: "Failed to delete event", variant: "destructive" });
    } finally {
      setEventToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">Manage your paint & sip sessions.</p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Price</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 float-right" /></TableCell>
                </TableRow>
              ))
            ) : events?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground/50" />
                    <p>No events found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              events?.data?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    {event.coverImageUrl ? (
                      <img 
                        src={event.coverImageUrl} 
                        alt={event.title} 
                        className="h-10 w-10 object-cover rounded-md border" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {format(new Date(event.date), "MMM d, yyyy • h:mm a")}
                  </TableCell>
                  <TableCell>{formatCurrency(event.price ?? 0)}</TableCell>
                  <TableCell>
                    {event.isPublished ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href={`/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setEventToDelete(event.id)}
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

      <AlertDialog open={eventToDelete !== null} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
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
