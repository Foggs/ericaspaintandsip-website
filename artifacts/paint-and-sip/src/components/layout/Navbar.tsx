import { Link, useLocation } from "wouter";
import { Menu, X, Palette } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Events", path: "/events" },
    { label: "Private Events", path: "/private-events" },
    { label: "Gallery", path: "/gallery" },
    { label: "Blog", path: "/blog" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-full transition-transform group-hover:rotate-12">
            <Palette className="h-6 w-6" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight text-foreground">
            Erica's Paint & Sip
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === item.path ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild className="rounded-full shadow-md hover:shadow-lg transition-all" size="lg">
            <Link href="/events">Book a Class</Link>
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-mobile-menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-background border-b absolute w-full px-4 py-6 shadow-lg">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-lg font-medium p-2 rounded-md ${
                  location === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button className="w-full mt-4 rounded-full" size="lg" onClick={() => setIsOpen(false)}>
              <Link href="/events">Book a Class</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
