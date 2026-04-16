import type { Metadata } from "next";
import { Briefcase, Star } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { JobCard } from "@/features/jobs/components/job-card";
import { JobFilters } from "@/features/jobs/components/job-filters";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { Job } from "@/lib/types";

export const metadata: Metadata = {
  title: "Jobs",
  description:
    "Browse the latest job openings, internships, and career opportunities. Find your next role today.",
};

interface JobsPageProps {
  searchParams: Promise<{ q?: string; type?: string; location?: string }>;
}

function mapRowToJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    companyName: row.company_name as string,
    companyLogoUrl: row.company_logo_url as string | null,
    description: (row.description as string) ?? "",
    requirements: row.requirements as string | null,
    location: row.location as string | null,
    remoteAllowed: (row.remote_allowed as boolean) ?? false,
    jobType: row.job_type as string,
    salaryMin: row.salary_min as number | null,
    salaryMax: row.salary_max as number | null,
    salaryCurrency: (row.salary_currency as string) ?? "INR",
    experienceMin: row.experience_min as number | null,
    experienceMax: row.experience_max as number | null,
    skillsRequired: (row.skills_required as string[]) ?? [],
    eligibility: row.eligibility as string | null,
    applicationUrl: row.application_url as string | null,
    applicationDeadline: row.application_deadline as string | null,
    status: row.status as string,
    postedBy: row.posted_by as string,
    collegeId: row.college_id as string | null,
    isFeatured: (row.is_featured as boolean) ?? false,
    viewsCount: (row.views_count as number) ?? 0,
    applicationsCount: (row.applications_count as number) ?? 0,
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  // Build the query for all active jobs
  let query = supabase
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(ITEMS_PER_PAGE);

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,company_name.ilike.%${params.q}%`
    );
  }
  if (params.type && params.type !== "all") {
    query = query.eq("job_type", params.type);
  }
  if (params.location) {
    query = query.ilike("location", `%${params.location}%`);
  }

  const { data: rows } = await query;

  const jobs: Job[] = (rows ?? []).map((row) =>
    mapRowToJob(row as Record<string, unknown>)
  );

  const hasFilters = !!(params.q || params.type || params.location);

  // Separate featured jobs (only on unfiltered view)
  const featuredJobs = hasFilters
    ? []
    : jobs.filter((job) => job.isFeatured);
  const regularJobs = hasFilters
    ? jobs
    : jobs.filter((job) => !job.isFeatured);

  return (
    <section className="container mx-auto py-8 px-4">
      <PageHeader
        title="Jobs"
        description="Browse the latest job openings, internships, and career opportunities."
      />

      <div className="mb-8">
        <JobFilters />
      </div>

      {/* Featured jobs section */}
      {featuredJobs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold">Featured Jobs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <Separator className="mt-8" />
        </div>
      )}

      {/* All jobs */}
      {regularJobs.length === 0 && featuredJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase />}
          title={hasFilters ? "No jobs match your filters" : "No jobs found"}
          description={
            hasFilters
              ? "Try adjusting your search, location, or job type filter."
              : "Check back later for new job openings."
          }
        />
      ) : (
        <>
          {featuredJobs.length > 0 && regularJobs.length > 0 && (
            <h2 className="text-lg font-semibold mb-4">All Jobs</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
