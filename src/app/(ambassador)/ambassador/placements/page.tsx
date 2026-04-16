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
import { DRIVE_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/formatters";
import {
  Calendar,
  Plus,
  Building2,
  Users,
  Eye,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

interface DriveRow {
  id: string;
  title: string;
  company_name: string;
  status: string;
  drive_date: string | null;
  registration_deadline: string | null;
  applications_count: number;
  views_count: number;
  created_at: string;
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  upcoming: "secondary",
  ongoing: "default",
  completed: "outline",
  cancelled: "destructive",
};

export default function AmbassadorPlacementsPage() {
  const { user } = useAuthStore();
  const [drives, setDrives] = useState<DriveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDrives = useCallback(async () => {
    if (!user?.collegeId) return;

    setLoading(true);
    const supabase = createClient();
    try {
      let query = supabase
        .from("placement_drives")
        .select(
          "id, title, company_name, status, drive_date, registration_deadline, applications_count, views_count, created_at"
        )
        .eq("college_id", user.collegeId)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setDrives(data ?? []);
    } catch {
      toast.error("Failed to load placement drives");
    } finally {
      setLoading(false);
    }
  }, [user?.collegeId, statusFilter]);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  async function handleStatusChange(driveId: string, newStatus: string) {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("placement_drives")
        .update({ status: newStatus })
        .eq("id", driveId);
      if (error) throw error;

      setDrives((prev) =>
        prev.map((d) => (d.id === driveId ? { ...d, status: newStatus } : d))
      );
      toast.success(`Drive status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update drive status");
    }
  }

  return (
    <div>
      <PageHeader
        title="Placement Drives"
        description="Manage on-campus placement drives for your college"
      >
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {DRIVE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/ambassador/placements/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Drive
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
          ) : drives.length === 0 ? (
            <EmptyState
              icon={<Calendar />}
              title="No placement drives found"
              description={
                statusFilter !== "all"
                  ? "Try changing the filter to see more drives."
                  : "Create your first placement drive for your college."
              }
              action={
                <Button asChild>
                  <Link href="/ambassador/placements/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Drive
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
                <span>Drive</span>
                <span>Drive Date</span>
                <span>Deadline</span>
                <span>Apps</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {drives.map((drive) => (
                <div
                  key={drive.id}
                  className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 md:gap-4 p-4 md:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {drive.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {drive.company_name}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(drive.drive_date)}
                  </span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(drive.registration_deadline)}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {drive.applications_count}
                  </span>
                  <div>
                    <Select
                      value={drive.status}
                      onValueChange={(val) =>
                        handleStatusChange(drive.id, val)
                      }
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DRIVE_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link href={`/placement/${drive.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
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