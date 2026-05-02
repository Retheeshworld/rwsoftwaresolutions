import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/internships")({
  head: () => ({ meta: [{ title: "Internships — RW Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <InternshipsPage />
      </AdminLayout>
    </RequireAuth>
  ),
});

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  domain: string;
  duration: string | null;
  message: string | null;
  resume_url: string | null;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  reviewed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  accepted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

function InternshipsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("internship_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load");
    else setApps((data ?? []) as Application[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("internship_applications")
      .update({ status })
      .eq("id", id);
    if (error) return toast.error("Update failed");
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success(`Marked as ${status}`);
  };

  const downloadResume = async (path: string) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    if (error || !data) return toast.error("Couldn't open resume");
    window.open(data.signedUrl, "_blank");
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Internships</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {apps.length} total · {apps.filter((a) => a.status === "pending").length} pending review
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          No applications.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 text-sm font-semibold text-primary">
                    {a.full_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{a.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.email}
                      {a.phone ? ` · ${a.phone}` : ""}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                        {a.domain}
                      </span>
                      {a.duration && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          {a.duration}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium capitalize ${
                          statusColors[a.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>

              {a.message && (
                <p className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  {a.message}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {a.resume_url && (
                  <Button size="sm" variant="outline" onClick={() => downloadResume(a.resume_url!)}>
                    <Download className="h-3.5 w-3.5" /> Resume
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(a.id, "reviewed")}
                  disabled={a.status === "reviewed"}
                >
                  Reviewed
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => updateStatus(a.id, "accepted")}
                  disabled={a.status === "accepted"}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600"
                  onClick={() => updateStatus(a.id, "rejected")}
                  disabled={a.status === "rejected"}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
