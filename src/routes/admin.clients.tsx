import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  Pencil,
  Plus,
  Trash2,
  FolderPlus,
  Search,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clients")({
  head: () => ({
    meta: [
      { title: "Clients — RW Software Admin" },
      {
        name: "description",
        content:
          "Manage clients, assign projects, and track payment status for RW Software Solutions.",
      },
    ],
  }),
  component: ClientsAdminRoute,
});

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  payment_status: string;
  total_billed: number;
  total_paid: number;
  created_at: string;
};

type ClientProject = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  deadline: string | null;
  amount: number;
};

const PAYMENT_STATUSES = ["pending", "partial", "paid", "overdue"] as const;
const PROJECT_STATUSES = ["active", "in_progress", "completed", "on_hold"] as const;

function ClientsAdminRoute() {
  return (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <ClientsPage />
      </AdminLayout>
    </RequireAuth>
  );
}

function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [projectFor, setProjectFor] = useState<Client | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: c, error: ec }, { data: p, error: ep }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("client_projects").select("*").order("created_at", { ascending: false }),
    ]);
    if (ec || ep) toast.error("Failed to load clients");
    setClients((c as Client[]) ?? []);
    setProjects((p as ClientProject[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.email, c.company, c.phone].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [clients, search]);

  const projectsByClient = useMemo(() => {
    const map: Record<string, ClientProject[]> = {};
    for (const p of projects) (map[p.client_id] ??= []).push(p);
    return map;
  }, [projects]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("clients").delete().eq("id", deleteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Client deleted");
    setDeleteId(null);
    load();
  };

  const totals = useMemo(() => {
    const billed = clients.reduce((s, c) => s + (c.total_billed ?? 0), 0);
    const paid = clients.reduce((s, c) => s + (c.total_paid ?? 0), 0);
    return { billed, paid, due: billed - paid };
  }, [clients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage clients, assign projects, and track payment status.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New client
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total clients" value={String(clients.length)} />
        <KpiCard label="Total billed" value={`₹${totals.billed.toLocaleString()}`} />
        <KpiCard
          label="Outstanding"
          value={`₹${totals.due.toLocaleString()}`}
          tone={totals.due > 0 ? "warn" : "ok"}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No clients yet. Add your first client to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Projects</TableHead>
                    <TableHead className="text-right">Billed</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const cProjects = projectsByClient[c.id] ?? [];
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="font-medium">{c.name}</div>
                          {c.company && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" /> {c.company}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.email && (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3 text-muted-foreground" /> {c.email}
                            </div>
                          )}
                          {c.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground" /> {c.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{cProjects.length}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{c.total_billed.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{c.total_paid.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <PaymentBadge status={c.payment_status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setProjectFor(c)}
                              title="Assign project"
                            >
                              <FolderPlus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditing(c)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(c.id)}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClientDialog
        open={creating || !!editing}
        client={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={load}
      />

      <ProjectDialog
        client={projectFor}
        projects={projectFor ? projectsByClient[projectFor.id] ?? [] : []}
        onClose={() => setProjectFor(null)}
        onChanged={load}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the client and all assigned projects. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div
          className={`mt-1 text-2xl font-bold ${
            tone === "warn" ? "text-destructive" : ""
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    paid: { label: "Paid", variant: "default" },
    partial: { label: "Partial", variant: "secondary" },
    pending: { label: "Pending", variant: "outline" },
    overdue: { label: "Overdue", variant: "destructive" },
  };
  const conf = map[status] ?? map.pending;
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}

/* ---------- Client create/edit dialog ---------- */

function ClientDialog({
  open,
  client,
  onClose,
  onSaved,
}: {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    payment_status: "pending",
    total_billed: 0,
    total_paid: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        email: client.email ?? "",
        phone: client.phone ?? "",
        company: client.company ?? "",
        notes: client.notes ?? "",
        payment_status: client.payment_status,
        total_billed: client.total_billed,
        total_paid: client.total_paid,
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        notes: "",
        payment_status: "pending",
        total_billed: 0,
        total_paid: 0,
      });
    }
  }, [client, open]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      notes: form.notes.trim() || null,
      payment_status: form.payment_status,
      total_billed: Number(form.total_billed) || 0,
      total_paid: Number(form.total_paid) || 0,
    };
    const { error } = client
      ? await supabase.from("clients").update(payload).eq("id", client.id)
      : await supabase.from("clients").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(client ? "Client updated" : "Client created");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "New client"}</DialogTitle>
          <DialogDescription>
            {client ? "Update client details and payment status." : "Add a new client to your roster."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="billed">Billed (₹)</Label>
              <Input
                id="billed"
                type="number"
                value={form.total_billed}
                onChange={(e) =>
                  setForm({ ...form, total_billed: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="paid">Paid (₹)</Label>
              <Input
                id="paid"
                type="number"
                value={form.total_paid}
                onChange={(e) =>
                  setForm({ ...form, total_paid: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={form.payment_status}
                onValueChange={(v) => setForm({ ...form, payment_status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {client ? "Save changes" : "Create client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Project assignment dialog ---------- */

function ProjectDialog({
  client,
  projects,
  onClose,
  onChanged,
}: {
  client: Client | null;
  projects: ClientProject[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "active",
    deadline: "",
    amount: 0,
  });
  const [saving, setSaving] = useState(false);

  const reset = () =>
    setForm({ title: "", description: "", status: "active", deadline: "", amount: 0 });

  const add = async () => {
    if (!client) return;
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("client_projects").insert({
      client_id: client.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      deadline: form.deadline || null,
      amount: Number(form.amount) || 0,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project assigned");
    reset();
    onChanged();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("client_projects")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    onChanged();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("client_projects").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project removed");
    onChanged();
  };

  return (
    <Dialog open={!!client} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Projects for {client?.name}</DialogTitle>
          <DialogDescription>
            Assign and manage projects for this client.
          </DialogDescription>
        </DialogHeader>

        {/* Existing projects */}
        <div className="space-y-2">
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No projects assigned yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.title}</div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground">
                            {p.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {p.deadline ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.status}
                          onValueChange={(v) => updateStatus(p.id, v)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROJECT_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">
                                {s.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => remove(p.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* New project form */}
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="text-sm font-semibold">Assign new project</div>
          <div className="grid gap-3">
            <Input
              placeholder="Project title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Deadline</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Amount (₹)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={add} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Assign project
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
