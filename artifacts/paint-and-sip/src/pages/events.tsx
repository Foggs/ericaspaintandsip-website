import { Layout } from "@/components/layout/Layout";
import { useListEvents, getListEventsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function EventsList() {
  const [, setLocation] = useLocation();
  const { data: eventsResponse, isLoading } = useListEvents({ upcoming: true, limit: 50 }, {
    query: { queryKey: getListEventsQueryKey({ upcoming: true, limit: 50 }) }
  });

  const events = eventsResponse?.data || [];

  return (
    <Layout>
      <div className="bg-primary/5 pt-32 pb-16">
        <div className="container px-4 md:px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">Class Schedule</h1>
          <p className="text-lg text-muted-foreground">
            Browse our upcoming painting events. Whether you're a seasoned artist or picking up a brush for the first time, we have a canvas waiting for you.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16 max-w-5xl mx-auto">
        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 border border-border/50 rounded-2xl p-4">
                <Skeleton className="h-48 md:w-64 rounded-xl shrink-0" />
                <div className="space-y-4 flex-1 py-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-32 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border/50">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">No upcoming classes</h3>
            <p className="text-muted-foreground mb-6">Check back soon for our new schedule!</p>
            <Button asChild className="rounded-full">
              <Link href="/private-events">Book a Private Party Instead</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event, index) => {
              const date = new Date(event.date);
              const isSoldOut = event.seatsAvailable !== null && event.seatsAvailable <= 0;

              return (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex flex-col md:flex-row gap-6 border border-border/50 bg-card rounded-2xl p-4 transition-all hover:shadow-md ${isSoldOut ? 'opacity-75' : ''}`}
                >
                  <div className="h-48 md:w-72 shrink-0 rounded-xl overflow-hidden relative">
                    <img 
                      src={event.coverImageUrl || "/images/event-2.png"} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-destructive text-destructive-foreground px-4 py-2 font-bold tracking-wider rounded-full transform -rotate-12 border-2 border-destructive-foreground/20 shadow-lg">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-serif font-bold text-card-foreground">
                          <Link href={`/events/${event.slug}`} className="hover:text-primary transition-colors">
                            {event.title}
                          </Link>
                        </h2>
                        <div className="text-xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                          ${event.price}
                        </div>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mt-2">{event.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{format(date, "EEE, MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{format(date, "h:mm a")} ({event.durationMinutes}m)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{event.seatsAvailable} seats left</span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-border/50">
                      <Button 
                        asChild 
                        variant={isSoldOut ? "outline" : "default"}
                        className="rounded-full px-8"
                        disabled={isSoldOut}
                      >
                        <Link href={`/events/${event.slug}`}>
                          {isSoldOut ? 'View Details' : 'Book Now'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
