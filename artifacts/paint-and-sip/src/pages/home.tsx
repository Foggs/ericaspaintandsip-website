import { Layout } from "@/components/layout/Layout";
import { useGetUpcomingEvents, getGetUpcomingEventsQueryKey, useGetFeaturedGalleryPhotos, getGetFeaturedGalleryPhotosQueryKey, useGetRecentPosts, getGetRecentPostsQueryKey, useSubscribeNewsletter } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const subscribeNewsletter = useSubscribeNewsletter();

  const { data: upcomingEvents, isLoading: loadingEvents } = useGetUpcomingEvents({ limit: 3 }, {
    query: { queryKey: getGetUpcomingEventsQueryKey({ limit: 3 }) }
  });

  const { data: featuredPhotos, isLoading: loadingPhotos } = useGetFeaturedGalleryPhotos({ limit: 6 }, {
    query: { queryKey: getGetFeaturedGalleryPhotosQueryKey({ limit: 6 }) }
  });

  const { data: recentPosts, isLoading: loadingPosts } = useGetRecentPosts({ limit: 3 }, {
    query: { queryKey: getGetRecentPostsQueryKey({ limit: 3 }) }
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeNewsletter.mutate({ data: { email } }, {
      onSuccess: () => {
        toast({
          title: "Subscribed!",
          description: "You're now on the list for our colorful updates.",
        });
        setEmail("");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not subscribe. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="People painting and sipping wine" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent"></div>
        </div>
        
        <div className="container mx-auto relative z-10 px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl space-y-6"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary font-medium text-sm border border-primary/20">
              Unleash Your Inner Artist
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight">
              Sip, Paint, and <span className="text-primary">Celebrate</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join us for joyful, vibrant painting classes where everyone is an artist. Grab a brush, pour a glass, and let your creativity flow in our warm and welcoming studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full text-lg h-14 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                <Link href="/events">View Schedule</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full text-lg h-14 px-8 border-primary/20 hover:bg-primary/5 transition-all">
                <Link href="/private-events">Book a Private Party</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-card-foreground">Upcoming Classes</h2>
            <p className="text-muted-foreground text-lg">Find your next masterpiece.</p>
            <Button asChild variant="link" className="text-primary hover:text-primary/80">
              <Link href="/events" className="flex items-center gap-2">
                See all classes <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingEvents ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : upcomingEvents?.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground text-lg">More classes being scheduled soon. Check back later!</p>
              </div>
            ) : (
              upcomingEvents?.map((event, index) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-2xl overflow-hidden border border-border/50 bg-background hover-elevate transition-all duration-300"
                >
                  <Link href={`/events/${event.slug}`} className="block">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={event.coverImageUrl || "/images/event-1.png"} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur text-foreground font-bold px-3 py-1 rounded-full text-sm shadow-sm">
                        ${event.price}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <h3 className="font-serif text-xl font-bold line-clamp-1">{event.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{format(new Date(event.date), "EEEE, MMMM do 'at' h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{event.location || "Main Studio"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Studio Moments</h2>
            <p className="text-muted-foreground text-lg">A glimpse into our colorful world of creativity and connection.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {loadingPhotos ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))
            ) : featuredPhotos?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Gallery is empty at the moment.</p>
              </div>
            ) : (
              featuredPhotos?.map((photo, index) => (
                <motion.div 
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-square overflow-hidden rounded-xl shadow-sm"
                >
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.caption || "Gallery photo"} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </motion.div>
              ))
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg" className="rounded-full border-primary/20">
              <Link href="/gallery">View Full Gallery</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/images/hero.png')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
        <div className="container relative z-10 px-4 md:px-6 max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">Stay Colorful</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive class announcements, early access to special events, and a splash of inspiration in your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8">
            <Input 
              type="email" 
              placeholder="Your email address" 
              className="h-14 rounded-full bg-background/10 border-background/20 text-white placeholder:text-white/60 focus-visible:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="h-14 rounded-full px-8 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={subscribeNewsletter.isPending}>
              {subscribeNewsletter.isPending ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
