"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_TYPES } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/formatters";
import {
  Briefcase,
  Plus,
  Eye,
  Users,
  ExternalLink,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

interface JobRow {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  location: string | null;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "closed", label: "Closed" },
];

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  draft: "secondary",
  closed: "destructive",
  expired: "outline",
};

export default function AmbassadorJobsPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchJobs = useCallback(async () => {
    if (!user?.collegeId) return;

    setLoading(true);
    const supabase = createClient();
    try {
      let query = supabase
        .from("jobs")
        .select(
          "id, title, slug, company_name, location, job_type, salary_min, salary_max, salary_currency, status, views_count, applications_count, created_at"
        )
        .eq("college_id", user.collegeId)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setJobs(data ?? []);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [user?.collegeId, statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function handleToggleStatus(job: JobRow) {
    const newStatus = job.status === "active" ? "closed" : "active";
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", job.id);
      if (error) throw error;

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      );
      toast.success(newStatus === "active" ? "Job reopened" : "Job closed");
    } catch {
      toast.error("Failed to update job status");
    }
  }

  const jobTypeLabels: Record<string, string> = {};
  JOB_TYPES.forEach((t) => {
    jobTypeLabels[t.value] = t.label;
  });

  return (
    <div>
      <PageHeader
        title="College Jobs"
        description="Manage job postings specific to your college"
      >
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/ambassador/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="No jobs found"
              description={
                statusFilter !== "all"
                  ? "Try changing the filter to see more jobs."
                  : "Post your first college-specific job."
              }
              action={
                <Button asChild>
                  <Link href="/ambassador/jobs/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Job
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {job.title}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {jobTypeLabels[job.job_type] ?? job.job_type}
                      </Badge>
                      <Badge
                        variant={statusVariant[job.status] ?? "outline"}
                        className="text-xs shrink-0"
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{job.company_name}</span>
                      {job.location && <span>{job.location}</span>}
                      <span>
                        {formatSalary(
                          job.salary_min,
                          job.salary_max,
                          job.salary_currency
                        )}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {job.views_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.applications_count} applications
                      </span>
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(job)}
                    >
                      {job.status === "active" ? (
                        <>
                          <Lock className="h-4 w-4 mr-1" />
                          Close
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-1" />
                          Reopen
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a
                        href={`/jobs/${job.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}