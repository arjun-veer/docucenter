"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatSalary } from "@/lib/formatters";
import { JOB_TYPES, APPLICATION_STATUSES } from "@/lib/constants";
import type { Job } from "@/lib/types";

interface ApplyPageProps {
  params: Promise<{ slug: string }>;
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

export default function ApplyPage({ params }: ApplyPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();

  const [slug, setSlug] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  // Form state
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve params (it's a Promise in Next.js 15)
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Fetch job and check application status
  useEffect(() => {
    if (!slug) return;

    async function fetchData() {
      setLoading(true);

      // Fetch job
      const { data: row, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "active")
        .single();

      if (jobError || !row) {
        setLoading(false);
        return;
      }

      setJob(mapRowToJob(row as Record<string, unknown>));

      // Check if already applied
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: application } = await supabase
          .from("job_applications")
          .select("status")
          .eq("job_id", row.id)
          .eq("user_id", authUser.id)
          .single();

        if (application) {
          setAlreadyApplied(true);
          setExistingStatus(application.status);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [slug, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!job) return;

    // Validate
    if (!resumeUrl.trim()) {
      setError("Please provide your resume URL.");
      return;
    }

    // Basic URL validation
    try {
      new URL(resumeUrl.trim());
    } catch {
      setError("Please enter a valid URL for your resume.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setError("You must be logged in to apply.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("job_applications")
      .insert({
        job_id: job.id,
        user_id: authUser.id,
        resume_url: resumeUrl.trim(),
        cover_letter: coverLetter.trim() || null,
        status: "pending",
        notes: null,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        setError("You have already applied to this job.");
        setAlreadyApplied(true);
      } else {
        setError(insertError.message);
      }
      setSubmitting(false);
      return;
    }

    // Increment application count
    await supabase
      .from("jobs")
      .update({ applications_count: job.applicationsCount + 1 })
      .eq("id", job.id);

    setSuccess(true);
    setSubmitting(false);
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This job posting may have been removed or is no longer active.
        </p>
        <Button asChild>
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Login Required</h1>
        <p className="text-muted-foreground mb-4">
          You need to be logged in to apply for this job.
        </p>
        <Button asChild>
          <Link href={`/login?redirect=/jobs/${job.slug}/apply`}>Login</Link>
        </Button>
      </div>
    );
  }

  const jobTypeLabel =
    JOB_TYPES.find((t) => t.value === job.jobType)?.label ?? job.jobType;

  const isExpired =
    job.applicationDeadline &&
    new Date(job.applicationDeadline) < new Date();

  const existingStatusMeta = existingStatus
    ? APPLICATION_STATUSES.find((s) => s.value === existingStatus)
    : null;

  // Success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Submitted</h1>
        <p className="text-muted-foreground mb-6">
          Your application for <strong>{job.title}</strong> at{" "}
          <strong>{job.companyName}</strong> has been submitted successfully.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/jobs/${job.slug}`}>View Job</Link>
          </Button>
          <Button asChild>
            <Link href="/jobs">Browse More Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href={`/jobs/${job.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to job details
      </Link>

      {/* Job summary card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {job.companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.companyLogoUrl}
                alt={job.companyName}
                className="h-12 w-12 rounded-lg border object-cover shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{job.companyName}</p>
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary">{jobTypeLabel}</Badge>
                {job.location && (
                  <span className="text-sm text-muted-foreground">
                    {job.location}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatSalary(
                    job.salaryMin,
                    job.salaryMax,
                    job.salaryCurrency
                  )}
                </span>
              </div>
              {job.applicationDeadline && (
                <p className="text-xs text-muted-foreground mt-2">
                  Deadline: {formatDate(job.applicationDeadline)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Already applied */}
      {alreadyApplied && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <p className="text-sm font-medium">
              You have already applied to this job.
            </p>
            {existingStatusMeta && (
              <p className="text-sm text-muted-foreground mt-1">
                Your application status:{" "}
                <Badge
                  variant={
                    (existingStatusMeta.color as "default" | "secondary" | "destructive" | "outline") ??
                    "secondary"
                  }
                >
                  {existingStatusMeta.label}
                </Badge>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expired */}
      {isExpired && !alreadyApplied && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive">
              The application deadline for this job has passed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application form */}
      {!alreadyApplied && !isExpired && (
        <Card>
          <CardHeader>
            <CardTitle>Apply for this position</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume-url">Resume URL *</Label>
                <Input
                  id="resume-url"
                  type="url"
                  placeholder="https://drive.google.com/your-resume"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide a link to your resume (Google Drive, Dropbox, or any
                  publicly accessible URL).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-letter">
                  Cover Letter{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="cover-letter"
                  placeholder="Tell the recruiter why you are a great fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground">
                  {coverLetter.length}/5000 characters
                </p>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Submit Application
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/jobs/${job.slug}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
