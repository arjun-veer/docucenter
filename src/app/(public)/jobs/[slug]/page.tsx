import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Calendar,
  ExternalLink,
  GraduationCap,
  Users,
  Eye,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatRelativeTime, formatSalary } from "@/lib/formatters";
import { JOB_TYPES, APPLICATION_STATUSES, APP_URL } from "@/lib/constants";
import type { Job } from "@/lib/types";

export const revalidate = 3600; // ISR: revalidate every hour

// ---- Types ----

interface PageParams {
  params: Promise<{ slug: string }>;
}

// ---- Metadata ----

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: row } = await supabase
    .from("jobs")
    .select("title, company_name, description, location")
    .eq("slug", slug)
    .single();

  if (!row) return { title: "Job Not Found" };

  const title = `${row.title} at ${row.company_name}`;
  const description = (row.description ?? "").slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${APP_URL}/jobs/${slug}`,
    },
  };
}

// ---- Row mapper ----

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

// ---- Helper components ----

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

// ---- Page ----

export default async function JobDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch the job
  const { data: row } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!row) notFound();

  const job = mapRowToJob(row as Record<string, unknown>);

  // Check if current user has applied (server-side session check)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let applicationStatus: string | null = null;
  if (authUser) {
    const { data: application } = await supabase
      .from("job_applications")
      .select("status")
      .eq("job_id", job.id)
      .eq("user_id", authUser.id)
      .single();
    applicationStatus = application?.status ?? null;
  }

  // Increment views (fire and forget)
  supabase
    .from("jobs")
    .update({ views_count: job.viewsCount + 1 })
    .eq("id", job.id)
    .then(() => {});

  const jobTypeLabel =
    JOB_TYPES.find((t) => t.value === job.jobType)?.label ?? job.jobType;

  const applicationStatusMeta = applicationStatus
    ? APPLICATION_STATUSES.find((s) => s.value === applicationStatus)
    : null;

  const isExpired =
    job.applicationDeadline &&
    new Date(job.applicationDeadline) < new Date();

  // JSON-LD structured data (JobPosting schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    validThrough: job.applicationDeadline ?? undefined,
    employmentType: job.jobType
      .toUpperCase()
      .replace("_", " "),
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
      ...(job.companyLogoUrl ? { logo: job.companyLogoUrl } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location ?? "India",
      },
    },
    ...(job.remoteAllowed
      ? { jobLocationType: "TELECOMMUTE" }
      : {}),
    ...(job.salaryMin || job.salaryMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.salaryCurrency,
            value: {
              "@type": "QuantitativeValue",
              ...(job.salaryMin ? { minValue: job.salaryMin } : {}),
              ...(job.salaryMax ? { maxValue: job.salaryMax } : {}),
              unitText: "YEAR",
            },
          },
        }
      : {}),
    ...(job.skillsRequired.length > 0
      ? { skills: job.skillsRequired.join(", ") }
      : {}),
  };

  return (
    <section className="container mx-auto py-8 px-4">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/jobs" className="hover:underline">
          Jobs
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{job.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          {job.companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.companyLogoUrl}
              alt={job.companyName}
              className="h-16 w-16 rounded-xl border object-cover shrink-0"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl border bg-muted flex items-center justify-center shrink-0">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{job.companyName}</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{jobTypeLabel}</Badge>
              {job.remoteAllowed && (
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  Remote
                </Badge>
              )}
              {job.isFeatured && <Badge variant="default">Featured</Badge>}
              {isExpired && (
                <Badge variant="destructive">Applications Closed</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {applicationStatus ? (
            <Badge
              variant={
                (applicationStatusMeta?.color as "default" | "secondary" | "destructive" | "outline") ??
                "secondary"
              }
              className="text-sm px-4 py-1.5"
            >
              Applied - {applicationStatusMeta?.label ?? applicationStatus}
            </Badge>
          ) : !isExpired ? (
            <>
              {job.applicationUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    External Apply
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {authUser ? (
                <Button asChild>
                  <Link href={`/jobs/${job.slug}/apply`}>Apply Now</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href={`/login?redirect=/jobs/${job.slug}`}>
                    Login to Apply
                  </Link>
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {job.description && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Job Description</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Requirements</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skillsRequired.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility */}
          {job.eligibility && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.eligibility}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Overview Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Job Overview</h3>
              <Separator />

              <InfoRow
                icon={<Briefcase className="h-4 w-4" />}
                label="Job Type"
                value={jobTypeLabel}
              />

              {(job.location || job.remoteAllowed) && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value={
                    <>
                      {job.location ?? ""}
                      {job.location && job.remoteAllowed ? " / " : ""}
                      {job.remoteAllowed ? "Remote" : ""}
                    </>
                  }
                />
              )}

              <InfoRow
                icon={<IndianRupee className="h-4 w-4" />}
                label="Salary"
                value={formatSalary(
                  job.salaryMin,
                  job.salaryMax,
                  job.salaryCurrency
                )}
              />

              {(job.experienceMin !== null || job.experienceMax !== null) && (
                <InfoRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Experience"
                  value={
                    job.experienceMin !== null && job.experienceMax !== null
                      ? `${job.experienceMin} - ${job.experienceMax} years`
                      : job.experienceMin !== null
                        ? `${job.experienceMin}+ years`
                        : `Up to ${job.experienceMax} years`
                  }
                />
              )}

              {job.applicationDeadline && (
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Application Deadline"
                  value={formatDate(job.applicationDeadline)}
                />
              )}

              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="Posted"
                value={formatRelativeTime(job.createdAt)}
              />

              <Separator />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {job.viewsCount} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {job.applicationsCount} applications
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {job.tags.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Eligibility summary */}
          {job.eligibility && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Eligibility</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {job.eligibility}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
