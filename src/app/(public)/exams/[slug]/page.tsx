import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  IndianRupee,
  BookOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/formatters";
import { ExamSubscribeButton } from "@/features/exams/components/exam-subscribe-button";
import type { Exam } from "@/lib/types";

export const revalidate = 3600; // ISR: revalidate every hour

// ---- Metadata ----

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: exam } = await supabase
    .from("exams")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!exam) return { title: "Exam Not Found" };

  return {
    title: exam.name,
    description: (exam.description ?? "").slice(0, 160),
  };
}

// ---- Helpers ----

interface DateItem {
  label: string;
  value: string | null;
  icon: React.ReactNode;
}

function DateCard({ label, value, icon }: DateItem) {
  const isPast = value && new Date(value) < new Date();
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{formatDate(value)}</p>
        {isPast && (
          <span className="text-xs text-muted-foreground">Passed</span>
        )}
      </div>
    </div>
  );
}

// ---- Row mapper ----

function mapRowToExam(row: Record<string, unknown>): Exam {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    category: row.category as string,
    description: (row.description as string) ?? "",
    registrationStart: row.registration_start as string,
    registrationEnd: row.registration_end as string,
    examDate: row.exam_date as string | null,
    resultDate: row.result_date as string | null,
    answerKeyDate: row.answer_key_date as string | null,
    websiteUrl: row.website_url as string,
    eligibility: row.eligibility as string | null,
    applicationFee: row.application_fee as string | null,
    syllabusUrl: row.syllabus_url as string | null,
    isVerified: row.is_verified as boolean,
    tags: (row.tags as string[]) ?? [],
  };
}

// ---- Page ----

export default async function ExamDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: row } = await supabase
    .from("exams")
    .select("*")
    .eq("slug", slug)
    .eq("is_verified", true)
    .single();

  if (!row) notFound();

  const exam = mapRowToExam(row as Record<string, unknown>);

  // Fetch related blogs
  const { data: relatedBlogs } = await supabase
    .from("blogs")
    .select(
      "id, title, slug, excerpt, cover_image_url, published_at, author_id, likes_count, comments_count"
    )
    .contains("exam_tags", [exam.id])
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(6);

  const isRegistrationOpen =
    exam.registrationStart &&
    exam.registrationEnd &&
    new Date(exam.registrationStart) <= new Date() &&
    new Date(exam.registrationEnd) >= new Date();

  const dates: DateItem[] = [
    {
      label: "Registration Start",
      value: exam.registrationStart,
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      label: "Registration End",
      value: exam.registrationEnd,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: "Exam Date",
      value: exam.examDate,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Result Date",
      value: exam.resultDate,
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      label: "Answer Key",
      value: exam.answerKeyDate,
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: exam.name,
    description: exam.description,
    startDate: exam.examDate ?? exam.registrationStart,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: exam.websiteUrl,
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
        <Link href="/exams" className="hover:underline">
          Exams
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{exam.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{exam.category}</Badge>
            {isRegistrationOpen && (
              <Badge variant="default">Registration Open</Badge>
            )}
            {exam.isVerified && (
              <Badge variant="outline" className="text-foreground border-foreground">
                Verified
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {exam.name}
          </h1>
          {exam.tags && exam.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {exam.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ExamSubscribeButton examId={exam.id} size="default" />
          {exam.websiteUrl && (
            <Button asChild>
              <a
                href={exam.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official Website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Important Dates Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Important Dates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {dates.map((d) => (
            <DateCard
              key={d.label}
              label={d.label}
              value={d.value}
              icon={d.icon}
            />
          ))}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Description */}
      {exam.description && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">About this Exam</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {exam.description}
          </p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {exam.eligibility && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Eligibility</h3>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {exam.eligibility}
              </p>
            </CardContent>
          </Card>
        )}

        {exam.applicationFee && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Application Fee</h3>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {exam.applicationFee}
              </p>
            </CardContent>
          </Card>
        )}

        {exam.syllabusUrl && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Syllabus</h3>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={exam.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Syllabus
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Related Blogs */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <>
          <Separator className="mb-8" />
          <div>
            <h2 className="text-lg font-semibold mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="group hover:border-foreground/20 transition-colors"
                >
                  {blog.cover_image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={blog.cover_image_url}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className={blog.cover_image_url ? "pt-4" : "pt-6"}>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="font-semibold leading-snug line-clamp-2 hover:underline"
                    >
                      {blog.title}
                    </Link>
                    {blog.excerpt && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                      <span>{blog.likes_count ?? 0} likes</span>
                      <span>{blog.comments_count ?? 0} comments</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
