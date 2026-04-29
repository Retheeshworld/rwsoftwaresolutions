import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  DollarSign,
  Download,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Mail,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — RiseWave" },
      { name: "description", content: "RiseWave admin dashboard." },
    ],
  }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminPage />
    </RequireAuth>
  ),
});

const stats = [
  { Icon: Users, label: "Total Users", value: "12,438", change: "+8.4%" },
  { Icon: GraduationCap, label: "Active Courses", value: "24", change: "+2" },
  { Icon: DollarSign, label: "Revenue (MTD)", value: "₹4.8L", change: "+18.2%" },
  { Icon: TrendingUp, label: "Conversions", value: "342", change: "+12%" },
];

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

function AdminPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("internship_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load applications");
      console.error(error);
    } else {
      setApps((data ?? []) as Application[]);
    }
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
    if (error) {
      toast.error("Update failed");
      return;
    }
    toast.success(`Marked as ${status}`);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const downloadResume = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Couldn't open resume");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </div>
            <nav className="space-y-1">
              {[
                { Icon: LayoutDashboard, label: "Dashboard", active: true },
                { Icon: Briefcase, label: "Internships" },
                { Icon: Users, label: "Users" },
                { Icon: BookOpen, label: "Courses" },
                { Icon: Mail, label: "Submissions" },
                { Icon: Bell, label: "Notifications" },
                { Icon: Settings, label: "Settings" },
              ].map(({ Icon, label, active }) => (
                <button
                  key={label}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
                    active
                      ? "bg-gradient-brand text-white shadow-elegant"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back. Here's what's happening today.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ Icon, label, value, change }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-500">{change}</span>
                  </div>
                  <div className="mt-4 text-2xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            {/* Internship Applications */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Internship Applications</h2>
                  <p className="text-xs text-muted-foreground">
                    {apps.length} total · {apps.filter((a) => a.status === "pending").length} pending
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : apps.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No applications yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {apps.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-border bg-background p-4 transition-smooth hover:border-primary/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {a.full_name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{a.full_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {a.email}{a.phone ? ` · ${a.phone}` : ""}
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadResume(a.resume_url!)}
                          >
                            <Download className="h-3.5 w-3.5" /> Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(a.id, "reviewed")}
                          disabled={a.status === "reviewed"}
                        >
                          Mark Reviewed
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
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
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
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
