import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building, Mail, Save, Sparkles, User } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — RW Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <SettingsPage />
      </AdminLayout>
    </RequireAuth>
  ),
});

function SettingsPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("RW Software Solutions");
  const [tagline, setTagline] = useState("Revolutionizing the Web with Smart Solutions");
  const [contactEmail, setContactEmail] = useState("hello@risewave.dev");
  const [upiId, setUpiId] = useState("retheeshworld86-1@okhdfcbank");

  const save = (label: string) => {
    toast.success(`${label} saved locally`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your company, branding, and admin preferences.
        </p>
      </div>

      <Section
        title="Company"
        subtitle="How RW Software Solutions appears across emails and certificates"
        Icon={Building}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </Field>
          <Field label="Public contact email">
            <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </Field>
          <Field label="Tagline" full>
            <Textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} />
          </Field>
        </div>
        <Button onClick={() => save("Company details")} className="mt-4">
          <Save className="h-4 w-4" /> Save
        </Button>
      </Section>

      <Section title="Payment" subtitle="UPI ID used for course enrollments" Icon={Sparkles}>
        <Field label="UPI ID">
          <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} />
        </Field>
        <p className="mt-2 text-xs text-muted-foreground">
          Note: changes here are local. To change the actual UPI ID used in checkout, update
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5">PaymentDialog.tsx</code>.
        </p>
        <Button onClick={() => save("Payment details")} className="mt-4">
          <Save className="h-4 w-4" /> Save
        </Button>
      </Section>

      <Section title="Admin account" subtitle="Your signed-in account" Icon={User}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input value={user?.email ?? ""} disabled />
          </Field>
          <Field label="Role">
            <Input value="Super Admin" disabled />
          </Field>
        </div>
      </Section>

      <Section title="Notifications" subtitle="Email + in-app preferences" Icon={Mail}>
        <div className="space-y-3 text-sm">
          {[
            "New contact form submissions",
            "New internship applications",
            "New course enrollments",
            "Failed payments",
          ].map((label) => (
            <label key={label} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
              <span>{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  Icon,
  children,
}: {
  title: string;
  subtitle: string;
  Icon: typeof Building;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary-glow/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
