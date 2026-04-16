"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ExamSubscribeButtonProps {
  examId: string;
  initialSubscribed?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExamSubscribeButton({
  examId,
  initialSubscribed = false,
  variant = "outline",
  size = "default",
  className,
}: ExamSubscribeButtonProps) {
  const { user } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (!user) return;

    startTransition(async () => {
      const supabase = createClient();

      if (isSubscribed) {
        const { error } = await supabase
          .from("exam_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("exam_id", examId);

        if (!error) {
          setIsSubscribed(false);
        }
      } else {
        const { error } = await supabase
          .from("exam_subscriptions")
          .insert({ user_id: user.id, exam_id: examId, notify_updates: true });

        if (!error) {
          setIsSubscribed(true);
        }
      }
    });
  }

  if (!user) {
    return null;
  }

  return (
    <Button
      variant={isSubscribed ? "secondary" : variant}
      size={size}
      className={cn(className)}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {size !== "icon" && (isSubscribed ? "Subscribed" : "Subscribe")}
    </Button>
  );
}
