import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import sealAsset from "@/assets/rw-seal.png.asset.json";
import signatureAsset from "@/assets/retheesh-signature.jpeg.asset.json";

export const Route = createFileRoute("/certificate/internship/$id")({
  head: () => ({
    meta: [
      { title: "Internship Certificate — RW Software Solutions" },
      {
        name: "description",
        content:
          "Verify and download an RW Software Solutions internship completion certificate.",
      },
      { property: "og:title", content: "Internship Certificate — RW Software Solutions" },
      {
        property: "og:description",
        content: "Verify an RW Software Solutions internship completion certificate.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InternshipCertificateView,
});

type Row = {
  id: string;
  certificate_code: string;
  issued_at: string;
  full_name: string;
  college_name: string;
  roll_number: string;
  domain: string;
  duration: string;
};

function InternshipCertificateView() {
  const { id } = Route.useParams();
  const [cert, setCert] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const client = supabase as unknown as {
        rpc: (
          fn: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: unknown; error: unknown }>;
      };
      const { data } = await client.rpc("get_internship_certificate", { _id: id });
      const row = (data as Row[] | null)?.[0] ?? null;
      if (active) {
        setCert(row);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

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
          <p className="mt-2 text-sm text-muted-foreground">
            This certificate is not issued yet, or the link is incorrect.
          </p>
          <Link to="/internship-certificate" className="mt-4 inline-block">
            <Button variant="outline" className="rounded-full">
              Apply for a certificate
            </Button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to dashboard
          </Link>
          <Button
            onClick={() => window.print()}
            className="rounded-full bg-gradient-brand text-white"
          >
            <Download className="h-4 w-4" /> Download / Print
          </Button>
        </div>

        <div className="overflow-hidden rounded-3xl border-[10px] border-primary/15 bg-white text-slate-900 shadow-elegant print:border-0 print:shadow-none">
          <div className="relative p-8 sm:p-12">
            <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-primary/25" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
              <img src={sealAsset.url} alt="" className="w-2/3" />
            </div>

            <div className="relative flex flex-col items-center px-2 text-center sm:px-8">
              <img src={sealAsset.url} alt="RW Software Solutions" className="h-20 w-auto" />
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                RW Software Solutions
              </div>

              <h1 className="mt-6 text-2xl font-bold uppercase tracking-[0.2em] text-slate-800 sm:text-3xl">
                Certificate of Internship
              </h1>
              <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-brand" />

              <p className="mt-6 text-sm text-slate-500">This is to certify that</p>
              <div className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                {cert.full_name}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {cert.college_name} · Roll No: {cert.roll_number}
              </p>

              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                has successfully completed an internship with RW Software Solutions in the
                domain of{" "}
                <span className="font-semibold text-slate-900">{cert.domain}</span> for a
                duration of{" "}
                <span className="font-semibold text-slate-900">{cert.duration}</span>,
                demonstrating dedication, professionalism and practical skill throughout the
                program.
              </p>

              <div className="mt-10 grid w-full grid-cols-2 items-end gap-6 sm:grid-cols-3">
                <div className="text-left text-xs text-slate-500">
                  <div className="font-semibold text-slate-700">Certificate ID</div>
                  <div className="font-mono">{cert.certificate_code}</div>
                  <div className="mt-2 font-semibold text-slate-700">Issued on</div>
                  <div>{new Date(cert.issued_at).toLocaleDateString("en-IN")}</div>
                </div>

                <div className="hidden sm:block" />

                <div className="flex flex-col items-center">
                  <img
                    src={signatureAsset.url}
                    alt="Signature of Retheesh R"
                    className="h-16 w-auto object-contain mix-blend-multiply"
                  />
                  <div className="mt-1 h-px w-40 bg-slate-300" />
                  <div className="mt-1 text-sm font-semibold text-slate-800">Retheesh R</div>
                  <div className="text-[11px] text-slate-500">Founder &amp; CEO</div>
                </div>
              </div>

              <p className="mt-8 text-[10px] text-slate-400">
                Verify this certificate at rwsoftwaresolutions.lovable.app/certificate/internship/
                {cert.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
