"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/formatters";
import {
  Briefcase,
  GraduationCap,
  Building2,
  FileText,
  PenSquare,
  Bell,
  ArrowRight,
  Calendar,
  BookOpen,
} from "lucide-react";
import type { Exam } from "@/lib/types";

const quickActions = [
  {
    icon: Briefcase,
    label: "Browse Jobs",
    href: "/jobs",
    desc: "Find opportunities",
  },
  {
    icon: GraduationCap,
    label: "Track Exams",
    href: "/exams",
    desc: "Upcoming exams",
  },
  {
    icon: Building2,
    label: "Placements",
    href: "/placement",
    desc: "Campus drives",
  },
  {
    icon: FileText,
    label: "Documents",
    href: "/documents",
    desc: "Your files",
  },
  {
    icon: PenSquare,
    label: "Write Blog",
    href: "/blogs/new",
    desc: "Share knowledge",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/notifications",
    desc: "Stay updated",
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [subscribedExams, setSubscribedExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const fetchSubscribedExams = async () => {
      const { data: subs } = await supabase
        .from("exam_subscriptions")
        .select("exam_id")
        .eq("user_id", user.id);

      if (subs && subs.length > 0) {
        const examIds = subs.map((s) => s.exam_id);
        const { data: exams } = await supabase
          .from("exams")
          .select("*")
          .in("id", examIds)
          .eq("is_verified", true)
          .order("exam_date", { ascending: true });

        if (exams) {
          setSubscribedExams(
            exams.map((e) => ({
              id: e.id,
              name: e.name,
              slug: e.slug,
              category: e.category,
              description: e.description,
              registrationStart: e.registration_start,
              registrationEnd: e.registration_end,
              examDate: e.exam_date,
              resultDate: e.result_date,
              answerKeyDate: e.answer_key_date,
              websiteUrl: e.website_url,
              eligibility: e.eligibility,
              applicationFee: e.application_fee,
              syllabusUrl: e.syllabus_url,
              isVerified: e.is_verified,
              tags: e.tags || [],
            }))
          );
        }
      }
      setLoading(false);
    };
    fetchSubscribedExams();
  }, [user]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome back${user?.fullName ? `, ${user.fullName}` : ""}`}
        description="Here's what's happening with your career journey."
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:border-foreground/20 transition-colors h-full">
              <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
                <span className="text-xs text-muted-foreground">
                  {action.desc}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Subscribed Exams */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Exam Tracker
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/exams">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : subscribedExams.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                No exams tracked yet
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/exams">Browse exams</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {subscribedExams.slice(0, 5).map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{exam.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {exam.category}
                      </Badge>
                      {exam.examDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(exam.examDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
