import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — RiseWave Software Solutions" },
      { name: "description", content: "Selected work from RiseWave: web platforms, AI products and mobile apps." },
      { property: "og:title", content: "RiseWave Portfolio" },
      { property: "og:description", content: "Selected work across Web, AI and Apps." },
    ],
  }),
  component: PortfolioPage,
});

type Cat = "All" | "Web" | "AI" | "Apps";

const projects: { title: string; cat: Exclude<Cat, "All">; tag: string; desc: string; gradient: string }[] = [
  { title: "NovaPay Dashboard", cat: "Web", tag: "Fintech SaaS", desc: "Realtime payments dashboard for merchants.", gradient: "from-blue-600 to-cyan-400" },
  { title: "AskWave AI", cat: "AI", tag: "RAG Copilot", desc: "Document Q&A copilot trained on private data.", gradient: "from-indigo-600 to-blue-400" },
  { title: "GreenLoop App", cat: "Apps", tag: "Mobile · iOS+Android", desc: "Sustainability tracker with social features.", gradient: "from-emerald-500 to-teal-400" },
  { title: "EduVerse LMS", cat: "Web", tag: "EdTech Platform", desc: "Course delivery + live cohorts platform.", gradient: "from-violet-600 to-blue-400" },
  { title: "VoxAgent", cat: "AI", tag: "Voice AI", desc: "Realtime voice agent for customer support.", gradient: "from-sky-500 to-cyan-400" },
  { title: "ShelfMate", cat: "Apps", tag: "Inventory App", desc: "Offline-first inventory app for SMBs.", gradient: "from-blue-500 to-indigo-500" },
  { title: "PulseSEO", cat: "Web", tag: "Marketing Tool", desc: "AI-powered SEO audit and rank tracker.", gradient: "from-cyan-500 to-blue-500" },
  { title: "FlowOps", cat: "AI", tag: "Workflow AI", desc: "Internal automation for ops teams.", gradient: "from-blue-700 to-sky-400" },
];

const cats: Cat[] = ["All", "Web", "AI", "Apps"];

function PortfolioPage() {
  const [filter, setFilter] = useState<Cat>("All");
  const list = filter === "All" ? projects : projects.filter((p) => p.cat === filter);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Selected work"
        title="Products we've |shipped|"
        subtitle="A glimpse of what we build when given a hard problem and a deadline."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-smooth ${
                filter === c
                  ? "bg-gradient-brand text-white shadow-elegant"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <div
              key={p.title}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className={`relative aspect-[16/10] bg-gradient-to-br ${p.gradient} p-6 text-white`}>
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/20 blur-2xl" />
                </div>
                <div className="relative flex h-full flex-col justify-between">
                  <span className="inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                    {p.cat}
                  </span>
                  <div className="text-2xl font-bold">{p.title}</div>
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs uppercase tracking-wider text-primary">{p.tag}</div>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-smooth hover:text-primary">
                  View demo <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
