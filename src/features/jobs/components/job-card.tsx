"use client";

import Link from "next/link";
import {
  MapPin,
  Building2,
  Clock,
  IndianRupee,
  Briefcase,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, formatSalary } from "@/lib/formatters";
import { JOB_TYPES } from "@/lib/constants";
import type { Job } from "@/lib/types";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const jobTypeLabel =
    JOB_TYPES.find((t) => t.value === job.jobType)?.label ?? job.jobType;

  const isDeadlineSoon =
    job.applicationDeadline &&
    new Date(job.applicationDeadline) > new Date() &&
    new Date(job.applicationDeadline).getTime() - Date.now() <
      7 * 24 * 60 * 60 * 1000;

  const isExpired =
    job.applicationDeadline &&
    new Date(job.applicationDeadline) < new Date();

  return (
    <Card className="group flex flex-col hover:border-foreground/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {job.companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.companyLogoUrl}
                alt={job.companyName}
                className="h-10 w-10 rounded-lg border object-cover shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                {job.companyName}
              </p>
              <Link href={`/jobs/${job.slug}`} className="hover:underline">
                <CardTitle className="text-lg leading-snug line-clamp-2">
                  {job.title}
                </CardTitle>
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {jobTypeLabel}
            </Badge>
            {job.isFeatured && (
              <Badge
                variant="default"
                className="text-xs gap-1"
              >
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        <div className="space-y-1.5 text-sm">
          {(job.location || job.remoteAllowed) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {job.location ?? ""}
                {job.location && job.remoteAllowed && " / "}
                {job.remoteAllowed && "Remote"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4 shrink-0" />
            <span>
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </span>
          </div>
          {(job.experienceMin !== null || job.experienceMax !== null) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span>
                {job.experienceMin !== null && job.experienceMax !== null
                  ? `${job.experienceMin}-${job.experienceMax} yrs`
                  : job.experienceMin !== null
                    ? `${job.experienceMin}+ yrs`
                    : `Up to ${job.experienceMax} yrs`}
              </span>
            </div>
          )}
        </div>

        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skillsRequired.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs font-normal"
              >
                {skill}
              </Badge>
            ))}
            {job.skillsRequired.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{job.skillsRequired.length - 3}
              </Badge>
            )}
          </div>
        )}

        {isDeadlineSoon && !isExpired && (
          <p className="text-xs text-muted-foreground font-medium">
            Deadline approaching
          </p>
        )}
        {isExpired && (
          <p className="text-xs text-destructive font-medium">
            Applications closed
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatRelativeTime(job.createdAt)}</span>
        </div>
        <Button asChild size="sm">
          <Link href={`/jobs/${job.slug}`}>View &amp; Apply</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
