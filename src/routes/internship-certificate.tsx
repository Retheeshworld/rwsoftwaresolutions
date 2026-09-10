import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Copy,
  Loader2,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UPI_ID, UPI_PAYEE_NAME } from "@/components/PaymentDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/internship-certificate")({
  head: () => ({
    meta: [
      { title: "Internship Certificate — RW Software Solutions" },
      {
        name: "description",
        content:
          "Apply for your RW Software Solutions internship completion certificate. Enter your details, pay ₹500 and download your verified certificate.",
      },
      { property: "og:title", content: "Internship Certificate — RW Software Solutions" },
      {
        property: "og:description",
        content:
          "Get your verified RW Software Solutions internship certificate for ₹500 — name, college, roll number, domain and duration included.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InternshipCertificatePage,
});

const AMOUNT = 500;

const DOMAINS = [
  "Python Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "AI / Machine Learning",
  "Data Science",
  "Digital Marketing",
  "UI/UX Design",
  "Web Development",
];

const DURATIONS = ["15 Days", "1 Month", "2 Months", "3 Months", "6 Months"];

type Step = "form" | "pay" | "verify" | "success" | "failed";

function InternshipCertificatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [roll, setRoll] = useState("");
  const [domain, setDomain] = useState("");
  const [duration, setDuration] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user, email]);

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_PAYEE_NAME,
      am: String(AMOUNT),
      cu: "INR",
      tn: "RW-Internship-Certificate",
    });
    return `upi://pay?${params.toString()}`;
  }, []);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=2&data=${encodeURIComponent(
    upiUrl,
  )}`;

  const formValid =
    fullName.trim().length >= 2 &&
    college.trim().length >= 2 &&
    roll.trim().length >= 1 &&
    domain !== "" &&
    duration !== "";

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const submitRequest = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const ref = utr.trim();
    if (ref.length < 6) {
      setErrorMsg("Enter a valid UPI transaction / UTR ID.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await (supabase.from("internship_certificates") as any).insert({
        user_id: user.id,
        full_name: fullName.trim(),
        college_name: college.trim(),
        roll_number: roll.trim(),
        domain,
        duration,
        email: email.trim() || null,
        phone: phone.trim() || null,
        amount: AMOUNT,
        payment_method: "upi",
        payment_reference: ref,
        payment_status: "submitted",
      });
      if (error) throw error;
      setStep("success");
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message ?? "Could not submit your request. Please try again.");
      setStep("failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Internship Program"
        title="Get your Internship Certificate"
        description="Fill in your internship details, pay ₹500, and receive a verified RW Software Solutions internship certificate with a public verification link."
      />

      <section className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant sm:p-8">
          {/* Steps indicator */}
          <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            {["Details", "Payment", "Confirm"].map((label, i) => {
              const idx =
                step === "form" ? 0 : step === "pay" ? 1 : 2;
              return (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                      i <= idx
                        ? "bg-gradient-brand text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={i <= idx ? "text-foreground" : ""}>{label}</span>
                  {i < 2 && <span className="mx-1 h-px w-6 bg-border" />}
                </div>
              );
            })}
          </div>

          {step === "form" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Full name (as it should appear)</Label>
                  <Input
                    id="name"
                    value={fullName}
                    maxLength={120}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Retheesh R"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="college">College / Institution name</Label>
                  <Input
                    id="college"
                    value={college}
                    maxLength={160}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Anna University, Chennai"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roll">Roll number / Register number</Label>
                  <Input
                    id="roll"
                    value={roll}
                    maxLength={60}
                    onChange={(e) => setRoll(e.target.value)}
                    placeholder="21CS1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Internship domain</Label>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    maxLength={20}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 90000 00000"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    maxLength={255}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Certificate fee
                  </div>
                  <div className="text-2xl font-bold">₹{AMOUNT}</div>
                </div>
                {user ? (
                  <Button
                    className="rounded-full bg-gradient-brand text-white"
                    disabled={!formValid}
                    onClick={() => setStep("pay")}
                  >
                    Continue to payment
                  </Button>
                ) : (
                  <Link to="/login">
                    <Button className="rounded-full bg-gradient-brand text-white">
                      Sign in to continue
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {step === "pay" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Pay to (UPI ID)</div>
                    <div className="font-mono text-sm font-semibold">{UPI_ID}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{UPI_PAYEE_NAME}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={copyUpi} className="rounded-full">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-4 rounded-xl border border-border/60 bg-card p-4">
                <img
                  src={qrSrc}
                  alt="UPI QR code to pay ₹500"
                  className="h-28 w-28 rounded-lg border border-border bg-white p-1"
                />
                <div className="flex flex-col justify-between text-sm">
                  <div>
                    <div className="font-semibold">Scan and pay ₹{AMOUNT}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      GPay · PhonePe · Paytm · BHIM
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secure UPI
                  </div>
                </div>
              </div>

              <Button asChild className="w-full rounded-full bg-gradient-brand text-white">
                <a href={upiUrl}>
                  <Smartphone className="h-4 w-4" /> Open UPI app
                </a>
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setStep("form")}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setStep("verify")}
                >
                  I've paid
                </Button>
              </div>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                Open your UPI app → Transaction history → copy the 12-digit
                <span className="font-semibold"> UTR / UPI Ref. ID </span>
                of your ₹{AMOUNT} payment to <span className="font-mono">{UPI_ID}</span>.
              </div>
              <div className="space-y-2">
                <Label htmlFor="utr">UPI Transaction / UTR ID</Label>
                <Input
                  id="utr"
                  inputMode="numeric"
                  placeholder="e.g. 412345678901"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\s+/g, ""))}
                  className="font-mono"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setStep("pay")}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-full bg-gradient-brand text-white"
                  onClick={submitRequest}
                  disabled={submitting || utr.trim().length < 6}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit request"}
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="text-lg font-semibold">Request submitted</div>
              <p className="max-w-md text-sm text-muted-foreground">
                We've received your payment reference. Once verified, your internship
                certificate is generated and appears on your dashboard — usually within a
                few hours.
              </p>
              <div className="mt-2 flex gap-2">
                <Link to="/dashboard">
                  <Button className="rounded-full bg-gradient-brand text-white">
                    <Award className="h-4 w-4" /> Go to dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {step === "failed" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="text-lg font-semibold">Couldn't submit your request</div>
              <p className="max-w-md text-sm text-muted-foreground">
                {errorMsg ?? "Something went wrong. Your payment is safe — please try again."}
              </p>
              <Button
                className="mt-2 rounded-full bg-gradient-brand text-white"
                onClick={() => setStep("verify")}
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
