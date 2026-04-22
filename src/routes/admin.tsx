import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — RiseWave" },
      { name: "description", content: "RiseWave admin dashboard." },
    ],
  }),
  component: AdminPage,
});

const stats = [
  { Icon: Users, label: "Total Users", value: "12,438", change: "+8.4%" },
  { Icon: GraduationCap, label: "Active Courses", value: "24", change: "+2" },
  { Icon: DollarSign, label: "Revenue (MTD)", value: "₹4.8L", change: "+18.2%" },
  { Icon: TrendingUp, label: "Conversions", value: "342", change: "+12%" },
];

const submissions = [
  { name: "Aarav Sharma", type: "Contact", time: "2m ago" },
  { name: "Priya Singh", type: "Internship", time: "14m ago" },
  { name: "Vikram Reddy", type: "Course Enrol", time: "1h ago" },
  { name: "Sneha Iyer", type: "Contact", time: "3h ago" },
  { name: "Rahul Das", type: "Internship", time: "5h ago" },
];

function AdminPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </div>
            <nav className="space-y-1">
              {[
                { Icon: LayoutDashboard, label: "Dashboard", active: true },
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

          {/* Main */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening today.</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ Icon, label, value, change }) => (
                <div key={label} className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
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

            {/* Chart placeholder */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Revenue Overview</h2>
                <span className="text-xs text-muted-foreground">Last 7 days</span>
              </div>
              <div className="flex h-48 items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-brand opacity-80 transition-smooth hover:opacity-100"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Submissions */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 font-semibold">Recent Submissions</h2>
              <div className="divide-y divide-border">
                {submissions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {s.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.type}</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
