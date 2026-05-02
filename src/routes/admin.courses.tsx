import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { fetchCourses, type Course } from "@/lib/lms";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({ meta: [{ title: "Manage Courses — Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminCoursesPage />
    </RequireAuth>
  ),
});

function AdminCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCourses(true);
      setCourses(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

  const createCourse = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const slug = `${slugify(newTitle)}-${Math.floor(Math.random() * 9999)}`;
    const { data, error } = await supabase
      .from("courses")
      .insert({ title: newTitle.trim(), slug, price: 999, is_published: false })
      .select()
      .maybeSingle();
    setCreating(false);
    if (error || !data) {
      toast.error("Could not create course");
      return;
    }
    setNewTitle("");
    toast.success("Course created");
    navigate({ to: "/admin/courses/$courseId", params: { courseId: data.id } });
  };

  const togglePublish = async (c: Course) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !c.is_published })
      .eq("id", c.id);
    if (error) return toast.error("Update failed");
    setCourses((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_published: !c.is_published } : x)));
  };

  const deleteCourse = async (c: Course) => {
    if (!confirm(`Delete "${c.title}"? This removes all modules, lessons and enrollments.`)) return;
    const { error } = await supabase.from("courses").delete().eq("id", c.id);
    if (error) return toast.error("Delete failed");
    setCourses((prev) => prev.filter((x) => x.id !== c.id));
    toast.success("Course deleted");
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground">
              ← Admin
            </Link>
            <h1 className="mt-1 text-2xl font-bold">Courses</h1>
            <p className="text-sm text-muted-foreground">{courses.length} total</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-4">
          <Input
            placeholder="New course title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="max-w-md"
          />
          <Button
            onClick={createCourse}
            disabled={creating || !newTitle.trim()}
            className="bg-gradient-brand text-white"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create course
          </Button>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex flex-col rounded-2xl border border-border bg-gradient-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      c.is_published
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {c.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>₹{c.price}</span>
                  <span>·</span>
                  <span>{c.duration ?? "—"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/admin/courses/$courseId" params={{ courseId: c.id }}>
                    <Button size="sm" variant="outline">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => togglePublish(c)}>
                    {c.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto text-rose-600"
                    onClick={() => deleteCourse(c)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
