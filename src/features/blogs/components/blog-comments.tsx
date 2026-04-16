"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { MessageCircle, Reply, Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/store";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/formatters";
import type { BlogComment } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface CommentRow {
  id: string;
  blog_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

function mapRow(row: CommentRow): BlogComment {
  return {
    id: row.id,
    blogId: row.blog_id,
    userId: row.user_id,
    parentId: row.parent_id,
    content: row.content,
    isEdited: row.is_edited,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: row.profiles
      ? { fullName: row.profiles.full_name, avatarUrl: row.profiles.avatar_url }
      : undefined,
    replies: [],
  };
}

function buildTree(comments: BlogComment[]): BlogComment[] {
  const map = new Map<string, BlogComment>();
  const roots: BlogComment[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ---------------------------------------------------------------------------
// Single Comment
// ---------------------------------------------------------------------------

interface CommentItemProps {
  comment: BlogComment;
  onReply: (parentId: string) => void;
  isNested?: boolean;
}

function CommentItem({ comment, onReply, isNested = false }: CommentItemProps) {
  return (
    <div className={isNested ? "ml-8 mt-3" : ""}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.author?.avatarUrl ?? undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.author?.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {comment.author?.fullName ?? "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>

          {!isNested && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 mt-1 text-xs text-muted-foreground"
              onClick={() => onReply(comment.id)}
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </Button>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              isNested
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comment Form
// ---------------------------------------------------------------------------

interface CommentFormProps {
  blogId: string;
  parentId: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

function CommentForm({
  blogId,
  parentId,
  onSuccess,
  onCancel,
  autoFocus = false,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !user) return;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("blog_comments").insert({
        blog_id: blogId,
        user_id: user.id,
        parent_id: parentId,
        content: trimmed,
      });

      if (!error) {
        setContent("");
        onSuccess();
      }
    });
  }

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Sign in to leave a comment.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
        disabled={isPending}
        className="resize-none"
      />
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !content.trim()}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface BlogCommentsProps {
  blogId: string;
  initialCount: number;
}

export function BlogComments({ blogId, initialCount }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_comments")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("blog_id", blogId)
      .order("created_at", { ascending: true });

    if (data) {
      const mapped = (data as unknown as CommentRow[]).map(mapRow);
      setComments(buildTree(mapped));
    }
    setIsLoading(false);
  }, [blogId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  function handleReply(parentId: string) {
    setReplyingTo(replyingTo === parentId ? null : parentId);
  }

  function handleCommentSuccess() {
    setReplyingTo(null);
    fetchComments();
  }

  const tree = comments;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          Comments {initialCount > 0 && `(${initialCount})`}
        </h2>
      </div>

      {/* New comment form */}
      <div className="mb-6">
        <CommentForm
          blogId={blogId}
          parentId={null}
          onSuccess={handleCommentSuccess}
        />
      </div>

      <Separator className="mb-6" />

      {/* Comment list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading comments...
        </div>
      ) : tree.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6">
          {tree.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} onReply={handleReply} />

              {/* Inline reply form */}
              {replyingTo === comment.id && (
                <div className="ml-11 mt-3">
                  <CommentForm
                    blogId={blogId}
                    parentId={comment.id}
                    onSuccess={handleCommentSuccess}
                    onCancel={() => setReplyingTo(null)}
                    autoFocus
                    placeholder="Write a reply..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
