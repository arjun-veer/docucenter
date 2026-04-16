"use client";

import Link from "next/link";
import { Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { ExamSubscribeButton } from "./exam-subscribe-button";
import type { Exam } from "@/lib/types";

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  const isRegistrationOpen =
    exam.registrationStart &&
    exam.registrationEnd &&
    new Date(exam.registrationStart) <= new Date() &&
    new Date(exam.registrationEnd) >= new Date();

  return (
    <Card className="group flex flex-col hover:border-foreground/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/exams/${exam.slug}`} className="hover:underline">
              <CardTitle className="text-lg leading-snug line-clamp-2">
                {exam.name}
              </CardTitle>
            </Link>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {exam.category}
          </Badge>
        </div>
        {isRegistrationOpen && (
          <Badge variant="default" className="w-fit text-xs mt-1">
            Registration Open
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span>Registration: {formatDate(exam.registrationStart)} - {formatDate(exam.registrationEnd)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Exam Date: {formatDate(exam.examDate)}</span>
          </div>
        </div>

        {exam.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {exam.description}
          </p>
        )}

        {exam.tags && exam.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {exam.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between gap-2">
        <Link
          href={`/exams/${exam.slug}`}
          className="text-sm font-medium hover:underline"
        >
          View Details
        </Link>
        <ExamSubscribeButton
          examId={exam.id}
          initialSubscribed={exam.isSubscribed}
          size="sm"
        />
      </CardFooter>
    </Card>
  );
}
