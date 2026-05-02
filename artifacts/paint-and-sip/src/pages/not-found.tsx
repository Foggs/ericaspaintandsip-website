import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-primary/5 py-24 text-center px-4">
        <div className="bg-background p-6 rounded-full shadow-lg border border-border/50 mb-8 inline-flex">
          <Palette className="h-16 w-16 text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">
          Oops! Blank Canvas.
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-10">
          We couldn't find the page you're looking for. It might have been moved or the link might be broken.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8 text-lg shadow-lg hover:-translate-y-1 transition-all">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-lg">
            <Link href="/events">View Upcoming Classes</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
