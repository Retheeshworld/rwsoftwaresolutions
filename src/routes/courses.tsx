import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Award,
  BadgeCheck,
  Brain,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  CreditCard,
  GraduationCap,
  Infinity as InfinityIcon,
  Instagram,
  Laptop,
  Lightbulb,
  Linkedin,
  Mail,
  MessageSquare,
  Palette,
  PlayCircle,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
  Twitter,
  UserCheck,
  Users,
  Wand2,
  Youtube,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCourses, type Course as DbCourse } from "@/lib/lms";
import { PaymentDialog } from "@/components/PaymentDialog";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "RW Software Solutions – Online Courses at ₹999" },
      {
        name: "description",
        content:
          "100% Online Courses with Live + Recorded sessions, Certificate & Lifetime Access. Learn AI, Web Dev, Python, UI/UX, Design, Marketing & Freelancing — just ₹999.",
      },
      { property: "og:title", content: "RW Software Solutions – Online Courses at ₹999" },
      {
        property: "og:description",
        content:
          "Learn in-demand skills online at just ₹999. Certificate Included. Lifetime Access.",
      },
    ],
  }),
  component: CoursesPage,
});

type Course = {
  title: string;
  duration: string;
  price: number;
  description: string;
  skills: string[];
  icon: LucideIcon;
  tag?: string;
};

const courses: Course[] = [
  {
    title: "AI Tools Mastery Course",
    duration: "15 Days",
    price: 999,
    description:
      "Master ChatGPT, Prompt Engineering, Lovable AI, AntiGravity AI, Figma AI, automation & AI content creation for productivity, freelancing and business.",
    skills: ["ChatGPT", "Prompt Engineering", "Lovable AI", "Automation", "AI Content"],
    icon: Brain,
    tag: "Most Popular",
  },
  {
    title: "Full Stack Web Development",
    duration: "45 Days",
    price: 999,
    description:
      "HTML, CSS, JavaScript, Bootstrap, Tailwind, React JS, PHP, MySQL, frontend-backend integration and website deployment.",
    skills: ["React JS", "Tailwind", "PHP", "MySQL", "Deployment"],
    icon: Code2,
    tag: "Career Track",
  },
  {
    title: "Python Programming Course",
    duration: "30 Days",
    price: 999,
    description:
      "Python basics, loops, functions, OOP, file handling, mini projects, automation scripts and practical programming.",
    skills: ["Python", "OOP", "Automation", "Projects"],
    icon: Sparkles,
  },
  {
    title: "UI/UX Design with Figma",
    duration: "20 Days",
    price: 999,
    description:
      "UI/UX design fundamentals, wireframing, app & website design, prototyping and design systems with Figma.",
    skills: ["Figma", "Wireframes", "Prototyping", "Design Systems"],
    icon: Palette,
  },
  {
    title: "Graphic Design Course",
    duration: "25 Days",
    price: 999,
    description:
      "Canva, Photoshop basics, social media creatives, posters, flyers, branding and logo design.",
    skills: ["Canva", "Photoshop", "Branding", "Logos"],
    icon: Wand2,
  },
  {
    title: "Digital Marketing Course",
    duration: "30 Days",
    price: 999,
    description:
      "Social media marketing, Instagram growth, SEO basics, branding, lead generation and WhatsApp marketing.",
    skills: ["SMM", "SEO", "Lead Gen", "WhatsApp Marketing"],
    icon: TrendingUp,
  },
  {
    title: "Freelancing & Business Growth",
    duration: "15 Days",
    price: 999,
    description:
      "Freelancing setup, client communication, proposals, portfolio building, pricing strategy and AI-powered business growth.",
    skills: ["Freelancing", "Proposals", "Portfolio", "Pricing"],
    icon: Briefcase,
  },
];

const trustBadges = [
  { icon: Laptop, label: "100% Online" },
  { icon: CreditCard, label: "₹999 Only" },
  { icon: Award, label: "Certificate Provided" },
  { icon: InfinityIcon, label: "Lifetime Access" },
];

