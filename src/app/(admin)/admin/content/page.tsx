"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRelativeTime } from "@/lib/formatters";
import {
  FileText,
  MessageSquare,
  Trash2,
  ExternalLink,
  Eye,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  is_featured: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  published_at: string | null;
  author_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
}

interface CommentRow {
  id: string;
  blog_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
  blogs: { title: string; slug: string } | null;
}

const blogStatusVariant: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
};

export default function AdminContentPage() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  const fetchBlogs = useCallback(async () => {
    const supabase = createClient();
    setLoadingBlogs(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(
          "id, title, slug, status, is_featured, views_count, likes_count, comments_count, created_at, published_at, author_id, profiles!blogs_author_id_fkey(full_name, email)"
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setBlogs((data as unknown as BlogRow[]) ?? []);
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    const supabase = createClient();
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("blog_comments")
        .select(
          "id, blog_id, user_id, content, is_edited, created_at, profiles!blog_comments_user_id_fkey(full_name, email), blogs!blog_comments_blog_id_fkey(title, slug)"
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setComments((data as unknown as CommentRow[]) ?? []);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchComments();
  }, [fetchBlogs, fetchComments]);

  async function handleDeleteBlog(id: string) {
    setDeletingBlogId(id);
    const supabase = createClient();
    try {
      // Delete related comments first
      await supabase.from("blog_comments").delete().eq("blog_id", id);
      await supabase.from("blog_likes").delete().eq("blog_id", id);

      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;

      setBlogs((prev) => prev.filter((b) => b.id !== id));
      setComments((prev) => prev.filter((c) => c.blog_id !== id));
      toast.success("Blog deleted");
    } catch {
      toast.error("Failed to delete blog");
    } finally {
      setDeletingBlogId(null);
    }
  }

  async function handleDeleteComment(id: string) {
    setDeletingCommentId(id);
    const supabase = createClient();
    try {
      // Delete child replies first
      await supabase.from("blog_comments").delete().eq("parent_id", id);

      const { error } = await supabase
        .from("blog_comments")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Content Moderation"
        description="Review and moderate blogs and comments"
      />

      <Tabs defaultValue="blogs">
        <TabsList>
          <TabsTrigger value="blogs">
            Blogs ({blogs.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({comments.length})
          </TabsTrigger>
        </TabsList>

        {/* Blogs Tab */}
        <TabsContent value="blogs">
          <Card>
            <CardContent className="p-0">
              {loadingBlogs ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <EmptyState
                  icon={<FileText />}
                  title="No blogs found"
                  description="No blog posts have been created yet"
                />
              ) : (
                <div className="divide-y divide-border">
                  {blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="flex flex-col md:flex-row md:items-center gap-3 p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {blog.title}
                          </span>
                          <Badge
                            variant={
                              blogStatusVariant[blog.status] ?? "outline"
                            }
                            className="text-xs shrink-0"
                          >
                            {blog.status}
                          </Badge>
                          {blog.is_featured && (
                            <Badge
                              variant="default"
                              className="text-xs shrink-0"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>
                            By:{" "}
                            {blog.profiles?.full_name ||
                              blog.profiles?.email ||
                              "Unknown"}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-3 w-3" />
                            {blog.views_count}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Heart className="h-3 w-3" />
                            {blog.likes_count}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="h-3 w-3" />
                            {blog.comments_count}
                          </span>
                          <span>
                            {blog.published_at
                              ? `Published ${formatDate(blog.published_at)}`
                              : `Created ${formatDate(blog.created_at)}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteBlog(blog.id)}
                          disabled={deletingBlogId === blog.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardContent className="p-0">
              {loadingComments ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-full max-w-md" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare />}
                  title="No comments found"
                  description="No comments have been posted yet"
                />
              ) : (
                <div className="divide-y divide-border">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex flex-col md:flex-row md:items-start gap-3 p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.profiles?.full_name ||
                              comment.profiles?.email ||
                              "Unknown User"}
                          </span>
                          {comment.is_edited && (
                            <span className="text-xs text-muted-foreground">
                              (edited)
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                          {comment.content}
                        </p>
                        {comment.blogs && (
                          <a
                            href={`/blogs/${comment.blogs.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            {comment.blogs.title}
                          </a>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
