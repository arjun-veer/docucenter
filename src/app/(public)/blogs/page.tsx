import type { Metadata } from "next";
import Link from "next/link";
import { FileText, PenSquare } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/features/blogs/components/blog-card";
import { BlogFilters } from "@/features/blogs/components/blog-filters";
import type { Blog } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Read articles about competitive exams, career tips, preparation strategies, and more from our community.",
};

interface BlogsPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string;
  status: string;
  exam_tags: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  published_at: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

function mapRowToBlog(row: BlogRow): Blog {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    authorId: row.author_id,
    author: row.profiles
      ? { fullName: row.profiles.full_name, avatarUrl: row.profiles.avatar_url }
      : undefined,
    status: row.status,
    examTags: row.exam_tags ?? [],
    tags: row.tags ?? [],
    isFeatured: row.is_featured,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    viewsCount: row.views_count,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  };
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("blogs")
    .select("*, profiles:author_id(full_name, avatar_url)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,excerpt.ilike.%${params.q}%`
    );
  }

  if (params.tag) {
    query = query.contains("tags", [params.tag]);
  }

  const { data: rows } = await query;

  const blogs: Blog[] = (
    (rows ?? []) as unknown as BlogRow[]
  ).map(mapRowToBlog);

  // Collect all unique tags for the filter
  const allTagsSet = new Set<string>();
  for (const blog of blogs) {
    for (const tag of blog.tags) {
      allTagsSet.add(tag);
    }
  }
  const allTags = Array.from(allTagsSet).sort();

  const hasFilters = !!(params.q || params.tag);

  return (
    <section className="container mx-auto py-8 px-4">
      <PageHeader
        title="Blogs"
        description="Articles on competitive exams, career tips, and preparation strategies."
      >
        <Button asChild>
          <Link href="/blogs/new">
            <PenSquare className="h-4 w-4" />
            Write a Blog
          </Link>
        </Button>
      </PageHeader>

      <div className="mb-8">
        <BlogFilters tags={allTags} />
      </div>

      {blogs.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title={hasFilters ? "No blogs match your filters" : "No blogs yet"}
          description={
            hasFilters
              ? "Try adjusting your search or tag filter."
              : "Be the first to write a blog post!"
          }
          action={
            !hasFilters ? (
              <Button asChild>
                <Link href="/blogs/new">Write a Blog</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </section>
  );
}
