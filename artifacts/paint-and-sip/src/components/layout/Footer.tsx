import { Link } from "wouter";
import { Palette, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-primary text-primary-foreground p-2 rounded-full transition-transform group-hover:-rotate-12">
                <Palette className="h-5 w-5" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">
                Erica's Paint & Sip
              </span>
            </Link>
            <p className="text-muted-foreground opacity-80 mt-4 leading-relaxed">
              Unleash your inner artist in our vibrant studio. Joyful painting classes with wine, friends, and endless creativity.
            </p>
            <div className="flex gap-4 mt-6">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/events" className="hover:text-primary transition-colors opacity-80 hover:opacity-100">Upcoming Events</Link></li>
              <li><Link href="/private-events" className="hover:text-primary transition-colors opacity-80 hover:opacity-100">Private Parties</Link></li>
              <li><Link href="/gallery" className="hover:text-primary transition-colors opacity-80 hover:opacity-100">Our Gallery</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors opacity-80 hover:opacity-100">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors opacity-80 hover:opacity-100">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 opacity-80">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>123 Creative Studio Lane<br />Art District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 opacity-80">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 opacity-80">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>hello@ericaspaintandsip.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Studio Hours</h3>
            <ul className="space-y-3 opacity-80">
              <li className="flex justify-between"><span>Mon - Wed:</span> <span>Closed (Private Events)</span></li>
              <li className="flex justify-between"><span>Thursday:</span> <span>6:00 PM - 9:00 PM</span></li>
              <li className="flex justify-between"><span>Friday:</span> <span>6:00 PM - 10:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday:</span> <span>2:00 PM - 10:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday:</span> <span>1:00 PM - 6:00 PM</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border/20 mt-12 pt-8 text-center opacity-60 text-sm">
          <p>&copy; {new Date().getFullYear()} Erica's Paint & Sip. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
