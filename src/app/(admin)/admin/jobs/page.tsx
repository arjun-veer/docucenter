"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatDate } from "@/lib/formatters";
import {
  Search,
  Briefcase,
  Star,
  StarOff,
  Lock,
  Unlock,
  Eye,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface JobRow {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  location: string | null;
  job_type: string;
  status: string;
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "closed", label: "Closed" },
  { value: "expired", label: "Expired" },
];

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  draft: "secondary",
  closed: "destructive",
  expired: "outline",
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      let query = supabase
        .from("jobs")
        .select(
          "id, title, slug, company_name, location, job_type, status, is_featured, views_count, applications_count, created_at"
        )
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search.trim()}%,company_name.ilike.%${search.trim()}%`
        );
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setJobs(data ?? []);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timeout);
  }, [fetchJobs]);

  async function handleToggleStatus(job: JobRow) {
    const newStatus = job.status === "active" ? "closed" : "active";
    setActioningId(job.id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", job.id);
      if (error) throw error;

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, status: newStatus } : j
        )
      );
      toast.success(
        newStatus === "active" ? "Job reopened" : "Job closed"
      );
    } catch {
      toast.error("Failed to update job status");
    } finally {
      setActioningId(null);
    }
  }

  async function handleToggleFeatured(job: JobRow) {
    setActioningId(job.id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ is_featured: !job.is_featured })
        .eq("id", job.id);
      if (error) throw error;

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, is_featured: !j.is_featured } : j
        )
      );
      toast.success(
        job.is_featured ? "Job unfeatured" : "Job featured"
      );
    } catch {
      toast.error("Failed to update featured status");
    } finally {
      setActioningId(null);
    }
  }

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    internship: "Internship",
    contract: "Contract",
    freelance: "Freelance",
  };

  return (
    <div>
      <PageHeader
        title="Job Moderation"
        description="Manage and moderate job postings"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Job List */}
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
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="No jobs found"
              description={
                search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No jobs have been posted yet"
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
                      {job.is_featured && (
                        <Star className="h-3.5 w-3.5 text-foreground fill-foreground shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{job.company_name}</span>
                      {job.location && <span>{job.location}</span>}
                      <Badge variant="outline" className="text-xs">
                        {jobTypeLabels[job.job_type] ?? job.job_type}
                      </Badge>
                      <Badge
                        variant={
                          statusBadgeVariant[job.status] ?? "outline"
                        }
                        className="text-xs"
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {job.views_count} views
                      </span>
                      <span>
                        {job.applications_count} applications
                      </span>
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(job)}
                      disabled={actioningId === job.id}
                      title={
                        job.is_featured ? "Remove featured" : "Mark featured"
                      }
                    >
                      {job.is_featured ? (
                        <StarOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Star className="h-4 w-4 mr-1" />
                      )}
                      {job.is_featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(job)}
                      disabled={actioningId === job.id}
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
