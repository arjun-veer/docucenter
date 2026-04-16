import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Eye, Tag } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatCount } from "@/lib/formatters";
import { LikeButton } from "@/features/blogs/components/like-button";
import { BlogComments } from "@/features/blogs/components/blog-comments";
import { APP_URL } from "@/lib/constants";
import type { Blog } from "@/lib/types";

export const revalidate = 3600; // ISR: revalidate every hour

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageParams {
  params: Promise<{ slug: string }>;
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

interface ExamTag {
  id: string;
  name: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: row } = await supabase
    .from("blogs")
    .select("title, excerpt, cover_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!row) return { title: "Blog Not Found" };

  return {
    title: row.title,
    description: (row.excerpt ?? "").slice(0, 160),
    openGraph: {
      title: row.title,
      description: (row.excerpt ?? "").slice(0, 160),
      type: "article",
      images: row.cover_image_url ? [row.cover_image_url] : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Simple markdown-ish renderer
// ---------------------------------------------------------------------------

function renderContent(content: string) {
  // Split into paragraphs and render with basic formatting
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Headings
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="text-xl font-semibold mt-6 mb-3">
              {trimmed.slice(4)}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="text-2xl font-bold mt-8 mb-4">
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={i} className="text-3xl font-bold mt-8 mb-4">
              {trimmed.slice(2)}
            </h1>
          );
        }

        // Unordered list
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split(/\n/).filter((l) => l.trim());
          return (
            <ul key={i} className="list-disc pl-6 my-4 space-y-1">
              {items.map((item, j) => (
                <li key={j} className="text-muted-foreground">
                  {item.replace(/^[-*]\s+/, "")}
                </li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split(/\n/).filter((l) => l.trim());
          return (
            <ol key={i} className="list-decimal pl-6 my-4 space-y-1">
              {items.map((item, j) => (
                <li key={j} className="text-muted-foreground">
                  {item.replace(/^\d+\.\s+/, "")}
                </li>
              ))}
            </ol>
          );
        }

        // Code block
        if (trimmed.startsWith("```")) {
          const code = trimmed.replace(/^```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre
              key={i}
              className="bg-muted rounded-lg p-4 overflow-x-auto my-4 text-sm"
            >
              <code>{code}</code>
            </pre>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-muted-foreground/30 pl-4 my-4 italic text-muted-foreground"
            >
              {trimmed
                .split("\n")
                .map((l) => l.replace(/^>\s?/, ""))
                .join("\n")}
            </blockquote>
          );
        }

        // Regular paragraph with inline formatting
        return (
          <p
            key={i}
            className="text-muted-foreground leading-relaxed my-4 whitespace-pre-line"
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: row } = await supabase
    .from("blogs")
    .select("*, profiles:author_id(full_name, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!row) notFound();

  const blog = mapRowToBlog(row as unknown as BlogRow);

  // Fetch exam tags details if any
  let examTagDetails: ExamTag[] = [];
  if (blog.examTags.length > 0) {
    const { data: exams } = await supabase
      .from("exams")
      .select("id, name, slug")
      .in("id", blog.examTags);

    examTagDetails = (exams ?? []) as ExamTag[];
  }

  // Check if current user has liked this blog
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let isLiked = false;
  if (authUser) {
    const { data: likeRow } = await supabase
      .from("blog_likes")
      .select("id")
      .eq("blog_id", blog.id)
      .eq("user_id", authUser.id)
      .maybeSingle();

    isLiked = !!likeRow;
  }

  const authorInitials = blog.author?.fullName
    ? blog.author.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // JSON-LD Article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt ?? "",
    image: blog.coverImageUrl ?? undefined,
    datePublished: blog.publishedAt ?? blog.createdAt,
    author: {
      "@type": "Person",
      name: blog.author?.fullName ?? "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "JobExam",
      url: APP_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${APP_URL}/blogs/${blog.slug}`,
    },
  };

  return (
    <article className="container mx-auto py-8 px-4">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/blogs" className="hover:underline">
          Blogs
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{blog.title}</span>
      </nav>

      {/* Cover image */}
      {blog.coverImageUrl && (
        <div className="aspect-video max-h-[480px] overflow-hidden rounded-xl mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
        {blog.title}
      </h1>

      {/* Author & meta */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={blog.author?.avatarUrl ?? undefined} />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {blog.author?.fullName ?? "Anonymous"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(blog.publishedAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {formatCount(blog.viewsCount)} views
          </span>
          <LikeButton
            blogId={blog.id}
            initialLiked={isLiked}
            initialCount={blog.likesCount}
          />
        </div>
      </div>

      {/* Tags */}
      {(blog.tags.length > 0 || examTagDetails.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {blog.tags.map((tag) => (
            <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`}>
              <Badge variant="secondary" className="text-xs font-normal cursor-pointer">
                {tag}
              </Badge>
            </Link>
          ))}
          {examTagDetails.map((exam) => (
            <Link key={exam.id} href={`/exams/${exam.slug}`}>
              <Badge variant="outline" className="text-xs font-normal cursor-pointer">
                {exam.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <Separator className="mb-8" />

      {/* Content */}
      <div className="max-w-3xl">
        {renderContent(blog.content)}
      </div>

      <Separator className="my-10" />

      {/* Comments */}
      <div className="max-w-3xl">
        <BlogComments blogId={blog.id} initialCount={blog.commentsCount} />
      </div>
    </article>
  );
}
