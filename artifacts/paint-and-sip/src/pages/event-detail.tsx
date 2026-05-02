import { Layout } from "@/components/layout/Layout";
import { useGetEventBySlug, getGetEventBySlugQueryKey, useCreateBooking } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Clock, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const bookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  seats: z.coerce.number().min(1).max(10),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function EventDetail() {
  const [, params] = useRoute("/events/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();

  const { data: event, isLoading } = useGetEventBySlug(slug, {
    query: { enabled: !!slug, queryKey: getGetEventBySlugQueryKey(slug) }
  });

  const createBooking = useCreateBooking();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      seats: 1,
    }
  });

  const isSoldOut = event && event.seatsAvailable !== null && event.seatsAvailable <= 0;

  const onSubmit = (data: BookingFormValues) => {
    if (!event) return;
    
    createBooking.mutate({
      data: {
        eventId: event.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        seats: data.seats,
        status: "pending"
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Booking requested!",
          description: "We've received your booking. You will be redirected to payment soon.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Booking failed",
          description: "There was an error processing your request. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 md:px-6 py-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full mt-12" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container py-32 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Class not found</h1>
          <p className="text-muted-foreground">The class you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  const date = new Date(event.date);

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-12 md:py-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column - Image & Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden relative shadow-xl">
              <img 
                src={event.coverImageUrl || "/images/event-1.png"} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {isSoldOut && (
                 <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                   <span className="bg-destructive text-destructive-foreground px-6 py-3 font-bold tracking-wider rounded-full transform -rotate-12 border-2 border-destructive-foreground/20 shadow-lg text-xl">SOLD OUT</span>
                 </div>
              )}
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
              <h3 className="font-serif font-bold text-xl border-b border-border/50 pb-4">Class Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Date & Time</p>
                    <p>{format(date, "EEEE, MMMM do, yyyy")}</p>
                    <p>{format(date, "h:mm a")} ({event.durationMinutes} minutes)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Capacity</p>
                    <p>{event.seatsAvailable} of {event.capacity} seats available</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details & Booking Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <div className="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full mb-4">
                ${event.price} per person
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">{event.title}</h1>
              <div className="prose prose-slate dark:prose-invert prose-p:text-muted-foreground max-w-none">
                <p>{event.description}</p>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-serif font-bold mb-6">Reserve Your Canvas</h2>
              
              {isSoldOut ? (
                <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 flex flex-col items-center text-center gap-2">
                  <Info className="w-8 h-8 mb-2" />
                  <p className="font-bold text-lg">This class is fully booked.</p>
                  <p className="text-sm opacity-90">Please check our schedule for other upcoming classes or contact us to join the waitlist.</p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="jane@example.com" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Seats</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select seats" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: Math.min(10, event.seatsAvailable || 10) }).map((_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  {i + 1} {i === 0 ? "Seat" : "Seats"} (${(event.price || 0) * (i + 1)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 border-t border-border mt-6">
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-medium text-muted-foreground">Total Due Today</span>
                        <span className="text-2xl font-bold text-foreground">
                          ${(event.price || 0) * form.watch("seats")}
                        </span>
                      </div>
                      
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-14 text-lg rounded-full"
                        disabled={createBooking.isPending}
                      >
                        {createBooking.isPending ? "Processing..." : "Complete Booking"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
