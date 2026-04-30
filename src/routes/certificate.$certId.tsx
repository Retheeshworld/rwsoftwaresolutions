import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/certificate/$certId")({
  head: () => ({
    meta: [
      { title: "Certificate — RW Software Solutions" },
      { name: "description", content: "Verify and download a RW Software Solutions course completion certificate." },
    ],
  }),
  component: CertificatePage,
});

type CertView = {
  id: string;
  certificate_code: string;
  issued_at: string;
  course: { title: string } | null;
  profile_name: string | null;
};

function CertificatePage() {
  const { certId } = Route.useParams();
  const [cert, setCert] = useState<CertView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("certificates")
        .select("id, certificate_code, issued_at, user_id, course:courses(title)")
        .eq("id", certId)
        .maybeSingle();
      if (!data) {
        if (active) setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user_id)
        .maybeSingle();
      if (active) {
        setCert({
          id: data.id,
          certificate_code: data.certificate_code,
          issued_at: data.issued_at,
          course: data.course as { title: string } | null,
          profile_name: profile?.full_name ?? null,
        });
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [certId]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </SiteLayout>
    );
  }

  if (!cert) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Certificate not found</h1>
          <Link to="/courses" className="mt-4 inline-block">
            <Button variant="outline">Browse courses</Button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to dashboard
          </Link>
          <Button onClick={() => window.print()} className="rounded-full bg-gradient-brand text-white">
            <Download className="h-4 w-4" /> Download / Print
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-brand opacity-30 blur-3xl" />
          <div className="relative aspect-[4/3] rounded-3xl border-8 border-card bg-gradient-card p-8 shadow-elegant sm:p-12">
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 p-6 text-center">
              <Award className="h-12 w-12 text-primary" />
              <div className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Certificate of Completion
              </div>
              <div className="mt-1 text-sm text-muted-foreground">This is to certify that</div>
              <div className="mt-3 text-3xl font-bold sm:text-4xl">
                {cert.profile_name ?? "Student"}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">has successfully completed</div>
              <div className="mt-3 text-xl font-semibold text-gradient sm:text-2xl">
                {cert.course?.title ?? "RW Software Solutions Course"}
              </div>
              <div className="mt-6 flex w-full items-center justify-between text-xs text-muted-foreground">
                <span>ID: {cert.certificate_code}</span>
                <span>{new Date(cert.issued_at).toLocaleDateString()}</span>
                <span>RW Software Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
