import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  CreditCard,
  GraduationCap,
  Mail,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — RW Software Solutions Admin" },
      { name: "description", content: "Internal control center for RW Software Solutions." },
    ],
  }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <DashboardHome />
      </AdminLayout>
    </RequireAuth>
  ),
});

type Stats = {
  students: number;
  courses: number;
  enrollments: number;
  applications: number;
  certificates: number;
  revenue: number;
  unreadInbox: number;
};

type ActivityItem = {
  id: string;
  type: "enrollment" | "application" | "message" | "certificate";
  title: string;
  subtitle: string;
  at: string;
};

function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    students: 0,
    courses: 0,
    enrollments: 0,
    applications: 0,
    certificates: 0,
    revenue: 0,
    unreadInbox: 0,
  });
  const [revenueChart, setRevenueChart] = useState<{ month: string; revenue: number }[]>([]);
  const [leadsChart, setLeadsChart] = useState<{ day: string; leads: number }[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [
        { count: students },
        { count: courses },
        { data: enrollments },
        { data: apps },
        { count: certs },
        { count: unread },
        { data: recentEnrollments },
        { data: recentApps },
        { data: recentMessages },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("amount_paid, enrolled_at"),
        supabase.from("internship_applications").select("created_at"),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false),
        supabase
          .from("enrollments")
          .select("id, enrolled_at, amount_paid, user_id, course:courses(title)")
          .order("enrolled_at", { ascending: false })
          .limit(4),
        supabase
          .from("internship_applications")
          .select("id, full_name, domain, created_at")
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("contact_messages")
          .select("id, name, subject, created_at")
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      const revenue = (enrollments ?? []).reduce((s, e) => s + (e.amount_paid ?? 0), 0);

      // Build 6-month revenue chart
      const months: { month: string; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
          month: d.toLocaleString("en-US", { month: "short" }),
          revenue: 0,
        });
      }
      (enrollments ?? []).forEach((e) => {
        const d = new Date(e.enrolled_at);
        const diff =
          (new Date().getFullYear() - d.getFullYear()) * 12 +
          (new Date().getMonth() - d.getMonth());
        if (diff >= 0 && diff < 6) {
          months[5 - diff].revenue += e.amount_paid ?? 0;
        }
      });
      setRevenueChart(months);

      // Build 7-day leads chart from internship applications
      const days: { day: string; leads: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
          day: d.toLocaleString("en-US", { weekday: "short" }),
          leads: 0,
        });
      }
      (apps ?? []).forEach((a) => {
        const d = new Date(a.created_at);
        const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (diff >= 0 && diff < 7) {
          days[6 - diff].leads += 1;
        }
      });
      setLeadsChart(days);

      // Activity feed
      const items: ActivityItem[] = [];
      (recentEnrollments ?? []).forEach((e: any) => {
        items.push({
          id: `e-${e.id}`,
          type: "enrollment",
          title: "New enrollment",
          subtitle: e.course?.title ?? "Course",
          at: e.enrolled_at,
        });
      });
      (recentApps ?? []).forEach((a) => {
        items.push({
          id: `a-${a.id}`,
          type: "application",
          title: a.full_name,
          subtitle: `Applied for ${a.domain}`,
          at: a.created_at,
        });
      });
      (recentMessages ?? []).forEach((m) => {
        items.push({
          id: `m-${m.id}`,
          type: "message",
          title: m.name,
          subtitle: m.subject ?? "New contact message",
          at: m.created_at,
        });
      });
      items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setActivity(items.slice(0, 8));

      setStats({
        students: students ?? 0,
        courses: courses ?? 0,
        enrollments: enrollments?.length ?? 0,
        applications: apps?.length ?? 0,
        certificates: certs ?? 0,
        revenue,
        unreadInbox: unread ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const kpis = [
    {
      label: "Total Students",
      value: stats.students.toLocaleString(),
      Icon: Users,
      change: "+12.5%",
      tone: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active Courses",
      value: stats.courses.toLocaleString(),
      Icon: BookOpen,
      change: "+3 this month",
      tone: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Enrollments",
      value: stats.enrollments.toLocaleString(),
      Icon: GraduationCap,
      change: "+24 this week",
      tone: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      Icon: CreditCard,
      change: "+18.2%",
      tone: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Internship Leads",
      value: stats.applications.toLocaleString(),
      Icon: Briefcase,
      change: "+5 today",
      tone: "from-cyan-500/20 to-cyan-500/5 text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Certificates Issued",
      value: stats.certificates.toLocaleString(),
      Icon: Award,
      change: "All time",
      tone: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Here's what's happening across RW Software Solutions today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/courses">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4" /> Courses
            </Button>
          </Link>
          <Link to="/admin/contact">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" /> Inbox
              {stats.unreadInbox > 0 && (
                <span className="ml-1 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                  {stats.unreadInbox}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/admin/courses">
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map(({ label, value, Icon, change, tone }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tone} blur-2xl transition-opacity group-hover:opacity-100`}
            />
            <div className="relative">
              <div
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${tone}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight">
                {loading ? "—" : value}
              </div>
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" /> {change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Revenue overview</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <span className="text-xs text-muted-foreground">₹ INR</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="font-semibold">Leads this week</h2>
            <p className="text-xs text-muted-foreground">Internship applications</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsChart} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="leads" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Recent activity</h2>
            <p className="text-xs text-muted-foreground">Latest events across the platform</p>
          </div>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        {activity.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent activity yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {activity.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <ActivityIcon type={a.type} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.subtitle}</div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(a.at)}
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const map = {
    enrollment: { Icon: GraduationCap, tone: "bg-emerald-500/10 text-emerald-600" },
    application: { Icon: Briefcase, tone: "bg-blue-500/10 text-blue-600" },
    message: { Icon: Mail, tone: "bg-violet-500/10 text-violet-600" },
    certificate: { Icon: Award, tone: "bg-amber-500/10 text-amber-600" },
  };
  const { Icon, tone } = map[type];
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
