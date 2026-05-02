import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — RiseWave Software Solutions" },
      { name: "description", content: "Get in touch with RiseWave. Phone, email, WhatsApp and form." },
      { property: "og:title", content: "Contact RiseWave" },
      { property: "og:description", content: "Reach the team — we usually reply within hours." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = contactSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject") || undefined,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject ?? null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send message. Please try again.");
      return;
    }
    toast.success("Message sent! We'll reply within 24 hours.");
    form.reset();
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Get in touch"
        title="Let's build |something great|"
        subtitle="Tell us about your idea, your team, or your timeline. We'll take it from there."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            {[
              { Icon: Phone, title: "Phone", value: "+91 76049 74617", href: "tel:+917604974617" },
              { Icon: MessageCircle, title: "WhatsApp", value: "Chat instantly", href: "https://wa.me/917604974617" },
              { Icon: Mail, title: "Email", value: "hello@risewave.dev", href: "mailto:hello@risewave.dev" },
              { Icon: MapPin, title: "Location", value: "Tamil Nadu, India" },
            ].map(({ Icon, title, value, href }) => {
              const content = (
                <>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-elegant">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
                    <div className="font-semibold">{value}</div>
                  </div>
                </>
              );
              return href ? (
                <a
                  key={title}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
                >
                  {content}
                </a>
              ) : (
                <div key={title} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                  {content}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-border bg-gradient-card p-6 shadow-elegant sm:p-8 lg:col-span-2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cname">Name</Label>
                <Input id="cname" name="name" required maxLength={100} placeholder="Your full name" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="cemail">Email</Label>
                <Input id="cemail" name="email" type="email" required maxLength={255} placeholder="you@email.com" className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="csubject">Subject</Label>
              <Input id="csubject" name="subject" maxLength={200} placeholder="What's this about?" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cmsg">Message</Label>
              <Textarea id="cmsg" name="message" required maxLength={2000} rows={6} placeholder="Tell us about your project..." className="mt-2" />
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full bg-gradient-brand text-white shadow-elegant transition-smooth hover:shadow-glow sm:w-auto">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>Send Message <Send className="ml-1 h-4 w-4" /></>}
            </Button>
          </form>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border shadow-elegant">
          <iframe
            title="RiseWave location"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d62209.96833!2d80.2209!3d13.0827!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000"
            className="h-[400px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
