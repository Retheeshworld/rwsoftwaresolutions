import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Brain, Code2, Eye, Globe, GraduationCap, Heart, Lightbulb, Mail, Rocket, Target, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — RiseWave Software Solutions" },
      { name: "description", content: "Meet the team behind RiseWave — a founder-led software studio building AI, web and automation products." },
      { property: "og:title", content: "About RiseWave" },
      { property: "og:description", content: "Founder-led, AI-native software studio." },
    ],
  }),
  component: AboutPage,
});

const milestones = [
  { year: "2023", title: "Founded", desc: "RiseWave begins as a 2-person studio in Tamil Nadu." },
  { year: "2024", title: "100+ Projects", desc: "Crossed 100 client deliveries across 8 countries." },
  { year: "2024", title: "Education Launch", desc: "Launched bootcamps; 10K+ students trained." },
  { year: "2025", title: "AI Lab", desc: "Opened a dedicated AI R&D division." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our story"
        title="We're builders |obsessed| with the future"
        subtitle="RiseWave was born from a simple belief: software should compound human ambition. We build it that way."
      />

      {/* About Retheesh R */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-brand opacity-30 blur-3xl" />
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-brand shadow-elegant">
              <div className="flex h-full w-full items-center justify-center text-white">
                <div className="text-center">
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/30 bg-white/10 text-4xl font-bold backdrop-blur">
                    RR
                  </div>
                  <div className="mt-4 text-2xl font-bold">Retheesh R</div>
                  <div className="text-sm uppercase tracking-wider opacity-90">Founder & CEO</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              About the Founder
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Retheesh R</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Retheesh R is an entrepreneur, software developer, and AI enthusiast dedicated to
              building innovative digital solutions. He is currently pursuing a Bachelor of Science
              in Artificial Intelligence and Machine Learning at Rathinam Group of Institutions,
              Coimbatore.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              As the CEO and Co-Founder of RW Group, Retheesh focuses on developing
              technology-driven solutions through RW Software Development and RW Education
              Service. His interests include Artificial Intelligence, Machine Learning, Web
              Development, Software Engineering, and Business Innovation.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              With a passion for technology and entrepreneurship, he aims to create impactful
              software products that help businesses and individuals succeed in the digital world.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="mailto:retheeshworld86@gmail.com">
                <Button className="bg-gradient-brand text-white">
                  <Mail className="mr-2 h-4 w-4" /> Contact
                </Button>
              </a>
              <Link to="/services">
                <Button variant="outline">What we do</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Education */}
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Skills */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-bold">Skills</h3>
              <ul className="mt-6 space-y-3">
                {[
                  { Icon: Brain, label: "Artificial Intelligence & Machine Learning" },
                  { Icon: Code2, label: "Python Programming" },
                  { Icon: Globe, label: "Web Development" },
                  { Icon: User, label: "Software Development" },
                  { Icon: Rocket, label: "Business Development" },
                  { Icon: Users, label: "Leadership & Communication" },
                ].map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Education */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-bold">Education</h3>
              <div className="mt-6 rounded-xl border border-border bg-gradient-card p-6">
                <div className="text-sm font-semibold text-primary">Bachelor of Science</div>
                <h4 className="mt-1 text-lg font-semibold">Artificial Intelligence & Machine Learning</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rathinam Group of Institutions, Coimbatore
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Motto */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader title="Vision & |Motto|" subtitle="What drives us forward every single day." />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
            <Eye className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-2xl font-bold">Vision</h3>
            <p className="mt-3 text-muted-foreground">
              To build innovative technology solutions and establish RW Group as a trusted
              global technology company.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
            <Target className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-2xl font-bold">Motto</h3>
            <p className="mt-3 text-lg font-semibold text-primary">
              "Transforming Ideas into Digital Innovation."
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader title="Our |Mission|" subtitle="What gets us out of bed every morning." />
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-card">
            <Target className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-4 text-center text-2xl font-bold">Mission</h3>
            <p className="mt-3 text-center text-muted-foreground">
              Deliver exceptional software, train world-class talent, and democratize access
              to modern AI & engineering practices.
            </p>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Achievements" title="Milestones on the |journey|" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {milestones.map((m) => (
            <div
              key={m.title}
              className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="text-sm font-semibold text-primary">{m.year}</div>
              <h3 className="mt-2 text-lg font-semibold">{m.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { Icon: Award, t: "Excellence", d: "Shipped 120+ production products." },
            { Icon: Users, t: "Community", d: "10K+ developers in our network." },
            { Icon: Heart, t: "Trust", d: "98% client satisfaction score." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
              <Icon className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <div className="font-semibold">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-brand p-10 text-center text-white shadow-elegant sm:p-14">
          <Rocket className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Ready to build something legendary?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Tell us about your idea — we'll tell you how we'd ship it.
          </p>
          <Link to="/contact" className="mt-6 inline-block">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Start a project
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
