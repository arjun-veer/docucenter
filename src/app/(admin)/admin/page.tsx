"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/formatters";
import {
  Users,
  BookOpen,
  Briefcase,
  FileText,
  Bot,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  totalExams: number;
  totalJobs: number;
  totalBlogs: number;
  activeAgents: number;
  pendingExams: number;
}

interface RecentActivity {
  id: string;
  type: "user" | "exam" | "job" | "blog";
  description: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const supabase = createClient();
    try {
      const [
        usersRes,
        examsRes,
        jobsRes,
        blogsRes,
        agentsRes,
        pendingExamsRes,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("exams")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("blogs")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("agents")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("exams")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalExams: examsRes.count ?? 0,
        totalJobs: jobsRes.count ?? 0,
        totalBlogs: blogsRes.count ?? 0,
        activeAgents: agentsRes.count ?? 0,
        pendingExams: pendingExamsRes.count ?? 0,
      });

      // Fetch recent activity from multiple tables
      const recentActivities: RecentActivity[] = [];

      const { data: recentUsers } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      recentUsers?.forEach((u) => {
        recentActivities.push({
          id: u.user_id,
          type: "user",
          description: `New user registered: ${u.full_name || u.email || "Unknown"}`,
          createdAt: u.created_at,
        });
      });

      const { data: recentExams } = await supabase
        .from("exams")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      recentExams?.forEach((e) => {
        recentActivities.push({
          id: e.id,
          type: "exam",
          description: `Exam added: ${e.name}`,
          createdAt: e.created_at,
        });
      });

      const { data: recentJobs } = await supabase
        .from("jobs")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      recentJobs?.forEach((j) => {
        recentActivities.push({
          id: j.id,
          type: "job",
          description: `Job posted: ${j.title}`,
          createdAt: j.created_at,
        });
      });

      const { data: recentBlogs } = await supabase
        .from("blogs")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      recentBlogs?.forEach((b) => {
        recentActivities.push({
          id: b.id,
          type: "blog",
          description: `Blog published: ${b.title}`,
          createdAt: b.created_at,
        });
      });

      recentActivities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setActivity(recentActivities.slice(0, 10));
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: Users,
        },
        {
          label: "Total Exams",
          value: stats.totalExams,
          icon: BookOpen,
        },
        {
          label: "Total Jobs",
          value: stats.totalJobs,
          icon: Briefcase,
        },
        {
          label: "Total Blogs",
          value: stats.totalBlogs,
          icon: FileText,
        },
        {
          label: "Active Agents",
          value: stats.activeAgents,
          icon: Bot,
        },
        {
          label: "Pending Exams",
          value: stats.pendingExams,
          icon: Clock,
        },
      ]
    : [];

  const activityBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
    user: "default",
    exam: "secondary",
    job: "outline",
    blog: "secondary",
  };

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your platform"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <Badge variant={activityBadgeVariant[item.type] ?? "default"}>
                    {item.type}
                  </Badge>
                  <span className="text-sm flex-1 truncate">
                    {item.description}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
