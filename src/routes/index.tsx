import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Code2,
  Cpu,
  Layers,
  Megaphone,
  Palette,
  Quote,
  Rocket,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeader } from "@/components/SectionHeader";
import { LinkedInFeed } from "@/components/LinkedInFeed";
import logo from "@/assets/rw-logo.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RiseWave Software Solutions — AI, Web & Automation" },
      {
        name: "description",
        content:
          "RiseWave builds the future with AI, web, app development, automation and digital growth for startups, students and enterprises.",
      },
      { property: "og:title", content: "RiseWave Software Solutions" },
      {
        property: "og:description",
        content: "Creating the Future with AI, Web & Automation.",
      },
    ],
  }),
  component: HomePage,
});

const services = [
  { Icon: Code2, title: "Web Development", desc: "Production-grade websites built for speed, SEO and conversion." },
  { Icon: Layers, title: "App Development", desc: "Cross-platform mobile apps with native-grade UX." },
  { Icon: Bot, title: "AI Solutions", desc: "Custom AI agents, RAG, copilots and automation pipelines." },
  { Icon: Palette, title: "UI / UX Design", desc: "Design systems & interfaces users love at first sight." },
  { Icon: Megaphone, title: "Digital Marketing", desc: "SEO, growth loops & paid campaigns that compound." },
  { Icon: Cpu, title: "Automation", desc: "Workflows that replace busywork with intelligent systems." },
];

const why = [
  { Icon: Rocket, title: "Ship Fast", desc: "MVPs in weeks, not quarters." },
  { Icon: Shield, title: "Built to Scale", desc: "Architecture trusted by growing teams." },
  { Icon: Sparkles, title: "AI-Native", desc: "Every product is intelligence-first." },
  { Icon: Users, title: "Founder-Led", desc: "You work directly with the makers." },
];

const stats = [
  { v: "50+", l: "Projects Delivered" },
  { v: "50+", l: "Startup Clients" },
  { v: "100+", l: "Students Trained" },
  { v: "98%", l: "Satisfaction" },
];

const testimonials = [
  {
    name: "Arjun Mehta",
    role: "Founder, NovaPay",
    quote: "RiseWave shipped our MVP in 4 weeks. Investors thought we'd been building for a year.",
  },
  {
    name: "Sneha Iyer",
    role: "CTO, GreenLoop",
    quote: "Their AI automation cut our ops cost by 40%. Genuinely the best engineering partner we've had.",
  },
  {
    name: "Rahul Das",
    role: "Student, IIT-M",
    quote: "Took the full-stack + AI course. Landed an internship within two months. Worth every rupee.",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-glow/20 blur-3xl animate-glow" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-32">
          <div className="text-center lg:text-left animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Zap className="h-3 w-3" /> Next-Gen Software Studio
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Creating the Future with{" "}
              <span className="text-gradient">AI, Web & Automation</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              We build intelligent products and train the next generation of builders. From idea
              to launch — engineered with obsession, designed for impact.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/services">
                <Button size="lg" className="group bg-gradient-brand text-white shadow-elegant transition-smooth hover:shadow-glow">
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4 transition-smooth group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
                <span className="ml-1 font-medium">4.9 / 5</span>
              </div>
              <span>Trusted by Students & Startups</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-in lg:max-w-none">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-brand opacity-30 blur-3xl" />
            <div className="relative rounded-[2rem] border border-border bg-gradient-card p-6 shadow-elegant sm:p-8">
              <div className="flex items-center justify-center">
                <img src={logo} alt="RW" className="h-40 w-40 rounded-2xl object-cover animate-float sm:h-56 sm:w-56" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { Icon: Bot, label: "AI Agents" },
                  { Icon: Code2, label: "Web Apps" },
                  { Icon: Layers, label: "Mobile" },
                  { Icon: Cpu, label: "Automation" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl border border-border bg-background/60 p-3 text-sm transition-smooth hover:border-primary/40 hover:shadow-card">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-bold text-gradient sm:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeader
          eyebrow="What we do"
          title="Engineered for |what's next|"
          subtitle="Six core offerings — one obsessive standard."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brand opacity-0 transition-smooth group-hover:opacity-100" />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-elegant">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/services">
            <Button variant="outline" size="lg">
              Explore all services <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader
            eyebrow="Why RiseWave"
            title="The unfair |advantage| your team needs"
            subtitle="We don't just deliver projects — we deliver leverage."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {why.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant"
              >
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeader eyebrow="Our impact" title="Numbers that |speak louder| than slogans" />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { Icon: TrendingUp, title: "3.4x avg ROI", desc: "Across launched products in the first 12 months." },
            { Icon: Users, title: "10,000+ learners", desc: "Trained through our courses and bootcamps." },
            { Icon: Rocket, title: "50+ MVPs shipped", desc: "From zero to production in record time." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
              <Icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/40 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader eyebrow="Testimonials" title="Loved by |builders & founders|" />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-background p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant"
              >
                <Quote className="h-6 w-6 text-primary opacity-60" />
                <p className="mt-3 text-sm leading-relaxed">{t.quote}</p>
                <div className="mt-5 border-t border-border pt-4">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internship CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center text-white shadow-elegant sm:p-16">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-primary-glow/40 blur-3xl" />
          </div>
          <div className="relative">
            <span className="inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Now Recruiting
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Join Our Internship Program
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Work on real products. Learn from senior engineers. Build a portfolio that opens doors.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/careers">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Apply Now <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
