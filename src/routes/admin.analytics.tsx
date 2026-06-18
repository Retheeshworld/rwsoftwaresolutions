import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — RW Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <AnalyticsPage />
      </AdminLayout>
    </RequireAuth>
  ),
});

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function AnalyticsPage() {
  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string; revenue: number; enrollments: number }[]>([]);
  const [growth, setGrowth] = useState<{ month: string; students: number }[]>([]);
  const [coursePop, setCoursePop] = useState<{ name: string; value: number }[]>([]);
  const [appStatus, setAppStatus] = useState<{ name: string; value: number }[]>([]);
  const [leadEvents, setLeadEvents] = useState<{ month: string; whatsapp: number; chat: number; contact: number }[]>([]);
  const [leadTotals, setLeadTotals] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: enrollments }, { data: profiles }, { data: apps }, { data: leads }] = await Promise.all([
        supabase
          .from("enrollments")
          .select("amount_paid, enrolled_at, course:courses(title)"),
        supabase.from("profiles").select("created_at"),
        supabase.from("internship_applications").select("status"),
        supabase.from("lead_events").select("event_type, created_at"),
      ]);

      // 12-month revenue + enrollments
      const months: { month: string; revenue: number; enrollments: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
          month: d.toLocaleString("en-US", { month: "short" }),
          revenue: 0,
          enrollments: 0,
        });
      }
      (enrollments ?? []).forEach((e: any) => {
        const d = new Date(e.enrolled_at);
        const diff = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
        if (diff >= 0 && diff < 12) {
          months[11 - diff].revenue += e.amount_paid ?? 0;
          months[11 - diff].enrollments += 1;
        }
      });
      setRevenueByMonth(months);

      // Student cumulative growth
      const sorted = (profiles ?? []).map((p) => new Date(p.created_at).getTime()).sort((a, b) => a - b);
      const gMonths: { month: string; students: number }[] = [];
      let cum = 0;
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const cutoff = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime();
        cum = sorted.filter((t) => t <= cutoff).length;
        gMonths.push({
          month: d.toLocaleString("en-US", { month: "short" }),
          students: cum,
        });
      }
      setGrowth(gMonths);

      // Course popularity
      const counts = new Map<string, number>();
      (enrollments ?? []).forEach((e: any) => {
        const t = e.course?.title ?? "Unknown";
        counts.set(t, (counts.get(t) ?? 0) + 1);
      });
      setCoursePop(
        [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, value })),
      );

      // App status pie
      const sCounts = new Map<string, number>();
      (apps ?? []).forEach((a) => {
        sCounts.set(a.status, (sCounts.get(a.status) ?? 0) + 1);
      });
      setAppStatus([...sCounts.entries()].map(([name, value]) => ({ name, value })));

      // Lead events by month
      const lMonths: { month: string; whatsapp: number; chat: number; contact: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        lMonths.push({ month: d.toLocaleString("en-US", { month: "short" }), whatsapp: 0, chat: 0, contact: 0 });
      }
      const lTotals = new Map<string, number>();
      (leads ?? []).forEach((l: any) => {
        const d = new Date(l.created_at);
        const diff = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
        if (diff >= 0 && diff < 12) {
          const bucket = lMonths[11 - diff];
          if (l.event_type === "whatsapp_click") bucket.whatsapp += 1;
          else if (l.event_type === "chat_open") bucket.chat += 1;
          else if (l.event_type === "contact_submit") bucket.contact += 1;
        }
        lTotals.set(l.event_type, (lTotals.get(l.event_type) ?? 0) + 1);
      });
      setLeadEvents(lMonths);
      setLeadTotals(
        [...lTotals.entries()]
          .map(([name, value]) => ({
            name: name === "whatsapp_click" ? "WhatsApp" : name === "chat_open" ? "Chat" : name === "contact_submit" ? "Contact" : name,
            value,
          }))
          .sort((a, b) => b.value - a.value),
      );
    };
    load();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trends and insights across revenue, growth, and engagement.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue trend" subtitle="Last 12 months">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Student growth" subtitle="Cumulative signups">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="students" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top courses" subtitle="By enrollments">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={coursePop} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={120} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--color-chart-2)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Application pipeline" subtitle="Internship status">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={appStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {appStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight">Lead Conversions</h2>
        <p className="mt-1 text-sm text-muted-foreground">WhatsApp clicks, chat opens, and contact submissions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Lead events trend" subtitle="Last 12 months">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={leadEvents}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="whatsapp" name="WhatsApp" stackId="a" fill="var(--color-chart-1)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="chat" name="Chat" stackId="a" fill="var(--color-chart-3)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="contact" name="Contact" stackId="a" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lead sources" subtitle="All time">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={leadTotals}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {leadTotals.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
