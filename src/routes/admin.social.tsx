import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  Heart,
  Instagram,
  Linkedin,
  MessageCircle,
  Save,
  TrendingUp,
  Users,
  UserPlus,
  Eye,
  Image as ImageIcon,
  Briefcase,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/social")({
  head: () => ({
    meta: [
      { title: "Social Media — RW Software Admin" },
      {
        name: "description",
        content:
          "Monitor Instagram and LinkedIn presence, leads, and content performance for RW Software Solutions.",
      },
    ],
  }),
  component: SocialAdminRoute,
});

const DEFAULT_IG = "https://share.google/fAMHTUUBY7BmTiOP2";
const DEFAULT_LI = "https://share.google/Q4WffmJuUdMQq92n2";

type SocialMetrics = {
  instagram: { followers: number; following: number; posts: number };
  linkedin: { connections: number; views: number; engagement: number };
};

const DEFAULT_METRICS: SocialMetrics = {
  instagram: { followers: 1240, following: 312, posts: 86 },
  linkedin: { connections: 2450, views: 1820, engagement: 7 },
};

const igGrowth = [
  { day: "Mon", followers: 1180, reach: 4200 },
  { day: "Tue", followers: 1195, reach: 4600 },
  { day: "Wed", followers: 1210, reach: 5100 },
  { day: "Thu", followers: 1218, reach: 4800 },
  { day: "Fri", followers: 1225, reach: 5600 },
  { day: "Sat", followers: 1233, reach: 6100 },
  { day: "Sun", followers: 1240, reach: 6400 },
];

const liGrowth = [
  { day: "Mon", views: 220, engagement: 18 },
  { day: "Tue", views: 280, engagement: 24 },
  { day: "Wed", views: 310, engagement: 31 },
  { day: "Thu", views: 290, engagement: 27 },
  { day: "Fri", views: 360, engagement: 38 },
  { day: "Sat", views: 240, engagement: 22 },
  { day: "Sun", views: 320, engagement: 34 },
];

const igContent = [
  { post: "Reel: Web Tips", likes: 412, comments: 38, reach: 6200 },
  { post: "Carousel: Stack", likes: 289, comments: 21, reach: 4100 },
  { post: "Story: Behind", likes: 156, comments: 9, reach: 2800 },
  { post: "Reel: Client Win", likes: 530, comments: 47, reach: 7800 },
];

const liContent = [
  { post: "Hiring interns", impressions: 4200, reactions: 128 },
  { post: "Case study", impressions: 3100, reactions: 92 },
  { post: "Industry insight", impressions: 2600, reactions: 71 },
  { post: "Team milestone", impressions: 5400, reactions: 184 },
];

const igLeads = [
  { name: "Aarav Mehta", source: "DM", status: "new" },
  { name: "Neha Sharma", source: "Comment", status: "contacted" },
  { name: "Rahul Iyer", source: "Bio link", status: "qualified" },
];

const liLeads = [
  { name: "Priya Nair", source: "InMail", status: "new" },
  { name: "Vikram Singh", source: "Connection", status: "qualified" },
  { name: "Sana Khan", source: "Post comment", status: "contacted" },
];

function SocialAdminRoute() {
  return (
    <RequireAuth requireAdmin>
      <AdminLayout>
        <SocialPage />
      </AdminLayout>
    </RequireAuth>
  );
}

