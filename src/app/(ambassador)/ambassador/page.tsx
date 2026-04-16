"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRelativeTime } from "@/lib/formatters";
import {
  Building2,
  Briefcase,
  Calendar,
  Users,
  Plus,
  TrendingUp,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  collegeName: string;
  totalDrives: number;
  activeDrives: number;
  totalJobs: number;
  totalApplications: number;
}

interface RecentDrive {
  id: string;
  title: string;
  company_name: string;
  status: string;
  applications_count: number;
  created_at: string;
}

interface RecentJob {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  status: string;
  views_count: number;
  created_at: string;
}

const driveStatusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  upcoming: "secondary",
  ongoing: "default",
  completed: "outline",
  cancelled: "destructive",
};

const jobStatusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  draft: "secondary",
  closed: "destructive",
  expired: "outline",
};

export default function AmbassadorDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDrives, setRecentDrives] = useState<RecentDrive[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.collegeId) return;

    async function fetchDashboardData() {
      const supabase = createClient();
      try {
        // Fetch college name
        const { data: college } = await supabase
          .from("colleges")
          .select("name")
          .eq("id", user!.collegeId!)
          .single();

        // Fetch drive counts
        const [totalDrivesRes, activeDrivesRes, totalJobsRes] =
          await Promise.all([
            supabase
              .from("placement_drives")
              .select("*", { count: "exact", head: true })
              .eq("college_id", user!.collegeId!),
            supabase
              .from("placement_drives")
              .select("*", { count: "exact", head: true })
              .eq("college_id", user!.collegeId!)
              .in("status", ["upcoming", "ongoing"]),
            supabase
              .from("jobs")
              .select("*", { count: "exact", head: true })
              .eq("college_id", user!.collegeId!),
          ]);

        // Total applications across drives
        const { data: appsData } = await supabase
          .from("placement_drives")
          .select("applications_count")
          .eq("college_id", user!.collegeId!);

        const totalApplications =
          appsData?.reduce(
            (sum, d) => sum + ((d.applications_count as number) ?? 0),
            0
          ) ?? 0;

        setStats({
          collegeName: college?.name ?? "Your College",
          totalDrives: totalDrivesRes.count ?? 0,
          activeDrives: activeDrivesRes.count ?? 0,
          totalJobs: totalJobsRes.count ?? 0,
          totalApplications,
        });

        // Recent drives
        const { data: drives } = await supabase
          .from("placement_drives")
          .select(
            "id, title, company_name, status, applications_count, created_at"
          )
          .eq("college_id", user!.collegeId!)
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentDrives((drives as RecentDrive[]) ?? []);

        // Recent jobs
        const { data: jobs } = await supabase
          .from("jobs")
          .select(
            "id, title, slug, company_name, status, views_count, created_at"
          )
          .eq("college_id", user!.collegeId!)
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentJobs((jobs as RecentJob[]) ?? []);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (!user?.collegeId) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">No College Assigned</h1>
        <p className="text-muted-foreground">
          You have not been assigned to a college yet. Please contact an admin.
        </p>
      </div>
    );
  }

  const statCards = stats
    ? [
        {
          label: "Total Drives",
          value: stats.totalDrives,
          icon: Calendar,
        },
        {
          label: "Active Drives",
          value: stats.activeDrives,
          icon: TrendingUp,
        },
        {
          label: "Total Jobs",
          value: stats.totalJobs,
          icon: Briefcase,
        },
        {
          label: "Total Applications",
          value: stats.totalApplications,
          icon: Users,
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title={stats?.collegeName ?? "Ambassador Dashboard"}
        description="Welcome to your college dashboard. Manage placements and job opportunities."
      >
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/ambassador/placements/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Drive
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/ambassador/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Placement Drives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Recent Placement Drives
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ambassador/placements">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentDrives.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No placement drives yet.{" "}
                <Link
                  href="/ambassador/placements/new"
                  className="underline hover:text-foreground"
                >
                  Create your first drive
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {recentDrives.map((drive) => (
                  <Link
                    key={drive.id}
                    href={`/placement/${drive.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {drive.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {drive.company_name} ·{" "}
                        {formatRelativeTime(drive.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {drive.applications_count}
                      </span>
                      <Badge
                        variant={
                          driveStatusVariant[drive.status] ?? "secondary"
                        }
                        className="text-xs"
                      >
                        {drive.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              Recent Jobs
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ambassador/jobs">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No jobs posted yet.{" "}
                <Link
                  href="/ambassador/jobs/new"
                  className="underline hover:text-foreground"
                >
                  Post your first job
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.company_name} ·{" "}
                        {formatRelativeTime(job.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {job.views_count}
                      </span>
                      <Badge
                        variant={jobStatusVariant[job.status] ?? "secondary"}
                        className="text-xs"
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}