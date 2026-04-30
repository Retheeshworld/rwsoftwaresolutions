import { supabase } from "@/integrations/supabase/client";

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  duration: string | null;
  level: string;
  is_published: boolean;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  position: number;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_path: string | null;
  video_duration_seconds: number | null;
  thumbnail_path: string | null;
  resource_path: string | null;
  position: number;
  is_published: boolean;
};

export async function fetchCourses(includeUnpublished = false) {
  let q = supabase.from("courses").select("*").order("created_at", { ascending: true });
  if (!includeUnpublished) q = q.eq("is_published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function fetchCourseBySlug(slug: string) {
  const { data, error } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Course | null;
}

export async function fetchCourseById(id: string) {
  const { data, error } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Course | null;
}

export async function fetchCourseTree(courseId: string) {
  const { data: modules, error: mErr } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true });
  if (mErr) throw mErr;

  const moduleIds = (modules ?? []).map((m) => m.id);
  let lessons: Lesson[] = [];
  if (moduleIds.length) {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .in("module_id", moduleIds)
      .order("position", { ascending: true });
    if (error) throw error;
    lessons = (data ?? []) as Lesson[];
  }
  return { modules: (modules ?? []) as Module[], lessons };
}

export async function getSignedVideoUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("course-videos")
    .createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function getSignedResourceUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("course-resources")
    .createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export function thumbnailUrl(path: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
  return data.publicUrl;
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export async function enrollInCourse(courseId: string, userId: string) {
  const { error } = await supabase
    .from("enrollments")
    .insert({ course_id: courseId, user_id: userId, status: "active", payment_status: "pending", amount_paid: 0 });
  if (error && !error.message.toLowerCase().includes("duplicate")) throw error;
}

export async function isEnrolled(courseId: string, userId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

/** Probes a video file to get duration in seconds. Throws if cannot read. */
export function probeVideoFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(v.duration);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Cannot read video metadata"));
    };
    v.src = url;
  });
}

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const MAX_VIDEO_SECONDS = 30 * 60;
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB
