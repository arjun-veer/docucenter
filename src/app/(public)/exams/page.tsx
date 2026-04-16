import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ExamCard } from "@/features/exams/components/exam-card";
import { ExamFilters } from "@/features/exams/components/exam-filters";
import type { Exam } from "@/lib/types";

export const metadata: Metadata = {
  title: "Competitive Exams",
  description:
    "Track registration dates, exam schedules, and results for all major competitive exams in India.",
};

interface ExamsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ExamsPage({ searchParams }: ExamsPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("exams")
    .select("*")
    .eq("is_verified", true)
    .order("exam_date", { ascending: true });

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }
  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }

  const { data: rows } = await query;

  const exams: Exam[] = (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description ?? "",
    registrationStart: row.registration_start,
    registrationEnd: row.registration_end,
    examDate: row.exam_date,
    resultDate: row.result_date,
    answerKeyDate: row.answer_key_date,
    websiteUrl: row.website_url,
    eligibility: row.eligibility,
    applicationFee: row.application_fee,
    syllabusUrl: row.syllabus_url,
    isVerified: row.is_verified,
    tags: row.tags ?? [],
  }));

  const hasFilters = !!(params.q || params.category);

  return (
    <section className="container mx-auto py-8 px-4">
      <PageHeader
        title="Competitive Exams"
        description="Track registration dates, exam schedules, and results for all major competitive exams."
      />

      <div className="mb-8">
        <ExamFilters />
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={<GraduationCap />}
          title={hasFilters ? "No exams match your filters" : "No exams found"}
          description={
            hasFilters
              ? "Try adjusting your search or category filter."
              : "Check back later for upcoming competitive exams."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </section>
  );
}
