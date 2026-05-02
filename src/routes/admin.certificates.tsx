import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, ExternalLink, Loader2, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
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
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/certificates")({
  head: () => ({ meta: [{ title: "Certificates — RW Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <CertificatesPage />
      </AdminLayout>
    </RequireAuth>
  ),
});

type Cert = {
  id: string;
  certificate_code: string;
  issued_at: string;
  user_id: string;
  course_id: string;
  course?: { title: string } | null;
  profile?: { full_name: string | null; email: string | null } | null;
};

function CertificatesPage() {
  const [rows, setRows] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("certificates")
        .select("id, certificate_code, issued_at, user_id, course_id, course:courses(title)")
        .order("issued_at", { ascending: false });
      const list = (data ?? []) as unknown as Cert[];
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
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.certificate_code.toLowerCase().includes(needle) ||
        r.profile?.full_name?.toLowerCase().includes(needle) ||
        r.profile?.email?.toLowerCase().includes(needle) ||
        r.course?.title?.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} certificates issued · automatically generated on course completion
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or course…"
              className="h-9 pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Award className="h-10 w-10 opacity-30" />
            <p className="mt-2 text-sm">No certificates yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead className="text-right">Verify</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-semibold">
                    {r.certificate_code}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.profile?.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.profile?.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{r.course?.title ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.issued_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={`/certificate/${r.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </Button>
                    </a>
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
