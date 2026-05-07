import { ArrowUpRight, Linkedin, ThumbsUp, MessageCircle, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/SectionHeader";

const COMPANY_URL =
  "https://www.linkedin.com/company/rw-software-solutions-60230a405";

type Post = {
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  likes: number;
  comments: number;
  reposts: number;
  url?: string;
};

// Curated previews — update these as new LinkedIn posts go live.
const posts: Post[] = [
  {
    title: "Now hiring interns for our AI Lab 🚀",
    excerpt:
      "We're opening 10 internship seats for ambitious developers to ship real AI-native products with our core team.",
    tag: "Hiring",
    date: "2d",
    likes: 124,
    comments: 18,
    reposts: 9,
  },
  {
    title: "Case study: 3.4x ROI for a D2C client",
    excerpt:
      "How a custom automation pipeline + a redesigned funnel helped one of our clients triple their first-year ROI.",
    tag: "Case Study",
    date: "5d",
    likes: 87,
    comments: 11,
    reposts: 6,
  },
  {
    title: "Launching the RiseWave AI bootcamp",
    excerpt:
      "8 weeks. Real projects. Senior mentors. Applications for the next cohort are now open — limited seats.",
    tag: "Education",
    date: "1w",
    likes: 212,
    comments: 34,
    reposts: 21,
  },
];

export function LinkedInFeed() {
  return (
    <section className="border-y border-border/40 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="From our LinkedIn"
            title="Latest |company updates|"
            subtitle="Follow RW Software Solutions on LinkedIn for hiring news, case studies and product launches."
          />
          <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <Linkedin className="h-4 w-4 text-primary" />
              Follow on LinkedIn
            </Button>
          </a>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((p) => (
            <a
              key={p.title}
              href={p.url ?? COMPANY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-border bg-background p-6 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">RW Software Solutions</div>
                    <div className="text-xs text-muted-foreground">{p.date} · {p.tag}</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-smooth group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>

              <h3 className="mt-5 text-base font-semibold leading-snug">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>

              <div className="mt-6 flex items-center gap-5 border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5" />{p.likes}</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" />{p.comments}</span>
                <span className="flex items-center gap-1.5"><Repeat2 className="h-3.5 w-3.5" />{p.reposts}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
