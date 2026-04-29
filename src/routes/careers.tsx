import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Brain, Briefcase, CheckCircle2, Clock, Code2, Globe, GraduationCap, Loader2, Mail, MapPin, Megaphone, Palette, Phone, Rocket, Smartphone, Sparkles, Target, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers & Internships — RiseWave" },
      { name: "description", content: "Join RiseWave. Open roles across engineering, AI, design and growth." },
      { property: "og:title", content: "Careers at RiseWave" },
      { property: "og:description", content: "Build the future with us. Internships and full-time roles open." },
    ],
  }),
  component: CareersPage,
});

const roles = [
  { role: "Frontend Engineer Intern", type: "Internship", loc: "Remote · India" },
  { role: "AI/ML Engineer", type: "Full-time", loc: "Hybrid · Chennai" },
  { role: "Full-Stack Developer", type: "Full-time", loc: "Remote" },
  { role: "UI/UX Designer Intern", type: "Internship", loc: "Remote" },
  { role: "Growth Marketer", type: "Full-time", loc: "Remote" },
  { role: "Automation Engineer", type: "Contract", loc: "Remote" },
];

function CareersPage() {
  const [selected, setSelected] = useState<string>("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Application received! We'll get back to you within 5 days.");
    e.currentTarget.reset();
    setSelected("");
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Careers & Internships"
        title="Ride the wave of |innovation|"
        subtitle="Join a team that ships fast, learns faster, and treats engineering like a craft. 100% online internships open now."
      />

      {/* Internship Program */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> We're Hiring Interns
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Join Our <span className="text-gradient">Internship Program</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Kickstart your career with real-world experience — from anywhere. 🌐
            </p>
          </div>

          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Globe, title: "100% Online", desc: "Work from anywhere" },
              { Icon: Clock, title: "1 / 3 Months", desc: "Flexible duration" },
              { Icon: Award, title: "Certificate", desc: "On completion" },
              { Icon: Rocket, title: "Placement", desc: "Real opportunities" },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-elegant transition-smooth group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold">{title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>

          <div className="mb-12 rounded-3xl border border-border bg-card p-6 shadow-elegant sm:p-8">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <Target className="h-5 w-5 text-primary" /> Domains Available
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Icon: Code2, name: "Web Development" },
                { Icon: Smartphone, name: "App Development" },
                { Icon: Rocket, name: "Full Stack Development" },
                { Icon: Palette, name: "UI/UX Design" },
                { Icon: Brain, name: "AI & Prompt Engineering" },
                { Icon: Megaphone, name: "Digital Marketing" },
                { Icon: Users, name: "Social Media Management" },
                { Icon: Sparkles, name: "Content Creation" },
              ].map(({ Icon, name }) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-smooth hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
              <h3 className="mb-5 flex items-center gap-2 text-xl font-bold">
                <GraduationCap className="h-5 w-5 text-primary" /> Who Can Apply?
              </h3>
              <ul className="space-y-3">
                {[
                  "Students (Any Degree / Department)",
                  "Freshers & Job Seekers",
                  "Anyone passionate about learning & growth",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
              <h3 className="mb-5 flex items-center gap-2 text-xl font-bold">
                <Sparkles className="h-5 w-5 text-primary" /> What You'll Get
              </h3>
              <ul className="space-y-3">
                {[
                  "Real-Time Project Experience",
                  "Internship Certificate",
                  "Skill Development & Mentorship",
                  "Work From Home",
                  "Placement Opportunity",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-brand p-6 text-white shadow-glow sm:p-8">
            <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
              <div>
                <div className="text-lg font-bold sm:text-xl">🌊 Ride the Wave of Innovation</div>
                <div className="mt-1 text-sm text-white/80">Learn • Build • Grow • Succeed</div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="https://wa.me/917604974617" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    <Phone className="h-4 w-4" /> WhatsApp 7604974617
                  </Button>
                </a>
                <a href="mailto:info.rwsoftwaresolutions@gmail.com">
                  <Button size="lg" variant="outline" className="border-white/40 bg-white/10 font-semibold text-white hover:bg-white/20 hover:text-white">
                    <Mail className="h-4 w-4" /> Email Us
                  </Button>
                </a>
                <a href="#apply">
                  <Button size="lg" className="bg-white font-semibold text-primary hover:bg-white/90">
                    Apply Now →
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Open Roles</h2>
        <div className="grid gap-4">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => {
                setSelected(r.role);
                document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group flex flex-col gap-2 rounded-2xl border bg-card p-5 text-left shadow-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant sm:flex-row sm:items-center sm:justify-between ${
                selected === r.role ? "border-primary" : "border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{r.role}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      {r.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {r.loc}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-primary transition-smooth group-hover:translate-x-1">
                Apply →
              </span>
            </button>
          ))}
        </div>
      </section>

      <section id="apply" className="bg-gradient-hero">
        <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Apply <span className="text-gradient">in 30 seconds</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Tell us a bit about you and upload your resume.</p>
          </div>
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-elegant sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required placeholder="Your name" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="you@email.com" className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                required
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a role</option>
                {roles.map((r) => (
                  <option key={r.role} value={r.role}>{r.role}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="resume">Resume (PDF)</Label>
              <label
                htmlFor="resume"
                className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
              >
                <Upload className="h-4 w-4" /> Click to upload your resume
                <input id="resume" type="file" accept=".pdf,.doc,.docx" className="hidden" />
              </label>
            </div>
            <Button type="submit" size="lg" className="w-full bg-gradient-brand text-white shadow-elegant">
              Submit Application
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
