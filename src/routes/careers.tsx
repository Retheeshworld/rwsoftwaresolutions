import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Brain, Briefcase, CheckCircle2, Clock, Code2, Globe, GraduationCap, Home, Mail, MapPin, Megaphone, Palette, Phone, Rocket, Smartphone, Sparkles, Target, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { toast } from "sonner";

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
        eyebrow="Careers"
        title="Build the future, |with us|"
        subtitle="Join a team that ships fast, learns faster, and treats engineering like a craft."
      />

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
