"use client";

import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  IndianRupee,
  Users,
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
import { formatDate, formatRelativeTime } from "@/lib/formatters";
import { DRIVE_STATUSES } from "@/lib/constants";
import type { PlacementDrive } from "@/lib/types";

interface DriveCardProps {
  drive: PlacementDrive;
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

export function DriveCard({ drive }: DriveCardProps) {
  const statusLabel =
    DRIVE_STATUSES.find((s) => s.value === drive.status)?.label ?? drive.status;

  const isDeadlineSoon =
    drive.registrationDeadline &&
    new Date(drive.registrationDeadline) > new Date() &&
    new Date(drive.registrationDeadline).getTime() - Date.now() <
      3 * 24 * 60 * 60 * 1000;

  const isDeadlinePassed =
    drive.registrationDeadline &&
    new Date(drive.registrationDeadline) < new Date();

  return (
    <Card className="group flex flex-col hover:border-foreground/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {drive.companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={drive.companyLogoUrl}
                alt={drive.companyName}
                className="h-10 w-10 rounded-lg border object-cover shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                {drive.companyName}
              </p>
              <Link
                href={`/placement/${drive.id}`}
                className="hover:underline"
              >
                <CardTitle className="text-lg leading-snug line-clamp-2">
                  {drive.title}
                </CardTitle>
              </Link>
            </div>
          </div>
          <Badge
            variant={statusVariantMap[drive.status] ?? "secondary"}
            className="text-xs shrink-0"
          >
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        <div className="space-y-1.5 text-sm">
          {drive.packageOffered && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="h-4 w-4 shrink-0" />
              <span>{drive.packageOffered}</span>
            </div>
          )}
          {drive.driveDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Drive: {formatDate(drive.driveDate)}</span>
            </div>
          )}
          {drive.registrationDeadline && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Deadline: {formatDate(drive.registrationDeadline)}</span>
            </div>
          )}
        </div>

        {drive.rolesOffered && drive.rolesOffered.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {drive.rolesOffered.slice(0, 3).map((role) => (
              <Badge
                key={role}
                variant="outline"
                className="text-xs font-normal"
              >
                {role}
              </Badge>
            ))}
            {drive.rolesOffered.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{drive.rolesOffered.length - 3}
              </Badge>
            )}
          </div>
        )}

        {isDeadlineSoon && !isDeadlinePassed && (
          <p className="text-xs text-muted-foreground font-medium">
            Registration closing soon
          </p>
        )}
        {isDeadlinePassed && (
          <p className="text-xs text-destructive font-medium">
            Registration closed
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {drive.applicationsCount} applied
          </span>
          <span>{formatRelativeTime(drive.createdAt)}</span>
        </div>
        <Button asChild size="sm">
          <Link href={`/placement/${drive.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