const whyChoose = [
  { icon: Laptop, title: "100% Online Learning", desc: "Learn anywhere, anytime from any device." },
  { icon: PlayCircle, title: "Live + Recorded Classes", desc: "Attend live or revisit recordings anytime." },
  { icon: Rocket, title: "Real-Time Projects", desc: "Build portfolio-grade projects that ship." },
  { icon: Award, title: "Certificate Included", desc: "Verifiable certificate on completion." },
  { icon: InfinityIcon, title: "Lifetime Access", desc: "One-time payment, lifetime updates." },
  { icon: MessageSquare, title: "Mentorship Support", desc: "1:1 doubt clearing & guidance." },
  { icon: Briefcase, title: "Freelancing Guidance", desc: "Land your first paid client confidently." },
  { icon: Lightbulb, title: "Beginner Friendly", desc: "Zero experience? We start from scratch." },
];

const audience = [
  { icon: GraduationCap, title: "College Students" },
  { icon: Sparkles, title: "Beginners" },
  { icon: Briefcase, title: "Freelancers" },
  { icon: UserCheck, title: "Job Seekers" },
  { icon: Rocket, title: "Entrepreneurs" },
  { icon: TrendingUp, title: "Working Professionals" },
];

const pricingIncludes = [
  "One-Time Payment",
  "100% Online Access",
  "Certificate Included",
  "Live + Recorded Sessions",
  "Lifetime Access",
  "No Hidden Charges",
];

