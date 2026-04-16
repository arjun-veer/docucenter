"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/formatters";

interface LikeButtonProps {
  blogId: string;
  initialLiked?: boolean;
  initialCount: number;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LikeButton({
  blogId,
  initialLiked = false,
  initialCount,
  size = "sm",
  className,
}: LikeButtonProps) {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (!user) return;

    // Optimistic update
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    startTransition(async () => {
      const supabase = createClient();

      if (nextLiked) {
        const { error } = await supabase
          .from("blog_likes")
          .insert({ blog_id: blogId, user_id: user.id });

        if (error) {
          // Revert on failure
          setIsLiked(false);
          setCount((prev) => prev - 1);
        }
      } else {
        const { error } = await supabase
          .from("blog_likes")
          .delete()
          .eq("blog_id", blogId)
          .eq("user_id", user.id);

        if (error) {
          // Revert on failure
          setIsLiked(true);
          setCount((prev) => prev + 1);
        }
      }
    });
  }

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size={size}
      className={cn("gap-1.5", className)}
      onClick={handleToggle}
      disabled={isPending || !user}
      title={user ? (isLiked ? "Unlike" : "Like") : "Sign in to like"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn("h-4 w-4", isLiked && "fill-current")}
        />
      )}
      {formatCount(count)}
    </Button>
  );
}
