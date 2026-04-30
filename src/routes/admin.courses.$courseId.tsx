import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  ALLOWED_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  fetchCourseById,
  fetchCourseTree,
  formatDuration,
  probeVideoFile,
  type Course,
  type Lesson,
  type Module,
} from "@/lib/lms";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses/$courseId")({
  head: () => ({ meta: [{ title: "Edit Course — Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <EditCoursePage />
    </RequireAuth>
  ),
});

function EditCoursePage() {
  const { courseId } = Route.useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newModule, setNewModule] = useState("");

  const load = async () => {
    setLoading(true);
    const c = await fetchCourseById(courseId);
    setCourse(c);
    if (c) {
      const tree = await fetchCourseTree(courseId);
      setModules(tree.modules);
      setLessons(tree.lessons);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const saveCourse = async () => {
    if (!course) return;
    setSaving(true);
    const { error } = await supabase
      .from("courses")
      .update({
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        price: course.price,
        duration: course.duration,
        level: course.level,
        is_published: course.is_published,
      })
      .eq("id", course.id);
    setSaving(false);
    if (error) return toast.error("Save failed");
    toast.success("Course saved");
  };

  const addModule = async () => {
    if (!newModule.trim()) return;
    const position = modules.length;
    const { data, error } = await supabase
      .from("modules")
      .insert({ course_id: courseId, title: newModule.trim(), position })
      .select()
      .maybeSingle();
    if (error || !data) return toast.error("Could not add module");
    setModules((prev) => [...prev, data as Module]);
    setNewModule("");
  };

  const deleteModule = async (m: Module) => {
    if (!confirm(`Delete module "${m.title}" and all its lessons?`)) return;
    const { error } = await supabase.from("modules").delete().eq("id", m.id);
    if (error) return toast.error("Delete failed");
    setModules((prev) => prev.filter((x) => x.id !== m.id));
    setLessons((prev) => prev.filter((l) => l.module_id !== m.id));
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
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Link to="/admin/courses" className="mt-4 inline-block">
            <Button variant="outline">Back to courses</Button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/admin/courses" className="text-xs text-muted-foreground hover:text-foreground">
          ← Courses
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{course.title}</h1>

        {/* Course meta */}
        <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Title
            </label>
            <Input
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Subtitle
            </label>
            <Input
              value={course.subtitle ?? ""}
              onChange={(e) => setCourse({ ...course, subtitle: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Price (₹)
            </label>
            <Input
              type="number"
              value={course.price}
              onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Duration
            </label>
            <Input
              value={course.duration ?? ""}
              onChange={(e) => setCourse({ ...course, duration: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <Textarea
              value={course.description ?? ""}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              rows={4}
              className="mt-1"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={course.is_published}
                onChange={(e) => setCourse({ ...course, is_published: e.target.checked })}
              />
              Published
            </label>
            <Button onClick={saveCourse} disabled={saving} className="ml-auto bg-gradient-brand text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save course"}
            </Button>
          </div>
        </div>

        {/* Modules */}
        <h2 className="mt-10 text-lg font-bold">Modules</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            placeholder="New module name…"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={addModule} className="bg-gradient-brand text-white">
            <Plus className="h-4 w-4" /> Add module
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {modules
            .sort((a, b) => a.position - b.position)
            .map((m) => (
              <ModuleEditor
                key={m.id}
                module={m}
                lessons={lessons.filter((l) => l.module_id === m.id).sort((a, b) => a.position - b.position)}
                onDelete={() => deleteModule(m)}
                onLessonsChange={(updated) =>
                  setLessons((prev) => [...prev.filter((l) => l.module_id !== m.id), ...updated])
                }
              />
            ))}
          {modules.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No modules yet. Add your first module above.
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function ModuleEditor({
  module,
  lessons,
  onDelete,
  onLessonsChange,
}: {
  module: Module;
  lessons: Lesson[];
  onDelete: () => void;
  onLessonsChange: (lessons: Lesson[]) => void;
}) {
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(module.title);
  const [savingTitle, setSavingTitle] = useState(false);

  const saveTitle = async () => {
    if (title === module.title) return;
    setSavingTitle(true);
    const { error } = await supabase.from("modules").update({ title }).eq("id", module.id);
    setSavingTitle(false);
    if (error) toast.error("Could not rename");
    else toast.success("Module renamed");
  };

  const addLesson = async () => {
    const position = lessons.length;
    const { data, error } = await supabase
      .from("lessons")
      .insert({ module_id: module.id, title: "Untitled lesson", position, is_published: true })
      .select()
      .maybeSingle();
    if (error || !data) return toast.error("Could not add lesson");
    onLessonsChange([...lessons, data as Lesson]);
  };

  const updateLesson = (l: Lesson) => onLessonsChange(lessons.map((x) => (x.id === l.id ? l : x)));
  const removeLesson = (id: string) => onLessonsChange(lessons.filter((l) => l.id !== id));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setOpen(!open)} className="text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          className="max-w-md"
        />
        {savingTitle && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <span className="ml-auto text-xs text-muted-foreground">{lessons.length} lessons</span>
        <Button size="sm" variant="outline" onClick={addLesson}>
          <Plus className="h-3.5 w-3.5" /> Lesson
        </Button>
        <Button size="sm" variant="outline" className="text-rose-600" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          {lessons.map((l) => (
            <LessonEditor key={l.id} lesson={l} onChange={updateLesson} onDelete={() => removeLesson(l.id)} />
          ))}
          {lessons.length === 0 && (
            <p className="text-xs text-muted-foreground">No lessons yet — click "Lesson" to add one.</p>
          )}
        </div>
      )}
    </div>
  );
}

function LessonEditor({
  lesson,
  onChange,
  onDelete,
}: {
  lesson: Lesson;
  onChange: (l: Lesson) => void;
  onDelete: () => void;
}) {
  const [local, setLocal] = useState(lesson);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("lessons")
      .update({
        title: local.title,
        description: local.description,
        is_published: local.is_published,
        video_path: local.video_path,
        video_duration_seconds: local.video_duration_seconds,
      })
      .eq("id", local.id);
    setSaving(false);
    if (error) return toast.error("Save failed");
    toast.success("Lesson saved");
    onChange(local);
  };

  const remove = async () => {
    if (!confirm(`Delete lesson "${local.title}"?`)) return;
    const { error } = await supabase.from("lessons").delete().eq("id", local.id);
    if (error) return toast.error("Delete failed");
    onDelete();
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Unsupported format. Use MP4, MOV or WEBM.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("File too large. Max 500 MB.");
      return;
    }

    let duration = 0;
    try {
      duration = await probeVideoFile(file);
    } catch {
      toast.error("Could not read video metadata");
      return;
    }
    if (duration > MAX_VIDEO_SECONDS) {
      toast.error(`Video is ${Math.round(duration / 60)}m. Max allowed is 30 minutes per lesson.`);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setProgress(10);

    const ext = file.name.split(".").pop() ?? "mp4";
    const path = `${local.module_id}/${local.id}.${ext}`;

    // Supabase JS doesn't expose progress; fake intermediate progress
    const ticker = setInterval(() => setProgress((p) => Math.min(p + 7, 88)), 400);

    const { error } = await supabase.storage
      .from("course-videos")
      .upload(path, file, { upsert: true, contentType: file.type });

    clearInterval(ticker);

    if (error) {
      setUploading(false);
      setProgress(0);
      toast.error(`Upload failed: ${error.message}`);
      return;
    }

    setProgress(100);
    setUploading(false);

    const { error: updErr } = await supabase
      .from("lessons")
      .update({ video_path: path, video_duration_seconds: Math.floor(duration) })
      .eq("id", local.id);

    if (updErr) {
      toast.error("Saved video but failed to update lesson");
      return;
    }
    const updated = { ...local, video_path: path, video_duration_seconds: Math.floor(duration) };
    setLocal(updated);
    onChange(updated);
    toast.success("Video uploaded");
  };

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={local.title}
          onChange={(e) => setLocal({ ...local, title: e.target.value })}
          placeholder="Lesson title"
        />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {local.video_path ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 font-medium text-emerald-600 dark:text-emerald-400">
              <Video className="h-3 w-3" /> Video uploaded · {formatDuration(local.video_duration_seconds)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 font-medium text-amber-600 dark:text-amber-400">
              No video
            </span>
          )}
          <label className="ml-auto flex items-center gap-2">
            <input
              type="checkbox"
              checked={local.is_published}
              onChange={(e) => setLocal({ ...local, is_published: e.target.checked })}
            />
            Published
          </label>
        </div>
      </div>

      <Textarea
        rows={2}
        className="mt-3"
        placeholder="Lesson notes / description"
        value={local.description ?? ""}
        onChange={(e) => setLocal({ ...local, description: e.target.value })}
      />

      {previewUrl && (
        <video src={previewUrl} controls className="mt-3 max-h-48 w-full rounded-lg" />
      )}

      {uploading && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Uploading… {progress}%</div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={onPickFile}
        />
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="h-3.5 w-3.5" /> {local.video_path ? "Replace video" : "Upload video"}
        </Button>
        <Button size="sm" onClick={save} disabled={saving} className="bg-gradient-brand text-white">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
        </Button>
        <Button size="sm" variant="outline" className="ml-auto text-rose-600" onClick={remove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        MP4 / MOV / WEBM · Max 30 minutes · Max 500 MB
      </p>
    </div>
  );
}
