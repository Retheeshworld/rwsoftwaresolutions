import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Download, Loader2, Search, TrendingUp } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — RW Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <PaymentsPage />
      </AdminLayout>
    </RequireAuth>
  ),
});

type Row = {
  id: string;
  user_id: string;
  course_id: string;
  amount_paid: number;
  payment_status: string;
  payment_method: string;
  payment_reference: string | null;
  enrolled_at: string;
  course?: { title: string } | null;
  profile?: { full_name: string | null; email: string | null } | null;
};

const statusTone: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  submitted: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  failed: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

function PaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enrollments")
      .select(
        "id, user_id, course_id, amount_paid, payment_status, payment_method, payment_reference, enrolled_at, course:courses(title)",
      )
      .order("enrolled_at", { ascending: false });
    if (error) {
      toast.error("Failed to load payments");
      setLoading(false);
      return;
    }
    const list = (data ?? []) as unknown as Row[];
    const ids = [...new Set(list.map((r) => r.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const m = new Map((profs ?? []).map((p) => [p.id, p]));
      list.forEach((r) => {
        const p = m.get(r.user_id);
        r.profile = p ? { full_name: p.full_name, email: p.email } : null;
      });
    }
    setRows(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("enrollments").update({ payment_status: status }).eq("id", id);
    if (error) return toast.error("Update failed");
    setRows((p) => p.map((r) => (r.id === id ? { ...r, payment_status: status } : r)));
    toast.success(`Marked as ${status}`);
  };

  const totals = useMemo(() => {
    const paid = rows.filter((r) => r.payment_status === "paid");
    const pending = rows.filter((r) => r.payment_status === "pending" || r.payment_status === "submitted");
    return {
      revenue: paid.reduce((s, r) => s + (r.amount_paid ?? 0), 0),
      pendingAmt: pending.reduce((s, r) => s + (r.amount_paid ?? 0), 0),
      paidCount: paid.length,
      pendingCount: pending.length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesStatus = filter === "all" || r.payment_status === filter;
      const needle = q.trim().toLowerCase();
      const matchesQ =
        !needle ||
        r.profile?.full_name?.toLowerCase().includes(needle) ||
        r.profile?.email?.toLowerCase().includes(needle) ||
        r.course?.title?.toLowerCase().includes(needle) ||
        r.payment_reference?.toLowerCase().includes(needle);
      return matchesStatus && matchesQ;
    });
  }, [rows, filter, q]);

  const exportCsv = () => {
    const header = ["Date", "Student", "Email", "Course", "Amount", "Status", "Method", "Reference"];
    const lines = filtered.map((r) =>
      [
        new Date(r.enrolled_at).toISOString(),
        r.profile?.full_name ?? "",
        r.profile?.email ?? "",
        r.course?.title ?? "",
        r.amount_paid,
        r.payment_status,
        r.payment_method,
        r.payment_reference ?? "",
      ]
        .map((x) => `"${String(x).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All transactions, invoices, and revenue records.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Revenue" value={`₹${totals.revenue.toLocaleString()}`} Icon={CreditCard} tone="emerald" />
        <Stat label="Pending" value={`₹${totals.pendingAmt.toLocaleString()}`} Icon={TrendingUp} tone="amber" />
        <Stat label="Successful" value={totals.paidCount.toString()} Icon={CreditCard} tone="blue" />
        <Stat label="Awaiting Verify" value={totals.pendingCount.toString()} Icon={CreditCard} tone="violet" />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student, course, ref…"
              className="h-9 pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No payments match your filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.enrolled_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.profile?.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.profile?.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{r.course?.title ?? "—"}</TableCell>
                  <TableCell className="font-medium">₹{r.amount_paid.toLocaleString()}</TableCell>
                  <TableCell className="uppercase text-xs">{r.payment_method}</TableCell>
                  <TableCell className="font-mono text-xs">{r.payment_reference ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        statusTone[r.payment_status] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.payment_status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.payment_status !== "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(r.id, "paid")}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  Icon: typeof CreditCard;
  tone: "emerald" | "blue" | "amber" | "violet";
}) {
  const tones = {
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    violet: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
