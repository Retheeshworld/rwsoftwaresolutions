import { type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LineChart,
  LogOut,
  Mail,
  Menu,
  Moon,
  Search,
  Settings,
  Share2,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type NavItem = {
  to: string;
  label: string;
  Icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/courses", label: "Courses", Icon: BookOpen },
  { to: "/admin/internships", label: "Internships", Icon: Briefcase },
  { to: "/admin/payments", label: "Payments", Icon: CreditCard },
  { to: "/admin/certificates", label: "Certificates", Icon: Award },
  { to: "/admin/contact", label: "Inbox", Icon: Mail },
  { to: "/admin/analytics", label: "Analytics", Icon: LineChart },
  { to: "/admin/social", label: "Social Media", Icon: Share2 },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Theme
  useEffect(() => {
    const stored = localStorage.getItem("rw-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefers;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("rw-theme", next ? "dark" : "light");
  };

  // Unread inbox count
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { count } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      if (mounted) setUnread(count ?? 0);
    };
    load();
    const channel = supabase
      .channel("admin-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => load(),
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const initials =
    (user?.user_metadata?.full_name || user?.email || "A")
      .split(/[\s@]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s[0]?.toUpperCase())
      .join("") || "A";

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card lg:block">
        <SidebarContent navItems={NAV} isActive={isActive} unread={unread} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              navItems={NAV}
              isActive={isActive}
              unread={unread}
              onNavigate={() => setMobileOpen(false)}
              hideBrand
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top navbar */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden flex-1 sm:block">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clients, courses, payments…"
                  className="h-9 pl-9"
                />
              </div>
            </div>
            <div className="flex-1 sm:hidden" />

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                className="relative rounded-full"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-fade-in">
                  <div className="border-b border-border px-4 py-3">
                    <div className="font-semibold">Notifications</div>
                    <div className="text-xs text-muted-foreground">
                      {unread} unread message{unread === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {unread === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        You're all caught up.
                      </div>
                    ) : (
                      <Link
                        to="/admin/contact"
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">New contact messages</div>
                          <div className="text-xs text-muted-foreground">
                            {unread} unread in your inbox
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 transition-colors hover:bg-muted"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>
                <span className="hidden text-sm font-medium sm:inline">Admin</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-fade-in">
                  <div className="border-b border-border px-4 py-3">
                    <div className="text-sm font-medium">{user?.email}</div>
                    <div className="text-xs text-muted-foreground">Super Admin</div>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    <Sparkles className="h-4 w-4" /> View site
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/admin" className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-lg">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold tracking-tight">RW Software</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Admin Console
        </div>
      </div>
    </Link>
  );
}

function SidebarContent({
  navItems,
  isActive,
  unread,
  onNavigate,
  hideBrand,
}: {
  navItems: NavItem[];
  isActive: (item: NavItem) => boolean;
  unread: number;
  onNavigate?: () => void;
  hideBrand?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      {!hideBrand && (
        <div className="flex h-16 items-center border-b border-border px-5">
          <Brand />
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.to === "/admin/contact" && unread > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-bold",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
          <div className="text-xs font-semibold">RW Software Solutions</div>
          <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Revolutionizing the Web with Smart Solutions
          </div>
        </div>
      </div>
    </div>
  );
}
