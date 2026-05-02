import { Layout } from "@/components/layout/Layout";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(10, "Message is too short"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    }
  });

  const onSubmit = (data: ContactFormValues) => {
    // In a real app, this would use a mutation hook
    // We'll simulate success since there's no specific general contact hook provided
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. We'll get back to you soon.",
    });
    form.reset();
  };

  return (
    <Layout>
      <div className="bg-primary/5 pt-32 pb-16">
        <div className="container px-4 md:px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">Get in Touch</h1>
          <p className="text-lg text-muted-foreground">
            Have a question about a class? Want to join our team? Just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 lg:gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-10"
          >
            <div>
              <h2 className="text-2xl font-serif font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full shrink-0 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Studio Location</h4>
                    <p className="text-muted-foreground mt-1">123 Creative Studio Lane<br/>Art District, NY 10001</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full shrink-0 text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Phone</h4>
                    <p className="text-muted-foreground mt-1">(555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full shrink-0 text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Email</h4>
                    <p className="text-muted-foreground mt-1">hello@ericaspaintandsip.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold mb-6">Studio Hours</h2>
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <ul className="space-y-3">
                  <li className="flex justify-between text-muted-foreground"><span>Monday - Wednesday</span> <span>Closed</span></li>
                  <li className="flex justify-between text-foreground font-medium"><span>Thursday</span> <span>6:00 PM - 9:00 PM</span></li>
                  <li className="flex justify-between text-foreground font-medium"><span>Friday</span> <span>6:00 PM - 10:00 PM</span></li>
                  <li className="flex justify-between text-foreground font-medium"><span>Saturday</span> <span>2:00 PM - 10:00 PM</span></li>
                  <li className="flex justify-between text-foreground font-medium"><span>Sunday</span> <span>1:00 PM - 6:00 PM</span></li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3 bg-card border border-border/50 rounded-3xl p-8 shadow-sm"
          >
            <h2 className="text-2xl font-serif font-bold mb-6">Send a Message</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input placeholder="Your name" className="bg-background" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl><Input placeholder="What is this regarding?" className="bg-background" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you?" 
                          className="min-h-[150px] bg-background" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-full mt-4">
                  Send Message
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