function SocialPage() {
  const [igUrl, setIgUrl] = useState(DEFAULT_IG);
  const [liUrl, setLiUrl] = useState(DEFAULT_LI);
  const [metrics, setMetrics] = useState<SocialMetrics>(DEFAULT_METRICS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("rw-social");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.igUrl) setIgUrl(parsed.igUrl);
        if (parsed.liUrl) setLiUrl(parsed.liUrl);
        if (parsed.metrics) setMetrics(parsed.metrics);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const save = () => {
    localStorage.setItem(
      "rw-social",
      JSON.stringify({ igUrl, liUrl, metrics }),
    );
    toast.success("Social settings saved");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Media</h1>
          <p className="text-sm text-muted-foreground">
            Monitor reach, engagement, and leads across your channels.
          </p>
        </div>
        <Button onClick={save} className="gap-2">
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </div>

      {/* Instagram */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-orange-400 text-white shadow-lg">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Instagram</h2>
            <p className="text-xs text-muted-foreground">
              Profile, audience, and content performance
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-orange-400 text-lg font-bold text-white">
                  RW
                </div>
                <div>
                  <div className="font-semibold">@rwsoftwaresolutions</div>
                  <div className="text-xs text-muted-foreground">
                    Revolutionizing the Web with Smart Solutions
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="ig-url" className="text-xs">
                  Profile link
                </Label>
                <Input
                  id="ig-url"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button asChild className="w-full gap-2" variant="outline">
                <a href={igUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open Instagram
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            <StatCard
              icon={Users}
              label="Followers"
              value={metrics.instagram.followers}
              onChange={(v) =>
                setMetrics((m) => ({
                  ...m,
                  instagram: { ...m.instagram, followers: v },
                }))
              }
              accent="from-pink-500/20 to-fuchsia-500/10"
            />
            <StatCard
              icon={UserPlus}
              label="Following"
              value={metrics.instagram.following}
              onChange={(v) =>
                setMetrics((m) => ({
                  ...m,
                  instagram: { ...m.instagram, following: v },
                }))
              }
              accent="from-orange-400/20 to-pink-500/10"
            />
            <StatCard
              icon={ImageIcon}
              label="Posts"
              value={metrics.instagram.posts}
              onChange={(v) =>
                setMetrics((m) => ({
                  ...m,
                  instagram: { ...m.instagram, posts: v },
                }))
              }
              accent="from-fuchsia-500/20 to-orange-400/10"
            />
            <Card className="sm:col-span-3">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reach &amp; followers (last 7 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={igGrowth}>
                    <defs>
                      <linearGradient id="igFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stroke="hsl(var(--primary))"
                      fill="url(#igFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead className="text-right">
                      <Heart className="ml-auto h-4 w-4" />
                    </TableHead>
                    <TableHead className="text-right">
                      <MessageCircle className="ml-auto h-4 w-4" />
                    </TableHead>
                    <TableHead className="text-right">Reach</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {igContent.map((p) => (
                    <TableRow key={p.post}>
                      <TableCell className="font-medium">{p.post}</TableCell>
                      <TableCell className="text-right">{p.likes}</TableCell>
                      <TableCell className="text-right">{p.comments}</TableCell>
                      <TableCell className="text-right">
                        {p.reach.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <LeadsCard title="Instagram leads" leads={igLeads} />
        </div>
      </section>

      {/* LinkedIn */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-lg">
            <Linkedin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">LinkedIn</h2>
            <p className="text-xs text-muted-foreground">
              Company presence, profile views, and engagement
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A66C2] text-lg font-bold text-white">
                  RW
                </div>
                <div>
                  <div className="font-semibold">RW Software Solutions</div>
                  <div className="text-xs text-muted-foreground">
                    Software · Web · Internships
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="li-url" className="text-xs">
                  Profile link
                </Label>
                <Input
                  id="li-url"
                  value={liUrl}
                  onChange={(e) => setLiUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button asChild className="w-full gap-2" variant="outline">
                <a href={liUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open LinkedIn
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            <StatCard
              icon={Briefcase}
              label="Connections"
              value={metrics.linkedin.connections}
              onChange={(v) =>
                setMetrics((m) => ({
                  ...m,
                  linkedin: { ...m.linkedin, connections: v },
                }))
              }
              accent="from-blue-500/20 to-sky-500/10"
            />
            <StatCard
              icon={Eye}
              label="Profile views"
              value={metrics.linkedin.views}
              onChange={(v) =>
                setMetrics((m) => ({
                  ...m,
                  linkedin: { ...m.linkedin, views: v },
                }))
              }
              accent="from-sky-500/20 to-cyan-500/10"
            />
            <StatCard
              icon={TrendingUp}
              label="Engagement %"
              value={metrics.linkedin.engagement}
              onChange={(v) =>
                setMetrics((m) => ({
                  ...m,
                  linkedin: { ...m.linkedin, engagement: v },
                }))
              }
              accent="from-cyan-500/20 to-blue-500/10"
            />
            <Card className="sm:col-span-3">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Views &amp; engagement (last 7 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="engagement" fill="hsl(var(--primary) / 0.4)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Reactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liContent.map((p) => (
                    <TableRow key={p.post}>
                      <TableCell className="font-medium">{p.post}</TableCell>
                      <TableCell className="text-right">
                        {p.impressions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{p.reactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <LeadsCard title="LinkedIn leads" leads={liLeads} />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  onChange,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  return (
    <Card className={`bg-gradient-to-br ${accent}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="mt-2 border-0 bg-transparent p-0 text-2xl font-bold shadow-none focus-visible:ring-0"
        />
      </CardContent>
    </Card>
  );
}

function LeadsCard({
  title,
  leads,
}: {
  title: string;
  leads: { name: string; source: string; status: string }[];
}) {
  const variant = (s: string) =>
    s === "qualified" ? "default" : s === "contacted" ? "secondary" : "outline";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => (
              <TableRow key={l.name}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell className="text-muted-foreground">{l.source}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={variant(l.status)} className="capitalize">
                    {l.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
