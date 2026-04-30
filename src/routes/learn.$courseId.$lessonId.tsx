import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  Loader2,
  Lock,
  PlayCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCourseById,
  fetchCourseTree,
  getSignedResourceUrl,
  getSignedVideoUrl,
  isEnrolled,
  type Course,
  type Lesson,
  type Module,
} from "@/lib/lms";
import { toast } from "sonner";

export const Route = createFileRoute("/learn/$courseId/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lesson — RW Software Solutions" },
      { name: "description", content: "Watch your enrolled course lessons online." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <LearnPage />
    </RequireAuth>
  ),
});

function LearnPage() {
  const { courseId, lessonId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingComplete, setSavingComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load course + tree + enrollment + progress
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [c, tree, enr] = await Promise.all([
          fetchCourseById(courseId),
          fetchCourseTree(courseId),
          isEnrolled(courseId, user.id),
        ]);
        if (!active) return;
        setCourse(c);
        setModules(tree.modules);
        setLessons(tree.lessons);
        setEnrolled(enr);

        const lessonIds = tree.lessons.map((l) => l.id);
        if (lessonIds.length) {
          const { data: prog } = await supabase
            .from("lesson_progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds);
          if (active) {
            setCompletedSet(new Set((prog ?? []).filter((p) => p.completed).map((p) => p.lesson_id)));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load course");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseId, user]);

  // Resolve "first" sentinel → first lesson
  const orderedLessons = useMemo(() => {
    const moduleOrder = new Map(modules.map((m) => [m.id, m.position]));
    return [...lessons].sort((a, b) => {
      const ma = moduleOrder.get(a.module_id) ?? 0;
      const mb = moduleOrder.get(b.module_id) ?? 0;
      if (ma !== mb) return ma - mb;
      return a.position - b.position;
    });
  }, [modules, lessons]);

  const activeLessonId = lessonId === "first" ? orderedLessons[0]?.id : lessonId;
  const activeLesson = orderedLessons.find((l) => l.id === activeLessonId);
  const activeIndex = orderedLessons.findIndex((l) => l.id === activeLessonId);
  const prevLesson = activeIndex > 0 ? orderedLessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < orderedLessons.length - 1 ? orderedLessons[activeIndex + 1] : null;

  // Redirect "first" to actual lesson id
  useEffect(() => {
    if (lessonId === "first" && orderedLessons[0]) {
      navigate({
        to: "/learn/$courseId/$lessonId",
        params: { courseId, lessonId: orderedLessons[0].id },
        replace: true,
      });
    }
  }, [lessonId, orderedLessons, courseId, navigate]);

  // Sign video url for active lesson
  useEffect(() => {
    setVideoUrl(null);
    if (!activeLesson?.video_path || !enrolled) return;
    let active = true;
    getSignedVideoUrl(activeLesson.video_path)
      .then((url) => {
        if (active) setVideoUrl(url);
      })
      .catch(() => toast.error("Could not load video"));
    return () => {
      active = false;
    };
  }, [activeLesson, enrolled]);

  const markComplete = async () => {
    if (!user || !activeLesson) return;
    setSavingComplete(true);
    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: activeLesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
          last_position_seconds: Math.floor(videoRef.current?.currentTime ?? 0),
        },
        { onConflict: "user_id,lesson_id" },
      );
    setSavingComplete(false);
    if (error) {
      toast.error("Couldn't save progress");
      return;
    }
    setCompletedSet((s) => new Set(s).add(activeLesson.id));
    toast.success("Lesson completed");
    if (nextLesson) {
      navigate({ to: "/learn/$courseId/$lessonId", params: { courseId, lessonId: nextLesson.id } });
    }
  };

  const downloadResource = async () => {
    if (!activeLesson?.resource_path) return;
    try {
      const url = await getSignedResourceUrl(activeLesson.resource_path);
      window.open(url, "_blank");
    } catch {
      toast.error("Couldn't open resource");
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </SiteLayout>
    );
  }

  if (!course) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Link to="/courses" className="mt-4 inline-block">
            <Button variant="outline">Browse courses</Button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (!enrolled) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-3 text-2xl font-bold">You're not enrolled in this course</h1>
          <p className="mt-2 text-muted-foreground">Enroll for ₹{course.price} to start watching lessons.</p>
          <Link to="/courses" className="mt-6 inline-block">
            <Button className="rounded-full bg-gradient-brand text-white">Go to courses</Button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const totalPublished = orderedLessons.filter((l) => l.is_published).length;
  const completedCount = [...completedSet].filter((id) => orderedLessons.find((l) => l.id === id)?.is_published).length;
  const pct = totalPublished > 0 ? Math.round((completedCount / totalPublished) * 100) : 0;

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        {/* Main */}
        <div>
          <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {activeLesson ? activeLesson.title : "Select a lesson"}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-black shadow-elegant">
            {activeLesson?.video_path ? (
              videoUrl ? (
                <video
                  ref={videoRef}
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  className="aspect-video w-full"
                  controlsList="nodownload"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-white/60">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 text-white/60">
                <PlayCircle className="h-10 w-10" />
                <p className="text-sm">No video uploaded for this lesson yet.</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              onClick={markComplete}
              disabled={savingComplete || (activeLesson && completedSet.has(activeLesson.id))}
              className="rounded-full bg-gradient-brand text-white"
            >
              {savingComplete ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : activeLesson && completedSet.has(activeLesson.id) ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Completed
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Mark as complete
                </>
              )}
            </Button>
            {activeLesson?.resource_path && (
              <Button variant="outline" className="rounded-full" onClick={downloadResource}>
                <Download className="h-4 w-4" /> Download resource
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              {prevLesson && (
                <Link
                  to="/learn/$courseId/$lessonId"
                  params={{ courseId, lessonId: prevLesson.id }}
                >
                  <Button variant="outline" size="sm" className="rounded-full">
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                </Link>
              )}
              {nextLesson && (
                <Link
                  to="/learn/$courseId/$lessonId"
                  params={{ courseId, lessonId: nextLesson.id }}
                >
                  <Button size="sm" className="rounded-full bg-gradient-brand text-white">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {activeLesson?.description && (
            <div className="mt-6 rounded-2xl border border-border/60 bg-gradient-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Lesson notes
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
                {activeLesson.description}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="rounded-2xl border border-border/60 bg-card p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Course progress
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>
                {completedCount}/{totalPublished} lessons
              </span>
              <span className="font-semibold text-primary">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="space-y-3">
            {modules.map((m) => {
              const moduleLessons = lessons
                .filter((l) => l.module_id === m.id)
                .sort((a, b) => a.position - b.position);
              return (
                <div key={m.id}>
                  <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {m.title}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {moduleLessons.map((l) => {
                      const isActive = l.id === activeLessonId;
                      const done = completedSet.has(l.id);
                      return (
                        <Link
                          key={l.id}
                          to="/learn/$courseId/$lessonId"
                          params={{ courseId, lessonId: l.id }}
                          className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-smooth ${
                            isActive
                              ? "bg-gradient-brand text-white shadow-elegant"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0" />
                          )}
                          <span className="line-clamp-1">{l.title}</span>
                        </Link>
                      );
                    })}
                    {moduleLessons.length === 0 && (
                      <div className="px-2 py-1 text-xs text-muted-foreground/70">No lessons yet</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
