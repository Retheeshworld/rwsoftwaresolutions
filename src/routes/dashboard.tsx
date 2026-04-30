import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, BookOpen, GraduationCap, Loader2, PlayCircle, Trophy } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { thumbnailUrl, type Course } from "@/lib/lms";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Learning — RW Software Solutions" },
      { name: "description", content: "Continue learning, view your courses, progress and certificates." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

type EnrollmentRow = {
  id: string;
  course_id: string;
  enrolled_at: string;
  course: Course | null;
};

type CertRow = {
  id: string;
  certificate_code: string;
  issued_at: string;
  course_id: string;
  course: { title: string; slug: string } | null;
};

function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [progress, setProgress] = useState<Record<string, { done: number; total: number; nextLessonId?: string }>>({});
  const [certs, setCerts] = useState<CertRow[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);

      const { data: enr } = await supabase
        .from("enrollments")
        .select("id, course_id, enrolled_at, course:courses(*)")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      const enrollList = (enr ?? []) as unknown as EnrollmentRow[];

      const { data: certData } = await supabase
        .from("certificates")
        .select("id, certificate_code, issued_at, course_id, course:courses(title,slug)")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      // Compute progress per course
      const progressMap: typeof progress = {};
      for (const e of enrollList) {
        if (!e.course) continue;
        const { data: tree } = await supabase
          .from("modules")
          .select("id, lessons(id, position, is_published)")
          .eq("course_id", e.course.id);
        const lessonIds: string[] = [];
        const orderedLessons: { id: string; pos: number }[] = [];
        (tree ?? []).forEach((m: { lessons?: { id: string; position: number; is_published: boolean }[] }) => {
          (m.lessons ?? [])
            .filter((l) => l.is_published)
            .forEach((l) => {
              lessonIds.push(l.id);
              orderedLessons.push({ id: l.id, pos: l.position });
            });
        });
        let done = 0;
        let nextLessonId: string | undefined;
        if (lessonIds.length) {
          const { data: prog } = await supabase
            .from("lesson_progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds);
          const completedSet = new Set((prog ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
          done = completedSet.size;
          const sorted = orderedLessons.sort((a, b) => a.pos - b.pos);
          nextLessonId = sorted.find((l) => !completedSet.has(l.id))?.id ?? sorted[0]?.id;
        }
        progressMap[e.course.id] = { done, total: lessonIds.length, nextLessonId };
      }

      if (!active) return;
      setEnrollments(enrollList);
      setProgress(progressMap);
      setCerts((certData ?? []) as unknown as CertRow[]);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const inProgress = enrollments.filter((e) => {
    const p = progress[e.course_id];
    return p && p.total > 0 && p.done < p.total;
  });
  const completed = enrollments.filter((e) => {
    const p = progress[e.course_id];
    return p && p.total > 0 && p.done >= p.total;
  });

  const continueCard = inProgress[0] ?? enrollments[0];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back<span className="text-gradient">.</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.email} — keep the momentum going.
            </p>
          </div>
          <Link to="/courses">
            <Button variant="outline" className="rounded-full">Browse all courses</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard Icon={BookOpen} label="Enrolled" value={enrollments.length} />
          <StatCard Icon={PlayCircle} label="In progress" value={inProgress.length} />
          <StatCard Icon={Trophy} label="Completed" value={completed.length} />
          <StatCard Icon={Award} label="Certificates" value={certs.length} />
        </div>

        {/* Continue learning */}
        {continueCard && continueCard.course && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-border/60 bg-gradient-brand p-8 text-white shadow-elegant">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  Continue learning
                </div>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{continueCard.course.title}</h2>
                <div className="mt-2 text-sm text-white/85">
                  {progress[continueCard.course_id]
                    ? `${progress[continueCard.course_id].done} / ${progress[continueCard.course_id].total} lessons completed`
                    : "Start your first lesson"}
                </div>
              </div>
              <Link
                to="/learn/$courseId/$lessonId"
                params={{
                  courseId: continueCard.course.id,
                  lessonId: progress[continueCard.course_id]?.nextLessonId ?? "first",
                }}
              >
                <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90">
                  <PlayCircle className="h-5 w-5" /> Resume
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* My courses */}
        <h2 className="mt-12 text-xl font-bold">My courses</h2>
        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : enrollments.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-10 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="mt-4 inline-block">
              <Button className="rounded-full bg-gradient-brand text-white">Explore courses</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e) => {
              if (!e.course) return null;
              const p = progress[e.course_id] ?? { done: 0, total: 0 };
              const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
              const thumb = thumbnailUrl(e.course.thumbnail_url);
              return (
                <div
                  key={e.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
                >
                  <div className="relative aspect-video w-full bg-gradient-brand">
                    {thumb && <img src={thumb} alt={e.course.title} className="h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                        {e.course.duration}
                      </span>
                      <span className="text-xs font-semibold">{pct}%</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold">{e.course.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {e.course.subtitle}
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {p.done}/{p.total} lessons
                      </span>
                      <Link
                        to="/learn/$courseId/$lessonId"
                        params={{ courseId: e.course.id, lessonId: p.nextLessonId ?? "first" }}
                      >
                        <Button size="sm" className="rounded-full bg-gradient-brand text-white">
                          {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Certificates */}
        {certs.length > 0 && (
          <>
            <h2 className="mt-12 text-xl font-bold">Certificates</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certs.map((c) => (
                <Link
                  key={c.id}
                  to="/certificate/$certId"
                  params={{ certId: c.id }}
                  className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-gradient-card p-5 transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{c.course?.title ?? "Course"}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {c.certificate_code}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}

function StatCard({
  Icon,
  label,
  value,
}: {
  Icon: typeof BookOpen;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
