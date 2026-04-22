import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Code2, Cpu, Layers, Megaphone, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — RiseWave Software Solutions" },
      { name: "description", content: "Web, mobile, AI, UI/UX, marketing and automation services from RiseWave." },
      { property: "og:title", content: "RiseWave Services" },
      { property: "og:description", content: "Six core services to ship and scale your product." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    Icon: Code2,
    title: "Web Development",
    desc: "Conversion-focused marketing sites, dashboards and SaaS platforms — built on modern stacks.",
    features: ["React / Next.js / TanStack", "SEO & Core Web Vitals", "Headless CMS", "Edge deployment"],
  },
  {
    Icon: Layers,
    title: "App Development",
    desc: "Cross-platform iOS & Android apps that feel native and ship in record time.",
    features: ["React Native", "Native modules", "Push & analytics", "App Store launch"],
  },
  {
    Icon: Bot,
    title: "AI Solutions",
    desc: "Production AI: agents, copilots, RAG pipelines and LLM-powered workflows.",
    features: ["Custom AI agents", "RAG & vector DBs", "Fine-tuning", "Realtime voice/chat"],
  },
  {
    Icon: Palette,
    title: "UI / UX Design",
    desc: "Design systems, user flows and interfaces engineered to delight and convert.",
    features: ["Design systems", "Prototyping", "Brand identity", "Motion design"],
  },
  {
    Icon: Megaphone,
    title: "Digital Marketing",
    desc: "SEO, content, paid ads and growth loops that compound over time.",
    features: ["Technical SEO", "Performance ads", "Content strategy", "Analytics"],
  },
  {
    Icon: Cpu,
    title: "Automation Services",
    desc: "Replace manual ops with intelligent workflows — internal tools, integrations & bots.",
    features: ["Workflow automation", "API integrations", "Internal tools", "Process AI"],
  },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="What we do"
        title="Services that |move the needle|"
        subtitle="Six core capabilities. One promise: ship excellence, faster than you thought possible."
      >
        <Link to="/contact">
          <Button size="lg" className="bg-gradient-brand text-white shadow-elegant">
            Start a project
          </Button>
        </Link>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map(({ Icon, title, desc, features }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-8 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brand opacity-0 transition-smooth group-hover:opacity-100" />
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-elegant">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{desc}</p>
              <ul className="mt-5 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Don't see what you need? <span className="text-gradient">Let's talk.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            We take on bespoke engagements when the problem is interesting and the team is ready.
          </p>
          <Link to="/contact" className="mt-6 inline-block">
            <Button size="lg" className="bg-gradient-brand text-white">Get in touch</Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
