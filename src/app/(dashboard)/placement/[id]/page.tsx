"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  IndianRupee,
  Users,
  CheckCircle2,
  Loader2,
  Briefcase,
  ListChecks,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/formatters";
import { DRIVE_STATUSES, APPLICATION_STATUSES } from "@/lib/constants";
import type { PlacementDrive, PlacementApplication } from "@/lib/types";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

const statusVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  upcoming: "secondary",
  ongoing: "default",
  completed: "outline",
  cancelled: "destructive",
};

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

export default function PlacementDetailPage({ params }: DetailPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();

  const [driveId, setDriveId] = useState<string | null>(null);
  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [loading, setLoading] = useState(true);

  // Application state
  const [application, setApplication] = useState<PlacementApplication | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve params (Promise in Next.js 15)
  useEffect(() => {
    params.then((p) => setDriveId(p.id));
  }, [params]);

  // Fetch drive details and application status
  useEffect(() => {
    if (!driveId) return;

    async function fetchData() {
      setLoading(true);

      // Fetch drive
      const { data: row, error: driveError } = await supabase
        .from("placement_drives")
        .select("*")
        .eq("id", driveId!)
        .single();

      if (driveError || !row) {
        setLoading(false);
        return;
      }

      const driveData = mapRowToDrive(row as Record<string, unknown>);
      setDrive(driveData);

      // Increment view count (fire and forget)
      supabase
        .from("placement_drives")
        .update({ views_count: driveData.viewsCount + 1 })
        .eq("id", driveData.id)
        .then();

      // Check existing application
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: app } = await supabase
          .from("placement_applications")
          .select("*")
          .eq("drive_id", driveData.id)
          .eq("user_id", authUser.id)
          .single();

        if (app) {
          setApplication({
            id: app.id,
            driveId: app.drive_id,
            userId: app.user_id,
            resumeUrl: app.resume_url,
            status: app.status,
            currentRound: app.current_round,
            notes: app.notes,
            createdAt: app.created_at,
          });
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [driveId, supabase]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!drive) return;

    if (!resumeUrl.trim()) {
      setError("Please provide your resume URL.");
      return;
    }

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

    const { data: newApp, error: insertError } = await supabase
      .from("placement_applications")
      .insert({
        drive_id: drive.id,
        user_id: authUser.id,
        resume_url: resumeUrl.trim(),
        status: "pending",
        current_round: null,
        notes: null,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        setError("You have already applied to this drive.");
      } else {
        setError(insertError.message);
      }
      setSubmitting(false);
      return;
    }

    // Increment application count
    await supabase
      .from("placement_drives")
      .update({ applications_count: drive.applicationsCount + 1 })
      .eq("id", drive.id);

    if (newApp) {
      setApplication({
        id: newApp.id,
        driveId: newApp.drive_id,
        userId: newApp.user_id,
        resumeUrl: newApp.resume_url,
        status: newApp.status,
        currentRound: newApp.current_round,
        notes: newApp.notes,
        createdAt: newApp.created_at,
      });
    }

    setSubmitSuccess(true);
    setSubmitting(false);
    setShowForm(false);
  }

  // Loading
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // Not found
  if (!drive) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Drive Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This placement drive may have been removed or is not accessible.
        </p>
        <Button asChild>
          <Link href="/placement">Browse Drives</Link>
        </Button>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Login Required</h1>
        <p className="text-muted-foreground mb-4">
          You need to be logged in to view placement drive details.
        </p>
        <Button asChild>
          <Link href={`/login?redirect=/placement/${drive.id}`}>Login</Link>
        </Button>
      </div>
    );
  }

  const statusLabel =
    DRIVE_STATUSES.find((s) => s.value === drive.status)?.label ?? drive.status;

  const isDeadlinePassed =
    drive.registrationDeadline &&
    new Date(drive.registrationDeadline) < new Date();

  const canApply =
    !application &&
    !isDeadlinePassed &&
    drive.status !== "completed" &&
    drive.status !== "cancelled";

  const existingStatusMeta = application
    ? APPLICATION_STATUSES.find((s) => s.value === application.status)
    : null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back link */}
      <Link
        href="/placement"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to placements
      </Link>

      {/* Company header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {drive.companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={drive.companyLogoUrl}
                alt={drive.companyName}
                className="h-14 w-14 rounded-lg border object-cover shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                {drive.companyName}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                {drive.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant={statusVariantMap[drive.status] ?? "secondary"}
                >
                  {statusLabel}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {drive.applicationsCount} applications
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application status banner */}
      {application && (
        <Card className="mb-6 border-blue-300 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  You have applied to this drive
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="text-sm text-muted-foreground">
                    Status:{" "}
                    <Badge
                      variant={
                        (existingStatusMeta?.color as
                          | "default"
                          | "secondary"
                          | "destructive"
                          | "outline") ?? "secondary"
                      }
                    >
                      {existingStatusMeta?.label ?? application.status}
                    </Badge>
                  </span>
                  {application.currentRound && (
                    <span className="text-sm text-muted-foreground">
                      Current round: {application.currentRound}
                    </span>
                  )}
                </div>
                {application.notes && (
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Note: {application.notes}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success banner */}
      {submitSuccess && !application && (
        <Card className="mb-6 border-green-300 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm font-medium">
                Application submitted successfully!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drive details */}
      <div className="grid gap-6">
        {/* Key information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Key Information
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {drive.packageOffered && (
                <div className="flex items-start gap-3">
                  <IndianRupee className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Package Offered
                    </p>
                    <p className="text-sm font-medium">
                      {drive.packageOffered}
                    </p>
                  </div>
                </div>
              )}
              {drive.driveDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Drive Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(drive.driveDate)}
                    </p>
                  </div>
                </div>
              )}
              {drive.registrationDeadline && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Registration Deadline
                    </p>
                    <p
                      className={`text-sm font-medium ${isDeadlinePassed ? "text-destructive" : ""}`}
                    >
                      {formatDate(drive.registrationDeadline)}
                      {isDeadlinePassed && " (Passed)"}
                    </p>
                  </div>
                </div>
              )}
              {drive.minCgpa !== null && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Minimum CGPA
                    </p>
                    <p className="text-sm font-medium">{drive.minCgpa}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {drive.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                About the Drive
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed">
                {drive.description}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Eligibility */}
        {drive.eligibility && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Eligibility
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {drive.eligibility}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Roles offered */}
        {drive.rolesOffered && drive.rolesOffered.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Roles Offered
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {drive.rolesOffered.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Process rounds */}
        {drive.processRounds && drive.processRounds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Selection Process
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ol className="space-y-3">
                {drive.processRounds.map((round, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm pt-0.5">{round}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Apply section */}
        {canApply && !showForm && (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
              <p className="text-sm text-muted-foreground">
                Interested in this placement drive? Submit your application now.
              </p>
              <Button size="lg" onClick={() => setShowForm(true)}>
                Apply Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Application form */}
        {canApply && showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Application</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <form onSubmit={handleApply} className="space-y-6">
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Deadline passed info */}
        {!application && isDeadlinePassed && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-destructive">
                The registration deadline for this drive has passed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
