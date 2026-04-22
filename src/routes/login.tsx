import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/SiteLayout";
import logo from "@/assets/rw-logo.jpeg";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — RiseWave" },
      { name: "description", content: "Sign in to your RiseWave account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Auth coming soon — connect Lovable Cloud to enable real login.");
  };
  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md items-center px-4 py-16 sm:px-6">
          <div className="w-full rounded-3xl border border-border bg-card p-8 shadow-elegant">
            <div className="text-center">
              <img src={logo} alt="RW" className="mx-auto h-14 w-14 rounded-xl object-cover" />
              <h1 className="mt-4 text-2xl font-bold">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to RiseWave</p>
            </div>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" required placeholder="you@email.com" className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="pass">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="pass" type="password" required placeholder="••••••••" className="pl-9" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-white shadow-elegant">
                Sign In
              </Button>
            </form>
            <div className="mt-5 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
