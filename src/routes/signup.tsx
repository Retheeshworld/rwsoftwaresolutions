import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/SiteLayout";
import logo from "@/assets/rw-logo.jpeg";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — RiseWave" },
      { name: "description", content: "Create your RiseWave account." },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: parsed.data.fullName },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created! Check your inbox to verify your email.");
    navigate({ to: "/login" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md items-center px-4 py-16 sm:px-6">
          <div className="w-full rounded-3xl border border-border bg-card p-8 shadow-elegant">
            <div className="text-center">
              <img src={logo} alt="RW" className="mx-auto h-14 w-14 rounded-xl object-cover" />
              <h1 className="mt-4 text-2xl font-bold">Create account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Start building with RiseWave</p>
            </div>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="pass">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="pl-9" />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-gradient-brand text-white shadow-elegant">
                {submitting ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              OR
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button type="button" variant="outline" onClick={onGoogle} className="w-full">
              Continue with Google
            </Button>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
