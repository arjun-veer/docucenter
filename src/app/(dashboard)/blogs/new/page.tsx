"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { useAuthStore } from "@/features/auth/store";
import { createClient } from "@/lib/supabase/client";
import { generateUniqueSlug } from "@/lib/slugify";

interface VerifiedExam {
  id: string;
  name: string;
}

export default function NewBlogPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [selectedExamTags, setSelectedExamTags] = useState<string[]>([]);

  // Verified exams for multi-select
  const [verifiedExams, setVerifiedExams] = useState<VerifiedExam[]>([]);
  const [examSearchQuery, setExamSearchQuery] = useState("");

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch verified exams
  useEffect(() => {
    async function fetchExams() {
      const supabase = createClient();
      const { data } = await supabase
        .from("exams")
        .select("id, name")
        .eq("is_verified", true)
        .order("name", { ascending: true });

      if (data) {
        setVerifiedExams(data);
      }
    }
    fetchExams();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const filteredExams = examSearchQuery
    ? verifiedExams.filter((e) =>
        e.name.toLowerCase().includes(examSearchQuery.toLowerCase())
      )
    : verifiedExams;

  const toggleExamTag = useCallback((examId: string) => {
    setSelectedExamTags((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId]
    );
  }, []);

  function parseTags(input: string): string[] {
    return input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function handleSubmit(status: "draft" | "published") {
    if (!user) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const slug = generateUniqueSlug(trimmedTitle);
      const tags = parseTags(tagsInput);

      const { error: insertError } = await supabase.from("blogs").insert({
        title: trimmedTitle,
        slug,
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        author_id: user.id,
        status,
        exam_tags: selectedExamTags.length > 0 ? selectedExamTags : [],
        tags,
        is_featured: false,
        published_at: status === "published" ? new Date().toISOString() : null,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push(status === "published" ? `/blogs/${slug}` : "/dashboard");
    });
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blogs">
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Write a New Blog"
        description="Share your knowledge with the community."
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter blog title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              placeholder="Write your blog content in markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
              rows={24}
              className="font-mono text-sm resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Supports headings (#, ##, ###), lists (-, *), blockquotes (&gt;), and code blocks (```).
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief summary of your blog..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={isPending}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              placeholder="https://example.com/image.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              disabled={isPending}
            />
            {coverImageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="tips, preparation, strategy"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={isPending}
            />
            {parseTags(tagsInput).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {parseTags(tagsInput).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Related Exams</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                  disabled={isPending}
                >
                  {selectedExamTags.length === 0
                    ? "Select exams..."
                    : `${selectedExamTags.length} exam(s) selected`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-2">
                  <Input
                    placeholder="Search exams..."
                    value={examSearchQuery}
                    onChange={(e) => setExamSearchQuery(e.target.value)}
                    className="h-8"
                  />
                </div>
                <Separator />
                <ScrollArea className="h-56">
                  <div className="p-2 space-y-1">
                    {filteredExams.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No exams found.
                      </p>
                    ) : (
                      filteredExams.map((exam) => (
                        <label
                          key={exam.id}
                          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedExamTags.includes(exam.id)}
                            onCheckedChange={() => toggleExamTag(exam.id)}
                          />
                          <span className="truncate">{exam.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            {selectedExamTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedExamTags.map((id) => {
                  const exam = verifiedExams.find((e) => e.id === id);
                  return (
                    <Badge
                      key={id}
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => toggleExamTag(id)}
                    >
                      {exam?.name ?? id} &times;
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleSubmit("published")}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
