import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/exams`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  // Dynamic exam pages
  const { data: exams } = await supabase
    .from("exams")
    .select("slug, created_at")
    .eq("status", "approved")
    .eq("is_verified", true);

  const examPages: MetadataRoute.Sitemap = (exams ?? []).map((exam) => ({
    url: `${BASE_URL}/exams/${exam.slug}`,
    lastModified: new Date(exam.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic job pages
  const { data: jobs } = await supabase
    .from("jobs")
    .select("slug, created_at")
    .eq("status", "active");

  const jobPages: MetadataRoute.Sitemap = (jobs ?? []).map((job) => ({
    url: `${BASE_URL}/jobs/${job.slug}`,
    lastModified: new Date(job.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic blog pages
  const { data: blogs } = await supabase
    .from("blogs")
    .select("slug, published_at, created_at")
    .eq("status", "published");

  const blogPages: MetadataRoute.Sitemap = (blogs ?? []).map((blog) => ({
    url: `${BASE_URL}/blogs/${blog.slug}`,
    lastModified: new Date(blog.published_at ?? blog.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...examPages, ...jobPages, ...blogPages];
}
