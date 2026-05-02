import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCheck, Loader2, Mail, Reply, Search, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/contact")({
  head: () => ({ meta: [{ title: "Inbox — RW Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <ContactInboxPage />
      </AdminLayout>
    </RequireAuth>
  ),
});

type Msg = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  replied: boolean;
  created_at: string;
};

function ContactInboxPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load messages");
    } else {
      setMsgs((data ?? []) as Msg[]);
      if (data?.length && !selectedId) setSelectedId(data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-contact-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return msgs.filter((m) => {
      if (filter === "unread" && m.is_read) return false;
      if (filter === "replied" && !m.replied) return false;
      const needle = q.trim().toLowerCase();
      if (!needle) return true;
      return (
        m.name.toLowerCase().includes(needle) ||
        m.email.toLowerCase().includes(needle) ||
        m.subject?.toLowerCase().includes(needle) ||
        m.message.toLowerCase().includes(needle)
      );
    });
  }, [msgs, filter, q]);

  const selected = msgs.find((m) => m.id === selectedId) ?? null;

  const markRead = async (id: string, is_read: boolean) => {
    await supabase.from("contact_messages").update({ is_read }).eq("id", id);
    setMsgs((p) => p.map((m) => (m.id === id ? { ...m, is_read } : m)));
  };

  const markReplied = async (id: string) => {
    await supabase.from("contact_messages").update({ replied: true, is_read: true }).eq("id", id);
    setMsgs((p) => p.map((m) => (m.id === id ? { ...m, replied: true, is_read: true } : m)));
    toast.success("Marked as replied");
  };

  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error("Delete failed");
    setMsgs((p) => p.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success("Deleted");
  };

  const handleSelect = (m: Msg) => {
    setSelectedId(m.id);
    if (!m.is_read) markRead(m.id, true);
  };

  const unread = msgs.filter((m) => !m.is_read).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {msgs.length} total · {unread} unread
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* List */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="space-y-2 border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search messages…"
                className="h-9 pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex gap-1 text-xs">
              {(["all", "unread", "replied"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 capitalize transition-colors",
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[70vh] divide-y divide-border overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No messages.</div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={cn(
                    "block w-full px-4 py-3 text-left transition-colors hover:bg-muted/60",
                    selectedId === m.id && "bg-muted",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!m.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    <div className="flex-1 truncate text-sm font-medium">{m.name}</div>
                    <div className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{m.email}</div>
                  <div className="mt-1 truncate text-xs">
                    {m.subject ? <span className="font-medium">{m.subject} · </span> : null}
                    <span className="text-muted-foreground">{m.message}</span>
                  </div>
                  {m.replied && (
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCheck className="h-3 w-3" /> Replied
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="rounded-2xl border border-border bg-card">
          {!selected ? (
            <div className="flex h-[70vh] flex-col items-center justify-center text-muted-foreground">
              <Mail className="h-10 w-10 opacity-30" />
              <p className="mt-2 text-sm">Select a message to read</p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-6">
                <div>
                  <h2 className="text-lg font-semibold">{selected.subject ?? "(no subject)"}</h2>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">{selected.name}</span>{" "}
                    <span className="text-muted-foreground">&lt;{selected.email}&gt;</span>
                    {selected.phone && (
                      <span className="text-muted-foreground"> · {selected.phone}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject ?? "")}`}>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
                      onClick={() => markReplied(selected.id)}
                    >
                      <Reply className="h-4 w-4" /> Reply
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markRead(selected.id, !selected.is_read)}
                  >
                    {selected.is_read ? "Mark unread" : "Mark read"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => deleteMsg(selected.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
