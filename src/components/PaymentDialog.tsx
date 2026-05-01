import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Loader2, ShieldCheck, Smartphone, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const UPI_ID = "retheeshworld86-1@okhdfcbank";
export const UPI_PAYEE_NAME = "RW Software Solutions";

type Step = "details" | "verify" | "success" | "failed";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string | null;
  courseTitle: string;
  amount: number;
  userId: string | null;
  onSuccess?: () => void;
};

export function PaymentDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  amount,
  userId,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<Step>("details");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep("details");
      setUtr("");
      setErrorMsg(null);
    }
  }, [open]);

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_PAYEE_NAME,
      am: String(amount),
      cu: "INR",
      tn: `RW-${courseTitle}`.slice(0, 50),
    });
    return `upi://pay?${params.toString()}`;
  }, [amount, courseTitle]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=2&data=${encodeURIComponent(
    upiUrl,
  )}`;

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const submitPayment = async () => {
    if (!userId || !courseId) {
      setErrorMsg("Please sign in and try again.");
      setStep("failed");
      return;
    }
    const ref = utr.trim();
    if (ref.length < 6) {
      setErrorMsg("Enter a valid 12-digit UPI transaction / UTR ID.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await (supabase.from("enrollments") as any).upsert(
        {
          user_id: userId,
          course_id: courseId,
          status: "active",
          payment_status: "submitted",
          payment_method: "upi",
          payment_reference: ref,
          amount_paid: amount,
        },
        { onConflict: "user_id,course_id" },
      );
      if (error && !error.message.toLowerCase().includes("duplicate")) {
        // Fallback: enrollments may not have a unique (user,course) constraint
        const { error: insertErr } = await (supabase.from("enrollments") as any).insert({
          user_id: userId,
          course_id: courseId,
          status: "active",
          payment_status: "submitted",
          payment_method: "upi",
          payment_reference: ref,
          amount_paid: amount,
        });
        if (insertErr && !insertErr.message.toLowerCase().includes("duplicate")) {
          throw insertErr;
        }
      }
      setStep("success");
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message ?? "Could not record payment. Please try again.");
      setStep("failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-brand px-6 py-5 text-white">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-white">Complete your enrollment</DialogTitle>
            <DialogDescription className="text-white/85">
              {courseTitle} · One-time payment
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/70">Amount</div>
              <div className="text-3xl font-bold">₹{amount.toLocaleString("en-IN")}</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/85">
              <ShieldCheck className="h-4 w-4" /> Secure UPI
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          {step === "details" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Pay to (UPI ID)</div>
                    <div className="font-mono text-sm font-semibold">{UPI_ID}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={copyUpi} className="rounded-full">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{UPI_PAYEE_NAME}</div>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-4 rounded-xl border border-border/60 bg-card p-4">
                <img
                  src={qrSrc}
                  alt="UPI QR code"
                  className="h-28 w-28 rounded-lg border border-border bg-white p-1"
                />
                <div className="flex flex-col justify-between text-sm">
                  <div>
                    <div className="font-semibold">Scan with any UPI app</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      GPay · PhonePe · Paytm · BHIM
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-gradient-brand text-white sm:hidden"
                  >
                    <a href={upiUrl}>
                      <Smartphone className="h-4 w-4" /> Open UPI app
                    </a>
                  </Button>
                </div>
              </div>

              <Button
                asChild
                className="hidden w-full rounded-full bg-gradient-brand text-white sm:inline-flex"
              >
                <a href={upiUrl}>
                  <Smartphone className="h-4 w-4" /> Open UPI app on phone
                </a>
              </Button>

              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => setStep("verify")}
              >
                I've paid — enter transaction ID
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                Your access unlocks immediately after we record your payment reference.
                Final verification happens within a few minutes.
              </p>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                Open your UPI app → Transaction history → copy the 12-digit
                <span className="font-semibold"> UTR / UPI Ref. ID </span>
                of your ₹{amount} payment to <span className="font-mono">{UPI_ID}</span>.
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
                  onClick={() => setStep("details")}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-full bg-gradient-brand text-white"
                  onClick={submitPayment}
                  disabled={submitting || utr.trim().length < 6}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm payment"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <div className="text-lg font-semibold">Payment received</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  You're enrolled in <span className="font-medium">{courseTitle}</span>.
                  Your course is unlocked.
                </div>
              </div>
              <Button
                className="mt-2 w-full rounded-full bg-gradient-brand text-white"
                onClick={() => onOpenChange(false)}
              >
                Start learning
              </Button>
            </div>
          )}

          {step === "failed" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <XCircle className="h-8 w-8" />
              </div>
              <div>
                <div className="text-lg font-semibold">Payment couldn't be recorded</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {errorMsg ?? "Something went wrong. Your payment is safe — please try again or contact support."}
                </div>
              </div>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 rounded-full bg-gradient-brand text-white"
                  onClick={() => setStep("verify")}
                >
                  Try again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
