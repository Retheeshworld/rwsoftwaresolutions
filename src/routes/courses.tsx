import { createFileRoute } from "@tanstack/react-router";
import { Award, Clock, GraduationCap, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { toast } from "sonner";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — RiseWave Education" },
      { name: "description", content: "Hands-on courses in Full-Stack, AI, App Development and Growth — with certificates." },
      { property: "og:title", content: "RiseWave Courses" },
      { property: "og:description", content: "Career-grade courses in AI, Web and Mobile." },
    ],
  }),
  component: CoursesPage,
});

const courses = [
  {
    title: "Full-Stack Web Development",
    desc: "From HTML to deploying production React apps with auth, payments and CI.",
    price: 9999,
    duration: "12 weeks",
    students: "2,400+",
    rating: 4.9,
    tag: "Most Popular",
  },
  {
    title: "AI & LLM Engineering",
    desc: "Build production AI agents, RAG systems and copilots end-to-end.",
    price: 14999,
    duration: "10 weeks",
    students: "1,200+",
    rating: 4.9,
    tag: "New",
  },
  {
    title: "Mobile App Development",
    desc: "Ship cross-platform apps with React Native and modern tooling.",
    price: 8999,
    duration: "8 weeks",
    students: "1,800+",
    rating: 4.8,
  },
  {
    title: "UI/UX Design Mastery",
    desc: "Design systems, Figma, prototyping and shipping interfaces users love.",
    price: 6999,
    duration: "6 weeks",
    students: "1,100+",
    rating: 4.8,
  },
  {
    title: "Digital Marketing & SEO",
    desc: "Modern growth: technical SEO, paid ads, content engines and analytics.",
    price: 5999,
    duration: "6 weeks",
    students: "900+",
    rating: 4.7,
  },
  {
    title: "Automation & No-Code AI",
    desc: "Build internal tools and AI workflows without writing thousands of lines.",
    price: 4999,
    duration: "4 weeks",
    students: "700+",
    rating: 4.8,
  },
];

function CoursesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Education"
        title="Learn what |actually ships|"
        subtitle="Career-grade courses taught by working engineers. Real projects. Real certificates."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div
              key={c.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              {c.tag && (
                <span className="absolute right-4 top-4 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-white shadow-elegant">
                  {c.tag}
                </span>
              )}
              <div className="bg-gradient-brand p-6 text-white">
                <GraduationCap className="h-8 w-8" />
                <h3 className="mt-3 text-xl font-bold">{c.title}</h3>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-sm text-muted-foreground">{c.desc}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {c.duration}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> {c.students}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {c.rating}
                  </div>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gradient">₹{c.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">One-time · Lifetime access</div>
                  </div>
                </div>
                <Button
                  onClick={() => toast.success(`Enrolled in ${c.title} — check your email!`)}
                  className="mt-5 w-full bg-gradient-brand text-white shadow-elegant transition-smooth hover:shadow-glow"
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certificate */}
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Certificate System
              </span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Earn a <span className="text-gradient">verifiable certificate</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every completed course unlocks a uniquely-signed certificate with a public
                verification page. Add it to LinkedIn in one click.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {[
                  "Verifiable certificate ID",
                  "LinkedIn-ready format",
                  "Public verification page",
                  "Recruiter-friendly profile",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-brand opacity-30 blur-3xl" />
              <div className="relative aspect-[4/3] rounded-3xl border-8 border-card bg-gradient-card p-6 shadow-elegant sm:p-8">
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 p-6 text-center">
                  <Award className="h-12 w-12 text-primary" />
                  <div className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Certificate of Completion
                  </div>
                  <div className="mt-2 text-2xl font-bold sm:text-3xl">Retheesh R</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    has successfully completed
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gradient">
                    AI & LLM Engineering
                  </div>
                  <div className="mt-4 flex w-full items-center justify-between text-xs text-muted-foreground">
                    <span>ID: RW-2025-00421</span>
                    <span>RiseWave Software Solutions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
