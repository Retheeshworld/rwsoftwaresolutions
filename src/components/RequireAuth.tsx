import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function RequireAuth({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error("Please sign in to continue");
      navigate({ to: "/login" });
      return;
    }
    if (requireAdmin && !isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/" });
    }
  }, [user, isAdmin, loading, requireAdmin, navigate]);

  if (loading || !user || (requireAdmin && !isAdmin)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <>{children}</>;
}
