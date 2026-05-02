import { Layout } from "@/components/layout/Layout";
import { useCreatePrivateInquiry } from "@workspace/api-client-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, GlassWater, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  preferredDate: z.string().optional(),
  guestCount: z.coerce.number().min(10, "Minimum 10 guests required").max(100, "Maximum 100 guests"),
  message: z.string().min(10, "Please provide some details about your event"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export default function PrivateEvents() {
  const { toast } = useToast();
  const createInquiry = useCreatePrivateInquiry();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredDate: "",
      guestCount: 10,
      message: "",
    }
  });

  const onSubmit = (data: InquiryFormValues) => {
    createInquiry.mutate({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferredDate: data.preferredDate,
        guestCount: data.guestCount,
        message: data.message
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Inquiry Sent!",
          description: "We'll get back to you shortly to plan your colorful event.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "There was a problem sending your inquiry. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const features = [
    { icon: <Paintbrush className="w-6 h-6" />, title: "Custom Artwork", desc: "Choose from our gallery or request a custom piece for your group." },
    { icon: <Users className="w-6 h-6" />, title: "Private Studio", desc: "Enjoy exclusive use of our beautiful, vibrant studio space." },
    { icon: <GlassWater className="w-6 h-6" />, title: "BYOB Allowed", desc: "Bring your favorite wine, beer, and snacks to enjoy while painting." },
    { icon: <Calendar className="w-6 h-6" />, title: "Flexible Timing", desc: "Book your event for a time that works best for your group." },
  ];

  return (
    <Layout>
      <div className="bg-primary/5 py-24">
        <div className="container px-4 md:px-6 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-bold tracking-wide uppercase text-sm border border-primary/20">
              Celebrate with Us
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground">Private Parties</h1>
            <p className="text-xl text-muted-foreground">
              Birthdays, bachelorettes, team building, or just a night out. Make your next gathering unforgettable with a private paint and sip experience.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-border/50">
              <img src="/images/gallery-1.png" alt="Group of friends painting" className="w-full h-full object-cover" />
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold mb-6">Why Book With Us?</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="bg-primary/10 p-3 rounded-full h-fit text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-2xl">
              <h4 className="font-bold mb-2">Pricing Details</h4>
              <p className="text-muted-foreground text-sm">Private events start at $45 per person with a minimum of 10 painters required. A non-refundable deposit of $100 is required to secure your date.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border/50 p-8 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-serif font-bold mb-2">Request an Event</h2>
            <p className="text-muted-foreground mb-8">Fill out the form below and our event coordinator will be in touch within 24 hours.</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Your name" className="bg-background" {...field} /></FormControl>
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
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="your@email.com" className="bg-background" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="(555) 123-4567" className="bg-background" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date (Optional)</FormLabel>
                        <FormControl><Input type="date" className="bg-background" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Guest Count</FormLabel>
                        <FormControl><Input type="number" min="10" className="bg-background" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your event (type of celebration, specific painting requests, etc.)" 
                          className="min-h-[120px] bg-background" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-full mt-4" disabled={createInquiry.isPending}>
                  {createInquiry.isPending ? "Sending Inquiry..." : "Submit Inquiry"}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