function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbCourses, setDbCourses] = useState<DbCourse[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses().then(setDbCourses).catch(() => {});
  }, []);

  const findDbCourse = (title: string) =>
    dbCourses.find((c) => c.title.toLowerCase() === title.toLowerCase());

  const enroll = async (title: string) => {
    if (!user) {
      toast.info("Please sign in to enroll");
      navigate({ to: "/login" });
      return;
    }
    const dbCourse = findDbCourse(title);
    if (!dbCourse) {
      toast.success(`Enrollment started for ${title}`, {
        description: "We'll reach out on WhatsApp within minutes.",
      });
      return;
    }
    setEnrolling(dbCourse.id);
    try {
      await enrollInCourse(dbCourse.id, user.id);
      toast.success(`Enrolled in ${title}`);
      navigate({
        to: "/learn/$courseId/$lessonId",
        params: { courseId: dbCourse.id, lessonId: "first" },
      });
    } catch (e) {
      console.error(e);
      toast.error("Enrollment failed");
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" /> RW Software Solutions · Online Courses
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-up">
              Learn In-Demand Skills{" "}
              <span className="text-gradient">Online at Just ₹999</span>
            </h1>

            <p className="mt-5 text-base text-muted-foreground sm:text-lg animate-fade-up">
              100% Online Courses · Live + Recorded Sessions · Certificate Included · Lifetime Access.
              Build career-ready skills in AI, Web Dev, Design and Marketing.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 animate-fade-up">
              <Button
                size="lg"
                onClick={() => enroll("RW Courses")}
                className="rounded-full bg-gradient-brand text-white shadow-elegant transition-smooth hover:shadow-glow"
              >
                <Zap className="h-4 w-4" /> Enroll Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full"
              >
                <a href="#courses">View Courses</a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Hero illustration card */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-brand opacity-30 blur-3xl" />
            <div className="relative rounded-3xl border border-border/60 bg-gradient-card p-6 shadow-elegant backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Online Skill Studio</div>
                    <div className="text-xs text-muted-foreground">Live cohort · Beginner friendly</div>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Live now
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { Icon: Brain, label: "AI Tools" },
                  { Icon: Code2, label: "Full Stack" },
                  { Icon: Palette, label: "UI/UX Figma" },
                  { Icon: TrendingUp, label: "Marketing" },
                ].map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3 transition-smooth hover:border-primary/40 hover:bg-background"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs text-muted-foreground">₹999 · Online</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Next batch starts</span>
                  <span className="text-primary">This Monday</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full w-4/5 bg-gradient-brand" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  80% seats filled · Reserve at ₹999
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Featured Courses
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Career-ready courses <span className="text-gradient">at just ₹999</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Hand-crafted by working professionals. Live cohorts, real projects, certificate & lifetime access.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-card backdrop-blur transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
              >
                {c.tag && (
                  <span className="absolute right-4 top-4 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-elegant">
                    {c.tag}
                  </span>
                )}

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-xl font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {c.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Laptop className="h-3.5 w-3.5" /> 100% Online
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> 4.9
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gradient">₹{c.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">One-time · Lifetime access</div>
                  </div>
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>

                <Button
                  onClick={() => enroll(c.title)}
                  className="mt-5 w-full rounded-full bg-gradient-brand text-white shadow-elegant transition-smooth hover:shadow-glow"
                >
                  Enroll Now
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Why RW Software Solutions
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for <span className="text-gradient">real careers</span>, not just certificates
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-smooth group-hover:bg-gradient-brand group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO CAN JOIN */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Who Can Join?
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Designed for <span className="text-gradient">everyone serious about growth</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audience.map(({ icon: Icon, title }) => (
            <div
              key={title}
              className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-gradient-card p-5 transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-base font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">Perfect fit for our cohorts</div>
              </div>
              <Compass className="ml-auto h-4 w-4 text-muted-foreground transition-smooth group-hover:text-primary" />
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Simple Pricing
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              One price. <span className="text-gradient">Every course.</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              No subscriptions. No hidden fees. Pay once and own it forever.
            </p>
          </div>

          <div className="relative mx-auto max-w-xl">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-brand opacity-40 blur-2xl" />
            <div className="relative rounded-3xl border border-primary/30 bg-card p-8 shadow-elegant sm:p-10">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Best Value
                </span>
                <Award className="h-6 w-6 text-primary" />
              </div>

              <div className="mt-6 text-center">
                <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Per Course
                </div>
                <div className="mt-2 flex items-end justify-center gap-1">
                  <span className="text-6xl font-extrabold text-gradient sm:text-7xl">₹999</span>
                  <span className="mb-2 text-sm text-muted-foreground">only</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  One-time payment · Lifetime access
                </div>
              </div>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {pricingIncludes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {item}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => enroll("₹999 Course Pack")}
                className="mt-8 w-full rounded-full bg-gradient-brand text-white shadow-elegant transition-smooth hover:shadow-glow"
                size="lg"
              >
                Enroll Now for ₹999
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure checkout · Instant access · 7-day support guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-brand p-10 text-center text-white shadow-elegant sm:p-16">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Start Learning Today with RW Software Solutions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/90 sm:text-lg">
            Join today and upgrade your skills with industry-ready online courses at just ₹999.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => enroll("RW Courses")}
              className="rounded-full bg-white text-primary shadow-elegant hover:bg-white/90"
            >
              <Zap className="h-4 w-4" /> Enroll Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* COURSES PAGE FOOTER STRIP (info, not replacing global footer) */}
      <section className="border-t border-border/40 bg-card/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="text-base font-bold">
              Rise<span className="text-gradient">Wave</span> Software Solutions
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              100% Online Learning Platform — building India's next generation of builders.
            </p>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Contact</div>
            <a
              href="mailto:info.rwsoftwaresolutions@gmail.com"
              className="mt-2 inline-flex items-center gap-2 text-muted-foreground transition-smooth hover:text-foreground"
            >
              <Mail className="h-4 w-4" /> info.rwsoftwaresolutions@gmail.com
            </a>
          </div>
          <div>
            <div className="text-sm font-semibold">Follow Us</div>
            <div className="mt-3 flex gap-3">
              {[Instagram, Linkedin, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-smooth hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              © 2026 RW Software Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
