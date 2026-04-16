"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DriveCard } from "@/features/placement/components/drive-card";
import { DRIVE_STATUSES, ITEMS_PER_PAGE } from "@/lib/constants";
import { Building2 } from "lucide-react";
import type { PlacementDrive } from "@/lib/types";

function mapRowToDrive(row: Record<string, unknown>): PlacementDrive {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    companyName: row.company_name as string,
    companyLogoUrl: row.company_logo_url as string | null,
    description: (row.description as string) ?? "",
    collegeId: row.college_id as string,
    driveDate: row.drive_date as string | null,
    registrationDeadline: row.registration_deadline as string | null,
    eligibility: row.eligibility as string | null,
    minCgpa: row.min_cgpa as number | null,
    packageOffered: row.package_offered as string | null,
    rolesOffered: (row.roles_offered as string[]) ?? [],
    processRounds: (row.process_rounds as string[]) ?? [],
    status: row.status as string,
    createdBy: row.created_by as string,
    viewsCount: (row.views_count as number) ?? 0,
    applicationsCount: (row.applications_count as number) ?? 0,
    createdAt: row.created_at as string,
  };
}

export default function PlacementPage() {
  const { user } = useAuthStore();
  const supabase = createClient();

  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchDrives = useCallback(
    async (currentPage: number, status: string) => {
      setLoading(true);

      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE;

      let query = supabase
        .from("placement_drives")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch placement drives:", error.message);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as Record<string, unknown>[];

      if (rows.length > ITEMS_PER_PAGE) {
        setHasMore(true);
        setDrives(rows.slice(0, ITEMS_PER_PAGE).map(mapRowToDrive));
      } else {
        setHasMore(false);
        setDrives(rows.map(mapRowToDrive));
      }

      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    if (!user) return;
    setPage(0);
    fetchDrives(0, statusFilter);
  }, [user, statusFilter, fetchDrives]);

  function handleStatusChange(value: string) {
    setStatusFilter(value);
  }

  function handlePrevPage() {
    const prev = Math.max(0, page - 1);
    setPage(prev);
    fetchDrives(prev, statusFilter);
  }

  function handleNextPage() {
    const next = page + 1;
    setPage(next);
    fetchDrives(next, statusFilter);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Campus Placements"
        description="Placement drives from your college. Apply and track your applications."
      >
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
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
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : drives.length === 0 ? (
        <EmptyState
          icon={<Building2 />}
          title="No placement drives found"
          description={
            statusFilter !== "all"
              ? "Try changing the status filter to see more drives."
              : "No placement drives have been posted for your college yet."
          }
          action={
            statusFilter !== "all" ? (
              <Button
                variant="outline"
                onClick={() => setStatusFilter("all")}
              >
                Clear filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drives.map((drive) => (
              <DriveCard key={drive.id} drive={drive} />
            ))}
          </div>

          {(page > 0 || hasMore) && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
